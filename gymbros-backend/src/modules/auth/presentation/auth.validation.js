import { z } from 'zod';

export const registerSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  noHp: z.string().min(10, 'Nomor HP tidak valid'),
  role: z.enum(['Admin', 'Coach', 'Member'], {
    errorMap: () => ({ message: 'Role harus Admin, Coach, atau Member' })
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});