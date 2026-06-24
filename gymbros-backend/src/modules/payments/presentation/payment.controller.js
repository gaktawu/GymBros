export class PaymentController {
  constructor(paymentUseCase) {
    this.paymentUseCase = paymentUseCase;
  }

  createInvoice = async (req, res) => {
    const idUser = req.user.id_user;
    const invoice = await this.paymentUseCase.createInvoice(idUser, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Invoice berhasil dibuat',
      data: invoice,
    });
  };

  getInvoice = async (req, res) => {
    const { id } = req.params;
    const invoice = await this.paymentUseCase.getInvoice(id);
    
    res.status(200).json({
      success: true,
      data: invoice,
    });
  };

  // Endpoint khusus untuk testing simulasi pelunasan (biasanya dipanggil oleh API Gateway Eksternal)
  simulateQRIS = async (req, res) => {
    const { id } = req.params;
    const result = await this.paymentUseCase.simulateWebhookSuccess(id);
    
    res.status(200).json({
      success: true,
      message: 'Simulasi pembayaran QRIS berhasil. Tagihan Lunas!',
      data: result,
    });
  };
}