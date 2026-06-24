export class ClassBookingController {
  constructor(classBookingUseCase) {
    this.classBookingUseCase = classBookingUseCase;
  }

  bookClass = async (req, res) => {
    const idUser = req.user.id_user; // dari middleware auth
    const { idKelas } = req.body;

    const booking = await this.classBookingUseCase.bookClass(idUser, idKelas);

    res.status(201).json({
      success: true,
      message: 'Berhasil mem-booking kelas',
      data: booking,
    });
  };

  cancelBooking = async (req, res) => {
    const idUser = req.user.id_user;
    const { id } = req.params; // idBooking

    const cancelledBooking = await this.classBookingUseCase.cancelBooking(idUser, id);

    res.status(200).json({
      success: true,
      message: 'Booking berhasil dibatalkan',
      data: cancelledBooking,
    });
  };
}