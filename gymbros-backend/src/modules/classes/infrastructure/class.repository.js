import { pool } from '../../../shared/config/database.js';

export class ClassRepository {
    _extractRows(result) {
        if (!result) return [];
        if (result.rows) return result.rows;
        if (Array.isArray(result)) return result;
        return result;
    }

    async findAll({ search = '', page = 1, limit = 10, includeDeleted = false } = {}) {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        const searchTerm = `%${search}%`;

        // Filter is_deleted hanya untuk non-admin
        const deletedFilter = includeDeleted ? '' : 'AND k.is_deleted = false';

        const dataQuery = `
            SELECT k.*, u.nama_lengkap AS pengajar_nama
            FROM kelas k
            LEFT JOIN users u ON k.id_coach = u.id_user
            WHERE (k.nama_kelas ILIKE $1 OR u.nama_lengkap ILIKE $1) ${deletedFilter}
            ORDER BY k.id_kelas DESC
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `
            SELECT COUNT(*)::int AS total 
            FROM kelas k
            LEFT JOIN users u ON k.id_coach = u.id_user
            WHERE k.nama_kelas ILIKE $1 OR u.nama_lengkap ILIKE $1
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, [searchTerm, safeLimit, offset]),
            pool.query(countQuery, [searchTerm]),
        ]);

        const rows = this._extractRows(dataResult);
        const total = this._extractRows(countResult)[0]?.total || 0;

        return {
            data: rows,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
    }

    async findById(id) {
        // PERBAIKAN: Menggunakan k.id_coach sesuai skema database
        const query = `
            SELECT k.*, u.nama_lengkap AS pengajar_nama 
            FROM kelas k
            LEFT JOIN users u ON k.id_coach = u.id_user 
            WHERE k.id_kelas = $1
        `;
        const result = await pool.query(query, [id]);
        const rows = this._extractRows(result);
        return rows[0] || null;
    }

    async create(data) {
        const { nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas, harga } = data;
        // PERBAIKAN: Menggunakan id_coach sesuai skema database
        const query = `
            INSERT INTO kelas (nama_kelas, id_coach, waktu_mulai, waktu_selesai, kapasitas, harga)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await pool.query(query, [
            nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas || 0, harga || 0,
        ]);
        return this._extractRows(result)[0];
    }

    async update(id, data) {
        const { nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas, harga } = data;
        // PERBAIKAN: Menggunakan id_coach sesuai skema database
        const query = `
            UPDATE kelas
            SET nama_kelas = $1, id_coach = $2, waktu_mulai = $3, waktu_selesai = $4,
                kapasitas = $5, harga = $6
            WHERE id_kelas = $7 RETURNING *
        `;
        const result = await pool.query(query, [
            nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas || 0, harga || 0, id,
        ]);
        return this._extractRows(result)[0];
    }

    // SOFT DELETE: Ubah status & flag is_deleted
    async softDelete(id) {
        const query = `
            UPDATE kelas
            SET is_deleted = true,
                deleted_at = NOW(),
                status = 'Completed'
            WHERE id_kelas = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return this._extractRows(result)[0];
    }

    async findParticipantsByClassId(id) {
        const query = `
            SELECT bk.id_booking, bk.status, u.id_user, u.nama_lengkap, u.email
            FROM booking_kelas bk
            JOIN users u ON bk.id_user = u.id_user
            WHERE bk.id_kelas = $1
            ORDER BY bk.id_booking ASC
        `;
        const result = await pool.query(query, [id]);
        return this._extractRows(result) || [];
    }

    async findBookingsByUserId(idUser) {
        const query = `
        SELECT bk.id_booking, bk.status, k.id_kelas, k.nama_kelas, k.waktu_mulai,
               u.nama_lengkap AS pengajar_nama
        FROM booking_kelas bk
        JOIN kelas k ON bk.id_kelas = k.id_kelas
        LEFT JOIN users u ON k.id_coach = u.id_user
        WHERE bk.id_user = $1 AND bk.status = 'Booked'
        ORDER BY k.waktu_mulai ASC
    `;
        const result = await pool.query(query, [idUser]);
        return this._extractRows(result) || [];
    }

    async findByCoachId(coachId) {
        const query = `
        SELECT k.*, u.nama_lengkap AS pengajar_nama
        FROM kelas k
        LEFT JOIN users u ON k.id_coach = u.id_user
        WHERE k.id_coach = $1 AND k.is_deleted = false
        ORDER BY k.waktu_mulai ASC
    `;
        const result = await pool.query(query, [coachId]);
        return this._extractRows(result);
    }
}