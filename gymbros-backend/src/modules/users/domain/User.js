export class User {
  // Sesuaikan properti dengan nama kolom database
  constructor({ idUser, namaLengkap, email, passwordHash, noTelepon, peran, statusAkun }) {
    this.idUser = idUser;
    this.namaLengkap = namaLengkap;
    this.email = email;
    this.passwordHash = passwordHash; 
    this.noTelepon = noTelepon;
    this.peran = peran;
    this.statusAkun = statusAkun;
  }

  isActive() {
    return this.statusAkun === 'Aktif';
  }

  toJSON() {
    return {
      idUser: this.idUser,
      namaLengkap: this.namaLengkap,
      email: this.email,
      noTelepon: this.noTelepon,
      peran: this.peran,
      statusAkun: this.statusAkun,
    };
  }
}