import { db } from '../../../shared/config/database.js';
import { GymClass } from '../domain/GymClass.js';

export class ClassRepository {
  _mapToDomain(row) {
    if (!row) return null;
    const gymClass = new GymClass({
      idKelas: row.id_kelas,
      namaKelas: row.nama_kelas,
      idPelatih: row.id_pelatih,
      kapasitas: row.kapasitas,
      waktuMulai: row.waktu_mulai,
      waktuSelesai: row.waktu_selesai,
      status: row.status,
      harga: row.harga,
    });
    
    // Menambahkan ekstra data jika di-join dengan tabel users
    if (row.nama_pelatih) {
      gymClass.namaPelatih = row.nama_pelatih;
    }
    
    return gymClass;
  }

  async create(data) {
    const { namaKelas, idPelatih, kapasitas, waktuMulai, waktuSelesai, harga } = data;
    const query = `
      INSERT INTO kelas (nama_kelas, id_pelatih, kapasitas, waktu_mulai, waktu_selesai, harga)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [namaKelas, idPelatih, kapasitas, waktuMulai, waktuSelesai, harga];
    const result = await db.query(query, values);
    return this._mapToDomain(result.rows[0]);
  }

  async findAll() {
    const query = `
      SELECT k.*, u.nama_lengkap as nama_pelatih 
      FROM kelas k
      LEFT JOIN users u ON k.id_pelatih = u.id_user
      ORDER BY k.waktu_mulai ASC
    `;
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async findById(idKelas) {
    const query = `
      SELECT k.*, u.nama_lengkap as nama_pelatih 
      FROM kelas k
      LEFT JOIN users u ON k.id_pelatih = u.id_user
      WHERE k.id_kelas = $1
    `;
    const result = await db.query(query, [idKelas]);
    return this._mapToDomain(result.rows[0]);
  }
}