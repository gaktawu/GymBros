export class ReportController {
  constructor(reportUseCase) {
    this.reportUseCase = reportUseCase;
  }

  getDashboardMetrics = async (req, res) => {
    const metrics = await this.reportUseCase.generateDashboardMetrics();

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil metrik analitik dashboard',
      data: metrics,
    });
  };
}