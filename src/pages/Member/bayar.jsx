// src/pages/member/Bayar.jsx
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost:5000/api/v1';
const formatRupiah = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

// ============================================================
// MIDTRANS SCRIPT LOADER
// ============================================================
const loadMidtransScript = (onLoad, onError) => {
  if (document.getElementById('midtrans-script')) {
    if (window.snap && onLoad) onLoad();
    return;
  }
  if (!MIDTRANS_CLIENT_KEY) {
    onError('VITE_MIDTRANS_CLIENT_KEY tidak ditemukan. Hubungi admin.');
    return;
  }
  const script = document.createElement('script');
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
  script.id = 'midtrans-script';
  script.onload = () => { if (onLoad) onLoad(); };
  script.onerror = () => { onError('Gagal memuat Midtrans Snap.js'); };
  document.body.appendChild(script);
};

const snapPay = (token, callbacks) => {
  if (typeof window === 'undefined' || !window.snap) throw new Error('Midtrans belum dimuat.');
  window.snap.pay(token, callbacks);
};

// ============================================================
// CUSTOM ALERTS & MODALS
// ============================================================
const CustomAlert = memo(({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1A1C1E] border border-white/10 rounded-3xl p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-blue-500/15 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 text-xl font-bold">!</div>
        <h3 className="text-lg font-black text-white uppercase mb-2">Pemberitahuan</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <button onClick={onClose} className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black py-2.5 rounded-xl transition-colors">
          Mengerti
        </button>
      </div>
    </div>
  );
});

