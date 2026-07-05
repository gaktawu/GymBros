export class User {
  constructor({ idUser, namaLengkap, email, passwordHash, noTelepon, peran, statusAkun, fotoProfil, jenisKelamin }) {
    this.idUser = idUser;
    this.namaLengkap = namaLengkap;
    this.email = email;
    this.passwordHash = passwordHash; 
    this.noTelepon = noTelepon;
    this.peran = peran;
    this.statusAkun = statusAkun;
    this.fotoProfil = fotoProfil;
    this.jenisKelamin = jenisKelamin; 
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
      fotoProfil: this.fotoProfil,
      jenisKelamin: this.jenisKelamin, 
    };
  }
}