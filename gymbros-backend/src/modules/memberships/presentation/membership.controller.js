export class MembershipController {
  constructor(membershipUseCase) {
    this.membershipUseCase = membershipUseCase;
  }

  subscribe = async (req, res) => {
    // id_user diambil dengan aman dari token JWT, bukan dari body request
    const idUser = req.user.id_user;
    const { idPaket } = req.body;

    const membership = await this.membershipUseCase.subscribe(idUser, idPaket);

    res.status(201).json({
      success: true,
      message: 'Berhasil berlangganan paket membership',
      data: membership,
    });
  };

  getMyMembership = async (req, res) => {
    const idUser = req.user.id_user;
    const membership = await this.membershipUseCase.getMyActiveMembership(idUser);

    if (!membership) {
      return res.status(200).json({
        success: true,
        message: 'Anda tidak memiliki membership aktif',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data membership aktif',
      data: membership,
    });
  };

  async softDeleteMembership(req, res, next) {
    try {
      const { id_membership } = req.params;

      // Panggil UseCase
      const result = await this.membershipUseCase.softDeleteUserMembership(id_membership);

      // Kembalikan response sukses
      return res.status(200).json({
        status: 'success',
        message: 'Membership berhasil dihapus (soft delete). Member tetap bisa menggunakan akses hingga masa aktif habis.',
        data: result
      });
    } catch (error) {
      // Lempar error ke errorMiddleware.js
      next(error);
    }
  }
}