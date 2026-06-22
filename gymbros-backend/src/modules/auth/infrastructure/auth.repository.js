import { db } from '../../../shared/config/database.js';

export class AuthRepository {
  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  async createUser(userData) {
    const { namaLengkap, email, passwordHash, noTelepon, peran, jenisKelamin } = userData;
    const query = `
      INSERT INTO users (nama_lengkap, email, password_hash, no_telepon, peran, jenis_kelamin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_user, nama_lengkap, email, peran, status_akun
    `;
    const values = [namaLengkap, email, passwordHash, noTelepon, peran, jenisKelamin];
    const result = await db.query(query, values);
    return result.rows[0];
  }
}