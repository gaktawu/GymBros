import { AppError } from '../../../shared/core/AppError.js';

export class UsersUseCase {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async getAllUsers() {
    return await this.usersRepository.findAll();
  }

  async getUserProfile(idUser) {
    const user = await this.usersRepository.findById(idUser);
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }
    return user.toJSON();
  }

  async editUserProfile(idUser, payload, file) {
    const existingUser = await this.usersRepository.findById(idUser);
    if (!existingUser) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const dataToUpdate = { ...payload };

    if (file) {
      const imageUrl = await this.usersRepository.uploadFileToSupabase(
        idUser,
        file
      );
      dataToUpdate.fotoProfil = imageUrl;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new AppError('Tidak ada data yang dikirim untuk diubah', 400);
    }

    const updatedUser = await this.usersRepository.updateProfileCombined(
      idUser,
      dataToUpdate
    );

    if (!updatedUser) {
      throw new AppError('Gagal memperbarui profil pengguna', 500);
    }

    return updatedUser.toJSON();
  }

  async hardDeleteUser(id) {    
    return await this.usersRepository.deleteUserById(id);
  }
}