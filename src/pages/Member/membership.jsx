import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Membership = () => {
  const navigate = useNavigate();

  // ── STATE ──────────────────────────────────────────────────
  const [paketList, setPaketList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testimoni, setTestimoni] = useState([]);
  const [loadingTestimoni, setLoadingTestimoni] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [paketDipilih, setPaketDipilih] = useState(null);
  const [showSyarat, setShowSyarat] = useState(false);
  const [agreedSyarat, setAgreedSyarat] = useState(false);

  // ── FETCH DATA DARI DATABASE (REAL-TIME) ───────────────────
  useEffect(() => {
    document.title = 'Gymbros | Pilih Membership';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';

    const fetchPaketMembership = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        // Menarik data paket dari backend
        const res = await axios.get('http://localhost:5000/api/v1/paket-membership', config);
        const rawData = res.data.data || res.data;

        // Memetakan data dari database ke tampilan UI
        const formattedPaket = rawData
          .filter(p => p.status_aktif === 'Tersedia') // Hanya yang aktif
          .map(p => {
            const hargaNormal = Number(p.harga);
            const diskonPersen = Number(p.diskon) || 0;
            const hargaDiskon = hargaNormal - (hargaNormal * (diskonPersen / 100));

            // Logika Warna, Aksen, & Kategori Filter berdasarkan Durasi Hari
            let filterCat = '1bulan';
            let warna = 'border-[#888888]/40';
            let aksen = 'text-gray-300';
            let badge = null;
            let highlight = false;

            if (p.durasi_hari === 1) {
              filterCat = 'harian';
              warna = 'border-[#888888]/30'; aksen = 'text-gray-400';
            } else if (p.durasi_hari > 30 && p.durasi_hari <= 180) {
              filterCat = '6bulan';
              warna = 'border-[#C2A676]/50'; aksen = 'text-[#C2A676]'; badge = 'TERLARIS'; highlight = true;
            } else if (p.durasi_hari > 180) {
              filterCat = '12bulan';
              warna = 'border-white/20'; aksen = 'text-white'; badge = 'TERBAIK'; highlight = false;
            }

            // Logika Pembuatan Benefit Otomatis agar tabel tetap terisi
            const benefit = ['Akses gym 24 jam'];
            if (p.durasi_hari > 1) benefit.push('Kelas grup');
            if (p.durasi_hari >= 30) {
              benefit.push('Loker premium');
              benefit.push('Progress tracking');
            } else {
              benefit.push('Loker standar');
            }
            if (p.durasi_hari >= 180) {
              benefit.push('Personal Trainer');
              benefit.push('Guest pass');
            }
            if (p.durasi_hari >= 360) benefit.push('Sauna & spa');

            return {
              id: p.id_paket || p.id,
              durasi: p.nama_paket, // Menampilkan Nama Paket dari Database
              durasiHari: p.durasi_hari,
              filter: filterCat,
              hargaNormal,
              hargaDiskon,
              diskonPersen,
              warna,
              aksen,
              badge,
              highlight,
              benefit
            };
          });

        setPaketList(formattedPaket);
      } catch (error) {
        console.error("Gagal menarik data paket:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaketMembership();

    // Fetch Testimoni (Tetap menggunakan API dummy placeholder agar UI tetap cantik)
    axios.get('https://jsonplaceholder.typicode.com/posts?_limit=6')
      .then((res) => {
        const namaList = ['Budi S.', 'Rina D.', 'Ahmad F.', 'Doni P.', 'Siti R.', 'Reza K.'];
        const mapped = res.data.map((item, i) => ({
          id: item.id,
          nama: namaList[i],
          rating: 4 + (i % 2),
          ulasan: item.body.replace(/\n/g, ' ').slice(0, 90) + '...',
          paket: i % 2 === 0 ? 'Member Baru' : 'Member Setia',
        }));
        setTestimoni(mapped);
        setLoadingTestimoni(false);
      })
      .catch(() => setLoadingTestimoni(false));

    return () => { document.body.style.backgroundColor = ori; };
  }, []);

  // ── FILTER PENCARIAN ───────────────────────────────────────
  const paketFiltered = paketList.filter((p) => {
    const matchFilter = selectedFilter === 'semua' || p.filter === selectedFilter;
    const matchSearch = p.durasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.benefit.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // ── HANDLERS ───────────────────────────────────────────────
  const handlePilihPaket = (paket) => {
    setPaketDipilih(paket);
    setShowSyarat(true);
    setAgreedSyarat(false);
  };

  const handleLanjutBayar = () => {
    if (!agreedSyarat) return;
    setShowSyarat(false);
    // Mengirim data paket nyata ke Halaman PaymentPage
    navigate('/member/bayar', { state: { paket: paketDipilih } });
  };

  const formatRupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <main className="w-full max-w-6xl mx-auto space-y-10 text-[#E0E0E0] p-4 lg:p-0 pb-12">

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
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Rating</p>
            <p className="text-sm font-black text-yellow-400">★ 4.9 / 5.0</p>
          </div>
        </div>
      </header>

      {/* ══ FORM FILTER / SEARCH ═════════════════════════════ */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-lg"
      >
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Cari nama paket atau fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#25282c] border border-white/10 text-[#E0E0E0] text-sm rounded-xl pl-11 pr-4 py-3 placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/60 transition-colors"
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
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border transition-all ' +
                (selectedFilter === opt.val
                  ? 'bg-[#C2A676] text-[#111315] border-[#C2A676] shadow-md'
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

      {/* ══ KARTU PAKET (DARI DATABASE) ═══════════════════════ */}
      <section aria-label="Daftar paket membership">
        {isLoading ? (
          <div className="text-center py-16 text-[#C2A676] animate-pulse">
            <div className="w-10 h-10 border-4 border-[#C2A676]/20 border-t-[#C2A676] rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold tracking-widest uppercase text-xs">Menarik Data Paket dari Server...</p>
          </div>
        ) : paketFiltered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-[#1A1C1E] border border-white/5 rounded-3xl">
            <p className="text-4xl mb-3 opacity-50">🔍</p>
            <p className="font-bold uppercase tracking-wider text-sm">Paket tidak ditemukan.</p>
            <p className="text-xs mt-1">Coba kata kunci lain atau hubungi admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paketFiltered.map((paket) => (
              <div
                key={paket.id}
                className={
                  'relative bg-[#1A1C1E] border-2 rounded-3xl p-6 shadow-lg flex flex-col ' +
                  'transition-all duration-300 hover:-translate-y-1 cursor-pointer ' +
                  (paket.highlight
                    ? 'hover:shadow-[0_0_35px_rgba(194,166,118,0.20)] ' + paket.warna
                    : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ' + paket.warna)
                }
              >
                {paket.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C2A676] text-[#111315] text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-md">
                    {paket.badge}
                  </span>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h2 className={'text-lg font-black uppercase tracking-widest leading-tight ' + paket.aksen}>
                    {paket.durasi}
                  </h2>
                </div>

                <div className="mb-5">
                  {paket.diskonPersen > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                        DISKON {paket.diskonPersen}%
                      </span>
                      <p className="text-xs text-gray-500 line-through">
                        {formatRupiah(paket.hargaNormal)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">
                      {formatRupiah(paket.hargaDiskon)}
                    </span>
                  </div>
                  {paket.diskonPersen > 0 && (
                    <p className="text-[10px] text-green-400 font-bold mt-1">
                      Hemat {formatRupiah(paket.hargaNormal - paket.hargaDiskon)}!
                    </p>
                  )}
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {paket.benefit.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-gray-300">
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
                    'w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-black transition-all duration-200 active:scale-95 ' +
                    (paket.highlight
                      ? 'bg-[#C2A676] text-[#111315] hover:bg-[#d4b88a] shadow-lg shadow-[#C2A676]/20'
                      : 'bg-[#25282c] text-white hover:bg-white/10 border border-white/10')
                  }
                >
                  Pilih Paket Ini →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ TABEL PERBANDINGAN ═══════════════════════════════ */}
      {!isLoading && paketList.length > 0 && (
        <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg overflow-x-auto">
          <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">
            Perbandingan Fasilitas
          </h2>
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 text-gray-400 font-bold uppercase tracking-wider w-1/3">Benefit Utama</th>
                {paketList.slice(0, 4).map((p) => (
                  <th key={p.id} className={'py-3 px-3 font-black uppercase text-center ' + p.aksen}>
                    {p.durasi}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                'Akses gym 24 jam',
                'Kelas grup',
                'Loker premium',
                'Personal Trainer',
                'Progress tracking',
                'Sauna & spa',
              ].map((row, i) => (
                <tr key={row} className={'border-b border-white/5 ' + (i % 2 === 0 ? '' : 'bg-[#25282c]/30')}>
                  <td className="py-3 pr-4 text-gray-300 font-medium">{row}</td>
                  {paketList.slice(0, 4).map((p) => {
                    const ada = p.benefit.some((b) => b.toLowerCase().includes(row.toLowerCase().split(' ')[0]));
                    return (
                      <td key={p.id} className="py-3 px-3 text-center">
                        {ada
                          ? <span className="text-green-400 font-black text-sm">✓</span>
                          : <span className="text-gray-600">—</span>
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-b border-white/5 bg-[#25282c]/50">
                <td className="py-4 pr-4 text-white font-black uppercase tracking-wider">Total Harga</td>
                {paketList.slice(0, 4).map((p) => (
                  <td key={p.id} className="py-4 px-3 text-center font-black text-[#C2A676] text-sm">
                    {formatRupiah(p.hargaDiskon)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* ══ TESTIMONI (DATA TETAP) ═══════════════════════════ */}
      <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg">
        <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">
          Apa Kata Member Kami
        </h2>
        {loadingTestimoni ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C2A676] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimoni.map((t) => (
              <div key={t.id} className="bg-[#25282c] border border-white/5 rounded-2xl p-5 hover:border-[#C2A676]/30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C2A676]/20 flex items-center justify-center text-[#C2A676] text-sm font-black">
                      {t.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{t.nama}</p>
                      <p className="text-[10px] text-gray-500">{t.paket}</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-xs tracking-widest">{'★'.repeat(t.rating)}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed italic">"{t.ulasan}"</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ MODAL SYARAT & KETENTUAN (CHECKOUT) ══════════════ */}
      {showSyarat && paketDipilih && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSyarat(false)} />
          <div className="relative w-full max-w-md bg-[#1A1C1E] border border-white/10 rounded-3xl p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-black text-white uppercase mb-1 tracking-wide">Konfirmasi Pilihan</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Anda memilih <strong className="text-[#C2A676]">{paketDipilih.durasi}</strong> seharga <strong className="text-white">{formatRupiah(paketDipilih.hargaDiskon)}</strong>.
            </p>

            <div className="bg-[#25282c] border border-white/5 rounded-2xl p-5 mb-5 max-h-48 overflow-y-auto custom-scrollbar">
              <p className="text-[10px] text-gray-500 font-bold mb-3 uppercase tracking-widest">Benefit yang Didapat:</p>
              <ul className="space-y-2.5">
                {paketDipilih.benefit.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-[#C2A676] font-black mt-0.5 shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <label className="flex items-start gap-3 bg-[#111315] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 cursor-pointer mb-5 transition-colors">
              <input
                type="checkbox"
                checked={agreedSyarat}
                onChange={(e) => setAgreedSyarat(e.target.checked)}
                className="mt-0.5 accent-[#C2A676] w-4 h-4 shrink-0"
              />
              <span className="text-[11px] text-gray-400 leading-relaxed">
                Saya menyetujui syarat & ketentuan membership Gymbros dan memahami bahwa pembayaran bersifat non-refundable (tidak dapat dikembalikan).
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSyarat(false)}
                className="flex-1 bg-[#25282c] hover:bg-[#333] text-gray-300 text-xs font-black uppercase tracking-widest py-3.5 rounded-xl border border-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLanjutBayar}
                disabled={!agreedSyarat}
                className={
                  'flex-1 text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 shadow-lg ' +
                  (agreedSyarat
                    ? 'bg-[#C2A676] hover:bg-[#d4b88a] text-[#111315] shadow-[#C2A676]/20 transform hover:-translate-y-0.5'
                    : 'bg-[#333] text-gray-600 cursor-not-allowed')
                }
              >
                Lanjut Bayar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Membership;