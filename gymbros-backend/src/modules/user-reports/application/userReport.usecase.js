export class UserReportUseCase {
  constructor(userReportRepository, notificationService) {
    this.userReportRepository = userReportRepository;
    this.notificationService = notificationService;
  }

  async submitReport(idUser, data) {
    // Simpan laporan ke database
    const report = await this.userReportRepository.create(idUser, data);

    // Kirim notifikasi ke admin
    await this.notificationService.notifyAdmins(
      "Laporan Baru",
      `Laporan dari User ID ${idUser}: ${data.judul}`
    );

    return report;
  }

  async getAllReportsForAdmin() {
    return await this.userReportRepository.findAll();
  }
}