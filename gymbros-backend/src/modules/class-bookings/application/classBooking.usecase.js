import { AppError } from '../../../shared/core/AppError.js';

export class ClassBookingUseCase {
  constructor(classBookingRepository, membershipRepository, classRepository) {
    this.classBookingRepository = classBookingRepository;
    this.membershipRepository = membershipRepository;
    this.classRepository = classRepository;
  }

  async bookClass(idUser, idKelas) {
    // Aturan 1: Member wajib memiliki membership aktif
    const activeMembership = await this.membershipRepository.findActiveByUserId(idUser);
    if (!activeMembership) {
      throw new AppError('Anda harus memiliki membership aktif untuk mem-booking kelas', 403);
    }

    // Aturan 2: Maksimal 3 booking aktif
    const activeBookingsCount = await this.classBookingRepository.countActiveBookingsByUser(idUser);
    if (activeBookingsCount >= 3) {
      throw new AppError('Batas maksimal booking tercapai. Anda hanya boleh memiliki maksimal 3 kelas yang dibooking pada satu waktu', 400);
    }

    // Aturan 3: Dilarang double booking
    const existingBooking = await this.classBookingRepository.checkExistingBooking(idUser, idKelas);
    if (existingBooking) {
      throw new AppError('Anda sudah mem-booking kelas ini', 400);
    }

    // Ambil data kelas
    const gymClass = await this.classRepository.findById(idKelas);
    if (!gymClass) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    // Cegah booking kelas yang sudah lewat
    if (gymClass.isPast()) {
      throw new AppError('Tidak dapat mem-booking kelas yang sudah dimulai atau berlalu', 400);
    }

    // Aturan 4: Cek Kapasitas Kelas
    const participantCount = await this.classBookingRepository.countParticipantsInClass(idKelas);
    if (participantCount >= gymClass.kapasitas) {
      throw new AppError('Mohon maaf, kelas ini sudah penuh', 400);
    }

    // Eksekusi pembuatan booking
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