import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = 'https://api.npoint.io/a2f67ac9f64763665cd2';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classIdParam = searchParams.get('classId');

  const [activeClass, setActiveClass] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [paymentStep, setPaymentStep] = useState(1); 
  const [selectedPayment, setSelectedPayment] = useState('qris');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Custom Modal Warning State (Menggantikan alert bawaan browser)
  const [warningModal, setWarningModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    document.title = "Gymbros | Checkout & Bayar";
    document.body.style.backgroundColor = "#111315";
  }, []);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classIdParam) {
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        const response = await axios.get(API_URL);
        const classes = response.data?.classes || [];
        const found = classes.find(c => c.id === parseInt(classIdParam, 10));
        
        if (found) {
          setActiveClass(found);
        } else {
          setFetchError('Kelas tidak ditemukan dalam database.');
        }
      } catch (err) {
        setFetchError('Gagal memuat data. Silakan periksa koneksi Anda.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchClassDetails();
  }, [classIdParam]);

  const paymentMethods = [
    {
      id: 'qris', name: 'QRIS', description: 'Scan QR dengan aplikasi apapun',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 'gopay', name: 'GoPay', description: 'Transfer via GoPay / Gojek',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#00AA13" fillOpacity="0.2" stroke="#00AA13" strokeWidth="1.5"/>
          <path d="M8 12C8 9.5 9.5 8 12 8C14.5 8 16 9.5 16 12C16 14.5 14.5 16 12 16" stroke="#00AA13" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 'ovo', name: 'OVO', description: 'Transfer via OVO',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#4D2C8B" fillOpacity="0.2" stroke="#4D2C8B" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="4" fill="#4D2C8B" fillOpacity="0.3"/>
        </svg>
      )
    },
    {
      id: 'mbanking', name: 'mBanking', description: 'Transfer bank BCA / Mandiri / BNI',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M3 21H21M4 18H20M6 18V13L12 8L18 13V18M12 8V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  };

  const classPrice = activeClass ? parseInt(activeClass.price.replace(/[^0-9]/g, '')) : 0;

  const handleConfirmPayment = () => {
    if ((selectedPayment === 'gopay' || selectedPayment === 'ovo') && phoneNumber.length < 10) {
      setWarningModal({
        isOpen: true,
        message: 'Nomor handphone tidak valid. Harap masukkan minimal 10 digit nomor yang terdaftar.'
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setPaymentStep(3);

      // SIMPAN DATA TRANSAKSI KE LOCALSTORAGE AGAR HALAMAN BOOKING DAPAT MEMBACA STATUSNYA
      const savedBookings = JSON.parse(localStorage.getItem('bookedClasses')) || [];
      if (!savedBookings.includes(activeClass.id)) {
        savedBookings.push(activeClass.id);
        localStorage.setItem('bookedClasses', JSON.stringify(savedBookings));
      }
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/member/booking');
      }, 2500);
    }, 2000);
  };

  if (isFetching) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-[#E0E0E0] bg-[#111315] space-y-4">
        <div className="w-10 h-10 border-4 border-[#C2A676]/20 border-t-[#C2A676] rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Memuat Data Checkout...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] bg-[#111315] pb-12 relative">
      
      {/* Custom Modal Warning HTML/Tailwind */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setWarningModal({ isOpen: false, message: '' })} />
          <div className="relative w-full max-w-sm bg-[#1e2023] border border-red-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 bg-red-950/50 border border-red-500/50 text-red-400 rounded-full flex items-center justify-center mx-auto font-bold text-xl">!</div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Perhatian</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{warningModal.message}</p>
            <button 
              onClick={() => setWarningModal({ isOpen: false, message: '' })}
              className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-950/90 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-wider shadow-2xl flex items-center gap-3">
          <span className="text-xl">✓</span>
          Pembayaran Berhasil! Mengalihkan halaman...
        </div>
      )}

      {/* Header Info */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">
            {paymentStep === 1 ? 'Langkah 1 dari 2' : paymentStep === 2 ? 'Langkah 2 dari 2' : 'Selesai'}
          </h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Checkout & Bayar</h3>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-[#1e2023] border border-white/10 rounded-2xl hidden md:block">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Kelas Dipilih</p>
            <p className="text-sm font-black text-[#C2A676]">{activeClass ? activeClass.name : 'Belum memilih'}</p>
          </div>
          <div className="px-4 py-2 bg-[#1e2023] border border-white/10 rounded-2xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total Tagihan</p>
            <p className="text-sm font-black text-white">{formatCurrency(classPrice)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#1a1c1f] border border-white/5 rounded-3xl p-6 shadow-lg">
            
            {paymentStep === 1 && (
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Pilih Metode Pembayaran</h4>
                {fetchError ? (
                  <div className="p-4 border border-red-500/30 bg-red-950/20 rounded-xl text-center">
                    <p className="text-sm text-red-400 mb-2">{fetchError}</p>
                    <button onClick={() => navigate('/member/booking')} className="text-xs text-[#C2A676] hover:underline">Kembali ke Jadwal</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const isSelected = selectedPayment === method.id;
                      return (
                         <button
                           key={method.id}
                           onClick={() => setSelectedPayment(method.id)}
                           className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${isSelected ? 'bg-[#C2A676]/10 border-[#C2A676]/50 shadow-md' : 'bg-[#1e2023] border-white/5 hover:border-white/15'}`}
                         >
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#C2A676]' : 'border-gray-600'}`}>
                             {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#C2A676]" />}
                           </div>
                           <div className="w-8 h-8 flex items-center justify-center shrink-0">{method.icon}</div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-white">{method.name}</p>
                             <p className="text-xs text-gray-500">{method.description}</p>
                           </div>
                         </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => navigate('/member/booking')} className="flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-widest border border-white/10 text-gray-400 hover:text-white transition-all">Batal</button>
                  <button onClick={() => setPaymentStep(2)} disabled={!activeClass || !!fetchError} className="flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-widest bg-[#C2A676] text-[#111315] hover:bg-white transition-all disabled:opacity-50">Lanjut Pembayaran</button>
                </div>
              </div>
            )}

            {paymentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Instruksi Pembayaran</h4>
                  <div className="flex items-center gap-2 text-[#C2A676]">
                    {paymentMethods.find(m => m.id === selectedPayment)?.icon}
                    <span className="text-xs font-bold uppercase">{paymentMethods.find(m => m.id === selectedPayment)?.name}</span>
                  </div>
                </div>

                <div className="bg-[#1e2023] rounded-2xl p-6 border border-white/5 text-center space-y-4">
                  {selectedPayment === 'qris' && (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-400">Pindai kode QR di bawah menggunakan aplikasi pembayaran Anda.</p>
                      <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PembayaranGymbros-${activeClass.id}`} alt="QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-lg font-black text-white">{formatCurrency(classPrice)}</p>
                    </div>
                  )}

                  {(selectedPayment === 'gopay' || selectedPayment === 'ovo') && (
                    <div className="space-y-6 text-left">
                      <div className="bg-[#111315] p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Nominal Transfer</p>
                        <p className="text-2xl font-black text-[#C2A676]">{formatCurrency(classPrice)}</p>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black tracking-widest text-gray-400 uppercase">Nomor Handphone yang Terdaftar</label>
                         <input 
                           type="tel"
                           value={phoneNumber}
                           onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                           placeholder="Contoh: 08123456789"
                           className="w-full bg-[#111315] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#C2A676]/50"
                         />
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'mbanking' && (
                    <div className="space-y-6 text-left">
                      <div className="bg-[#111315] p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Nominal Transfer</p>
                        <p className="text-2xl font-black text-[#C2A676]">{formatCurrency(classPrice)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-black tracking-widest text-gray-400 uppercase">Nomor Virtual Account (BCA)</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-[#111315] border border-white/10 rounded-xl p-3 font-mono tracking-widest text-lg text-white">8077 0812 3456 7890</div>
                          <button onClick={() => { navigator.clipboard.writeText("8077081234567890"); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="bg-[#25282c] border border-white/10 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase">{isCopied ? 'Tersalin!' : 'Salin'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => { setPaymentStep(1); setPhoneNumber(''); }} disabled={isProcessing} className="flex-1 py-3 rounded-xl font-black uppercase text-xs border border-white/10 text-gray-400 hover:text-white transition-all">Ganti Metode</button>
                  <button onClick={handleConfirmPayment} disabled={isProcessing} className="flex-1 py-3 rounded-xl font-black uppercase text-xs bg-[#C2A676] text-[#111315] hover:bg-white transition-all flex items-center justify-center gap-2">
                    {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 3 && (
               <div className="text-center py-12 space-y-4">
                 <div className="w-16 h-16 bg-green-950/50 border border-green-500 text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                 <h4 className="text-lg font-black text-white uppercase tracking-wider">Transaksi Berhasil</h4>
               </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1a1c1f] border border-white/5 rounded-3xl p-6 shadow-lg">
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Ringkasan Pesanan</h4>
            {activeClass ? (
              <div className="space-y-4">
                <div className="bg-[#1e2023] rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{activeClass.category}</p>
                  <p className="text-md font-black text-[#C2A676] uppercase">{activeClass.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{activeClass.day}, {activeClass.time}</p>
                </div>
                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-sm font-black text-white">Total Tagihan</span>
                  <span className="text-lg font-black text-[#C2A676]">{formatCurrency(classPrice)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-6 uppercase tracking-wide">Belum ada kelas dipilih</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;