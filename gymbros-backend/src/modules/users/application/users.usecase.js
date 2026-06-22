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
    // Ingat, kita memanggil toJSON() dari Entity agar password tidak ikut terkirim!
    return user.toJSON();
  }
}