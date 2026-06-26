export class NotificationUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async createNotification(id_user, judul, pesan) {
    return await this.notificationRepository.save({
      id_user,
      judul,
      pesan,
      status_baca: 0
    });
  }
}