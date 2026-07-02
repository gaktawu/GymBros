import midtransClient from 'midtrans-client';
import dotenv from 'dotenv'; // Tambahkan ini

dotenv.config();

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// console.log('--- STATUS MIDTRANS INIT ---');
// // Tanda kutip tunggal ini akan memperlihatkan jika ada spasi berlebih
// console.log(`Server Key Terbaca: '${process.env.MIDTRANS_SERVER_KEY}'`); 
// console.log('Is Production:', process.env.MIDTRANS_IS_PRODUCTION);
// console.log('----------------------------');