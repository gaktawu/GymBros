import { AppError } from '../../../shared/core/AppError.js';

export class PaymentUseCase {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  async createInvoice(idUser, data) {
    // Di aplikasi nyata, totalTagihan tidak boleh diinput manual dari request client
    // melainkan dihitung berdasarkan ID Paket yang dipilih untuk mencegah manipulasi harga.
    return await this.paymentRepository.createInvoice({ idUser, ...data });
  }

  async getInvoice(idPayment) {
    const invoice = await this.paymentRepository.findById(idPayment);
    if (!invoice) throw new AppError('Invoice tidak ditemukan', 404);
    return invoice;
  }

  // Simulasi Webhook dari Payment Gateway (misal: Midtrans/QRIS terbayar)
  async simulateWebhookSuccess(idPayment) {
    const invoice = await this.paymentRepository.findById(idPayment);
    
    if (!invoice) {
      throw new AppError('Invoice tidak ditemukan', 404);
    }
    
    if (!invoice.isPending()) {
      throw new AppError('Pembayaran ini sudah lunas atau dibatalkan', 400);
    }

    // Melunasi tagihan secara penuh
    return await this.paymentRepository.processPaymentSuccess(idPayment, invoice.totalTagihan);
  }
}