import { z } from 'zod';

export const subscribeSchema = z.object({
  // Zod memastikan input idPaket ada dan bertipe number
  idPaket: z.number().int().positive('ID Paket tidak valid'),
});