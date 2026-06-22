import { z } from 'zod';

export const bookClassSchema = z.object({
  idKelas: z.number().int().positive('ID Kelas tidak valid'),
});