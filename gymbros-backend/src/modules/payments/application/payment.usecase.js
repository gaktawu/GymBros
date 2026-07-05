import { AppError } from '../../../shared/core/AppError.js';
import { snap } from '../../../shared/config/midtrans.js';
import { verifyMidtransSignature } from '../infrastructure/midtransSignature.js';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
}

export class PaymentUseCase {
  constructor(paymentRepo, notificationService = null) {
    this.paymentRepo = paymentRepo;
    this.notificationService = notificationService;
  }

  async createInvoice(idUser, payload) {
    const { kategoriTransaksi, idPaket, idKelas, metode } = payload;

    if (kategoriTransaksi === 'Membership') {
      return this._createMembershipInvoice(idUser, idPaket, metode);
    }

    if (kategoriTransaksi === 'Kelas') {
      return this._createKelasInvoice(idUser, idKelas, metode);
    }

    throw new AppError('Kategori transaksi tidak dikenali atau tidak didukung', 400);
  }

  async _createMembershipInvoice(idUser, idPaket, metode) {
    const paket = await this.paymentRepo.getPaketMembershipById(idPaket);
    if (!paket) {
      throw new AppError('Paket membership tidak ditemukan atau tidak tersedia', 404);
    }

    const existingPending = await this.paymentRepo.findActivePendingInvoiceByReference(idUser, 'MBR', idPaket);
    if (existingPending) {
      if (existingPending.snapToken) {
        // Masih ada token valid → tinggal pakai lagi, tidak perlu hit Midtrans
        return this._reissueSnapToken(existingPending);
      }

      // LOGIKA SELF-HEAL: Invoice "orphan" (Tercatat Pending tapi snapToken tidak pernah sukses dibuat)
      console.warn(`[Invoice Orphan] ${existingPending.idPayment} berstatus Pending tanpa snapToken. Menandai gagal otomatis.`);
      await this.paymentRepo.markAsFailed(existingPending.idPayment);
      // Eksekusi dibiarkan lolos ke bawah untuk membuat baris invoice baru dengan ID baru
    }

    const totalTagihan = Number(paket.harga);
    const idPayment = `MBR-${idPaket}-${idUser}-${Date.now()}`;
    const itemDetails = [
      { id: `PKT-${idPaket}`, price: totalTagihan, quantity: 1, name: paket.nama_paket },
    ];

    return this._persistAndCreateSnap({ idPayment, idUser, kategoriTransaksi: 'Membership', totalTagihan, metode, itemDetails });
  }

