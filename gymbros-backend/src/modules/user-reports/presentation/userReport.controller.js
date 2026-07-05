// presentation/userReport.controller.js
export class UserReportController {
  constructor(userReportUseCase) {
    this.userReportUseCase = userReportUseCase;
  }

  submitReport = async (req, res) => {
    const idUser = req.user.id_user;
    const report = await this.userReportUseCase.submitReport(idUser, req.body);
    res.status(201).json({ success: true, message: 'Laporan berhasil dibuat', data: report });
  };

  getMemberReports = async (req, res) => {
    const idUser = req.user.id_user;
    const reports = await this.userReportUseCase.getReportsByUser(idUser);
    res.status(200).json({ success: true, data: reports });
  };

  getReportDetail = async (req, res) => {
    const report = await this.userReportUseCase.getReportDetail(req.params.id, req.user.id_user, req.user.peran);
    res.status(200).json({ success: true, data: report });
  };

  editReport = async (req, res) => {
    const idUser = req.user.id_user;
    const report = await this.userReportUseCase.editReport(req.params.id, idUser, req.body);
    res.status(200).json({ success: true, message: 'Laporan berhasil diubah', data: report });
  };

  deleteReport = async (req, res) => {
    await this.userReportUseCase.deleteReport(req.params.id, req.user.id_user, req.user.peran);
    res.status(200).json({ success: true, message: 'Laporan berhasil dihapus' });
  };

  updateStatus = async (req, res) => {
    const report = await this.userReportUseCase.updateReportStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: 'Status laporan diperbarui', data: report });
  };

  getAdminDashboard = async (req, res) => {
    const dashboardData = await this.userReportUseCase.getAdminDashboard(req.query);
    res.status(200).json({ success: true, data: dashboardData });
  };
}