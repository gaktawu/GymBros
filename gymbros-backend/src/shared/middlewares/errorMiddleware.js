export const globalErrorHandler = (err, req, res, next) => {
  console.error('Error Details:', err); 

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;

  // Selalu ambil string message murni — jangan pernah teruskan err.request/err.response/err itu sendiri
  let message = 'Internal Server Error';
  if (typeof err?.message === 'string' && err.message.trim() !== '') {
    message = err.message;
  } else if (err?.response?.data?.error_messages) {
    // contoh: pesan error dari Midtrans API biasanya array string di error_messages
    message = Array.isArray(err.response.data.error_messages)
      ? err.response.data.error_messages.join(', ')
      : String(err.response.data.error_messages);
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};