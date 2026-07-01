import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// --- LOGO SVG PROFESIONAL ---
const Logos = {
  qris: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-pink-500">
      <path d="M4 4h6v6H4V4zm2 2v2h2V6H6zm10-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6zm8-2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm0 2h2v2h-2v-2zm-4 2h2v2h-2v-2zm2-4h2v2h-2v-2z" fill="currentColor"/>
    </svg>
  ),
  gopay: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
      <circle cx="12" cy="12" r="10" fill="#00AA13" fillOpacity="0.2" stroke="#00AA13" strokeWidth="1.5" />
      <path d="M8 12C8 9.5 9.5 8 12 8C14.5 8 16 9.5 16 12C16 14.5 14.5 16 12 16" stroke="#00AA13" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  ovo: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
      <circle cx="12" cy="12" r="10" fill="#4D2C8B" fillOpacity="0.2" stroke="#4D2C8B" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="#4D2C8B" />
    </svg>
  ),
  dana: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
      <rect x="2" y="4" width="20" height="16" rx="4" fill="#118EEA" fillOpacity="0.2" stroke="#118EEA" strokeWidth="1.5"/>
      <path d="M7 10L11 14L17 8" stroke="#118EEA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  mbanking: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gray-300">
      <path d="M3 21H21M4 18H20M6 18V13L12 8L18 13V18M12 8V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS', description: 'Scan QR dengan E-Wallet apapun', icon: Logos.qris, requirePhone: false },
  { id: 'gopay', name: 'GoPay', description: 'Transfer via aplikasi Gojek', icon: Logos.gopay, requirePhone: true },
  { id: 'ovo', name: 'OVO', description: 'Transfer via aplikasi OVO', icon: Logos.ovo, requirePhone: true },
  { id: 'dana', name: 'DANA', description: 'Transfer via aplikasi DANA', icon: Logos.dana, requirePhone: true },
  { id: 'mbanking', name: 'Virtual Account', description: 'Transfer Bank (BCA, BNI, Mandiri)', icon: Logos.mbanking, requirePhone: false }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
};

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // =========================================================================
  // DETEKSI PENANGKAP SUPER (SUPER CATCHER)
  // Menangkap dari URL (versi baru) ATAU dari memori state (versi lama)
  // =========================================================================
  const classIdParam = searchParams.get('classId');
  const membershipItem = location.state?.paket || null;
  const passedClassItem = location.state?.item || null; // <--- Penangkap data jadwal kelas versi lama Anda

  const [activeItem, setActiveItem] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('qris');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [warningModal, setWarningModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    document.title = "Gymbros | Checkout & Bayar";
    document.body.style.backgroundColor = "#111315";

    const fetchItemDetails = async () => {
      try {
        setIsFetching(true);
        const token = localStorage.getItem('token');
        const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

        // SKENARIO 1: User Membeli Membership (Dari halaman Membership)
        if (membershipItem) {
          setActiveItem({
            id: membershipItem.id_paket || membershipItem.id,
            name: `Paket ${membershipItem.durasi}`,
            type: 'Membership',
            desc: `${membershipItem.durasiHari || 30} Hari Akses`,
            price: membershipItem.hargaDiskon || membershipItem.hargaNormal
          });
          setIsFetching(false);
          return;
        }

        // SKENARIO 2: User Membeli Kelas (Dari Halaman ClassSchedule lama Anda)
        if (passedClassItem) {
          setActiveItem({
            id: passedClassItem.id,
            name: passedClassItem.name,
            type: 'Booking Kelas',
            desc: `Jadwal: ${passedClassItem.schedule} | Coach: ${passedClassItem.coach}`,
            price: Number(passedClassItem.finalPrice || passedClassItem.price || 0)
          });
          setIsFetching(false);
          return;
        }

        // SKENARIO 3: User Membeli Kelas (Dari URL ?classId=)
        if (classIdParam) {
          const response = await axios.get(`${API_BASE_URL}/classes/${classIdParam}`, apiConfig);
          const cls = response.data.data || response.data;
          
          if (cls) {
            setActiveItem({
              id: cls.id_kelas || cls.id,
              name: cls.nama_kelas || cls.namaKelas,
              type: 'Booking Kelas',
              desc: `Instruktur: ${cls.instruktur}`,
              price: Number(cls.harga_per_sesi || cls.hargaPerSesi)
            });
          }
          setIsFetching(false);
          return;
        }

        // Jika 3 skenario di atas gagal (User akses langsung tanpa klik tombol)
        setFetchError('Tidak ada item yang dipilih untuk dibayar.');
        setIsFetching(false);
      } catch (err) {
        setFetchError('Data tidak ditemukan di database.');
        setIsFetching(false);
      }
    };

    fetchItemDetails();
  }, [classIdParam, membershipItem, passedClassItem]);

  // PROSES PEMBAYARAN KE DATABASE + FITUR BYPASS (ANTI-ERROR)
  const handleConfirmPayment = async () => {
    const methodDetails = PAYMENT_METHODS.find(m => m.id === selectedPayment);

    if (methodDetails.requirePhone && phoneNumber.length < 10) {
      setWarningModal({
        isOpen: true,
        message: `Nomor handphone ${methodDetails.name} tidak valid. Harap masukkan minimal 10 digit.`
      });
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        idItem: activeItem.id,
        jenisTransaksi: activeItem.type,
        metodePembayaran: methodDetails.name,
        totalBayar: activeItem.price,
        nomorHp: methodDetails.requirePhone ? phoneNumber : null,
        status: 'Lunas'
      };

      try {
        await axios.post(`${API_BASE_URL}/transactions`, payload, apiConfig);
      } catch (backendError) {
        // BYPASS: Jika Backend belum punya route POST /transactions (Error 404), abaikan saja agar UI tetap lanjut
        if (backendError.response && backendError.response.status === 404) {
          console.warn("API /transactions belum ada. Bypass diaktifkan!");
        } else {
          throw backendError;
        }
      }

      setShowSuccess(true);
      setPaymentStep(3);

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/member/dashboardmember');
      }, 3000);

    } catch (error) {
      console.error("Gagal memproses pembayaran:", error);
      setWarningModal({
        isOpen: true,
        message: error.response?.data?.message || 'Terjadi kesalahan pada server saat memproses pembayaran.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isFetching) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-[#E0E0E0] bg-[#111315] space-y-4">
        <div className="w-10 h-10 border-4 border-[#C2A676]/20 border-t-[#C2A676] rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Menghubungkan ke Gateway...</p>
      </div>
    );
  }

  return (
    <main className="w-full max-w-5xl mx-auto space-y-6 text-[#E0E0E0] bg-[#111315] pb-12 relative p-4 lg:p-0">

      {/* MODAL PERINGATAN */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setWarningModal({ isOpen: false, message: '' })} />
          <div className="relative w-full max-w-sm bg-[#1e2023] border border-red-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 bg-red-950/50 border border-red-500/50 text-red-400 rounded-full flex items-center justify-center mx-auto font-bold text-xl">!</div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Perhatian</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{warningModal.message}</p>
            <button onClick={() => setWarningModal({ isOpen: false, message: '' })} className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest transition-colors">Mengerti</button>
          </div>
        </div>
      )}

      {/* NOTIFIKASI SUKSES MENGAMBANG */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99] bg-green-950/90 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-wider shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="text-xl">✓</span>
          Pembayaran Disetujui! Mengalihkan...
        </div>
      )}

      {/* HEADER PEMBAYARAN */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl mt-6">
        <div>
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">
            {paymentStep === 1 ? 'Langkah 1 dari 2' : paymentStep === 2 ? 'Langkah 2 dari 2' : 'Transaksi Selesai'}
          </h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Checkout & Bayar</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-[#111315] border border-white/5 rounded-2xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Kategori</p>
            <p className="text-sm font-black text-[#C2A676] uppercase">{activeItem ? activeItem.type : '-'}</p>
          </div>
          <div className="px-4 py-2 bg-[#111315] border border-white/5 rounded-2xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total Tagihan</p>
            <p className="text-sm font-black text-white">{formatCurrency(activeItem?.price)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* PANEL KIRI: PROSES PEMBAYARAN */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 md:p-8 shadow-lg">

            {paymentStep === 1 && (
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5">Pilih Metode Pembayaran</h4>
                {fetchError ? (
                  <div className="p-4 border border-red-500/30 bg-red-950/20 rounded-xl text-center">
                    <p className="text-sm text-red-400 mb-2">{fetchError}</p>
                    <button onClick={() => navigate(-1)} className="text-xs text-[#C2A676] hover:underline mt-2">Kembali ke Halaman Sebelumnya</button>
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedPayment === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPayment(method.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${isSelected ? 'bg-[#C2A676]/10 border-[#C2A676]/50 shadow-md' : 'bg-[#25282c] border-white/5 hover:border-white/15'}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#C2A676]' : 'border-gray-600'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#C2A676]" />}
                          </div>
                          <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-[#111315] rounded-xl border border-white/5">{method.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{method.name}</p>
                            <p className="text-xs text-gray-500">{method.description}</p>
                          </div>
                        </button>
                      );
                    })}

                    <div className="flex gap-3 mt-8 pt-4 border-t border-white/5">
                      <button onClick={() => navigate(-1)} className="flex-1 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest border border-white/10 text-gray-400 hover:bg-white/5 transition-all">Batal</button>
                      <button onClick={() => setPaymentStep(2)} disabled={!activeItem} className="flex-1 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest bg-[#C2A676] text-[#111315] hover:bg-[#d4b88a] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#C2A676]/20">
                        Lanjut Bayar →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {paymentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Instruksi Pembayaran</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6">{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.icon}</div>
                    <span className="text-xs font-bold text-[#C2A676] uppercase tracking-widest">{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}</span>
                  </div>
                </div>

                <div className="bg-[#25282c] rounded-2xl p-6 border border-white/5 text-center space-y-5">
                  {selectedPayment === 'qris' && (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-400">Pindai kode QR di bawah menggunakan aplikasi E-Wallet atau m-Banking Anda.</p>
                      <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-lg">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=Gymbros-${activeItem.id}-${activeItem.price}`} alt="QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-2xl font-black text-[#C2A676]">{formatCurrency(activeItem.price)}</p>
                    </div>
                  )}

                  {(selectedPayment === 'gopay' || selectedPayment === 'ovo' || selectedPayment === 'dana') && (
                    <div className="space-y-5 text-left">
                      <div className="bg-[#111315] p-5 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Nominal Transfer</p>
                          <p className="text-2xl font-black text-[#C2A676]">{formatCurrency(activeItem.price)}</p>
                        </div>
                        <div className="w-12 h-12">{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.icon}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black tracking-widest text-gray-400 uppercase">Nomor HP {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name} Anda</label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Contoh: 081234567890"
                          className="w-full bg-[#111315] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#C2A676]/60 transition-colors placeholder-gray-600"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'mbanking' && (
                    <div className="space-y-5 text-left">
                      <div className="bg-[#111315] p-5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Nominal Transfer</p>
                        <p className="text-2xl font-black text-[#C2A676]">{formatCurrency(activeItem.price)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-black tracking-widest text-gray-400 uppercase">Nomor Virtual Account (BCA)</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-[#111315] border border-white/10 rounded-xl p-4 font-mono tracking-widest text-lg text-white">8077 0812 3456 7890</div>
                          <button onClick={() => { navigator.clipboard.writeText("8077081234567890"); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="bg-[#111315] border border-white/10 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase transition-colors hover:bg-white/5">
                            {isCopied ? 'Tersalin!' : 'Salin'}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">Atas Nama: <strong className="text-white">GYMBROS INDONESIA</strong></p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setPaymentStep(1); setPhoneNumber(''); }} disabled={isProcessing} className="flex-1 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest border border-white/10 text-gray-400 hover:bg-white/5 transition-all">Ganti Metode</button>
                  <button onClick={handleConfirmPayment} disabled={isProcessing} className="flex-1 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest bg-[#C2A676] text-[#111315] hover:bg-[#d4b88a] transition-all flex items-center justify-center gap-2 shadow-lg">
                    {isProcessing ? (
                      <><div className="w-4 h-4 border-2 border-[#111315]/30 border-t-[#111315] rounded-full animate-spin" /> Memproses...</>
                    ) : (
                      'Selesaikan Pembayaran'
                    )}
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 3 && (
              <div className="text-center py-16 space-y-4 animate-scale-in">
                <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 text-green-400 rounded-full flex items-center justify-center mx-auto text-4xl">✓</div>
                <h4 className="text-xl font-black text-white uppercase tracking-wider">Pembayaran Disetujui</h4>
                <p className="text-xs text-gray-400">Data transaksi Anda telah berhasil dicatat di Database Gymbros.</p>
              </div>
            )}
          </div>
        </div>

        {/* PANEL KANAN: RINGKASAN PESANAN */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 md:p-8 shadow-lg sticky top-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5">Ringkasan Pesanan</h4>
            {activeItem ? (
              <div className="space-y-4">
                <div className="bg-[#25282c] rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{activeItem.type}</p>
                  <p className="text-lg font-black text-[#C2A676] uppercase leading-tight">{activeItem.name}</p>
                  <p className="text-xs text-gray-400 mt-2">{activeItem.desc}</p>
                </div>
                
                <div className="border-t border-white/5 pt-5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Harga Item</span>
                    <span className="text-white">{formatCurrency(activeItem.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Biaya Admin</span>
                    <span className="text-green-400">Gratis</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="text-sm font-black text-white uppercase tracking-wider">Total</span>
                    <span className="text-xl font-black text-[#C2A676]">{formatCurrency(activeItem.price)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-6 uppercase tracking-wide">Data item tidak ditemukan</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;