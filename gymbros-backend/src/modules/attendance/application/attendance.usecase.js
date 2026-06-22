import { AppError } from '../../../shared/core/AppError.js';

export class AttendanceUseCase {
  constructor(attendanceRepository, membershipRepository) {
    this.attendanceRepository = attendanceRepository;
    this.membershipRepository = membershipRepository;
  }

  async processCheckIn(idUser) {
    // 1. Cek apakah user sudah check-in dan belum check-out
    const activeCheckIn = await this.attendanceRepository.findActiveCheckIn(idUser);
    if (activeCheckIn) {
      throw new AppError('Anda sudah melakukan Check-In dan belum melakukan Check-Out.', 400);
    }

    // 2. Validasi status Membership
    const activeMembership = await this.membershipRepository.findActiveByUserId(idUser);
    
    // 3. Tentukan status akses pintu
    const statusAkses = activeMembership ? 'Granted' : 'Denied - Expired';

    // 4. Catat log ke database
    const attendanceRecord = await this.attendanceRepository.createCheckIn(idUser, statusAkses);

    // 5. Jika ditolak, kembalikan response dengan status code yang wajar (tapi sukses mencatat log)
    if (statusAkses === 'Denied - Expired') {
      throw new AppError('Akses ditolak. Membership Anda sudah kedaluwarsa atau tidak aktif.', 403);
    }

    return attendanceRecord;
  }

  async processCheckOut(idUser) {
    // Cari data check-in yang masih menggantung
    const activeCheckIn = await this.attendanceRepository.findActiveCheckIn(idUser);
    
    if (!activeCheckIn) {
      throw new AppError('Anda belum melakukan Check-In atau sudah melakukan Check-Out sebelumnya.', 400);
    }

    return await this.attendanceRepository.updateCheckOut(activeCheckIn.idAbsensi);
  }
}