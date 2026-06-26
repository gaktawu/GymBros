import { coreApi } from '../../../shared/config/midtrans.js';

export class PaymentController {
  constructor(paymentUseCase) {
    this.paymentUseCase = paymentUseCase;
  }

  handleMidtransWebhook = async (req, res, next) => {
    try {
      const notificationJson = req.body;
      const statusResponse = await coreApi.transaction.notification(notificationJson);
      await this.paymentUseCase.processWebhook(statusResponse);
      res.status(200).json({ status: 'OK' });
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(500).json({ error: error.message });
    }
  };

  createInvoice = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.createInvoice(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInvoice = async (req, res, next) => {
    try {
      const result = await this.paymentUseCase.getInvoice(req.params.id);
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
}