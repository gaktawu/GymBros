import { db } from '../../../shared/config/database.js';
import { PaketMembership } from '../domain/PaketMembership.js';

export class PaketMembershipRepository {
  
  // Data Mapper: Mengubah baris mentah DB menjadi instansiasi Entity murni
  _mapToDomain(row) {
    if (!row) return null;
    return new PaketMembership({
      idPaket: row.id_paket,
      namaPaket: row.nama_paket,
      durasiHari: row.durasi_hari,
      harga: parseFloat(row.harga), // Memastikan numeric PG menjadi float JS
      statusAktif: row.status_aktif,
    });
  }

  async create(data) {
    const { namaPaket, durasiHari, harga } = data;
    const query = `
      INSERT INTO paket_membership (nama_paket, durasi_hari, harga)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [namaPaket, durasiHari, harga];
    const result = await db.query(query, values);
    return this._mapToDomain(result.rows[0]);
  }

  async findAll() {
    const query = `SELECT * FROM paket_membership ORDER BY id_paket ASC`;
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async findById(id) {
    const query = `SELECT * FROM paket_membership WHERE id_paket = $1`;
    const result = await db.query(query, [id]);
    return this._mapToDomain(result.rows[0]);
  }

  async updateStatus(id, statusAktif) {
    const query = `
      UPDATE paket_membership 
      SET status_aktif = $1 
      WHERE id_paket = $2 
      RETURNING *
    `;
    const result = await db.query(query, [statusAktif, id]);
    return this._mapToDomain(result.rows[0]);
  }
}