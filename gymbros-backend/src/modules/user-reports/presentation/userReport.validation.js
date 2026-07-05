// presentation/userReport.validation.js
import { z } from 'zod';

export const createReportSchema = z.object({
  judul: z.string().min(5, 'Judul laporan minimal 5 karakter').max(150),
  pesan: z.string().min(10, 'Isi laporan harus detail, minimal 10 karakter'),
});

export const updateReportSchema = z.object({
  judul: z.string().min(5, 'Judul laporan minimal 5 karakter').max(150),
  pesan: z.string().min(10, 'Isi laporan harus detail, minimal 10 karakter'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'In Progress', 'Resolved', 'Closed'])
});