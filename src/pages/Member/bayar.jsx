import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const formatRupiah = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

// Mengambil Client Key dari environment variable Vite
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

// ============================================================
// MIDTRANS SCRIPT LOADER
// ============================================================
const loadMidtransScript = (onLoad) => {
  if (document.getElementById('midtrans-script')) {
    if (window.snap && onLoad) onLoad();
    return;
  }

  if (!MIDTRANS_CLIENT_KEY) {
    console.error('VITE_MIDTRANS_CLIENT_KEY tidak ditemukan di environment.');
    alert('Konfigurasi payment gateway salah. Silakan hubungi admin.');
    return;
  }

  const script = document.createElement('script');
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
  script.id = 'midtrans-script';
  script.onload = () => {
    if (onLoad) onLoad();
  };
  script.onerror = () => {
    console.error('Gagal memuat Midtrans Snap.js');
  };
  document.body.appendChild(script);
};

const snapPay = (token, callbacks) => {
  if (typeof window === 'undefined' || !window.snap) {
    throw new Error('Midtrans Snap.js belum dimuat. Pastikan script snap.js sudah ter-load.');
  }
  window.snap.pay(token, callbacks);
};

// ============================================================
// SUB-COMPONENTS
// ============================================================
const Header = memo(({ item, onNavigate }) => (
  <header className="bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl shadow-xl">
    <p className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">PROSES PEMBAYARAN</p>
    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Checkout & Bayar</h1>
    {item ? (
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="bg-[#111315] border border-white/5 px-4 py-2 rounded-xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Item Dipilih</p>
          <p className="text-sm font-black text-[#C2A676] uppercase">{item.name}</p>
        </div>
        <div className="bg-[#111315] border border-white/5 px-4 py-2 rounded-xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Bayar</p>
          <p className="text-sm font-black text-white">{formatRupiah(item.finalPrice)}</p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-yellow-400 mt-2">
        ⚠️ Tidak ada item dipilih.{' '}
        <button onClick={onNavigate} className="underline text-[#C2A676]">Pilih pesanan dulu</button>
      </p>
    )}
  </header>
));

const OrderSummary = memo(({ item }) => {
  if (!item) return <p className="text-xs text-gray-500">Belum ada item yang dipilih.</p>;
  const isClass = item.type?.toLowerCase() === 'class' || item.type === 'Kelas';
  const isCoaching = item.type === 'Paket_Coaching';

  return (
    <div className="space-y-3">
      <div className="bg-[#25282c] border border-white/5 rounded-2xl p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {isClass ? 'Kelas Gym' : isCoaching ? 'Paket Coaching' : 'Membership'}
        </p>
        <p className="text-lg font-black text-[#C2A676] uppercase">{item.name}</p>
      </div>
      <div className="flex justify-between border-t border-white/10 pt-3">
        <span className="text-sm font-black text-white">Total Tagihan</span>
        <span className="text-sm font-black text-[#C2A676]">{formatRupiah(item.finalPrice)}</span>
      </div>
    </div>
  );
});

