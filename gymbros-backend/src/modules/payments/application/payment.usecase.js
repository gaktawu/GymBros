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

  // ============================================================
  // CREATE INVOICE — Harga diambil 100% dari database.
  // Kategori didukung: Membership, Kelas (selaras dengan CHECK
  // constraint kolom kategori_transaksi di tabel payments).
  // ============================================================
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

    // Guard: cegah user membuat invoice Pending berkali-kali untuk paket yang sama
    // (spam klik "Bayar" / refresh browser).
    const existingPending = await this.paymentRepo.findActivePendingInvoiceByReference(idUser, 'MBR', idPaket);
    if (existingPending) {
      const itemDetails = [
        { id: `PKT-${idPaket}`, price: Number(existingPending.totalTagihan), quantity: 1, name: paket.nama_paket },
      ];
      return this._reissueSnapToken(existingPending, itemDetails, idUser);
    }

    const totalTagihan = Number(paket.harga);
    const idPayment = `MBR-${idPaket}-${idUser}-${Date.now()}`;
    const itemDetails = [
      { id: `PKT-${idPaket}`, price: totalTagihan, quantity: 1, name: paket.nama_paket },
    ];

    return this._persistAndCreateSnap({ idPayment, idUser, kategoriTransaksi: 'Membership', totalTagihan, metode, itemDetails });
  }

  async _createKelasInvoice(idUser, idKelas, metode) {
    const kelas = await this.paymentRepo.getKelasById(idKelas);
    if (!kelas) {
      throw new AppError('Kelas tidak ditemukan atau sudah dihapus', 404);
    }
    if (new Date(kelas.waktu_mulai) < new Date()) {
      throw new AppError('Kelas sudah berlangsung atau berakhir', 400);
    }

    const alreadyBooked = await this.paymentRepo.isUserAlreadyBooked(idKelas, idUser);
    if (alreadyBooked) {
      throw new AppError('Anda sudah terdaftar di kelas ini', 409);
    }

    // Validasi time-overlap: user tidak boleh booking dua kelas yang jadwalnya bertabrakan.
    const overlap = await this.paymentRepo.isUserBookingOverlap(idUser, kelas.waktu_mulai, kelas.waktu_selesai);
    if (overlap) {
      throw new AppError('Jadwal kelas ini bertabrakan dengan kelas lain yang sudah Anda booking', 409);
    }

    // Cek kuota (pre-emptive, final check di webhook dengan row lock)
    const bookedCount = await this.paymentRepo.countBookingKelasById(idKelas);
    if (bookedCount >= kelas.kapasitas) {
      throw new AppError('Kelas sudah penuh, silakan pilih kelas lain', 409);
    }

    // Guard: cegah duplicate invoice Pending untuk kelas yang sama
    const existingPending = await this.paymentRepo.findActivePendingInvoiceByReference(idUser, 'KLS', idKelas);
    if (existingPending) {
      const itemDetails = [
        { id: `KLS-${idKelas}`, price: Number(existingPending.totalTagihan), quantity: 1, name: kelas.nama_kelas },
      ];
      return this._reissueSnapToken(existingPending, itemDetails, idUser);
    }

    const totalTagihan = Number(kelas.harga || 0);
    const idPayment = `KLS-${idKelas}-${idUser}-${Date.now()}`;
    const itemDetails = [
      { id: `KLS-${idKelas}`, price: totalTagihan, quantity: 1, name: kelas.nama_kelas },
    ];

    return this._persistAndCreateSnap({ idPayment, idUser, kategoriTransaksi: 'Kelas', totalTagihan, metode, itemDetails });
  }

  // Insert invoice Pending lalu minta Snap Token. Jika Midtrans gagal, invoice langsung
  // ditandai Gagal (bukan dibiarkan Pending tanpa token) agar tidak jadi data orphan.
  async _persistAndCreateSnap({ idPayment, idUser, kategoriTransaksi, totalTagihan, metode, itemDetails }) {
    const payment = await this.paymentRepo.createInvoice({ idPayment, idUser, kategoriTransaksi, totalTagihan, metode });

    try {
      const midtransResponse = await snap.createTransaction({
        transaction_details: {
          order_id: idPayment,
          gross_amount: Math.round(totalTagihan), // Midtrans butuh angka bulat, hindari desimal
        },
        item_details: itemDetails,
        customer_details: {
          first_name: `User-${idUser}`,
        },
      });

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

  // Menerbitkan ulang Snap Token untuk invoice Pending yang sudah ada, alih-alih membuat
  // baris invoice baru (mencegah duplicate invoice akibat spam klik "Bayar").
  async _reissueSnapToken(existingPayment, itemDetails, idUser) {
    try {
      const midtransResponse = await snap.createTransaction({
        transaction_details: {
          order_id: existingPayment.idPayment,
          gross_amount: Math.round(Number(existingPayment.totalTagihan)),
        },
        item_details: itemDetails,
        customer_details: {
          first_name: `User-${idUser}`,
        },
      });

      return {
        idPayment: existingPayment.idPayment,
        kategoriTransaksi: existingPayment.kategoriTransaksi,
        totalTagihan: existingPayment.totalTagihan,
        status: existingPayment.status,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
        note: 'Invoice Pending sebelumnya ditemukan, Snap Token diterbitkan ulang',
      };
    } catch (midtransErr) {
      console.error('--- ERROR MIDTRANS (reissue) ---');
      console.error(midtransErr?.ApiResponse?.error_messages || midtransErr.message);
      throw new AppError('Gagal menerbitkan ulang transaksi pembayaran. Silakan coba lagi.', 502);
    }
  }

  // ============================================================
  // GET INVOICE — Authorization check
  // ============================================================
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

  // ============================================================
  // MY INVOICES — pemetaan response dipindah dari routing layer ke sini
  // ============================================================
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
      // waktu_bayar NULL untuk invoice yang belum Lunas — jangan dipalsukan jadi "sekarang".
      tanggal: inv.waktuBayar || null,
      kategori: inv.kategoriTransaksi,
    }));
  }

  // ============================================================
  // WEBHOOK — Satu-satunya sumber kebenaran status pembayaran.
  // Business logic (membership / booking kelas) HANYA dijalankan
  // setelah status settlement dikonfirmasi Midtrans di sini.
  // ============================================================
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

    // =========================================================================
    // BYPASS UNTUK MIDTRANS TEST NOTIFICATION
    // Jika order_id diawali dengan payment_notif_test, langsung return sukses.
    // Ini mengizinkan ping testing lewat tanpa mengorbankan keamanan transaksi asli.
    // =========================================================================
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

    // Idempotency + anti out-of-order: Pending adalah satu-satunya state yang boleh
    // diproses lebih lanjut. Kalau sudah Lunas/Gagal (final state), callback apa pun
    // setelahnya (duplicate, atau expire yang datang telat setelah settlement) diabaikan.
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
      const failedPayment = await this.paymentRepo.markAsFailed(orderId);
      if (!failedPayment) {
        // Row sudah diubah request lain di antara pengecekan awal dan UPDATE ini.
        const current = await this.paymentRepo.findById(orderId);
        return { success: true, status: current.status, note: 'Callback diabaikan, sudah diproses request lain' };
      }
      return { success: true, status: 'Gagal' };
    }

    // --- PENDING / CHALLENGE ---
    return { success: true, status: 'Pending' };
  }

  async _handleSettlement(payment, orderId, grossAmount) {
    const result = await this.paymentRepo.runInTransaction(async (client) => {
      const paidPayment = await this.paymentRepo.markAsPaid(orderId, grossAmount, client);

      // Guard race: jika ternyata sudah diproses request paralel lain (bukan Pending lagi
      // saat UPDATE dieksekusi), hentikan tanpa menjalankan business logic dua kali.
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

  // Aturan membership:
  // - Belum pernah punya membership -> buat baru (tgl_mulai = sekarang).
  // - Membership sedang Aktif & belum expired -> perpanjang (tgl_berakhir += durasi_hari,
  //   tgl_mulai TIDAK berubah).
  // - Membership sudah Expired/Cancelled atau tgl_berakhir sudah lewat -> reaktivasi
  //   dengan tgl_mulai baru (= sekarang).
  // Row membership dikunci (FOR UPDATE) agar dua settlement bersamaan untuk user yang sama
  // tidak saling menimpa (id_user bersifat UNIQUE di tabel membership).
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

  // Kelas dikunci (FOR UPDATE) lalu kuota, duplicate booking, dan time-overlap dicek ULANG
  // sebagai final check di dalam transaksi (bukan cuma pre-emptive check saat create invoice),
  // karena kondisi bisa berubah selama user menunggu pembayaran.
  async _settleKelas(payment, orderId, client) {
    const [, idKelas] = orderId.split('-');
    const kelas = await this.paymentRepo.lockKelasForUpdate(idKelas, client);
    if (!kelas) {
      throw new AppError(`Kelas ${idKelas} tidak ditemukan saat settlement`, 404);
    }

    const alreadyBooked = await this.paymentRepo.isUserAlreadyBooked(idKelas, payment.idUser, client);
    if (alreadyBooked) {
      await this._failKelasSettlement(orderId, kelas, client, 'User sudah terdaftar di kelas ini sebelumnya');
      return { type: 'kelas', detail: 'OVERBOOKED', kelasName: kelas.nama_kelas };
    }

    const bookedCount = await this.paymentRepo.countBookingKelasById(idKelas, client);
    if (bookedCount >= kelas.kapasitas) {
      await this._failKelasSettlement(orderId, kelas, client, 'Kelas penuh saat konfirmasi pembayaran');
      return { type: 'kelas', detail: 'OVERBOOKED', kelasName: kelas.nama_kelas };
    }

    const overlap = await this.paymentRepo.isUserBookingOverlap(
      payment.idUser, kelas.waktu_mulai, kelas.waktu_selesai, client, idKelas
    );
    if (overlap) {
      await this._failKelasSettlement(orderId, kelas, client, 'Jadwal bertabrakan dengan kelas lain saat konfirmasi pembayaran');
      return { type: 'kelas', detail: 'OVERLAP', kelasName: kelas.nama_kelas };
    }

    // id_payment WAJIB diisi agar audit trail booking <-> pembayaran terjaga.
    await this.paymentRepo.createBookingKelas({ idKelas, idUser: payment.idUser, idPayment: orderId }, client);
    return { type: 'kelas', detail: kelas.nama_kelas };
  }

  async _failKelasSettlement(orderId, kelas, client, reason) {
    await this.paymentRepo.markAsFailed(orderId, client);
    // Refund logic manual bisa ditambahkan di sini oleh tim finance.
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
}