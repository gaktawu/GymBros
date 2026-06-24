import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Membership = () => {
  const navigate = useNavigate();

  // ── STATE ──────────────────────────────────────────────────
  const [testimoni, setTestimoni] = useState([]);
  const [loadingTestimoni, setLoadingTestimoni] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [paketDipilih, setPaketDipilih] = useState(null);
  const [showSyarat, setShowSyarat] = useState(false);
  const [agreedSyarat, setAgreedSyarat] = useState(false);

  // ── DATA PAKET ─────────────────────────────────────────────
  const paketList = [
    {
      id: 'harian',
      durasi: 'Harian',
      filter: 'harian',
      hargaNormal: 20000,
      hargaDiskon: 20000,
      diskonPersen: 0,
      warna: 'border-[#888888]/30',
      aksen: 'text-gray-400',
      badge: null,
      highlight: false,
      benefit: [
        'Akses gym 1 hari penuh',
        'Akses area kardio & beban',
        'Loker harian (tidak permanen)',
        'Tanpa komitmen jangka panjang',
      ],
    },
    {
      id: 'bulanan',
      durasi: '1 Bulan',
      filter: '1bulan',
      hargaNormal: 250000,
      hargaDiskon: 250000,
      diskonPersen: 0,
      warna: 'border-[#888888]/40',
      aksen: 'text-gray-300',
      badge: null,
      highlight: false,
      benefit: [
        'Akses gym 24 jam',
        'Loker standar',
        '1 kelas grup per minggu',
        'Konsultasi awal 1x',
        'Akses semua area kardio',
      ],
    },
    {
      id: '6bulan',
      durasi: '6 Bulan',
      filter: '6bulan',
      hargaNormal: 250000 * 6,   // 1.500.000 (harga tanpa diskon)
      hargaDiskon: 1200000,       // harga pakai diskon
      diskonPersen: Math.round((1 - 1200000 / (250000 * 6)) * 100),
      warna: 'border-[#C2A676]/50',
      aksen: 'text-[#C2A676]',
      badge: 'TERLARIS',
      highlight: true,
      benefit: [
        'Akses gym 24 jam',
        'Loker premium',
        '3 kelas grup per minggu',
        'Personal Trainer 2 sesi/minggu',
        'Program latihan personal',
        'Progress tracking bulanan',
        'Guest pass 2x',
      ],
    },
    {
      id: '12bulan',
      durasi: '12 Bulan',
      filter: '12bulan',
      hargaNormal: 250000 * 12,  // 3.000.000
      hargaDiskon: 2500000,
      diskonPersen: Math.round((1 - 2500000 / (250000 * 12)) * 100),
      warna: 'border-white/20',
      aksen: 'text-white',
      badge: 'TERBAIK',
      highlight: false,
      benefit: [
        'Akses gym 24 jam',
        'Loker VIP + kunci digital',
        'Kelas grup unlimited',
        'Personal Trainer 3 sesi/minggu',
        'Program nutrisi personal',
        'Progress tracking mingguan',
        'Guest pass 4x',
        'Akses sauna & spa',
        'Merchandise eksklusif Gymbros',
      ],
    },
  ];

  // ── FILTER ─────────────────────────────────────────────────
  const paketFiltered = paketList.filter((p) => {
    const matchFilter = selectedFilter === 'semua' || p.filter === selectedFilter;
    const matchSearch = p.durasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.benefit.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // ── USE EFFECT ─────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Gymbros | Pilih Membership';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';

    // [AXIOS] Ambil testimoni dari JSONPlaceholder (10 item)
    axios
      .get('https://jsonplaceholder.typicode.com/posts?_limit=10')
      .then((res) => {
        const namaList = ['Budi S.', 'Rina D.', 'Ahmad F.', 'Doni P.', 'Siti R.',
                          'Reza K.', 'Maya L.', 'Tono W.', 'Eka J.', 'Putri N.'];
        const mapped = res.data.map((item, i) => ({
          id: item.id,
          nama: namaList[i],
          ulasan: item.body.replace(/\n/g, ' ').slice(0, 90) + '...',
          paket: paketList[i % 3].durasi,
        }));
        setTestimoni(mapped);
        setLoadingTestimoni(false);
      })
      .catch(() => setLoadingTestimoni(false));

    return () => { document.body.style.backgroundColor = ori; };
  }, []);

  // ── HANDLER ────────────────────────────────────────────────
  const handlePilihPaket = (paket) => {
    setPaketDipilih(paket);
    setShowSyarat(true);
    setAgreedSyarat(false);
  };

  const handleLanjutBayar = () => {
    if (!agreedSyarat) return;
    setShowSyarat(false);
    // Kirim data paket ke halaman pembayaran via state
    navigate('/member/bayar', { state: { paket: paketDipilih } });
  };

  const formatRupiah = (n) =>
    'Rp ' + n.toLocaleString('id-ID');

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <main className="w-full max-w-6xl mx-auto space-y-10 text-[#E0E0E0]">

      {/* ══ HERO HEADER ══════════════════════════════════════ */}
      <header className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl overflow-hidden">
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
            <p className="text-sm font-black text-green-400">17% Diskon</p>
          </div>
        </div>
      </header>

      {/* ══ FORM FILTER / SEARCH ═════════════════════════════ */}
      {/* [HTML SEMANTIC] <form> dengan input type="text" dan input type="radio" */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        aria-label="Filter paket membership"
      >
        {/* Search input */}
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

        {/* Radio filter durasi */}
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
      {/* [CSS] Grid responsif: 1 kolom mobile → 3 kolom desktop */}
      <section aria-label="Daftar paket membership">
        {paketFiltered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold">Paket tidak ditemukan.</p>
            <p className="text-sm mt-1">Coba kata kunci lain.</p>
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
                {/* Badge */}
                {paket.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C2A676] text-[#111315] text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-md">
                    {paket.badge}
                  </span>
                )}

                {/* Durasi & Diskon persen */}
                <div className="flex items-start justify-between mb-2">
                  <h2 className={'text-xl font-black uppercase tracking-widest ' + paket.aksen}>
                    Paket {paket.durasi}
                  </h2>
                  {paket.diskonPersen > 0 && (
                    <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-1 rounded-full">
                      HEMAT {paket.diskonPersen}%
                    </span>
                  )}
                </div>

                {/* Harga */}
                <div className="mb-5">
                  {/* [CONDITIONAL RENDER] harga normal dicoret jika ada diskon */}
                  {paket.diskonPersen > 0 && (
                    <p className="text-xs text-gray-500 line-through mb-0.5">
                      {formatRupiah(paket.hargaNormal)}
                    </p>
                  )}
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">
                      {formatRupiah(paket.hargaDiskon)}
                    </span>
                    <span className="text-xs text-gray-500 mb-1">/ {paket.durasi}</span>
                  </div>
                  {paket.diskonPersen > 0 && (
                    <p className="text-[11px] text-green-400 font-bold mt-0.5">
                      Hemat {formatRupiah(paket.hargaNormal - paket.hargaDiskon)}!
                    </p>
                  )}
                </div>

                {/* Benefit list */}
                <ul className="space-y-2 flex-1 mb-6">
                  {paket.benefit.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-[#C2A676] font-black mt-0.5">✓</span>
                      {/* [CONDITIONAL RENDER] Personal Trainer di-highlight */}
                      {b.toLowerCase().includes('personal trainer') ? (
                        <span className="text-[#C2A676] font-bold">{b}</span>
                      ) : (
                        b
                      )}
                    </li>
                  ))}
                </ul>

                {/* Tombol CTA */}
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

      {/* ══ TABEL PERBANDINGAN ═══════════════════════════════ */}
      <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg overflow-x-auto">
        <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">
          Perbandingan Paket
        </h2>
        <table className="w-full text-xs text-left border-collapse min-w-[420px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-2 pr-4 text-gray-400 font-bold uppercase tracking-wider">Benefit</th>
              {paketList.map((p) => (
                <th key={p.id} className={'py-2 px-3 font-black uppercase text-center ' + p.aksen}>
                  {p.durasi}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              'Akses gym 24 jam',
              'Loker premium',
              'Kelas grup',
              'Personal Trainer',
              'Progress tracking',
              'Guest pass',
              'Sauna & spa',
            ].map((row, i) => (
              <tr key={row} className={'border-b border-white/5 ' + (i % 2 === 0 ? '' : 'bg-[#25282c]/30')}>
                <td className="py-2.5 pr-4 text-gray-300">{row}</td>
                {paketList.map((p) => {
                  const ada = p.benefit.some((b) => b.toLowerCase().includes(row.toLowerCase().split(' ')[0]));
                  return (
                    <td key={p.id} className="py-2.5 px-3 text-center">
                      {ada
                        ? <span className="text-green-400 font-black">✓</span>
                        : <span className="text-gray-600">—</span>
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-b border-white/5 bg-[#25282c]/30">
              <td className="py-2.5 pr-4 text-gray-300 font-bold">Total Harga</td>
              {paketList.map((p) => (
                <td key={p.id} className="py-2.5 px-3 text-center font-black text-[#C2A676]">
                  {formatRupiah(p.hargaDiskon)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      
      {/* ══ MODAL SYARAT & KETENTUAN ═════════════════════════ */}
      {/* [CONDITIONAL RENDER] tampil hanya jika showSyarat === true */}
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
              <strong className="text-[#C2A676]">Paket {paketDipilih.durasi}</strong>
              {' '}seharga{' '}
              <strong className="text-white">{formatRupiah(paketDipilih.hargaDiskon)}</strong>
            </p>

            <div className="bg-[#25282c] border border-white/5 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
              <p className="text-[11px] text-gray-300 font-bold mb-2 uppercase tracking-wider">Benefit yang Anda Dapatkan:</p>
              <ul className="space-y-1.5">
                {paketDipilih.benefit.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-[#C2A676] font-black mt-0.5 shrink-0">✓</span>
                    {b.toLowerCase().includes('personal trainer')
                      ? <span className="text-[#C2A676] font-bold">{b}</span>
                      : b
                    }
                  </li>
                ))}
              </ul>
            </div>

            {/* [HTML SEMANTIC] input type="checkbox" untuk persetujuan */}
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