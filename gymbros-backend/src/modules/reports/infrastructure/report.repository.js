import { db } from '../../../shared/config/database.js';
import { DashboardMetrics } from '../domain/DashboardMetrics.js';

export class ReportRepository {
  async getDashboardMetrics() {
    const query = `
      WITH member_aktif AS (
        SELECT COUNT(*) as total FROM membership WHERE status = 'Aktif' AND tgl_berakhir > NOW()
      ),
      pendapatan AS (
        SELECT SUM(total_dibayar) as total FROM payments WHERE status = 'Lunas'
      ),
      kelas_aktif AS (
        SELECT COUNT(*) as total FROM kelas WHERE waktu_mulai > NOW()
      ),
      alat_rusak AS (
        SELECT COUNT(*) as total FROM equipment WHERE status_kondisi = 'RUSAK'
      )
      SELECT 
        (SELECT total FROM member_aktif) AS total_member_aktif,
        (SELECT COALESCE(total, 0) FROM pendapatan) AS total_pendapatan,
        (SELECT total FROM kelas_aktif) AS total_kelas_aktif,
        (SELECT total FROM alat_rusak) AS peralatan_rusak
    `;

    const result = await db.query(query);
    const row = result.rows[0];

    return new DashboardMetrics({
      totalMemberAktif: row.total_member_aktif,
      totalPendapatan: row.total_pendapatan,
      totalKelasAktif: row.total_kelas_aktif,
      peralatanRusak: row.peralatan_rusak
    });
  }
}