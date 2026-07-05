import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { AppError } from '../../../shared/core/AppError.js';

export class ClassController {
    constructor(classUseCase) {
        this.classUseCase = classUseCase;
    }

    // PUBLIK / MEMBER: Hanya kelas aktif
    getAllClasses = asyncHandler(async (req, res) => {
        const { search = '', page = 1, limit = 10 } = req.query;
        const result = await this.classUseCase.getAllClasses({
            search, page, limit, includeDeleted: false
        });

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

    // ADMIN: Semua kelas termasuk yang diarsipkan
    getAllClassesAdmin = asyncHandler(async (req, res) => {
        const { search = '', page = 1, limit = 10 } = req.query;
        const result = await this.classUseCase.getAllClasses({
            search, page, limit, includeDeleted: true
        });

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
        const deletedClass = await this.classUseCase.deleteClass(id);
        res.status(200).json({
            status: 'success',
            message: 'Kelas berhasil diarsipkan',
            data: deletedClass
        });
    });

    getParticipants = asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!id || id === 'undefined' || isNaN(Number(id))) {
            throw new AppError('ID kelas tidak valid', 400);
        }

        const participants = await this.classUseCase.getParticipants(id);
        res.status(200).json({ status: 'success', data: participants });
    });

    getMyBookings = asyncHandler(async (req, res) => {
        const idUser = req.user.id_user;
        const bookings = await this.classUseCase.getMyBookedClasses(idUser);

        res.status(200).json({
            status: 'success',
            message: 'Berhasil mengambil daftar kelas yang dipesan',
            data: bookings
        });
    });

    getMyCoachClasses = asyncHandler(async (req, res) => {
        const coachId = req.user.id_user;
        const classes = await this.classUseCase.getCoachClasses(coachId);
        res.status(200).json({
            status: 'success',
            message: 'Berhasil mengambil kelas yang diajar',
            data: classes
        });
    });
}