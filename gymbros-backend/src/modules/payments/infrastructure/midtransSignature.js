import crypto from 'crypto';

export function verifyMidtransSignature(notification = {}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const { order_id: orderId, status_code: statusCode, gross_amount: grossAmount, signature_key: signatureKey } = notification;

  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY belum diset di environment variable');
  }
  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }

  const expected = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  // timingSafeEqual mencegah timing attack saat membandingkan hash
  const expectedBuf = Buffer.from(expected, 'utf-8');
  const actualBuf = Buffer.from(String(signatureKey), 'utf-8');

  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}