import cron from 'node-cron';
import { AttendanceRepository } from '../modules/attendance/infrastructure/attendance.repository.js';
import { AttendanceUseCase } from '../modules/attendance/application/attendance.usecase.js';

export const startAttendanceCron = () => {
  const attendanceRepo = new AttendanceRepository();
  const attendanceUseCase = new AttendanceUseCase(attendanceRepo, null); // membershipRepo tidak diperlukan untuk Auto Check-Out

  cron.schedule('*/30 * * * *', async () => {
    try {
      await attendanceUseCase.autoCheckOut();
    } catch (error) {
      console.error('[CRON ERROR] Auto Check-Out failed:', error.message);
    }
  });
};