export class CoachingController {
  constructor(coachingUseCase) {
    this.coachingUseCase = coachingUseCase;
  }

  createSession = async (req, res) => {
    const idCoach = req.user.id_user; // Coach yang login
    const session = await this.coachingUseCase.addSession(idCoach, req.body);
    res.status(201).json({ success: true, message: 'Slot jadwal berhasil dibuka', data: session });
  };

  buyPackage = async (req, res) => {
    const idMember = req.user.id_user;
    const { idCoach } = req.body;
    const paket = await this.coachingUseCase.buyPackage(idMember, idCoach);
    res.status(201).json({ success: true, message: 'Paket Coaching 10 Sesi berhasil diaktifkan', data: paket });
  };

  bookSession = async (req, res) => {
    const idMember = req.user.id_user;
    const { idSesi } = req.params;
    const bookedSession = await this.coachingUseCase.bookSession(idMember, idSesi);
    res.status(200).json({ success: true, message: 'Berhasil mem-booking sesi dengan Coach', data: bookedSession });
  };
}