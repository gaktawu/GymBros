import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const formatRupiah = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

const METODE_LIST = [
  { id: 'qris', label: 'QRIS', icon: '🔳', deskripsi: 'Scan QR dengan aplikasi apapun' },
  { id: 'gopay', label: 'GoPay', icon: '💚', deskripsi: 'Transfer via GoPay / Gojek' },
  { id: 'ovo', label: 'OVO', icon: '💜', deskripsi: 'Transfer via OVO' },
  { id: 'mbanking', label: 'mBanking', icon: '🏦', deskripsi: 'Transfer bank BCA / Mandiri / BNI' },
];

const BANK_LIST = [
  { bank: 'BCA', norek: '1234 5678 90', an: 'Gymbros Indonesia', warna: 'text-blue-400' },
  { bank: 'Mandiri', norek: '0987 6543 21', an: 'Gymbros Indonesia', warna: 'text-yellow-400' },
  { bank: 'BNI', norek: '5566 7788 99', an: 'Gymbros Indonesia', warna: 'text-orange-400' },
];

const ALASAN_LIST = [
  'Ingin ganti pesanan yang lain',
  'Salah memilih item',
  'Ingin ganti metode pembayaran',
  'Berubah pikiran',
  'Lainnya',
];

const PaymentMethodCard = memo(({ method, selected, onSelect }) => {
  const active = selected === method.id;
  return (
    <label
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        active
          ? 'border-[#C2A676]/60 bg-[#C2A676]/5'
          : 'border-white/10 bg-[#25282c] hover:border-[#C2A676]/30'
      }`}
    >
      <input
        type="radio"
        name="metodeBayar"
        value={method.id}
        checked={active}
        onChange={() => onSelect(method.id)}
        className="accent-[#C2A676] w-4 h-4 shrink-0"
      />
      <span className="text-2xl">{method.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-black text-white">{method.label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{method.deskripsi}</p>
      </div>
      {active && <span className="text-[#C2A676] text-xs font-black">✓</span>}
    </label>
  );
});

const QRISPayment = memo(({ item, onConfirm }) => {
  const kode = useMemo(
    () => `GYMBROS-${(item?.type || 'PAY').toUpperCase()}-${Math.floor(Math.random() * 90000) + 10000}`,
    [item?.type]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-gray-400 text-center">
        Scan QR Code di bawah menggunakan aplikasi e-wallet atau mobile banking manapun.
      </p>
      <div className="p-4 bg-white rounded-2xl shadow-lg">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GYMBROS-${item?.id}-${item?.finalPrice}`}
          alt="QR Code Pembayaran Gymbros"
          className="w-44 h-44 rounded-lg"
        />
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Kode pembayaran</p>
        <p className="text-sm font-black text-[#C2A676] tracking-widest mt-0.5">{kode}</p>
      </div>
      <div className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-3 text-center">
        <p className="text-xs text-gray-400">Total Pembayaran</p>
        <p className="text-xl font-black text-white mt-0.5">{formatRupiah(item?.finalPrice)}</p>
      </div>
      <p className="text-[11px] text-yellow-400 text-center">⏱ QR berlaku selama 15 menit. Jangan tutup halaman ini.</p>
      <button
        onClick={onConfirm}
        className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black text-sm py-3 rounded-xl transition-all active:scale-95 shadow-md"
      >
        ✅ OK — Saya Sudah Bayar
      </button>
    </div>
  );
});

const EWalletPayment = memo(({ type, item, nomorHP, setNomorHP, onConfirm }) => {
  const config = {
    gopay: { color: 'green', icon: '💚', label: 'GoPay', phone: '0821-0000-1234', btnClass: 'bg-green-600 hover:bg-green-500' },
    ovo: { color: 'purple', icon: '💜', label: 'OVO', phone: '0822-0000-5678', btnClass: 'bg-purple-700 hover:bg-purple-600' },
  }[type];

  if (!config) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400">
        Transfer ke nomor {config.label} berikut, lalu klik OK setelah pembayaran selesai.
      </p>
      <div className="bg-[#25282c] border border-white/10 rounded-2xl p-5 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-3xl">{config.icon}</span>
          <p className="text-lg font-black text-white">{config.label}</p>
        </div>
        <p className="text-xs text-gray-500 mb-1">Nomor {config.label} Tujuan</p>
        <p className={`text-2xl font-black text-${config.color}-400 tracking-widest`}>{config.phone}</p>
        <p className="text-xs text-gray-500 mt-1">a.n. <strong className="text-white">Gymbros Indonesia</strong></p>
      </div>
      <div className="bg-[#25282c] border border-white/5 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-xs text-gray-400">Nominal Transfer</span>
        <span className="text-sm font-black text-[#C2A676]">{formatRupiah(item?.finalPrice)}</span>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Nomor HP {config.label} Anda (verifikasi)
        </label>
        <input
          type="tel"
          placeholder="Contoh: 0812-xxxx-xxxx"
          value={nomorHP}
          onChange={(e) => setNomorHP(e.target.value)}
          className="w-full bg-[#25282c] border border-white/10 text-[#E0E0E0] text-sm rounded-xl px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/60 transition-colors"
        />
      </div>
      <button
        onClick={onConfirm}
        className={`w-full ${config.btnClass} text-white font-black text-sm py-3 rounded-xl transition-all active:scale-95 shadow-md`}
      >
        ✅ OK — Transfer Sudah Dilakukan
      </button>
    </div>
  );
});

