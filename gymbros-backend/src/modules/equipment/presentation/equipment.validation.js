import { z } from 'zod';

export const createEquipmentSchema = z.object({
  idAlat: z.string().min(3, 'Kode alat minimal 3 karakter (contoh: EQ001)'),
  namaAlat: z.string().min(3, 'Nama alat minimal 3 karakter'),
  kategori: z.string().min(2, 'Kategori harus diisi'),
  statusKondisi: z.enum(['Available', 'Maintenance', 'Broken']),
  statusKetersediaan: z.string().min(1, 'Label ketersediaan harus diisi'),
});

export const updateStatusEquipmentSchema = z.object({
  statusKondisi: z.enum(['Available', 'Maintenance', 'Broken']),
});