export class PaymentController {
  constructor(paymentUseCase) {
    this.paymentUseCase = paymentUseCase;
  }

  handleMidtransWebhook = async (req, res) => {
    try {
      const result = await this.paymentUseCase.processWebhook(req.body);
      res.status(200).json({ status: 'OK', ...result });
    } catch (error) {
      console.error('Webhook Error:', error.message);
      const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
      res.status(statusCode).json({ status: 'FAILED', message: error.message });
    }
  };

  createInvoice = async (req, res, next) => {
    try {
      const idUser = req.user.id_user;
      const result = await this.paymentUseCase.createInvoice(idUser, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInvoice = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.getInvoice(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  simulateQRIS = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.simulateQRIS(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  cancelInvoice = async (req, res, next) => {
    try {
      // req.params.id didapat dari URL parameter /invoice/:id/cancel
      const result = await this.paymentUseCase.cancelInvoice(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}