  async _createKelasInvoice(idUser, idKelas, metode) {
    // ── Self-heal: cek invoice pending lama untuk kelas ini ──
    const existingPending = await this.paymentRepo.findActivePendingInvoiceByReference(idUser, 'KLS', idKelas);
    if (existingPending) {
      if (existingPending.snapToken) {
        return this._reissueSnapToken(existingPending);
      }
      console.warn(`[Invoice Orphan] ${existingPending.idPayment} berstatus Pending tanpa snapToken. Menandai gagal & membatalkan reserved.`);
      await this.paymentRepo.runInTransaction(async (client) => {
        await this.paymentRepo.markAsFailed(existingPending.idPayment, client);
        await this.paymentRepo.cancelReservedBookingByPaymentId(existingPending.idPayment, client);
      });
    }

    // ── Transaction: Lock → Cek → Reserve → Create Invoice ──
    const { payment, kelas } = await this.paymentRepo.runInTransaction(async (client) => {
      const kelas = await this.paymentRepo.lockKelasForUpdate(idKelas, client);
      if (!kelas) throw new AppError('Kelas tidak ditemukan atau sudah dihapus', 404);
      if (new Date(kelas.waktu_mulai) < new Date()) {
        throw new AppError('Kelas sudah berlangsung atau berakhir', 400);
      }

      const alreadyBooked = await this.paymentRepo.isUserAlreadyBookedOrReserved(idKelas, idUser, client);
      if (alreadyBooked) throw new AppError('Anda sudah terdaftar di kelas ini', 409);

      const overlap = await this.paymentRepo.isUserBookingOverlapIncludingReserved(
        idUser, kelas.waktu_mulai, kelas.waktu_selesai, client
      );
      if (overlap) throw new AppError('Jadwal kelas ini bertabrakan dengan kelas lain yang sudah Anda booking', 409);

      const bookedCount = await this.paymentRepo.countBookingAndReservedById(idKelas, client);
      if (bookedCount >= kelas.kapasitas) {
        throw new AppError('Kelas sudah penuh, silakan pilih kelas lain', 409);
      }

      const totalTagihan = Number(kelas.harga || 0);
      const idPayment = `KLS-${idKelas}-${idUser}-${Date.now()}`;

      await this.paymentRepo.createReservedBooking({ idKelas, idUser, idPayment }, client);

      const payment = await this.paymentRepo.createInvoice(
        { idPayment, idUser, kategoriTransaksi: 'Kelas', totalTagihan, metode }, client
      );

      return { payment, kelas };
    });

    // ── Midtrans Snap (di luar transaction) ──
    try {
      const midtransResponse = await snap.createTransaction({
        transaction_details: {
          order_id: payment.idPayment,
          gross_amount: Math.round(payment.totalTagihan),
        },
        item_details: [
          { id: `KLS-${idKelas}`, price: Math.round(payment.totalTagihan), quantity: 1, name: kelas.nama_kelas },
        ],
        customer_details: { first_name: `User-${idUser}` },
        expiry: { duration: 30, unit: 'minute' }, // ⏱️ Invoice hanya berlaku 30 menit
      });

      await this.paymentRepo.saveSnapToken(payment.idPayment, midtransResponse.token, midtransResponse.redirect_url);

      return {
        idPayment: payment.idPayment,
        kategoriTransaksi: payment.kategoriTransaksi,
        totalTagihan: payment.totalTagihan,
        status: payment.status,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
      };
    } catch (midtransErr) {
      console.error('--- ERROR MIDTRANS ---');
      console.error(midtransErr?.ApiResponse?.error_messages || midtransErr.message);

      // Cleanup: lepas reserved seat + mark invoice gagal
      await this.paymentRepo.runInTransaction(async (client) => {
        await this.paymentRepo.cancelReservedBookingByPaymentId(payment.idPayment, client);
        await this.paymentRepo.markAsFailed(payment.idPayment, client);
      });

      throw new AppError('Gagal membuat transaksi pembayaran. Silakan coba lagi.', 502);
    }
  }

  async _persistAndCreateSnap({ idPayment, idUser, kategoriTransaksi, totalTagihan, metode, itemDetails }) {
    const payment = await this.paymentRepo.createInvoice({ idPayment, idUser, kategoriTransaksi, totalTagihan, metode });

    try {
      const midtransResponse = await snap.createTransaction({
        transaction_details: {
          order_id: idPayment,
          gross_amount: Math.round(totalTagihan),
        },
        item_details: itemDetails,
        customer_details: {
          first_name: `User-${idUser}`,
        },
      });

      // SIMPAN TOKEN KE DATABASE
      await this.paymentRepo.saveSnapToken(idPayment, midtransResponse.token, midtransResponse.redirect_url);

      return {
        idPayment: payment.idPayment,
        kategoriTransaksi: payment.kategoriTransaksi,
        totalTagihan: payment.totalTagihan,
        status: payment.status,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
      };
    } catch (midtransErr) {
      console.error('--- ERROR MIDTRANS ---');
      console.error(midtransErr?.ApiResponse?.error_messages || midtransErr.message);
      console.error('HTTP Status:', midtransErr?.httpStatusCode);
      console.error('----------------------');

      // Cegah invoice Pending menggantung tanpa Snap Token
      await this.paymentRepo.markAsFailed(idPayment);

      throw new AppError('Gagal membuat transaksi pembayaran. Silakan coba lagi.', 502);
    }
  }

  async _reissueSnapToken(existingPayment) {
    if (!existingPayment.snapToken) {
      throw new AppError(
        'Invoice tertunda ditemukan tetapi token pembayaran tidak tersedia. Silakan batalkan pesanan ini dan buat pesanan baru.',
        409
      );
    }

    return {
      idPayment: existingPayment.idPayment,
      kategoriTransaksi: existingPayment.kategoriTransaksi,
      totalTagihan: existingPayment.totalTagihan,
      status: existingPayment.status,
      snapToken: existingPayment.snapToken,
      redirectUrl: existingPayment.redirectUrl,
      note: 'Invoice Pending sebelumnya ditemukan, menggunakan Snap Token yang sudah ada',
    };
  }

