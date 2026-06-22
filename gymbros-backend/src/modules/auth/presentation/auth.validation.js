import { z } from 'zod';

export const registerSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(150),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  noTelepon: z.string().min(10, 'Nomor telepon tidak valid').optional(),
  peran: z.enum(['Admin', 'Member', 'Coach']).default('Member'),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});