import { AppError } from '../../../shared/core/AppError.js';
import { GymClass } from '../domain/GymClass.js';

export class ClassUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async createClass(data) {
    // 1. Validasi Domain (Memastikan jadwal masuk akal)
    const proposedClass = new GymClass(data);
    if (!proposedClass.isValidSchedule()) {
      throw new AppError('Waktu selesai tidak boleh lebih awal dari waktu mulai', 400);
    }
    
    // 2. Cegah pembuatan kelas di masa lalu
    if (proposedClass.isPast()) {
      throw new AppError('Tidak dapat menjadwalkan kelas untuk waktu yang sudah berlalu', 400);
    }

    return await this.classRepository.create(data);
  }

  async getAllClasses() {
    return await this.classRepository.findAll();
  }
  
  async getClassById(idKelas) {
    const gymClass = await this.classRepository.findById(idKelas);
    if (!gymClass) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }
    return gymClass;
  }
}