const BankPayment = memo(({ item, namaPengirim, setNamaPengirim, onConfirm }) => (
  <div className="flex flex-col gap-4">
    <p className="text-xs text-gray-400">
      Transfer ke salah satu rekening berikut, lalu isi nama pengirim dan klik OK.
    </p>
    <div className="space-y-3">
      {BANK_LIST.map((b) => (
        <div key={b.bank} className="bg-[#25282c] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className={`text-sm font-black ${b.warna}`}>{b.bank}</p>
            <p className="text-xs text-gray-500 mt-0.5">a.n. {b.an}</p>
          </div>
          <p className="text-sm font-black text-white tracking-widest">{b.norek}</p>
        </div>
      ))}
    </div>
    <div className="bg-[#25282c] border border-white/5 rounded-xl px-4 py-3 flex justify-between items-center">
      <span className="text-xs text-gray-400">Nominal Transfer</span>
      <span className="text-sm font-black text-[#C2A676]">{formatRupiah(item?.finalPrice)}</span>
    </div>
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        Nama Pengirim (sesuai rekening)
      </label>
      <input
        type="text"
        placeholder="Nama lengkap sesuai buku rekening"
        value={namaPengirim}
        onChange={(e) => setNamaPengirim(e.target.value)}
        className="w-full bg-[#25282c] border border-white/10 text-[#E0E0E0] text-sm rounded-xl px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/60 transition-colors"
      />
    </div>
    <button
      onClick={onConfirm}
      className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black text-sm py-3 rounded-xl transition-all active:scale-95 shadow-md"
    >
      ✅ OK — Transfer Sudah Dilakukan
    </button>
  </div>
));

