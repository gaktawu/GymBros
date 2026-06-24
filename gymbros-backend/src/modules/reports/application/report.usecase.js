export class ReportUseCase {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async generateDashboardMetrics() {
    return await this.reportRepository.getDashboardMetrics();
  }
}