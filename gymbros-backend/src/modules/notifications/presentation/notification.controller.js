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
    
    // Kita tangkap parameter detail transaksi dari body
    const { namaPaket, harga, statusEvent } = req.body; 

    if (!namaPaket || !harga || !statusEvent) {
        return res.status(400).json({
            success: false,
            message: 'Data tidak lengkap. Butuh namaPaket, harga, dan statusEvent (PENDING/SUCCESS)',
        });
    }

    // Eksekusi pembuatan notifikasi terpisah untuk Member dan Admin
    await this.notificationService.handlePaymentNotification(idUser, namaPaket, harga, statusEvent);

    res.status(201).json({
      success: true,
      message: 'Notifikasi berhasil dibuat dan dipisahkan untuk Member dan Admin',
    });
  };

  triggerPaymentNotification = async (req, res) => {
    const idUser = req.user.id_user;
    
    const { namaPaket, statusEvent } = req.body; 

    if (!namaPaket || !statusEvent) {
        return res.status(400).json({
            success: false,
            message: 'namaPaket dan statusEvent (PENDING/SUCCESS) wajib diisi'
        });
    }

    await this.notificationService.handlePaymentNotification(idUser, namaPaket, statusEvent);

    res.status(201).json({
      success: true,
      message: 'Notifikasi pembayaran berhasil dipicu untuk Member dan Admin',
    });
  };
}