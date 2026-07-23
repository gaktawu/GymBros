import { AppError } from '../../../shared/core/AppError.js';
import bcrypt from 'bcrypt';

// --- KONSTANTA VALIDASI ---
const VALID_ROLES = ['Admin', 'Member', 'Coach'];
const VALID_STATUS = ['Aktif', 'Nonaktif', 'Diblokir'];

// --- MAPPING PERAN: Frontend (ID) → Database ---
const ROLE_MAPPING = {
  // Bahasa Indonesia
  'Anggota': 'Member',
  'Pelatih': 'Coach',
  'Admin': 'Admin',
  // Bahasa Inggris (langsung)
  'Member': 'Member',
  'Coach': 'Coach',
};

// --- MAPPING STATUS: Frontend → Database ---
const STATUS_MAPPING = {
  'Aktif': 'Aktif',
  'Nonaktif': 'Nonaktif',
  'Diblokir': 'Diblokir',
  'active': 'Aktif',
  'inactive': 'Nonaktif',
  'blocked': 'Diblokir',
};

export class UsersUseCase {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  // --- Helper: Normalisasi Peran ---
  _normalizeRole(role) {
    if (!role) return 'Member'; // Default

    const trimmed = role.trim();
    const mapped = ROLE_MAPPING[trimmed];

    if (mapped && VALID_ROLES.includes(mapped)) {
      return mapped;
    }

    // Jika sudah dalam format yang benar
    if (VALID_ROLES.includes(trimmed)) {
      return trimmed;
    }

    return null; // Invalid
  }

  // --- Helper: Normalisasi Status ---
  _normalizeStatus(status) {
    if (!status) return 'Aktif'; // Default

    const trimmed = status.trim();
    const mapped = STATUS_MAPPING[trimmed];

    if (mapped && VALID_STATUS.includes(mapped)) {
      return mapped;
    }

    if (VALID_STATUS.includes(trimmed)) {
      return trimmed;
    }

    return null; // Invalid
  }

  // --- Diperbarui: menerima filter ---
  async getAllUsers(filters = {}) {
    return await this.usersRepository.findAll(filters);
  }

  // --- Tambahan: getCoaches ---
  async getCoaches() {
    return await this.usersRepository.findAll({ role: 'Coach' });
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
    const { namaLengkap, email, password, noTelepon, peran, statusAkun, jenisKelamin } = payload;

    if (!namaLengkap || !email || !password) {
      throw new AppError('Nama lengkap, email, dan password wajib diisi', 400);
    }

    // Validasi & Normalisasi Peran
    const normalizedRole = this._normalizeRole(peran);
    if (!normalizedRole) {
      throw new AppError(
        `Peran tidak valid. Pilihan: Anggota (Member), Pelatih (Coach), Admin`,
        400
      );
    }

    // Validasi & Normalisasi Status
    const normalizedStatus = this._normalizeStatus(statusAkun);
    if (!normalizedStatus) {
      throw new AppError(
        `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}`,
        400
      );
    }

    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await this.usersRepository.createUser({
      namaLengkap,
      email,
      passwordHash,
      noTelepon,
      peran: normalizedRole,      // Pastikan: Member / Coach / Admin
      statusAkun: normalizedStatus, // Pastikan: Aktif / Nonaktif / Diblokir
      jenisKelamin
    });

    return newUser.toJSON();
  }

  async editUserByAdmin(idUser, payload) {
    const existingUser = await this.usersRepository.findById(idUser);
    if (!existingUser) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const updatePayload = { ...payload };

    // Normalisasi & Validasi Peran jika dikirim
    if (updatePayload.peran !== undefined) {
      const normalizedRole = this._normalizeRole(updatePayload.peran);
      if (!normalizedRole) {
        throw new AppError(
          `Peran tidak valid. Pilihan: Anggota (Member), Pelatih (Coach), Admin`,
          400
        );
      }
      updatePayload.peran = normalizedRole;
    }

    // Normalisasi & Validasi Status jika dikirim
    // Frontend bisa kirim 'status' atau 'statusAkun'
    const statusInput = updatePayload.status ?? updatePayload.statusAkun;
    if (statusInput !== undefined) {
      const normalizedStatus = this._normalizeStatus(statusInput);
      if (!normalizedStatus) {
        throw new AppError(
          `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}`,
          400
        );
      }
      // Repository mengharapkan key 'status' untuk mapping ke status_akun
      updatePayload.status = normalizedStatus;
      delete updatePayload.statusAkun; // Hapus duplikat jika ada
    }

    const updatedUser = await this.usersRepository.updateUserByAdmin(idUser, updatePayload);
    return updatedUser.toJSON();
  }

  async changeUserStatus(idUser, status) {
    const existingUser = await this.usersRepository.findById(idUser);
    if (!existingUser) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const normalizedStatus = this._normalizeStatus(status);
    if (!normalizedStatus) {
      throw new AppError(
        `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}`,
        400
      );
    }

    const updatedUser = await this.usersRepository.updateStatus(idUser, normalizedStatus);
    return updatedUser.toJSON();
  }
}