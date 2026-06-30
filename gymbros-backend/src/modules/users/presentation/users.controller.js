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

  deleteUser = async (req, res) => {
    const { id } = req.params;

    // Memanggil UseCase untuk menghapus user secara permanen
    await this.usersUseCase.hardDeleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User dan seluruh data transaksional terkait berhasil dihapus permanen dari sistem.',
    });
  };

  createUser = async (req, res) => {
    const newUser = await this.usersUseCase.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Berhasil menambahkan anggota baru',
      data: newUser,
    });
  };

  getUserById = async (req, res) => {
    const { id } = req.params;
    // Menggunakan UseCase yang sama dengan getProfile, tapi mengirimkan id dari params
    const user = await this.usersUseCase.getUserProfile(id); 
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data pengguna',
      data: user,
    });
  };

  // Admin memperbarui data user lain
  updateUserByAdmin = async (req, res) => {
    const { id } = req.params; // Ambil ID target user dari URL params, BUKAN req.user
    const { namaLengkap, noTelepon } = req.body;
    const file = req.file;

    const updatePayload = {};
    
    if (namaLengkap !== undefined && namaLengkap.trim() !== '') {
        updatePayload.namaLengkap = namaLengkap;
    }
    if (noTelepon !== undefined && noTelepon.trim() !== '') {
        updatePayload.noTelepon = noTelepon;
    }

    // Menggunakan UseCase yang sudah ada
    const updatedProfile = await this.usersUseCase.editUserProfile(
      id, 
      updatePayload,
      file
    );

    res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui oleh Admin',
      data: updatedProfile,
    });
  };

  // Controller untuk Admin Update Member
  updateUserByAdmin = async (req, res) => {
    const { id } = req.params;
    const payload = req.body; // berisi { namaLengkap, email, peran, status } dari React

    const updatedUser = await this.usersUseCase.editUserByAdmin(id, payload);

    res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui oleh Admin',
      data: updatedUser,
    });
  };

  
  updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    const updatedUser = await this.usersUseCase.changeUserStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Status pengguna berhasil diubah menjadi ${status}`,
      data: updatedUser,
    });
  };
}