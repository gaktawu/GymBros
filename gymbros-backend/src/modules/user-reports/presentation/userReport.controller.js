export class UserReportController {
  constructor(userReportUseCase) {
    this.userReportUseCase = userReportUseCase;
  }

  submitReport = async (req, res) => {
    const idUser = req.user.id_user;
    const report = await this.userReportUseCase.submitReport(idUser, req.body);
    res.status(201).json({ success: true, message: 'Laporan keluhan berhasil dikirim', data: report });
  };

  getAllReports = async (req, res) => {
    const reports = await this.userReportUseCase.getAllReportsForAdmin();
    res.status(200).json({ success: true, data: reports });
  };
}