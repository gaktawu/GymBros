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

  // kalo ga perlu login
  async findAll() {
    const query = `
      SELECT * FROM kelas 
      ORDER BY waktu_mulai ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }
 
  async findAllClasses(role = 'Member') {
  let query = `
    SELECT k.*, u.nama_lengkap AS nama_pelatih 
    FROM kelas k
    LEFT JOIN users u ON k.id_pelatih = u.id_user
  `;
  
  if (role !== 'Admin') {
    // Member hanya bisa melihat kelas yang TIDAK di-soft-delete
    // dan Coach-nya masih Aktif (tidak di-soft-delete)
    query += ` WHERE k.is_deleted = false AND u.status_akun = 'Aktif'`;
  } else {
    // Admin melihat semua status, baik kelasnya dihapus maupun pelatihnya nonaktif
    query += ` ORDER BY k.waktu_mulai DESC`;
  }

  const result = await db.query(query);
  return result.rows;
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

  async softDeleteClassById(id) {
    const query = `
      UPDATE public.kelas 
      SET is_deleted = TRUE, deleted_at = NOW() 
      WHERE id_kelas = $1 RETURNING *;
    `;
    return await this.db.query(query, [id]);
  }
}