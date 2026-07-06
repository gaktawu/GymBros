import { AppError } from '../../../shared/core/AppError.js';
import { Attendance } from '../domain/Attendance.js';
import { gymState } from '../infrastructure/gym.state.js';

export class AttendanceUseCase {
  constructor(attendanceRepository, membershipRepository) {
    this.attendanceRepository = attendanceRepository;
    this.membershipRepository = membershipRepository;
  }

  generateNewCode() {
    return gymState.generateDynamicCode(10);
  }

  async processRedeemCode(idUser, submittedCode) {
    const validation = gymState.validateCode(submittedCode);

    if (!validation.valid) {
      const messages = {
        EMPTY_INPUT: 'Kode tidak boleh kosong.',
        NO_ACTIVE_CODE: 'Belum ada kode aktif. Hubungi admin gym.',
        EXPIRED: 'Kode sudah kedaluwarsa, silakan minta kode terbaru.',
        MISMATCH: 'Kode Redeem tidak valid.',
      };
      throw new AppError(messages[validation.reason] || 'Kode tidak valid.', 400);
    }

    const activeSession = await this.attendanceRepository.findActiveCheckIn(idUser);

    if (activeSession) {
      const record = await this.attendanceRepository.updateCheckOut(activeSession.idAbsensi);
      gymState.decrement();
      return { action: 'CHECKOUT', message: 'Check-Out berhasil.', data: record };
    }

    const membership = await this.membershipRepository.findActiveByUserId(idUser);

    if (!Attendance.validateMembership(membership)) {
      await this.attendanceRepository.createCheckIn(idUser, 'Denied - Expired');
      throw new AppError('Akses ditolak. Membership Anda kedaluwarsa.', 403);
    }

    const record = await this.attendanceRepository.createCheckIn(idUser, 'Granted');
    gymState.increment();
    return { action: 'CHECKIN', message: 'Check-In berhasil.', data: record };
  }

  async autoCheckOut() {
    const affectedRows = await this.attendanceRepository.autoCheckOutOverdue(Attendance.MAX_DURATION_HOURS);
    if (affectedRows > 0) {
      const currentCount = await this.attendanceRepository.countActiveMembers();
      gymState.syncCount(currentCount);
    }
    return affectedRows;
  }

  async getAttendanceStats(idUser) {
    const totalDays = await this.attendanceRepository.countDistinctCheckInDays(idUser);
    return { totalDays };
  }

}