import { z } from 'zod';

export const createClassSchema = z.object({
  namaKelas: z.string().min(3, 'Nama kelas minimal 3 karakter'),
  idPelatih: z.number().int().positive().optional().nullable(),
  kapasitas: z.number().int().positive('Kapasitas harus lebih dari 0'),
  waktuMulai: z.string().datetime({ message: 'Format waktu mulai harus ISO-8601' }),
  waktuSelesai: z.string().datetime({ message: 'Format waktu selesai harus ISO-8601' }),
  harga: z.number().min(0).default(0),
});