  async getInvoice(idPayment, requestingUser) {
    const payment = await this.paymentRepo.findById(idPayment);
    if (!payment) {
      throw new AppError('Invoice tidak ditemukan', 404);
    }
    if (requestingUser.peran !== 'Admin' && payment.idUser !== requestingUser.id_user) {
      throw new AppError('Anda tidak memiliki akses ke invoice ini', 403);
    }
    return payment;
  }

  async getMyInvoices(idUser) {
    const invoices = await this.paymentRepo.findByUserId(idUser);
    return invoices.map((inv) => ({
      id: inv.idPayment,
      id_payment: inv.idPayment,
      nama_item:
        inv.kategoriTransaksi === 'Membership' ? 'Membership' :
          inv.kategoriTransaksi === 'Kelas' ? 'Kelas Gym' : 'Transaksi',
      metode: inv.metode,
      nominal: inv.totalTagihan,
      status: inv.status,
      tanggal: inv.waktuBayar || null,
      kategori: inv.kategoriTransaksi,
    }));
  }

  async processWebhook(notification) {
    if (!verifyMidtransSignature(notification)) {
      throw new AppError('Signature tidak valid, notifikasi ditolak', 403);
    }

    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      gross_amount: grossAmount,
    } = notification;

    if (orderId && orderId.startsWith('payment_notif_test')) {
      console.log(`[Webhook Test] Menerima dummy request dari Midtrans: ${orderId}`);
      return {
        success: true,
        status: 'Test Notification',
        note: 'Koneksi webhook Midtrans berhasil diuji.'
      };
    }

    const payment = await this.paymentRepo.findById(orderId);
    if (!payment) {
      throw new AppError(`Payment dengan order_id ${orderId} tidak ditemukan`, 404);
    }

    if (payment.status !== 'Pending') {
      return { success: true, status: payment.status, note: 'Callback diabaikan, invoice sudah pada status final' };
    }

    if (Number(grossAmount) !== Number(payment.totalTagihan)) {
      throw new AppError('Nominal pembayaran tidak sesuai dengan invoice', 400);
    }

    const isSuccess =
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept');
    const isFailed = ['cancel', 'deny', 'expire'].includes(transactionStatus);

    if (isSuccess) {
      return this._handleSettlement(payment, orderId, grossAmount);
    }

    if (isFailed) {
      const result = await this.paymentRepo.runInTransaction(async (client) => {
        const failedPayment = await this.paymentRepo.markAsFailed(orderId, client);
        if (failedPayment) {
          await this.paymentRepo.cancelReservedBookingByPaymentId(orderId, client);
        }
        return failedPayment;
      });

      if (!result) {
        const current = await this.paymentRepo.findById(orderId);
        return { success: true, status: current.status, note: 'Callback diabaikan, sudah diproses request lain' };
      }
      return { success: true, status: 'Gagal' };
    }

