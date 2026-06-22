import { db } from '../../../shared/config/database.js';
import { User } from '../domain/User.js';

export class UsersRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new User({
      idUser: row.id_user,
      namaLengkap: row.nama_lengkap,
      email: row.email,
      passwordHash: row.password_hash,
      noTelepon: row.no_telepon,
      peran: row.peran,
      statusAkun: row.status_akun,
    });
  }

  async findAll() {
    const query = 'SELECT * FROM users ORDER BY dibuat_pada DESC';
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row).toJSON());
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id_user = $1';
    const result = await db.query(query, [id]);
    return this._mapToDomain(result.rows[0]);
  }
}