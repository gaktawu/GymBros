export class RefundController {
  constructor(refundUseCase) {
    this.refundUseCase = refundUseCase;
  }

  requestRefund = async (req, res) => {
    const refund = await this.refundUseCase.requestRefund(req.body);
    res.status(201).json({ success: true, message: 'Pengajuan pengembalian dana berhasil dicatat', data: refund });
  };

  getQueue = async (req, res) => {
    const list = await this.refundUseCase.getAdminQueue();
    res.status(200).json({ success: true, data: list });
  };

  approve = async (req, res) => {
    const { id } = req.params;
    const approved = await this.refundUseCase.approveRefund(id);
    res.status(200).json({ success: true, message: 'Refund berhasil disetujui', data: approved });
  };
}