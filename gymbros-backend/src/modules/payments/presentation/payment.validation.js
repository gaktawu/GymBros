import { z } from 'zod';

export const createInvoiceSchema = z
  .object({
    kategoriTransaksi: z.enum(['Membership', 'Paket_Coaching', 'Kelas']),
    idPaket: z.number().int().positive().optional(),
    idCoach: z.number().int().positive().optional(),
    totalSesi: z.number().int().positive().optional(),
    idKelas: z.number().int().positive().optional(),
    // Metode wajib diisi sebagai label awal; Midtrans Snap akan menangani seleksi metode final
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
  )
  .refine(
    (data) => data.kategoriTransaksi !== 'Kelas' || !!data.idKelas,
    {
      message: 'idKelas wajib diisi untuk kategori Kelas',
      path: ['idKelas'],
    }
  );