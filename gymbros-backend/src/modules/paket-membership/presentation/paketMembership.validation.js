import { z } from 'zod';

export const createPaketSchema = z.object({
  namaPaket: z.string().min(3, 'Nama paket minimal 3 karakter'),
  durasiHari: z.number().int().positive('Durasi hari harus bilangan bulat positif'),
  harga: z.number().nonnegative('Harga tidak boleh kurang dari 0'),
});

export const updateStatusSchema = z.object({
  statusAktif: z.enum(['Tersedia', 'Tidak Tersedia'], {
    errorMap: () => ({ message: 'Status harus Tersedia atau Tidak Tersedia' })
  }),
});