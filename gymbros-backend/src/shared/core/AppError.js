export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Jika status code diawali angka 4 (misal 400, 404), maka statusnya 'fail' (client error)
    // Selain itu (misal 500), maka statusnya 'error' (server error)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Penanda bahwa error ini memang kita yang buat/prediksi (operational error)
    // Bukan error dari bug sistem atau library pihak ketiga
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}