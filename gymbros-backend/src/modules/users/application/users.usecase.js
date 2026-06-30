import { AppError } from '../../../shared/core/AppError.js';
import bcrypt from 'bcrypt'; 

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

  async createUser(payload) {
    const { namaLengkap, email, password, noTelepon, peran, statusAkun } = payload;

    // 1. Validasi data wajib
    if (!namaLengkap || !email || !password) {
      throw new AppError('Nama lengkap, email, dan password wajib diisi', 400);
    }

    // 2. Cek duplikasi email
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Kirim ke repository
    const newUser = await this.usersRepository.createUser({
      namaLengkap,
      email,
      passwordHash,
      noTelepon,
      peran: peran || 'Member',
      statusAkun: statusAkun || 'Aktif'
    });

    return newUser.toJSON();
  }

  // Fungsi UseCase untuk Edit Data oleh Admin
  async editUserByAdmin(idUser, payload) {
    const existingUser = await this.usersRepository.findById(idUser);
    if (!existingUser) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const updatedUser = await this.usersRepository.updateUserByAdmin(idUser, payload);
    return updatedUser.toJSON();
  }

  // Fungsi UseCase untuk ganti status (Ban/Unban)
  async changeUserStatus(idUser, status) {
    const existingUser = await this.usersRepository.findById(idUser);
    if (!existingUser) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const updatedUser = await this.usersRepository.updateStatus(idUser, status);
    return updatedUser.toJSON();
  }
}