const OrderSummary = memo(({ item }) => {
  if (!item) {
    return <p className="text-xs text-gray-500">Belum ada item yang dipilih.</p>;
  }

  const isClass = item.type?.toLowerCase() === 'class' || item.type === 'Kelas';
  const diskonNominal = (item.price || 0) - (item.finalPrice || 0);

  return (
    <div className="space-y-3">
      <div className="bg-[#25282c] border border-white/5 rounded-2xl p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {isClass ? 'Kelas Gym' : 'Membership'}
        </p>
        <p className="text-lg font-black text-[#C2A676] uppercase">{item.name}</p>
      </div>

      {/* Tampilan Dinamis Berdasarkan Tipe */}
      {isClass ? (
        <div className="px-1 text-xs text-gray-400 space-y-1">
          <p>🗓 Jadwal: <strong className="text-white">{item.schedule}</strong></p>
          <p>👨‍🏫 Pelatih: <strong className="text-white">{item.coach}</strong></p>
        </div>
      ) : (
        <ul className="space-y-2">
          {item.benefits?.map((b, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-[#C2A676] font-black mt-0.5 shrink-0">✓</span>
              {b}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-white/10 pt-3 space-y-2">
        {diskonNominal > 0 && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Harga Normal</span>
              <span className="line-through text-gray-500">{formatRupiah(item.price)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-400">Diskon</span>
              <span className="text-green-400">- {formatRupiah(diskonNominal)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-sm font-black text-white">Total Tagihan</span>
          <span className="text-sm font-black text-[#C2A676]">{formatRupiah(item.finalPrice)}</span>
        </div>
      </div>
    </div>
  );
});

const TransactionItem = memo(({ item }) => {
  const icon =
    item.metode === 'QRIS' ? '🔳' :
    item.metode === 'GoPay' ? '💚' :
    item.metode === 'OVO' ? '💜' : '🏦';

  return (
    <div className="flex items-center justify-between p-4 bg-[#25282c] border border-white/5 rounded-2xl hover:border-[#C2A676]/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1A1C1E] border border-white/5 flex items-center justify-center text-sm">{icon}</div>
        <div>
          <p className="text-xs font-bold text-white uppercase">{item.nama_item}</p>
          <p className="text-[10px] text-gray-500">{item.metode} · {new Date(item.tanggal).toLocaleDateString('id-ID')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-[#C2A676]">{formatRupiah(item.nominal)}</p>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
          item.status === 'Lunas' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {item.status}
        </span>
      </div>
    </div>
  );
});

const SuccessModal = memo(({ item, metodeBayar, onClose }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
    <div className="relative w-full max-w-sm bg-[#1A1C1E] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
      <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center">
        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-white uppercase mb-1">Pembayaran Berhasil!</h3>
      <p className="text-xs text-gray-400 mb-4">
        Terima kasih! Pesanan <strong className="text-[#C2A676]">{item?.name}</strong> Anda telah berhasil diproses.
      </p>
      <div className="bg-[#25282c] border border-white/5 rounded-xl p-4 mb-5 text-left space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Metode</span>
          <span className="font-bold text-white uppercase">{metodeBayar}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Nominal</span>
          <span className="font-bold text-[#C2A676]">{formatRupiah(item?.finalPrice)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Status</span>
          <span className="font-bold text-green-400">✓ LUNAS</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">ID Transaksi</span>
          <span className="font-mono text-gray-300">TRX-{Date.now().toString().slice(-8)}</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] font-black text-sm py-3 rounded-xl transition-all active:scale-95 shadow-md"
      >
        Kembali ke Dashboard
      </button>
    </div>
  </div>
));

const CancelModal = memo(({ item, alasanBatal, setAlasanBatal, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-sm bg-[#1A1C1E] border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-3xl">⚠️</div>
      <h3 className="text-lg font-black text-white uppercase text-center mb-1">Batalkan Pesanan?</h3>
      <p className="text-xs text-gray-400 text-center mb-4">
        Pesanan <strong className="text-[#C2A676]">{item?.name || 'ini'}</strong> akan dibatalkan.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alasan Pembatalan</label>
          <select
            value={alasanBatal}
            onChange={(e) => setAlasanBatal(e.target.value)}
            required
            className="w-full bg-[#25282c] border border-white/10 text-[#E0E0E0] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500/40 transition-colors"
          >
            <option value="">-- Pilih alasan --</option>
            {ALASAN_LIST.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#25282c] hover:bg-[#333] text-gray-300 text-sm font-medium py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            Tidak, Kembali
          </button>
          <button
            type="submit"
            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-black py-2.5 rounded-xl transition-all active:scale-95"
          >
            Ya, Batalkan
          </button>
        </div>
      </form>
    </div>
  </div>
));

const CancelSuccessModal = memo(() => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
    <div className="bg-[#1A1C1E] border border-white/10 rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full">
      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-4xl">❌</div>
      <h3 className="text-lg font-black text-white uppercase mb-2">Pembayaran Dibatalkan</h3>
      <p className="text-xs text-gray-400">
        Pesanan Anda telah berhasil dibatalkan. Mengalihkan halaman...
      </p>
    </div>
  </div>
));

const PaymentInstructions = memo(({ metode, item, nomorHP, setNomorHP, namaPengirim, setNamaPengirim, onConfirm }) => {
  switch (metode) {
    case 'qris': return <QRISPayment item={item} onConfirm={onConfirm} />;
    case 'gopay': return <EWalletPayment type="gopay" item={item} nomorHP={nomorHP} setNomorHP={setNomorHP} onConfirm={onConfirm} />;
    case 'ovo': return <EWalletPayment type="ovo" item={item} nomorHP={nomorHP} setNomorHP={setNomorHP} onConfirm={onConfirm} />;
    case 'mbanking': return <BankPayment item={item} namaPengirim={namaPengirim} setNamaPengirim={setNamaPengirim} onConfirm={onConfirm} />;
    default: return null;
  }
});

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

export default function Bayar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Menerima data dinamis (item) dari halaman sebelumnya
  const item = location.state?.item || null;

  const [metodeBayar, setMetodeBayar] = useState('qris');
  const [step, setStep] = useState('pilih');
  const [namaPengirim, setNamaPengirim] = useState('');
  const [nomorHP, setNomorHP] = useState('');
  const [showBatalModal, setShowBatalModal] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState('');
  const [batalBerhasil, setBatalBerhasil] = useState(false);
  const [histori, setHistori] = useState([]);
  const [loadingHistori, setLoadingHistori] = useState(true);

  const goToDashboard = useCallback(() => navigate('/member/dashboardmember'), [navigate]);
  const goBack = useCallback(() => navigate(-1), [navigate]);

  useEffect(() => {
    document.title = 'Gymbros | Pembayaran';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';

    // FETCH RIWAYAT TRANSAKSI DARI BACKEND SUPABASE
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        // Pastikan endpoint ini ada di backend Anda. Jika belum, gunakan data fallback sementara
        const res = await axios.get(`${API_BASE_URL}/transactions/my-history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistori(res.data.data || []);
      } catch (err) {
        console.log("Endpoint riwayat belum tersedia, menggunakan data sementara.");
        // Fallback Data Sementara (Jika endpoint belum jadi)
        setHistori([
          { id: 1, nama_item: 'Membership 1 Bulan', metode: 'QRIS', nominal: 250000, status: 'Lunas', tanggal: new Date().toISOString() },
          { id: 2, nama_item: 'Kelas Yoga', metode: 'GoPay', nominal: 50000, status: 'Lunas', tanggal: new Date().toISOString() }
        ]);
      } finally {
        setLoadingHistori(false);
      }
    };
    fetchHistory();

    return () => { document.body.style.backgroundColor = ori; };
  }, []);

  const handleLanjut = useCallback((e) => {
    e.preventDefault();
    setStep('bayar');
  }, []);

  const handleKonfirmasiOK = useCallback(async () => {
    // DISINI TEMPAT UNTUK POST DATA KE BACKEND (Contoh API Call)
    // await axios.post(`${API_BASE_URL}/transactions`, { itemId: item.id, type: item.type, method: metodeBayar }, ...)
    
    setStep('sukses');
  }, []);

  const handleGantiMetode = useCallback(() => setStep('pilih'), []);

  const handleBatalKirim = useCallback((e) => {
    e.preventDefault();
    setShowBatalModal(false);
    setBatalBerhasil(true);
    setTimeout(() => {
      goBack(); // Kembali ke halaman sebelumnya secara otomatis
    }, 2500);
  }, [goBack]);

  const handleCloseBatal = useCallback(() => setShowBatalModal(false), []);
  const handleOpenBatal = useCallback(() => setShowBatalModal(true), []);
  const metodeAktif = useMemo(() => METODE_LIST.find((m) => m.id === metodeBayar), [metodeBayar]);

  return (
    <main className="w-full max-w-5xl mx-auto space-y-6 text-[#E0E0E0] pb-10">
      {batalBerhasil && <CancelSuccessModal />}
      {step === 'sukses' && <SuccessModal item={item} metodeBayar={metodeBayar} onClose={goToDashboard} />}

      <Header item={item} onNavigate={goBack} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {step === 'pilih' && (
          <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg h-fit">
            <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">Pilih Metode Pembayaran</h2>
            <form onSubmit={handleLanjut} className="space-y-4">
              <div className="space-y-3">
                {METODE_LIST.map((m) => (
                  <PaymentMethodCard key={m.id} method={m} selected={metodeBayar} onSelect={setMetodeBayar} />
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenBatal}
                  className="flex-1 bg-[#25282c] hover:bg-red-900/30 text-red-400 text-sm font-black py-2.5 rounded-xl border border-red-500/20 transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={!item}
                  className="flex-1 bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] text-sm font-black py-2.5 rounded-xl transition-all active:scale-95 shadow-md disabled:opacity-50"
                >
                  Lanjut →
                </button>
              </div>
            </form>
          </section>
        )}

        {step === 'bayar' && (
          <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black tracking-widest text-white uppercase">
                {metodeAktif?.icon} {metodeAktif?.label}
              </h2>
              <button
                onClick={handleGantiMetode}
                className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                ← Ganti Metode
              </button>
            </div>
            <PaymentInstructions
              metode={metodeBayar}
              item={item}
              nomorHP={nomorHP}
              setNomorHP={setNomorHP}
              namaPengirim={namaPengirim}
              setNamaPengirim={setNamaPengirim}
              onConfirm={handleKonfirmasiOK}
            />
            <button
              onClick={handleOpenBatal}
              className="w-full mt-3 text-xs text-red-400 hover:text-red-300 py-2 transition-colors"
            >
              Batalkan Pesanan
            </button>
          </section>
        )}

        <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg h-fit">
          <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">Ringkasan Pesanan</h2>
          <OrderSummary item={item} />
        </section>
      </div>

      {/* TAMPILAN RIWAYAT TRANSAKSI */}
      <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg">
        <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">Riwayat Transaksi Terakhir</h2>
        {loadingHistori ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C2A676] border-t-transparent animate-spin" />
            <p className="text-xs text-gray-400 tracking-wider">Memuat riwayat...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {histori.length > 0 ? histori.map((h) => (
              <TransactionItem key={h.id} item={h} />
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada riwayat transaksi</p>
            )}
          </div>
        )}
      </section>

      {showBatalModal && (
        <CancelModal
          item={item}
          alasanBatal={alasanBatal}
          setAlasanBatal={setAlasanBatal}
          onSubmit={handleBatalKirim}
          onClose={handleCloseBatal}
        />
      )}
    </main>
  );
}