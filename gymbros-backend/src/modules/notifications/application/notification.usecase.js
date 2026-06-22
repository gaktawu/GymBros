import { AppError } from '../../../shared/core/AppError.js';

export class NotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async getMyNotifications(idUser) {
    return await this.notificationRepository.findByUserId(idUser);
  }

  async readNotification(idUser, idNotifikasi) {
    const updatedNotification = await this.notificationRepository.markAsRead(idNotifikasi, idUser);
    
    if (!updatedNotification) {
      throw new AppError('Notifikasi tidak ditemukan atau Anda tidak memiliki akses.', 404);
    }

    return updatedNotification;
  }
}