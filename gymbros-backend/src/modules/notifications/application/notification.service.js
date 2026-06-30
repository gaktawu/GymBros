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
    return await this.notificationRepository.save({ id_user, judul, pesan, status_baca: 0 });
  }
}