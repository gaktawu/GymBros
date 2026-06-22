import { z } from 'zod';

export const createRefundSchema = z.object({
  idPayment: z.string().min(1, 'ID Payment wajib diisi'),
  idSesi: z.number().int().positive(),
  totalAwal: z.number().positive(),
  potonganDenda: z.number().nonnegative(),
  informasiRekening: z.string().min(10, 'Informasi rekening & bank tujuan harus jelas'),
});