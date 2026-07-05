import { gymState } from '../infrastructure/gym.state.js';

export class AttendanceController {
  constructor(attendanceUseCase) {
    this.attendanceUseCase = attendanceUseCase;
  }

  redeemCode = async (req, res) => {
    const idUser = req.user.id_user;
    const { code } = req.body;

    const result = await this.attendanceUseCase.processRedeemCode(idUser, code);
    res.status(200).json({ success: true, ...result });
  };

  manualGenerateCode = async (req, res) => {
    const { code, expiresAt } = this.attendanceUseCase.generateNewCode();
    res.status(200).json({
      success: true,
      message: 'Kode baru berhasil di-generate',
      data: { code, expiresAt }
    });
  };

   getAttendanceStats = async (req, res) => {
    const idUser = req.user.id_user;
    const stats = await this.attendanceUseCase.getAttendanceStats(idUser);
    res.status(200).json({
      success: true,
      message: 'Statistik absensi berhasil diambil',
      data: stats
    });
  };
}