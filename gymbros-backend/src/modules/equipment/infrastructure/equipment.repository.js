import { db } from '../../../shared/config/database.js';
import { Equipment } from '../domain/Equipment.js';

export class EquipmentRepository {
  // Mapping dari Database (Bahasa Indonesia) ke Domain (Bahasa Inggris)
  _mapToDomain(row) {
    if (!row) return null;
    
    const statusMap = {
      'BAIK': 'Available',
      'PERAWATAN': 'Maintenance',
      'RUSAK': 'Broken'
    };

    return new Equipment({
      idAlat: row.id_alat,
      namaAlat: row.nama_alat,
      kategori: row.kategori,
      statusKondisi: statusMap[row.status_kondisi],
      statusKetersediaan: row.status_ketersediaan,
    });
  }

  // Mapping dari Domain (Bahasa Inggris) ke Database (Bahasa Indonesia)
  _mapToDB(statusDomain) {
    const statusMap = {
      'Available': 'BAIK',
      'Maintenance': 'PERAWATAN',
      'Broken': 'RUSAK'
    };
    return statusMap[statusDomain];
  }

  async findAll() {
    const query = `SELECT * FROM equipment ORDER BY id_alat ASC`;
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async findById(idAlat) {
    const query = `SELECT * FROM equipment WHERE id_alat = $1`;
    const result = await db.query(query, [idAlat]);
    return this._mapToDomain(result.rows[0]);
  }

  async create(data) {
    const { idAlat, namaAlat, kategori, statusKondisi, statusKetersediaan } = data;
    const dbStatus = this._mapToDB(statusKondisi);

    const query = `
      INSERT INTO equipment (id_alat, nama_alat, kategori, status_kondisi, status_ketersediaan)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [idAlat, namaAlat, kategori, dbStatus, statusKetersediaan]);
    return this._mapToDomain(result.rows[0]);
  }

  async updateStatus(idAlat, statusKondisi) {
    const dbStatus = this._mapToDB(statusKondisi);
    const query = `
      UPDATE equipment 
      SET status_kondisi = $1 
      WHERE id_alat = $2 
      RETURNING *
    `;
    const result = await db.query(query, [dbStatus, idAlat]);
    return this._mapToDomain(result.rows[0]);
  }
}