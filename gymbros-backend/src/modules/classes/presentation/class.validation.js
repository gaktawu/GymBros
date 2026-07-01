import { AppError } from '../../../shared/core/AppError.js';

export const validateClassInput = (req, res, next) => {
    const { nama_kelas, pengajar, hari, jam_mulai, jam_selesai } = req.body;
    const errors = [];

    if (!nama_kelas || String(nama_kelas).trim() === '') errors.push('Nama kelas tidak boleh kosong');
    if (!pengajar || String(pengajar).trim() === '') errors.push('Pengajar tidak boleh kosong');
    if (!hari || String(hari).trim() === '') errors.push('Hari tidak boleh kosong');
    if (!jam_mulai) errors.push('Jam mulai tidak boleh kosong');
    if (!jam_selesai) errors.push('Jam selesai tidak boleh kosong');

    if (errors.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Validasi gagal',
            errors
        });
    }
    next();
};

export const validateIdParam = (req, res, next) => {
    const { id } = req.params;

    if (
        id === undefined ||
        id === null ||
        id === 'undefined' ||
        id === 'null' ||
        String(id).trim() === '' ||
        isNaN(Number(id))
    ) {
        throw new AppError(`ID tidak valid: "${id}"`, 400);
    }

    next();
};
