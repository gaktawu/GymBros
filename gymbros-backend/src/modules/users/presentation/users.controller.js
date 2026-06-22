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
    const idUser = req.user.id_user; // Diambil otomatis dari token JWT
    const profile = await this.usersUseCase.getUserProfile(idUser);
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil profil pengguna',
      data: profile,
    });
  };
}