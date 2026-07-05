import { AppError } from '../../../shared/core/AppError.js';

export class ClassUseCase {
    constructor(classRepository) {
        this.repository = classRepository;
    }

    async getAllClasses(filters = {}) {
        return await this.repository.findAll(filters);
    }

    async getClassById(id) {
        const gymClass = await this.repository.findById(id);
        if (!gymClass) {
            throw new AppError('Kelas tidak ditemukan', 404);
        }
        return gymClass;
    }

    async createClass(data) {
        return await this.repository.create(data);
    }

    async updateClass(id, data) {
        // Validasi ketersediaan
        await this.getClassById(id);
        return await this.repository.update(id, data);
    }

    async deleteClass(id) {
        await this.getClassById(id);
        return await this.repository.delete(id);
    }

    async getParticipants(id) {
        await this.getClassById(id);
        return await this.repository.findParticipantsByClassId(id);
    }
    async getMyBookedClasses(userId) {
        if (!userId) {
            throw new AppError('User ID wajib diisi', 400);
        }
        return await this.repository.findBookingsByUserId(userId);
    }
}

export class ClassBookingUseCase {
    constructor(classBookingRepository, classRepository) {
        this.bookingRepository = classBookingRepository;
        this.classRepository = classRepository;
    }

    async createBooking(userId, classId) {
        const targetClass = await this.classRepository.findById(classId);
        if (!targetClass) {
            throw new AppError('Kelas yang Anda pilih tidak ditemukan.', 404);
        }

        const existingBooking = await this.bookingRepository.findUserBookingInClass(userId, classId);
        if (existingBooking) {
            throw new AppError('Anda sudah terdaftar di kelas ini.', 400);
        }

        const currentParticipants = await this.classRepository.findParticipantsByClassId(classId);

        if (currentParticipants.length >= targetClass.kapasitas) {
            throw new AppError('Mohon maaf, kapasitas kelas ini sudah penuh.', 400);
        }

        const newBooking = {
            user_id: userId,
            class_id: classId,
            status: 'confirmed',
        };

        return await this.bookingRepository.create(newBooking);
    }
}
