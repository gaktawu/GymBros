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

export const globalErrorHandler = (err, req, res, next) => {
  console.error('Error Details:', err); // util.inspect aman, otomatis handle circular

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;

  let message = 'Internal Server Error';
  if (typeof err?.message === 'string' && err.message.trim() !== '') {
    message = err.message;
  } else if (err?.ApiResponse?.error_messages) {
    message = Array.isArray(err.ApiResponse.error_messages)
      ? err.ApiResponse.error_messages.join(', ')
      : String(err.ApiResponse.error_messages);
  }

  const safePayload = { success: false, message, statusCode };

  try {
    res.status(statusCode).json(safePayload);
  } catch (jsonErr) {
    // Fallback absolut — tidak mungkin gagal karena payload sudah primitif
    console.error('Gagal serialize error response:', jsonErr);
    res.status(500).json({ success: false, message: 'Internal Server Error', statusCode: 500 });
  }
};