// ============================================================
// MODALS
// ============================================================
const SuccessModal = memo(({ onClose }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-[#1A1C1E] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
      <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center">
        <span className="text-green-400 text-3xl">✓</span>
      </div>
      <h3 className="text-2xl font-black text-white uppercase mb-4">Pembayaran Berhasil!</h3>
      <p className="text-xs text-gray-400 mb-6">Terima kasih, transaksi Anda telah dikonfirmasi oleh sistem.</p>
      <button onClick={onClose} className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black py-3 rounded-xl">
        Kembali ke Dashboard
      </button>
    </div>
  </div>
));

const ProcessingModal = memo(() => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-[#1A1C1E] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
      <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#C2A676] border-t-transparent rounded-full animate-spin"></div>
      <h3 className="text-lg font-black text-white uppercase mb-2">Memproses Transaksi</h3>
      <p className="text-xs text-gray-400">Menyiapkan konfirmasi pembayaran Anda...</p>
    </div>
  </div>
));

const PendingVAModal = memo(({ pendingResult, onClose, onCheckStatus, isChecking }) => {
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  let paymentMethod = 'Menunggu Pembayaran';
  let vaNumber = '-';

  if (pendingResult?.va_numbers && pendingResult.va_numbers.length > 0) {
    paymentMethod = `VA ${pendingResult.va_numbers[0].bank.toUpperCase()}`;
    vaNumber = pendingResult.va_numbers[0].va_number;
  } else if (pendingResult?.payment_type === 'echannel') {
    paymentMethod = 'Mandiri Bill';
    vaNumber = `Biller Code: ${pendingResult.biller_code} | Bill Key: ${pendingResult.bill_key}`;
  } else if (pendingResult?.payment_type === 'permata_va') {
    paymentMethod = 'Permata VA';
    vaNumber = pendingResult.permata_va_number;
  } else if (pendingResult?.payment_type === 'qris' || pendingResult?.payment_type === 'gopay') {
    paymentMethod = 'QRIS / E-Wallet';
    vaNumber = 'Silakan scan QR pada layar Snap sebelumnya.';
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1A1C1E] border border-yellow-500/30 rounded-3xl p-6 text-center shadow-2xl">
        <h3 className="text-xl font-black text-yellow-400 uppercase mb-2">Selesaikan Pembayaran</h3>

        <div className="my-4">
          <p className="text-xs text-gray-400 mb-1">Sisa Waktu Pembayaran:</p>
          <div className="text-3xl font-mono font-bold text-white bg-[#25282c] py-3 rounded-xl border border-white/5">
            {timeLeft > 0 ? `${minutes}:${seconds < 10 ? '0' : ''}${seconds}` : <span className="text-red-500">KADALUARSA</span>}
          </div>
        </div>

        <div className="bg-[#111315] border border-white/10 rounded-xl p-4 text-left space-y-3 mb-5">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Metode Pembayaran</p>
            <p className="text-sm font-bold text-white">{paymentMethod}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Nomor Virtual Account / Kode Bayar</p>
            <p className="text-lg font-mono font-black text-[#C2A676] break-all">{vaNumber}</p>
          </div>
        </div>

        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-left">
          <p className="text-xs text-blue-300">
            <strong>Cara Simulasi (Testing):</strong><br />
            1. Copy kode VA di atas.<br />
            2. Buka web <a href="https://simulator.sandbox.midtrans.com/" target="_blank" rel="noreferrer" className="underline font-bold text-blue-400">Midtrans Simulator</a>.<br />
            3. Pilih bank sesuai metode, paste kode, dan klik Pay.<br />
            4. Kembali ke halaman ini dan klik "Cek Status Pembayaran".
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onCheckStatus} 
            disabled={isChecking}
            className="flex-1 bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black text-sm py-3 rounded-xl shadow-md disabled:opacity-50"
          >
            {isChecking ? 'Mengecek...' : 'Cek Status Pembayaran'}
          </button>
          <button onClick={onClose} className="flex-1 bg-[#25282c] hover:bg-[#333] text-gray-300 text-sm font-medium py-3 rounded-xl border border-white/10">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
});

