import { pool } from '../../../shared/config/database.js';

export class ClassRepository {

    // Helper untuk mengekstrak data dari PostgreSQL (pg-pool)
    _extractRows(result) {
        if (!result) return [];
        if (result.rows) return result.rows;
        if (Array.isArray(result)) return result;
        return result;
    }

    async findAll({ search = '', page = 1, limit = 10 } = {}) {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;
        const searchTerm = `%${search}%`;

        // PERBAIKAN: Menggunakan id_pelatih, id_kelas, dan nama_lengkap sesuai schema
        const dataQuery = `
            SELECT k.*, u.nama_lengkap AS pengajar_nama
            FROM kelas k
            LEFT JOIN users u ON k.id_pelatih = u.id_user
            WHERE k.nama_kelas ILIKE $1 OR u.nama_lengkap ILIKE $1
            ORDER BY k.id_kelas DESC
            LIMIT $2 OFFSET $3
        `;
        
        const countQuery = `
            SELECT COUNT(*)::int AS total 
            FROM kelas k
            LEFT JOIN users u ON k.id_pelatih = u.id_user
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
        // PERBAIKAN: Menggunakan k.id_kelas dan u.id_user
        const query = `
            SELECT k.*, u.nama_lengkap AS pengajar_nama 
            FROM kelas k
            LEFT JOIN users u ON k.id_pelatih = u.id_user 
            WHERE k.id_kelas = $1
        `;
        const result = await pool.query(query, [id]);
        const rows = this._extractRows(result);
        return rows[0] || null;
    }

    async create(data) {
        // PERBAIKAN: Disesuaikan dengan kolom Supabase (waktu_mulai & waktu_selesai)
        // Pastikan dari Frontend, input payload disesuaikan untuk mengirim waktu_mulai dan waktu_selesai
        const { nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas, harga } = data;
        const query = `
            INSERT INTO kelas (nama_kelas, id_pelatih, waktu_mulai, waktu_selesai, kapasitas, harga)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await pool.query(query, [
            nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas || 0, harga || 0,
        ]);
        return this._extractRows(result)[0];
    }

    async update(id, data) {
        const { nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas, harga } = data;
        const query = `
            UPDATE kelas
            SET nama_kelas = $1, id_pelatih = $2, waktu_mulai = $3, waktu_selesai = $4,
                kapasitas = $5, harga = $6
            WHERE id_kelas = $7 RETURNING *
        `;
        const result = await pool.query(query, [
            nama_kelas, pengajar, waktu_mulai, waktu_selesai, kapasitas || 0, harga || 0, id,
        ]);
        return this._extractRows(result)[0];
    }

    async delete(id) {
        // PERBAIKAN: Hapus relasi booking menggunakan kolom id_kelas yang benar
        await pool.query(`DELETE FROM booking_kelas WHERE id_kelas = $1`, [id]);

        const query = `DELETE FROM kelas WHERE id_kelas = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return this._extractRows(result)[0];
    }

    async findParticipantsByClassId(id) {
        // PERBAIKAN: Menggunakan id_booking, id_user, nama_lengkap, dan id_kelas sesuai tabel
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
}