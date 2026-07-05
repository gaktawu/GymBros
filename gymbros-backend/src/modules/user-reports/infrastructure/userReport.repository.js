// infrastructure/userReport.repository.js
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
      namaLengkap: row.nama_lengkap,
      email: row.email
    });
  }

  async create(idUser, { judul, pesan }) {
    const query = `
      INSERT INTO reports (id_user, judul, pesan, status, dibuat_pada)
      VALUES ($1, $2, $3, 'Pending', NOW())
      RETURNING *
    `;
    const result = await db.query(query, [idUser, judul, pesan]);
    return this._mapToDomain(result.rows[0]);
  }

  async findByUserId(idUser) {
    const query = `SELECT * FROM reports WHERE id_user = $1 ORDER BY dibuat_pada DESC`;
    const result = await db.query(query, [idUser]);
    return result.rows.map(row => this._mapToDomain(row));
  }

  async findById(idReport) {
    const query = `
      SELECT r.*, u.nama_lengkap, u.email 
      FROM reports r 
      JOIN users u ON r.id_user = u.id_user 
      WHERE r.id_report = $1
    `;
    const result = await db.query(query, [idReport]);
    return this._mapToDomain(result.rows[0]);
  }

  async update(idReport, { judul, pesan }) {
    const query = `
      UPDATE reports 
      SET judul = $1, pesan = $2 
      WHERE id_report = $3 
      RETURNING *
    `;
    const result = await db.query(query, [judul, pesan, idReport]);
    return this._mapToDomain(result.rows[0]);
  }

  async updateStatus(idReport, status) {
    const query = `
      UPDATE reports 
      SET status = $1 
      WHERE id_report = $2 
      RETURNING *
    `;
    const result = await db.query(query, [status, idReport]);
    return this._mapToDomain(result.rows[0]);
  }

  async delete(idReport) {
    const query = `DELETE FROM reports WHERE id_report = $1`;
    await db.query(query, [idReport]);
  }

  async getAdminDashboardData({ page = 1, limit = 10, search = '', statusFilter = '', sortBy = 'terbaru' }) {
    let whereClauses = [];
    let params = [];
    let paramCount = 1;

    if (search) {
      whereClauses.push(`(r.judul ILIKE $${paramCount} OR r.pesan ILIKE $${paramCount} OR u.nama_lengkap ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (statusFilter) {
      whereClauses.push(`r.status = $${paramCount}`);
      params.push(statusFilter);
      paramCount++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const orderString = sortBy === 'terlama' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const queryData = `
      SELECT r.*, u.nama_lengkap, u.email
      FROM reports r
      JOIN users u ON r.id_user = u.id_user
      ${whereString}
      ORDER BY r.dibuat_pada ${orderString}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    const queryCount = `
      SELECT COUNT(*) 
      FROM reports r
      JOIN users u ON r.id_user = u.id_user
      ${whereString}
    `;

    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      db.query(queryData, params),
      db.query(queryCount, params.slice(0, paramCount - 1))
    ]);

    return {
      data: dataResult.rows.map(row => this._mapToDomain(row)),
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
  }

  async getStats() {
    const query = `
      SELECT status, COUNT(*) as count 
      FROM reports 
      GROUP BY status
    `;
    const result = await db.query(query);
    const stats = { Total: 0, Pending: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count, 10);
      stats.Total += parseInt(row.count, 10);
    });
    return stats;
  }
}