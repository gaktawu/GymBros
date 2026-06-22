import { db } from '../../../shared/config/database.js';
import { UserReport } from '../domain/UserReport.js';

export class UserReportRepository {
  _mapToDomain(row) {
    if (!row) return null;
    return new UserReport({
      idReport: row.id_report,
      idUser: row.id_user,
      judul: row.judul,
      pesan: row.pesan,
      status: row.status,
      dibuatPada: row.dibuat_pada,
    });
  }

  async create(idUser, { judul, pesan }) {
    const query = `
      INSERT INTO reports (id_user, judul, pesan, status)
      VALUES ($1, $2, $3, 'Pending')
      RETURNING *
    `;
    const result = await db.query(query, [idUser, judul, pesan]);
    return this._mapToDomain(result.rows[0]);
  }

  async findAll() {
    const query = `SELECT * FROM reports ORDER BY dibuat_pada DESC`;
    const result = await db.query(query);
    return result.rows.map(row => this._mapToDomain(row));
  }
}