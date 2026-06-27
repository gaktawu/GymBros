import { AppError } from '../../../shared/core/AppError.js';

export class ClassBookingUseCase {
  constructor(classBookingRepository, membershipRepository, classRepository) {
    this.classBookingRepository = classBookingRepository;
    this.membershipRepository = membershipRepository;
    this.classRepository = classRepository;
  }

  async bookClass(idUser, idKelas) {
    const activeMembership = await this.membershipRepository.findActiveByUserId(idUser);
    if (!activeMembership) throw new AppError('Anda harus memiliki membership aktif', 403);

    const activeBookingsCount = await this.classBookingRepository.countActiveBookingsByUser(idUser);
    if (activeBookingsCount >= 3) throw new AppError('Batas maksimal 3 booking', 400);

    const existingBooking = await this.classBookingRepository.checkExistingBooking(idUser, idKelas);
    if (existingBooking) throw new AppError('Anda sudah mem-booking kelas ini', 400);

    const gymClass = await this.classRepository.findById(idKelas);
    if (!gymClass) throw new AppError('Kelas tidak ditemukan', 404);

    // Cek Kapasitas menggunakan fungsi repository yang benar
    const participantCount = await this.classBookingRepository.countParticipantsInClass(idKelas);
    if (participantCount >= gymClass.kapasitas) {
      throw new AppError('Mohon maaf, kelas ini sudah penuh', 400);
    }

    return await this.classBookingRepository.create(idUser, idKelas);
  }

  async cancelBooking(idUser, idBooking) {
    // Ambil detail booking (membutuhkan waktu_mulai kelas untuk validasi H-2)
    const bookingDetails = await this.classBookingRepository.findBookingWithClassDetails(idBooking);
    
    if (!bookingDetails) {
      throw new AppError('Data booking tidak ditemukan', 404);
    }

    // Validasi kepemilikan booking
    if (bookingDetails.id_user !== idUser) {
      throw new AppError('Anda tidak memiliki hak untuk membatalkan booking ini', 403);
    }

    if (bookingDetails.status === 'Cancelled') {
      throw new AppError('Booking ini sudah dibatalkan sebelumnya', 400);
    }

    // Aturan 5: Validasi H-2 Jam Pembatalan
    const classStartTime = new Date(bookingDetails.waktu_mulai);
    const currentTime = new Date();
    
    // Konversi selisih milidetik ke jam
    const diffInHours = (classStartTime - currentTime) / (1000 * 60 * 60);
    
    if (diffInHours < 2) {
      throw new AppError('Pembatalan kelas hanya dapat dilakukan maksimal 2 jam sebelum kelas dimulai', 400);
    }

    return await this.classBookingRepository.cancelBooking(idBooking);
  }
}