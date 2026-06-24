export class UserReportUseCase {
  constructor(userReportRepository) {
    this.userReportRepository = userReportRepository;
  }

  async submitReport(idUser, data) {
    return await this.userReportRepository.create(idUser, data);
  }

  async getAllReportsForAdmin() {
    return await this.userReportRepository.findAll();
  }
}