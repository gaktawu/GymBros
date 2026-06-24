// D:\PemrogW\fp\GymBros\gymbros-backend\src\modules\users\domain\User.js

export class User {
  // Semua parameter menggunakan camelCase yang konsisten
  constructor({ idUser, namaLengkap, email, passwordHash, noTelepon, peran, statusAkun, fotoProfil }) {
    this.idUser = idUser;
    this.namaLengkap = namaLengkap;
    this.email = email;
    this.passwordHash = passwordHash; 
    this.noTelepon = noTelepon;
    this.peran = peran;
    this.statusAkun = statusAkun;
    this.fotoProfil = fotoProfil; // Menggunakan camelCase agar seragam
  }

  isActive() {
    return this.statusAkun === 'Aktif';
  }

  // WAJIB dimasukkan ke toJSON() agar field fotoProfil ikut keluar saat dipanggil di Controller!
  toJSON() {
    return {
      idUser: this.idUser,
      namaLengkap: this.namaLengkap,
      email: this.email,
      noTelepon: this.noTelepon,
      peran: this.peran,
      statusAkun: this.statusAkun,
      fotoProfil: this.fotoProfil, // Sekarang aman, tidak akan ketinggalan lagi
    };
  }
}