    return { success: true, status: 'Pending' };
  }

  async _handleSettlement(payment, orderId, grossAmount) {
    const result = await this.paymentRepo.runInTransaction(async (client) => {
      const paidPayment = await this.paymentRepo.markAsPaid(orderId, grossAmount, client);

      if (!paidPayment) {
        return { alreadyProcessed: true };
      }

      if (orderId.startsWith('MBR-')) {
        return this._settleMembership(payment, orderId, client);
      }
      if (orderId.startsWith('KLS-')) {
        return this._settleKelas(payment, orderId, client);
      }
      throw new AppError(`Format order_id tidak dikenali: ${orderId}`, 400);
    });

    if (result.alreadyProcessed) {
      const current = await this.paymentRepo.findById(orderId);
      return { success: true, status: current.status, note: 'Callback diabaikan, sudah diproses lebih dulu' };
    }

    if (this.notificationService) {
      const isConflict = result.detail === 'OVERBOOKED' || result.detail === 'OVERLAP';
      const title = isConflict ? 'Pembayaran Gagal — Konflik Booking' : 'Pembayaran Berhasil';
      const message = isConflict
        ? `Maaf, kelas "${result.kelasName}" tidak dapat dikonfirmasi karena konflik jadwal/kuota. Admin akan menghubungi Anda untuk refund.`
        : 'Terima kasih, pembayaran Anda telah kami terima dan aktif.';
      await this.notificationService.notifyMember(payment.idUser, title, message);
    }

    return {
      success: true,
      status: result.detail === 'OVERBOOKED' || result.detail === 'OVERLAP' ? 'Gagal' : 'Lunas',
      processed: result,
    };
  }

  async _settleMembership(payment, orderId, client) {
    const [, idPaket] = orderId.split('-');
    const paket = await this.paymentRepo.getPaketMembershipById(idPaket, client);
    if (!paket) {
      throw new AppError(`Paket membership ${idPaket} tidak ditemukan saat settlement`, 404);
    }

    const now = new Date();
    const existingMembership = await this.paymentRepo.lockMembershipForUpdate(payment.idUser, client);

    if (!existingMembership) {
      const tglMulai = now;
      const tglBerakhir = addDays(now, paket.durasi_hari);
      await this.paymentRepo.createMembership(
        { idUser: payment.idUser, idPaket, tglMulai, tglBerakhir, status: 'Aktif' },
        client
      );
      return { type: 'membership', detail: paket.nama_paket, action: 'created' };
    }

    const isStillActive = existingMembership.status === 'Aktif' && new Date(existingMembership.tgl_berakhir) > now;

    const tglMulai = isStillActive ? existingMembership.tgl_mulai : now;
    const tglBerakhir = isStillActive
      ? addDays(new Date(existingMembership.tgl_berakhir), paket.durasi_hari)
      : addDays(now, paket.durasi_hari);

    await this.paymentRepo.extendMembership(
      { idMembership: existingMembership.id_membership, tglMulai, tglBerakhir, status: 'Aktif' },
      client
    );
    return { type: 'membership', detail: paket.nama_paket, action: isStillActive ? 'extended' : 'reactivated' };
  }

  async _settleKelas(payment, orderId, client) {
    const [, idKelas] = orderId.split('-');
    const kelas = await this.paymentRepo.lockKelasForUpdate(idKelas, client);
    if (!kelas) {
      throw new AppError(`Kelas ${idKelas} tidak ditemukan saat settlement`, 404);
    }

    const reserved = await this.paymentRepo.findReservedBookingByPaymentId(orderId, client);
    if (!reserved) {
      const alreadyBooked = await this.paymentRepo.isUserAlreadyBooked(idKelas, payment.idUser, client);
      if (alreadyBooked) {
        return { type: 'kelas', detail: 'ALREADY_BOOKED', kelasName: kelas.nama_kelas };
      }
      throw new AppError(`Data reserved booking untuk ${orderId} tidak ditemukan`, 404);
    }

    const overlap = await this.paymentRepo.isUserBookingOverlap(
      payment.idUser, kelas.waktu_mulai, kelas.waktu_selesai, client, idKelas
    );
    if (overlap) {
      await this._failKelasSettlement(orderId, kelas, client, 'Jadwal bertabrakan dengan kelas lain saat konfirmasi pembayaran');
      return { type: 'kelas', detail: 'OVERLAP', kelasName: kelas.nama_kelas };
    }

    await this.paymentRepo.confirmReservedBooking(orderId, client);
    return { type: 'kelas', detail: kelas.nama_kelas };
  }

  async _failKelasSettlement(orderId, kelas, client, reason) {
    await this.paymentRepo.markAsFailed(orderId, client);
    await this.paymentRepo.cancelReservedBookingByPaymentId(orderId, client);

    const admins = await this.paymentRepo.findAdmins(client);
    for (const admin of admins) {
      await this.paymentRepo.createNotification(
        {
          idUser: admin.id_user,
          judul: 'Konflik Booking Kelas Terdeteksi',
          pesan: `Pembayaran ${orderId} untuk kelas "${kelas.nama_kelas}" gagal karena: ${reason}. Mohon tindak lanjut refund manual ke member.`,
        },
        client
      );
    }
  }

  async simulateQRIS(idPayment) {
    if (process.env.MIDTRANS_IS_PRODUCTION === 'true') {
      throw new AppError('Simulasi tidak diizinkan di environment production', 403);
    }
    const payment = await this.paymentRepo.findById(idPayment);
    if (!payment) throw new AppError('Invoice tidak ditemukan', 404);

    return {
      message:
        'Buka Midtrans Simulator (Sandbox Dashboard) atau panggil endpoint sandbox status API Midtrans untuk memicu settlement. Webhook akan otomatis memproses setelah itu.',
      idPayment,
      status: payment.status,
    };
  }

  async cancelInvoice(idPayment, requestingUser) {
    const payment = await this.paymentRepo.findById(idPayment);
    if (!payment) throw new AppError('Invoice tidak ditemukan', 404);
    if (requestingUser.peran !== 'Admin' && payment.idUser !== requestingUser.id_user) {
      throw new AppError('Anda tidak memiliki izin untuk membatalkan invoice ini', 403);
    }
    if (payment.status !== 'Pending') {
      throw new AppError(`Invoice tidak dapat dibatalkan karena sudah berstatus ${payment.status}`, 400);
    }

    try {
      await snap.transaction.cancel(idPayment);
      console.log(`[Midtrans] Transaksi ${idPayment} berhasil dibatalkan di sistem Midtrans.`);
    } catch (error) {
      console.warn(`[Midtrans Warning] Gagal membatalkan di Midtrans: ${error.message}`);
    }

    const canceledPayment = await this.paymentRepo.runInTransaction(async (client) => {
      const cp = await this.paymentRepo.markAsFailed(idPayment, client);
      await this.paymentRepo.cancelReservedBookingByPaymentId(idPayment, client);
      return cp;
    });

    return {
      success: true,
      message: 'Pesanan berhasil dibatalkan',
      data: { idPayment: canceledPayment.idPayment, status: canceledPayment.status }
    };
  }

  async getTransactionHistory(idUser, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 5;
    const search = queryParams.search || '';
    const offset = (page - 1) * limit;

    const invoices = await this.paymentRepo.getPaginatedHistory(idUser, search, limit, offset);
    const totalItems = await this.paymentRepo.countHistory(idUser, search);
    const totalPages = Math.ceil(totalItems / limit);

    const data = invoices.map((inv) => ({
      id_payment: inv.idPayment,
      nama_item: inv.namaItemSpesifik || (inv.kategoriTransaksi === 'Membership' ? 'Membership' : 'Kelas Gym'),
      metode: inv.metode,
      nominal: inv.totalTagihan,
      status: inv.status,
      tanggal: inv.waktuBayar || null,
      kategori: inv.kategoriTransaksi,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async getRevenueStats(requestingUser) {
    const userRole = requestingUser?.peran || requestingUser?.role;

    if (!userRole || userRole.toLowerCase() !== 'admin') {
      throw new AppError('Anda tidak memiliki akses untuk melihat statistik pendapatan', 403);
    }

    const stats = await this.paymentRepo.getRevenueStats();

    return {
      success: true,
      data: {
        totalPendapatan: stats.totalRevenue,
        pendapatanBulanIni: stats.monthlyRevenue
      }
    };
  }

  async expireStaleReservedBookings() {
    const stale = await this.paymentRepo.runInTransaction(async (client) => {
      return this.paymentRepo.expireStaleReservedBookings(30, client);
    });

    if (stale.length > 0) {
      console.log(`[Cron] Expired ${stale.length} stale reserved bookings:`, stale.map(s => s.id_payment));
      if (this.notificationService) {
        for (const item of stale) {
          await this.notificationService.notifyMember(
            item.id_user,
            'Pemesanan Kelas Dibatalkan',
            'Pemesanan kelas Anda dibatalkan karena melewati batas waktu pembayaran (30 menit). Kuota telah dilepas kembali.'
          );
        }
      }
    }

    return {
      success: true,
      expiredCount: stale.length,
      expiredIds: stale.map(s => s.id_payment),
    };
  }
}