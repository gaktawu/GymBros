import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const Membership = () => {
  const navigate = useNavigate();

  // ── STATE ──────────────────────────────────────────────────
  const [paketList, setPaketList] = useState([]);
  const [loadingPaket, setLoadingPaket] = useState(true);

  const [testimoni, setTestimoni] = useState([]);
  const [loadingTestimoni, setLoadingTestimoni] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [paketDipilih, setPaketDipilih] = useState(null);
  const [showSyarat, setShowSyarat] = useState(false);
  const [agreedSyarat, setAgreedSyarat] = useState(false);

  // ── USE EFFECT (FETCHING DATA) ──────────────────────────────
  useEffect(() => {
    document.title = 'Gymbros | Pilih Membership';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';

    // 1. FETCH DATA PAKET MEMBERSHIP DARI DATABASE
    const fetchPaket = async () => {
      try {
        setLoadingPaket(true);
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const res = await axios.get(`${API_BASE_URL}/paket-membership`, config);
        const rawData = res.data.data || [];

        // Mapping Data Database ke Format UI
        const mappedPaket = rawData.map((item) => {
          const namaPaket = item.nama_paket || item.namaPaket || 'Membership';
          const harga = item.harga || 0;
          const durasiHari = item.durasi_hari || item.durasiHari || 30; // Tambahan fallback durasi

          let benefits = item.benefit || item.deskripsi || '';
          if (typeof benefits === 'string') {
            benefits = benefits.split(',').map(b => b.trim()).filter(b => b);
          }
          if (!Array.isArray(benefits) || benefits.length === 0) {
            benefits = ['Akses Gym', 'Loker', 'Akses Semua Area'];
          }

          let filterStr = 'semua';
          let warna = 'border-[#888888]/30';
          let aksen = 'text-gray-400';
          let badge = null;
          let highlight = false;
          let diskonPersen = 0;
          let hargaDiskon = harga;

          const namaLower = namaPaket.toLowerCase();

          if (namaLower.includes('hari')) {
            filterStr = 'harian';
          } else if (namaLower.includes('1 bulan') || namaLower.includes('bulanan')) {
            filterStr = '1bulan';
            warna = 'border-[#888888]/40';
            aksen = 'text-gray-300';
          } else if (namaLower.includes('6 bulan')) {
            filterStr = '6bulan';
            warna = 'border-[#C2A676]/50';
            aksen = 'text-[#C2A676]';
            badge = 'TERLARIS';
            highlight = true;
            diskonPersen = 20;
            hargaDiskon = harga - (harga * diskonPersen / 100);
          } else if (namaLower.includes('12 bulan') || namaLower.includes('tahun')) {
            filterStr = '12bulan';
            warna = 'border-white/20';
            aksen = 'text-white';
            badge = 'TERBAIK';
            diskonPersen = 16;
            hargaDiskon = harga - (harga * diskonPersen / 100);
          }

          return {
            id: item.id_paket || item.idPaket || item.id,
            durasi: namaPaket,
            durasiHari: durasiHari, // Digunakan untuk warning extend
            filter: filterStr,
            hargaNormal: harga,
            hargaDiskon: hargaDiskon,
            diskonPersen: diskonPersen,
            warna,
            aksen,
            badge,
            highlight,
            benefit: benefits,
          };
        });

        setPaketList(mappedPaket);
      } catch (error) {
        console.error("Gagal mengambil data paket membership:", error);
      } finally {
        setLoadingPaket(false);
      }
    };

    fetchPaket();

    // 2. FETCH TESTIMONI
    axios
      .get('https://jsonplaceholder.typicode.com/posts?_limit=10')
      .then((res) => {
        const namaList = ['Budi S.', 'Rina D.', 'Ahmad F.', 'Doni P.', 'Siti R.', 'Reza K.', 'Maya L.', 'Tono W.', 'Eka J.', 'Putri N.'];
        const mapped = res.data.map((item, i) => ({
          id: item.id,
          nama: namaList[i],
          ulasan: item.body.replace(/\n/g, ' ').slice(0, 90) + '...',
          paket: 'Member Aktif',
        }));
        setTestimoni(mapped);
        setLoadingTestimoni(false);
      })
      .catch(() => setLoadingTestimoni(false));

    return () => { document.body.style.backgroundColor = ori; };
  }, []);

  // ── FILTER ─────────────────────────────────────────────────
  const paketFiltered = paketList.filter((p) => {
    const matchFilter = selectedFilter === 'semua' || p.filter === selectedFilter;
    const matchSearch = p.durasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.benefit.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // ── HANDLER ────────────────────────────────────────────────
  const handlePilihPaket = (paket) => {
    setPaketDipilih(paket);
    setShowSyarat(true);
    setAgreedSyarat(false);
  };

  const handleLanjutBayar = () => {
    if (!agreedSyarat) return;
    setShowSyarat(false);

    // Konversi ke format Universal Payment Page
    navigate('/member/bayar', {
      state: {
        item: {
          type: 'membership',
          id: paketDipilih.id,
          name: paketDipilih.durasi,
          price: paketDipilih.hargaNormal,
          finalPrice: paketDipilih.hargaDiskon,
          benefits: paketDipilih.benefit
        }
      }
    });
  };

  const formatRupiah = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <main className="w-full max-w-6xl mx-auto space-y-10 text-[#E0E0E0] pb-10">

      {/* ══ HERO HEADER ══════════════════════════════════════ */}
      <header className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl overflow-hidden mt-6">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#C2A676]/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">
          ARENA GYMBROS
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Pilih Paket Membership
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
          Investasi terbaik untuk tubuh dan kesehatanmu. Pilih paket yang sesuai,
          dan mulai perjalanan transformasimu bersama Gymbros.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="bg-[#111315] border border-white/5 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Anggota Aktif</p>
            <p className="text-sm font-black text-[#C2A676]">2.400+ Members</p>
          </div>

          <div className="bg-[#111315] border border-white/5 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Hemat hingga</p>
            <p className="text-sm font-black text-green-400">20% Diskon</p>
          </div>
        </div>
      </header>

      {/* ══ FORM FILTER / SEARCH ═════════════════════════════ */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
      >
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Cari paket atau benefit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#25282c] border border-white/10 text-[#E0E0E0] text-sm rounded-xl pl-9 pr-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/60 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { val: 'semua', label: 'Semua' },
            { val: 'harian', label: 'Harian' },
            { val: '1bulan', label: '1 Bulan' },
            { val: '6bulan', label: '6 Bulan' },
            { val: '12bulan', label: '12 Bulan' },
          ].map((opt) => (
            <label
              key={opt.val}
              className={
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ' +
                (selectedFilter === opt.val
                  ? 'bg-[#C2A676] text-[#111315] border-[#C2A676]'
                  : 'bg-[#25282c] text-gray-400 border-white/10 hover:text-white')
              }
            >
              <input
                type="radio"
                name="filterDurasi"
                value={opt.val}
                checked={selectedFilter === opt.val}
                onChange={() => setSelectedFilter(opt.val)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </form>

      {/* ══ KARTU PAKET ══════════════════════════════════════ */}
      <section>
        {loadingPaket ? (
          <div className="text-center py-20 text-[#C2A676] font-black uppercase tracking-widest animate-pulse">
            MEMUAT DATA DATABASE...
          </div>
        ) : paketFiltered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold">Paket tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paketFiltered.map((paket) => (
              <div
                key={paket.id}
                className={
                  'relative bg-[#1A1C1E] border-2 rounded-3xl p-6 shadow-lg flex flex-col ' +
                  'transition-all duration-300 hover:scale-[1.03] cursor-pointer ' +
                  (paket.highlight
                    ? 'hover:shadow-[0_0_35px_rgba(194,166,118,0.25)] ' + paket.warna
                    : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ' + paket.warna)
                }
              >
                {paket.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C2A676] text-[#111315] text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-md">
                    {paket.badge}
                  </span>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h2 className={'text-xl font-black uppercase tracking-widest ' + paket.aksen}>
                    {paket.durasi}
                  </h2>
                </div>

                <div className="mb-5">
                  {paket.diskonPersen > 0 && (
                    <p className="text-xs text-gray-500 line-through mb-0.5">
                      {formatRupiah(paket.hargaNormal)}
                    </p>
                  )}
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">
                      {formatRupiah(paket.hargaDiskon)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">
                    Masa Berlaku: {paket.durasiHari} Hari
                  </span>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {paket.benefit.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-[#C2A676] font-black mt-0.5">✓</span>
                      {b.toLowerCase().includes('personal trainer') ? (
                        <span className="text-[#C2A676] font-bold">{b}</span>
                      ) : (
                        b
                      )}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePilihPaket(paket)}
                  className={
                    'w-full py-3 rounded-xl text-sm font-black transition-all duration-200 active:scale-95 ' +
                    (paket.highlight
                      ? 'bg-[#C2A676] text-[#111315] hover:bg-[#d4b88a] shadow-md hover:shadow-[0_0_20px_rgba(194,166,118,0.4)]'
                      : 'bg-[#25282c] text-white hover:bg-[#333] border border-white/10')
                  }
                >
                  Pilih Paket Ini →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ MODAL SYARAT & KETENTUAN ═════════════════════════ */}
      {showSyarat && paketDipilih && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowSyarat(false)}
          />
          <div className="relative w-full max-w-md bg-[#1A1C1E] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white uppercase mb-1">Konfirmasi Pilihan</h3>
            <p className="text-xs text-gray-400 mb-4">
              Anda memilih{' '}
              <strong className="text-[#C2A676]">{paketDipilih.durasi}</strong>
              {' '}seharga{' '}
              <strong className="text-white">{formatRupiah(paketDipilih.hargaDiskon)}</strong>
            </p>

            {/* INFO BANNER BACKEND LOGIC MEMBERSHIP (Perpanjangan / Anti Duplikat Invoice) */}
            <div className="bg-[#111315] border border-[#C2A676]/30 rounded-xl p-3 mb-4 flex gap-3 items-start">
              <span className="text-[#C2A676] text-lg leading-none mt-0.5">ℹ️</span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                <strong>Catatan Sistem:</strong> Jika Anda masih memiliki Membership Aktif, masa berlaku <strong>{paketDipilih.durasiHari} hari</strong> akan otomatis diakumulasi (diperpanjang) dari tanggal expired sebelumnya. Jika Anda memiliki tagihan pembayaran sebelumnya yang tertunda untuk paket ini, sistem akan melanjutkannya untuk Anda.
              </p>
            </div>

            <div className="bg-[#25282c] border border-white/5 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
              <p className="text-[11px] text-gray-300 font-bold mb-2 uppercase tracking-wider">Benefit yang Anda Dapatkan:</p>
              <ul className="space-y-1.5">
                {paketDipilih.benefit.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-[#C2A676] font-black mt-0.5 shrink-0">✓</span>
                    {b.toLowerCase().includes('personal trainer')
                      ? <span className="text-[#C2A676] font-bold">{b}</span>
                      : b
                    }
                  </li>
                ))}
              </ul>
            </div>

            <label className="flex items-start gap-3 bg-[#25282c] border border-white/5 rounded-xl px-4 py-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={agreedSyarat}
                onChange={(e) => setAgreedSyarat(e.target.checked)}
                className="mt-0.5 accent-[#C2A676] w-4 h-4 shrink-0"
              />
              <span className="text-xs text-gray-400 leading-relaxed">
                Saya menyetujui syarat & ketentuan membership Gymbros dan memahami
                bahwa pembayaran bersifat non-refundable setelah diproses.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSyarat(false)}
                className="flex-1 bg-[#25282c] hover:bg-[#333] text-gray-300 text-sm font-medium py-2.5 rounded-xl border border-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLanjutBayar}
                disabled={!agreedSyarat}
                className={
                  'flex-1 text-sm font-black py-2.5 rounded-xl transition-all duration-200 ' +
                  (agreedSyarat
                    ? 'bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] shadow-md'
                    : 'bg-[#333] text-gray-600 cursor-not-allowed')
                }
              >
                Lanjut Bayar →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Membership;