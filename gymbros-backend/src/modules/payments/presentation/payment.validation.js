import { z } from 'zod';

export const createInvoiceSchema = z
  .object({
    kategoriTransaksi: z.enum(['Membership', 'Paket_Coaching']),
    idPaket: z.number().int().positive().optional(),
    idCoach: z.number().int().positive().optional(),
    totalSesi: z.number().int().positive().optional(),
    metode: z.string().min(2, 'Metode pembayaran wajib diisi (misal: QRIS, Transfer)'),
  })
  .refine((data) => data.kategoriTransaksi !== 'Membership' || !!data.idPaket, {
    message: 'idPaket wajib diisi untuk kategori Membership',
    path: ['idPaket'],
  })
  .refine(
    (data) => data.kategoriTransaksi !== 'Paket_Coaching' || (!!data.idCoach && !!data.totalSesi),
    {
      message: 'idCoach dan totalSesi wajib diisi untuk kategori Paket_Coaching',
      path: ['idCoach'],
    }
  );