// domain/UserReport.js
export class UserReport {
  constructor({ idReport, idUser, judul, pesan, status, dibuatPada, namaLengkap, email }) {
    this.idReport = idReport;
    this.idUser = idUser;
    this.judul = judul;
    this.pesan = pesan;
    this.status = status;
    this.dibuatPada = dibuatPada;
    this.namaLengkap = namaLengkap;
    this.email = email;
  }
}