const ConfirmCancelModal = memo(({ onConfirm, onClose, isCanceling }) => (
  <div className="fixed inset-0 z-[85] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-[#1A1C1E] border border-red-500/30 rounded-3xl p-6 text-center shadow-2xl">
      <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center text-red-400 text-xl font-bold">?</div>
      <h3 className="text-lg font-black text-white uppercase mb-2">Batalkan Pesanan?</h3>
      <p className="text-sm text-gray-400 mb-6">Yakin ingin membatalkan pesanan tertunda ini? Anda bisa membuat pesanan baru setelahnya.</p>
      <div className="flex gap-3">
        <button 
          onClick={onConfirm} 
          disabled={isCanceling}
          className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {isCanceling ? 'Memproses...' : 'Ya, Batalkan'}
        </button>
        <button onClick={onClose} className="flex-1 bg-[#25282c] hover:bg-[#333] text-gray-300 text-sm font-medium py-2.5 rounded-xl border border-white/10 transition-colors">
          Kembali
        </button>
      </div>
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

  // States
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [globalPending, setGlobalPending] = useState(null); 
  const [step, setStep] = useState('summary'); 
  const [paymentData, setPaymentData] = useState(null);
  const [snapReady, setSnapReady] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const pollingIntervalRef = useRef(null);

  const goToDashboard = useCallback(() => navigate('/member/dashboardmember'), [navigate]);
  const goBack = useCallback(() => navigate(-1), [navigate]);

  const fetchPendingInvoice = useCallback(async (isSilent = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/payments/my-invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pendingInvoice = res.data.data?.find(inv => inv.status === 'Pending');
      
      if (globalPending && !pendingInvoice) {
        setGlobalPending(null);
        setStep('success'); 
        return;
      }

      setGlobalPending(pendingInvoice || null);

      if (step === 'loading') {
        setStep('summary');
      } else if (!pendingInvoice && step !== 'success') {
        setStep('summary');
      }
    } catch (err) {
      console.error('Gagal memperbarui data transaksi otomatis', err);
    } finally {
      if (!isSilent) setIsPageLoading(false);
    }
  }, [globalPending, step]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; 
    
    pollingIntervalRef.current = setInterval(() => {
      fetchPendingInvoice(true); 
    }, 5000); 
  }, [fetchPendingInvoice]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    document.title = 'Gymbros | Pembayaran';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';

    loadMidtransScript(
      () => setSnapReady(true),
      (errMsg) => setAlertMsg(errMsg)
    );

    fetchPendingInvoice();

    return () => { 
      document.body.style.backgroundColor = ori; 
      stopPolling(); 
    };
  }, []);

  useEffect(() => {
    if (globalPending) {
      startPolling(); 
    } else {
      stopPolling(); 
    }
  }, [globalPending, startPolling, stopPolling]);

  const triggerSnap = useCallback((snapToken, idPayment) => {
    stopPolling(); 

    let hasProgressed = false;

    const cancelGhostInvoice = async () => {
      if (idPayment) {
        try {
          const token = localStorage.getItem('token');
          await axios.post(`${API_BASE_URL}/payments/invoice/${idPayment}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.error('Gagal auto-cancel invoice setelah Snap ditutup/gagal:', err);
        }
      }
      setPaymentData(null);
      setGlobalPending(null);
      setStep('summary');
      fetchPendingInvoice();
    };

    snapPay(snapToken, {
      onSuccess: async (result) => {
        // --- TRIGGER NOTIFIKASI BERHASIL SAAT PEMBAYARAN SELESAI ---
        try {
          const token = localStorage.getItem('token');
          const finalIdPayment = idPayment || result.order_id;
          await axios.post(
            `${API_BASE_URL}/payments/invoice/${finalIdPayment}/confirm`,
            { nama_paket: item?.name || globalPending?.nama_item || 'Pembelian' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Gagal mengirim notifikasi pembayaran berhasil:", err);
        }

        setGlobalPending(null);
        setStep('success');
      },
      onPending: () => {
        hasProgressed = true; 
        setStep('summary'); 
        setAlertMsg('Silakan selesaikan pembayaran sesuai instruksi bank.');
        fetchPendingInvoice();
      },
      onError: () => {
        setAlertMsg('Transaksi ditolak atau kadaluwarsa. Pesanan otomatis dibatalkan, silakan coba lagi.');
        cancelGhostInvoice();
      },
      onClose: () => {
        if (hasProgressed) {
          setStep('summary');
          fetchPendingInvoice();
        } else {
          setAlertMsg('Pembayaran dibatalkan.');
          cancelGhostInvoice();
        }
      },
    });
  }, [fetchPendingInvoice, stopPolling, item, globalPending]);

  const handleBayar = useCallback(async () => {
    if (!item || !snapReady) return;
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

      const responseData = res.data.data || res.data;
      const { snapToken, idPayment } = responseData;

      if (!snapToken) throw new Error('Gagal mendapatkan token pembayaran.');

      setPaymentData({ idPayment, snapToken });
      triggerSnap(snapToken, idPayment);

    } catch (err) {
      setAlertMsg(err.response?.data?.message || err.message || 'Gagal membuat pesanan.');
      setStep('summary');
      fetchPendingInvoice(); 
    }
  }, [item, snapReady, triggerSnap, fetchPendingInvoice]);

  const handleResumePending = async () => {
    if (!globalPending || !snapReady) {
      setAlertMsg('Gateway pembayaran sedang disiapkan, tunggu sebentar...');
      return;
    }
    
    setStep('loading');
    
    try {
      const token = localStorage.getItem('token');
      const parts = globalPending.id_payment.split('-');
      const prefix = parts[0];
      const idItem = Number(parts[1]);

      let payload = { metode: 'Midtrans_Gateway' };

      if (prefix === 'MBR') {
        payload.kategoriTransaksi = 'Membership';
        payload.idPaket = idItem;
      } else if (prefix === 'KLS') {
        payload.kategoriTransaksi = 'Kelas';
        payload.idKelas = idItem;
      }

      const res = await axios.post(`${API_BASE_URL}/payments/invoice`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const responseData = res.data.data || res.data;
      
      if (!responseData.snapToken) {
        throw new Error('Token Midtrans tidak tersedia. Silakan Batalkan Pesanan dan coba kembali.');
      }

      triggerSnap(responseData.snapToken, responseData.idPayment || globalPending.id_payment);

    } catch (err) {
      setAlertMsg(err.response?.data?.message || err.message || 'Gagal memuat ulang gateway pembayaran.');
      setStep('summary');
      fetchPendingInvoice();
    }
  };

  const executeCancel = async () => {
    const idToCancel = globalPending ? globalPending.id_payment : paymentData?.idPayment;
    if (!idToCancel) return;
    
    setIsCanceling(true);
    stopPolling(); 
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/payments/invoice/${idToCancel}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowCancelConfirm(false);
      setGlobalPending(null); 
      setPaymentData(null);
      setStep('summary');
      setAlertMsg('Pesanan sebelumnya berhasil dibatalkan. Anda sekarang dapat melanjutkan pesanan baru.');
    } catch (err) {
      setShowCancelConfirm(false);
      setAlertMsg(err.response?.data?.message || 'Gagal membatalkan pesanan.');
    } finally {
      setIsCanceling(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen bg-[#111315]">
         <div className="w-12 h-12 border-4 border-[#C2A676] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-5xl mx-auto space-y-6 text-[#E0E0E0] pb-10 mt-10 px-4">
      <CustomAlert message={alertMsg} onClose={() => setAlertMsg('')} />
      
      {showCancelConfirm && (
        <ConfirmCancelModal 
          onConfirm={executeCancel} 
          onClose={() => setShowCancelConfirm(false)} 
          isCanceling={isCanceling}
        />
      )}

      {step === 'success' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1C1E] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center">
              <span className="text-green-400 text-3xl">✓</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase mb-4">Berhasil!</h3>
            <p className="text-xs text-gray-400 mb-6">Pembayaran Anda telah sukses diverifikasi otomatis oleh sistem.</p>
            <button onClick={goToDashboard} className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black py-3 rounded-xl transition-colors">Kembali ke Dashboard</button>
          </div>
        </div>
      )}

      {globalPending ? (
        <section className="bg-[#1A1C1E] border border-yellow-500/30 rounded-3xl p-8 shadow-xl text-center animate-fade-in mt-20">
          <div className="w-16 h-16 bg-yellow-500/20 border-2 border-yellow-500/40 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
          <h2 className="text-2xl font-black text-yellow-400 uppercase mb-3">Ada Transaksi Tertunda</h2>
          <p className="text-sm text-gray-300 mb-6">
            Sistem mendeteksi Anda masih memiliki tagihan yang belum diselesaikan:
          </p>
          
          <div className="bg-[#111315] border border-white/5 rounded-xl p-6 max-w-md mx-auto mb-4 text-left shadow-inner">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Item Tertunda</p>
            <p className="text-base font-bold text-white mb-4">{globalPending.nama_item}</p>
            
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
            <p className="text-sm font-mono text-gray-400 mb-4 break-all">{globalPending.id_payment}</p>
            
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Nominal</p>
            <p className="text-2xl font-black text-[#C2A676]">{formatRupiah(globalPending.nominal)}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
            <span>Mengecek status pembayaran otomatis...</span>
          </div>

          <div className="flex flex-col gap-3 max-w-md mx-auto">
            {step === 'loading' ? (
               <div className="bg-[#C2A676]/30 text-[#C2A676] font-bold py-4 rounded-xl text-sm animate-pulse">
                 Memuat Midtrans...
               </div>
            ) : (
               <button 
                  onClick={handleResumePending}
                  className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black py-4 rounded-xl shadow-md transition-all active:scale-95 text-sm"
                >
                  💳 Lanjutkan Pembayaran (Lihat VA / QRIS)
                </button>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 bg-transparent hover:bg-red-900/20 border border-red-500/30 text-red-400 font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                Batalkan Pesanan
              </button>
              <button 
                onClick={goBack} 
                className="flex-1 bg-[#25282c] hover:bg-[#333] border border-white/10 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                Kembali
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <header className="bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl shadow-xl">
            <p className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">PROSES PEMBAYARAN</p>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Checkout & Bayar</h1>
          </header>

          <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg">
            {item ? (
               <div className="space-y-3">
                 <div className="bg-[#25282c] border border-white/5 rounded-2xl p-4">
                   <p className="text-lg font-black text-[#C2A676] uppercase">{item.name}</p>
                 </div>
                 <div className="flex justify-between border-t border-white/10 pt-3">
                   <span className="text-sm font-black text-white">Total Tagihan</span>
                   <span className="text-sm font-black text-[#C2A676]">{formatRupiah(item.finalPrice)}</span>
                 </div>
               </div>
            ) : (
               <p className="text-sm text-yellow-400">Tidak ada item dipilih.</p>
            )}

            <div className="mt-8 space-y-3">
              {step === 'loading' ? (
                <div className="text-center text-sm font-bold text-[#C2A676] animate-pulse py-4">Membuka Midtrans...</div>
              ) : (
                <>
                  <button
                    onClick={handleBayar}
                    disabled={!snapReady}
                    className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black text-sm py-4 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    💳 Bayar Sekarang
                  </button>
                  <button onClick={goBack} className="w-full bg-transparent hover:bg-white/5 text-gray-400 py-3 rounded-xl font-bold transition-colors">
                    Kembali
                  </button>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}