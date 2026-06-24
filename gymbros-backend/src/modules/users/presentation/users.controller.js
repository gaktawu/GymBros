export class UsersController {
  constructor(usersUseCase) {
    this.usersUseCase = usersUseCase;
  }

  getAllUsers = async (req, res) => {
    const users = await this.usersUseCase.getAllUsers();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar pengguna',
      data: users,
    });
  };

  getProfile = async (req, res) => {
    const idUser = req.user.id_user;
    const profile = await this.usersUseCase.getUserProfile(idUser);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil profil pengguna',
      data: profile,
    });
  };

  updateProfile = async (req, res) => {
    
    const idUser = req.user.id_user;
    const { namaLengkap, noTelepon } = req.body;
    const file = req.file;

    const updatePayload = {};
    
    if (namaLengkap !== undefined && namaLengkap.trim() !== '') {
        updatePayload.namaLengkap = namaLengkap;
    }
    if (noTelepon !== undefined && noTelepon.trim() !== '') {
        updatePayload.noTelepon = noTelepon;
    }

    const updatedProfile = await this.usersUseCase.editUserProfile(
      idUser,
      updatePayload,
      file
    );

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedProfile,
    });
  };
}