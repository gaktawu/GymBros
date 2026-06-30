import { AppError } from '../../../shared/core/AppError.js';
import { GymClass } from '../domain/GymClass.js';

export class ClassUseCase {
  constructor(classRepository, notificationService) {
    this.classRepository = classRepository;
    this.notificationService = notificationService;
  }

  async createClass(data) {
    // 1. Validasi Domain
    const proposedClass = new GymClass(data);

    if (!proposedClass.isValidSchedule()) {
      throw new AppError(
        'Waktu selesai tidak boleh lebih awal dari waktu mulai',
        400
      );
    }

    // 2. Cegah pembuatan kelas di masa lalu
    if (proposedClass.isPast()) {
      throw new AppError(
        'Tidak dapat menjadwalkan kelas untuk waktu yang sudah berlalu',
        400
      );
    }

    // 3. Simpan ke database
    const kelas = await this.classRepository.create(data);

    // 4. Kirim notifikasi ke admin
    await this.notificationService.notifyAdmins(
      "Kelas Baru",
      `Kelas ${kelas.nama_kelas} telah dibuka.`
    );

    return kelas;
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