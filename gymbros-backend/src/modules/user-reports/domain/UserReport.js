export class UserReport {
  constructor({ idReport, idUser, judul, pesan, status, dibuatPada }) {
    this.idReport = idReport;
    this.idUser = idUser;
    this.judul = judul;
    this.pesan = pesan;
    this.status = status; // 'Pending', 'Resolved', etc.
    this.dibuatPada = dibuatPada;
  }
}