const ErrorModal = memo(({ message, onClose }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-[#1A1C1E] border border-red-500/20 rounded-3xl p-8 text-center">
      <h3 className="text-xl font-black text-white uppercase mb-2">Status Pembayaran</h3>
      <p className="text-xs text-gray-400 mb-5">{message}</p>
      <button onClick={onClose} className="w-full bg-[#25282c] text-gray-300 py-3 rounded-xl">Tutup</button>
    </div>
  </div>
));

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Bayar() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item || null;

  const [step, setStep] = useState('summary');
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [snapReady, setSnapReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const goToDashboard = useCallback(() => navigate('/member/dashboardmember'), [navigate]);
  const goBack = useCallback(() => navigate(-1), [navigate]);

  useEffect(() => {
    document.title = 'Gymbros | Pembayaran';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';

    loadMidtransScript(() => setSnapReady(true));

    return () => { document.body.style.backgroundColor = ori; };
  }, []);

  // Polling backend masih dilakukan untuk memastikan data sinkron
  const pollPaymentStatus = async (idPayment, maxRetries = 3, delay = 1500) => {
    const token = localStorage.getItem('token');
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await axios.get(`${API_BASE_URL}/payments/invoice/${idPayment}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.status === 'Lunas') return 'Lunas';
        if (res.data.status === 'Gagal') return 'Gagal';
      } catch (err) {
        console.error('Error fetching status', err);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return 'Pending';
  };

  const handleBayar = useCallback(async () => {
    if (!item) return;
    if (!snapReady || !window.snap) {
      alert('Gateway pembayaran sedang dimuat, tunggu sebentar...');
      return;
    }

    setStep('loading');

    try {
      const token = localStorage.getItem('token');
      const payload = { metode: 'Midtrans_Gateway' };

      if (item.type === 'Membership' || item.type === 'membership') {
        payload.kategoriTransaksi = 'Membership';
        payload.idPaket = Number(item.id);
      } else if (item.type === 'Paket_Coaching' || item.type === 'coaching') {
        payload.kategoriTransaksi = 'Paket_Coaching';
        payload.idCoach = Number(item.coachId || item.idCoach);
        payload.totalSesi = Number(item.totalSesi || 10);
      } else if (item.type === 'Kelas' || item.type === 'class' || item.type === 'kelas') {
        payload.kategoriTransaksi = 'Kelas';
        payload.idKelas = Number(item.id);
      }

      const res = await axios.post(`${API_BASE_URL}/payments/invoice`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { snapToken, idPayment } = res.data;
      setPaymentData({ idPayment });

      snapPay(snapToken, {
        onSuccess: async () => {
          setStep('processing');
          
          // Lakukan polling singkat (kurang lebih 4-5 detik total)
          const status = await pollPaymentStatus(idPayment, 3, 1500);
          
          // LOGIKA YANG DIPERBAIKI:
          if (status === 'Lunas') {
            setStep('success'); 
          } else if (status === 'Gagal') {
            // Jika backend membatalkan (expired, ditolak sistem) maka wajib tampil Error
            setErrorMsg('Pembayaran gagal atau dibatalkan oleh sistem. Silakan coba lagi.');
            setStep('error');
          } else {
            // Optimistic UI: Jika Midtrans onSuccess tapi server masih Pending, anggap sukses.
            setStep('success');
          }
        },
        onPending: (result) => {
          setPendingResult(result);
          setStep('pending');
        },
        onError: (result) => {
          setErrorMsg(result.status_message || 'Transaksi gagal.');
          setStep('error');
        },
        onClose: () => {
          setStep((current) => current === 'loading' ? 'summary' : current);
        },
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal terhubung ke server.');
      setStep('error');
    }
  }, [item, snapReady]);

  const handleCheckStatus = useCallback(async () => {
    if (!paymentData?.idPayment) return;
    setIsChecking(true);
    
    const status = await pollPaymentStatus(paymentData.idPayment, 3, 1000);
    
    if (status === 'Lunas') {
      setStep('success');
    } else if (status === 'Gagal') {
      setErrorMsg('Pembayaran telah dibatalkan atau gagal (kadaluwarsa).');
      setStep('error');
    } else {
      // Jika status masih pending saat di-klik manual, beri tahu user.
      alert('Pembayaran belum dikonfirmasi oleh bank. Silakan selesaikan pembayaran sesuai instruksi VA.');
    }
    
    setIsChecking(false);
  }, [paymentData]);

  return (
    <main className="w-full max-w-5xl mx-auto space-y-6 text-[#E0E0E0] pb-10 mt-10 px-4">
      {step === 'success' && <SuccessModal onClose={goToDashboard} />}
      {step === 'processing' && <ProcessingModal />}
      {step === 'pending' && <PendingVAModal pendingResult={pendingResult} onClose={() => setStep('summary')} onCheckStatus={handleCheckStatus} isChecking={isChecking} />}
      {step === 'error' && <ErrorModal message={errorMsg} onClose={() => setStep('summary')} />}

      <Header item={item} onNavigate={goBack} />

      <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg">
        <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">Ringkasan Pesanan</h2>
        <OrderSummary item={item} />

        <div className="mt-8 space-y-3">
          {step === 'loading' ? (
            <div className="text-center text-sm text-[#C2A676] animate-pulse">Membuka Midtrans...</div>
          ) : (
            <>
              <button
                onClick={handleBayar}
                disabled={!snapReady}
                className={`w-full font-black text-sm py-4 rounded-xl shadow-md transition-all active:scale-95 ${snapReady
                    ? 'bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315]'
                    : 'bg-[#C2A676]/40 text-[#111315]/50 cursor-not-allowed'
                  }`}
              >
                {snapReady ? '💳 Bayar Sekarang via Midtrans' : '⏳ Memuat Gateway Pembayaran...'}
              </button>
              <button onClick={goBack} className="w-full bg-transparent hover:bg-white/5 text-gray-400 py-3 rounded-xl font-bold">
                Batal & Kembali
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}