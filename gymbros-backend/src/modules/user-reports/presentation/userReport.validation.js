import { z } from 'zod';

export const createReportSchema = z.object({
  judul: z.string().min(5, 'Judul laporan minimal 5 karakter').max(150),
  pesan: z.string().min(10, 'Isi laporan/keluhan harus detail, minimal 10 karakter'),
});