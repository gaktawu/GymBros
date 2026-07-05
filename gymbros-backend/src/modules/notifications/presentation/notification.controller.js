// src/modules/notifications/interfaces/notification.controller.js
export class NotificationController {
  constructor(notificationUseCase, notificationService) {
    this.notificationUseCase = notificationUseCase;
    this.notificationService = notificationService;
  }

  getMyNotifications = async (req, res) => {
    const idUser = req.user.id_user; 
    const notifications = await this.notificationUseCase.getMyNotifications(idUser);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar notifikasi',
      data: notifications.map(n => n.toJSON()),
    });
  };

  getAllNotifications = async (req, res) => {
    const notifications = await this.notificationUseCase.getAllNotifications();

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua notifikasi',
      data: notifications.map(n => n.toJSON()),
    });
  };

  markAsRead = async (req, res) => {
    const idUser = req.user.id_user;
    const { id } = req.params; 

    const notification = await this.notificationUseCase.readNotification(idUser, id);

    res.status(200).json({
      success: true,
      message: 'Notifikasi telah ditandai sebagai dibaca',
      data: notification ? notification.toJSON() : null,
    });
  };

  deleteNotification = async (req, res) => {
    const idUser = req.user.id_user; 
    const userRole = req.user.role; 
    const { id } = req.params; 

    if (userRole === 'Admin') {
      await this.notificationUseCase.deleteNotificationAdmin(id);
    } else {
      await this.notificationUseCase.deleteNotification(idUser, id);
    }

    res.status(200).json({
      success: true,
      message: 'Notifikasi berhasil dihapus secara permanen',
    });
  };

  triggerNotification = async (req, res) => {
    const idUser = req.user.id_user;
    const { judul, pesan } = req.body;

    // Hanya kirim notifikasi ke Member (status: Menunggu Pembayaran)
    await this.notificationUseCase.createNotification(idUser, judul, pesan);

    // BLOK KODE UNTUK NOTIFY ADMIN TELAH DIHAPUS DARI SINI
    // Admin tidak akan lagi menerima notifikasi saat member baru klik "Lanjut Bayar"

    res.status(201).json({
      success: true,
      message: 'Notifikasi berhasil dipicu dan disimpan ke database (Hanya Member)',
    });
  };
}