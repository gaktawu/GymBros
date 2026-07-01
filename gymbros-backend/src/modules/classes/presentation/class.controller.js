import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { AppError } from '../../../shared/core/AppError.js';

export class ClassController {
    constructor(classUseCase) {
        this.classUseCase = classUseCase;
    }

    getAllClasses = asyncHandler(async (req, res) => {
        const { search = '', page = 1, limit = 10 } = req.query;
        const result = await this.classUseCase.getAllClasses({ search, page, limit });

        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    });

    getClassById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const gymClass = await this.classUseCase.getClassById(id);
        res.status(200).json({ status: 'success', data: gymClass });
    });

    createClass = asyncHandler(async (req, res) => {
        const newClass = await this.classUseCase.createClass(req.body);
        res.status(201).json({ status: 'success', message: 'Kelas berhasil ditambahkan', data: newClass });
    });

    updateClass = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updatedClass = await this.classUseCase.updateClass(id, req.body);
        res.status(200).json({ status: 'success', message: 'Kelas berhasil diperbarui', data: updatedClass });
    });

    deleteClass = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await this.classUseCase.deleteClass(id);
        res.status(200).json({ status: 'success', message: 'Kelas berhasil dihapus' });
    });

    getParticipants = asyncHandler(async (req, res) => {
        const { id } = req.params;

        // id sudah divalidasi oleh middleware validateIdParam di routes,
        // pengecekan ini tetap dijaga sebagai defense-in-depth.
        if (!id || id === 'undefined' || isNaN(Number(id))) {
            throw new AppError('ID kelas tidak valid', 400);
        }

        const participants = await this.classUseCase.getParticipants(id);
        res.status(200).json({ status: 'success', data: participants });
    });
}
