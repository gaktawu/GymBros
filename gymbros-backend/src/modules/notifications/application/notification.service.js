// src/modules/notifications/application/notification.service.js
export class NotificationService {
  constructor(notificationRepository, userRepository) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  async notifyAdmins(judul, pesan) {
    const admins = await this.userRepository.findUsersByRole('Admin');
    const notifications = admins.map(admin => ({ id_user: admin.id_user, judul, pesan, status_baca: 0 }));
    return await this.notificationRepository.saveMany(notifications);
  }

  async notifyMember(id_user, judul, pesan) {
    return await this.notificationRepository.createSystemNotification(id_user, judul, pesan);
  }

  // FUNGSI BARU UNTUK MENANGANI NOTIFIKASI PEMBAYARAN
  async handlePaymentNotification(idUser, namaPaket, harga, statusEvent) {
    // 1. Ambil data nama lengkap user
    // (Pastikan di UsersRepository Anda ada method findById atau sesuaikan dengan nama method yang ada)
    const user = await this.userRepository.findById(idUser); 
    const namaUser = user ? user.nama_lengkap : `User ID ${idUser}`;

    let judulMember, pesanMember, judulAdmin, pesanAdmin;

    // 2. Racik pesan yang berbeda total antara Member dan Admin
    if (statusEvent === 'PENDING') {
        // Pesan untuk MEMBER
        judulMember = 'Menunggu Pembayaran Membership';
        pesanMember = `Anda telah memilih paket ${namaPaket}. Silakan selesaikan pembayaran Anda sebesar Rp ${harga}.`;
        
        // Pesan untuk ADMIN (Berbeda sepenuhnya)
        judulAdmin = 'Pemesanan Membership Baru';
        pesanAdmin = `User dengan nama ${namaUser} baru saja membuat pesanan untuk paket ${namaPaket} dan saat ini sedang menunggu proses pembayaran.`;
    } 
    else if (statusEvent === 'SUCCESS') {
        // Pesan untuk MEMBER
        judulMember = 'Pembayaran Berhasil \uD83C\uDF89';
        pesanMember = `Pembayaran Anda untuk paket ${namaPaket} telah berhasil diverifikasi. Transaksi sukses!`;
        
        // Pesan untuk ADMIN (Berbeda sepenuhnya)
        judulAdmin = 'Pembayaran Membership Berhasil';
        pesanAdmin = `User dengan nama ${namaUser} telah menyelesaikan pembayaran untuk paket ${namaPaket}.`;
    }

    // 3. Simpan ke database untuk masing-masing role
    await this.notifyMember(idUser, judulMember, pesanMember);
    await this.notifyAdmins(judulAdmin, pesanAdmin);
  }
}