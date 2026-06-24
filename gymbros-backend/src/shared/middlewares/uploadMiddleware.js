import multer from 'multer';
import { AppError } from '../core/AppError.js';

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Hanya file gambar yang diperbolehkan', 400), false);
    }
  },
});