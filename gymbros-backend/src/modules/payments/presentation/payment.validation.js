import { z } from 'zod';

export const createInvoiceSchema = z.object({
  kategoriTransaksi: z.enum(['Membership', 'Paket_Coaching']),
  totalTagihan: z.number().positive('Total tagihan harus lebih dari 0'),
  metode: z.string().min(2, 'Metode pembayaran wajib diisi (misal: QRIS, Transfer)'),
});