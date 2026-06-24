export class DashboardMetrics {
  constructor({ totalMemberAktif, totalPendapatan, totalKelasAktif, peralatanRusak }) {
    this.totalMemberAktif = parseInt(totalMemberAktif, 10) || 0;
    this.totalPendapatan = parseFloat(totalPendapatan) || 0;
    this.totalKelasAktif = parseInt(totalKelasAktif, 10) || 0;
    this.peralatanRusak = parseInt(peralatanRusak, 10) || 0;
  }
}