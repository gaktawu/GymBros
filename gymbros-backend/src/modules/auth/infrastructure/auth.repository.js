import { db } from '../../../shared/config/database.js';
import { User } from '../../users/domain/User.js';

export class AuthRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new User({
      idUser: row.id_user,
      namaLengkap: row.nama_lengkap,
      email: row.email,
      passwordHash: row.password_hash, // Sinkron dengan DB
      noTelepon: row.no_telepon,       // Sinkron dengan DB
      peran: row.peran,                // Sinkron dengan DB
      statusAkun: row.status_akun,
    });
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return this._mapToDomain(result.rows[0]);
  }

  async create(data) {
    // Data input dari frontend tetap menggunakan nama camelCase (noHp, role, password)
    const { namaLengkap, email, password, noHp, role } = data;
    
    // Kueri disesuaikan persis dengan kolom database Anda
    const query = `
      INSERT INTO users (nama_lengkap, email, password_hash, no_telepon, peran)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [namaLengkap, email, password, noHp, role]);
    return this._mapToDomain(result.rows[0]);
  }
}