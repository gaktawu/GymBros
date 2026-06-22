export class AttendanceController {
  constructor(attendanceUseCase) {
    this.attendanceUseCase = attendanceUseCase;
  }

  checkIn = async (req, res) => {
    const idUser = req.user.id_user; // Diambil otomatis dari token
    const record = await this.attendanceUseCase.processCheckIn(idUser);

    res.status(201).json({
      success: true,
      message: 'Check-In berhasil. Selamat berlatih!',
      data: record,
    });
  };

  checkOut = async (req, res) => {
    const idUser = req.user.id_user;
    const record = await this.attendanceUseCase.processCheckOut(idUser);

    res.status(200).json({
      success: true,
      message: 'Check-Out berhasil. Sampai jumpa kembali!',
      data: record,
    });
  };
}