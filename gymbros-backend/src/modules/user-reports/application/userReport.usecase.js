// application/userReport.usecase.js
export class UserReportUseCase {
  constructor(userReportRepository) {
    this.userReportRepository = userReportRepository;
  }

  async submitReport(idUser, data) {
    return await this.userReportRepository.create(idUser, data);
  }

  async getReportsByUser(idUser) {
    return await this.userReportRepository.findByUserId(idUser);
  }

  async getReportDetail(idReport, idUser, role) {
    const report = await this.userReportRepository.findById(idReport);
    if (!report) throw new Error('Laporan tidak ditemukan');
    if (role === 'Member' && report.idUser !== idUser) {
      throw new Error('Unauthorized: Anda hanya dapat mengakses laporan Anda sendiri');
    }
    return report;
  }

  async editReport(idReport, idUser, data) {
    const report = await this.userReportRepository.findById(idReport);
    if (!report) throw new Error('Laporan tidak ditemukan');
    if (report.idUser !== idUser) throw new Error('Unauthorized: Bukan laporan Anda');
    return await this.userReportRepository.update(idReport, data);
  }

  async deleteReport(idReport, idUser, role) {
    const report = await this.userReportRepository.findById(idReport);
    if (!report) throw new Error('Laporan tidak ditemukan');
    if (role === 'Member' && report.idUser !== idUser) throw new Error('Unauthorized: Bukan laporan Anda');
    await this.userReportRepository.delete(idReport);
  }

  async updateReportStatus(idReport, newStatus) {
    const report = await this.userReportRepository.findById(idReport);
    if (!report) throw new Error('Laporan tidak ditemukan');

    const sequence = ['Pending', 'In Progress', 'Resolved', 'Closed'];
    const currentIndex = sequence.indexOf(report.status);
    const newIndex = sequence.indexOf(newStatus);

    if (newIndex === -1) throw new Error('Status tidak valid');
    if (newIndex !== currentIndex + 1) throw new Error('Status tidak boleh melompati urutan');

    return await this.userReportRepository.updateStatus(idReport, newStatus);
  }

  async getAdminDashboard(query) {
    const stats = await this.userReportRepository.getStats();
    const paginatedData = await this.userReportRepository.getAdminDashboardData(query);
    return { stats, ...paginatedData };
  }
}