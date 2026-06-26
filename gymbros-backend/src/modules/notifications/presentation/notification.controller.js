export class NotificationController {
  constructor(notificationUseCase) {
    this.notificationUseCase = notificationUseCase;
  }

  getMyNotifications = async (req, res) => {
    const idUser = req.user.id_user; // Dari token JWT
    const notifications = await this.notificationUseCase.getMyNotifications(idUser);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar notifikasi',
      data: notifications,
    });
  };

  markAsRead = async (req, res) => {
    const idUser = req.user.id_user;
    const { id } = req.params; // idNotifikasi

    const notification = await this.notificationUseCase.readNotification(idUser, id);

    res.status(200).json({
      success: true,
      message: 'Notifikasi telah ditandai sebagai dibaca',
      data: notification,
    });
  };

  deleteNotification = async (req, res) => {
    const idUser = req.user.id_user; // Dari token JWT
    const { id } = req.params; // idNotifikasi

    await this.notificationUseCase.deleteNotification(idUser, id);

    res.status(200).json({
      success: true,
      message: 'Notifikasi berhasil dihapus secara permanen',
    });
  };
}