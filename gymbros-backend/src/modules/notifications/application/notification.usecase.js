// src/modules/notifications/application/notification.usecase.js
export class NotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async createNotification(id_user, judul, pesan) {
    return await this.notificationRepository.createSystemNotification(id_user, judul, pesan);
  }

  async getMyNotifications(idUser) {
    return await this.notificationRepository.findByUserId(idUser);
  }

  async getAllNotifications() {
    return await this.notificationRepository.findAll();
  }

  async readNotification(idUser, idNotifikasi) {
    return await this.notificationRepository.markAsRead(idNotifikasi, idUser);
  }

  async deleteNotification(idUser, idNotifikasi) {
    return await this.notificationRepository.deleteByIdAndUserId(idNotifikasi, idUser);
  }

  async deleteNotificationAdmin(idNotifikasi) {
    return await this.notificationRepository.deleteById(idNotifikasi);
  }
}