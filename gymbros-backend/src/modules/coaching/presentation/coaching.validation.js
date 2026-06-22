import { z } from 'zod';

export const createSessionSchema = z.object({
  tanggalSesi: z.string().date('Format tanggal harus YYYY-MM-DD'),
  waktuMulai: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu HH:MM'),
  waktuSelesai: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu HH:MM'),
});

export const buyPackageSchema = z.object({
  idCoach: z.number().int().positive('ID Coach tidak valid'),
});