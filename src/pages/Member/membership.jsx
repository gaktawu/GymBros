import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Membership = () => {
  const navigate = useNavigate();

  // ── STATE ──────────────────────────────────────────────────
  const [paketList, setPaketList] = useState([]);
  const [loadingPaket, setLoadingPaket] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [paketDipilih, setPaketDipilih] = useState(null);
  const [showSyarat, setShowSyarat] = useState(false);
  const [agreedSyarat, setAgreedSyarat] = useState(false);

  // ── USE EFFECT (MENGAMBIL DATA DARI BACKEND) ───────────────
  useEffect(() => {
    document.title = 'Gymbros | Pilih Membership';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';

    const fetchPaket = async () => {
      try {
        // Ambil token jika endpoint ini dilindungi
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const res = await axios.get('http://localhost:5000/api/v1/paket-membership');
        const rawData = res.data.data || res.data;

        // Filter HANYA paket yang berstatus "Tersedia"
        const paketTersedia = rawData.filter(item => item.status_aktif === 'Tersedia');

        // MAPPING: Mengubah data database menjadi format yang dimengerti UI
        const mappedPaket = paketTersedia.map((item, index) => {
          const harga = Number(item.harga);
          const durasi = Number(item.durasi_hari);

          // Logika Penentuan Filter UI
          let filterVal = 'semua';
          if (durasi <= 1) filterVal = 'harian';
          else if (durasi <= 31) filterVal = '1bulan';
          else if (durasi <= 185) filterVal = '6bulan';
          else filterVal = '12bulan';

          // Logika Desain UI (Warna & Badge)
          const isHighlight = durasi > 90 || index === 2; 
          const badgeText = durasi >= 180 ? 'TERBAIK' : durasi >= 90 ? 'TERLARIS' : null;

          // Logika Benefit Otomatis (Karena di database tidak ada kolom fasilitas)
          const autoBenefit = [
            `Akses gym ${durasi} hari penuh`,
            'Akses area kardio & beban',
            durasi > 1 ? 'Loker standar' : 'Loker harian (tidak permanen)',
            durasi > 30 ? '1 kelas grup per minggu' : null,
            durasi > 90 ? 'Personal Trainer 2 sesi/minggu' : null,
            durasi > 180 ? 'Akses sauna & spa' : null,
            durasi > 180 ? 'Merchandise eksklusif Gymbros' : null,
          ].filter(Boolean); // Filter(Boolean) untuk membuang nilai null

          return {
            id: item.id_paket,
            durasi: item.nama_paket, // Kita gunakan nama_paket sebagai judul utama
            durasiHari: durasi,
            filter: filterVal,
            hargaNormal: harga,
            hargaDiskon: harga, 
            diskonPersen: 0, // Dikosongkan karena tidak ada di database
            warna: isHighlight ? 'border-[#C2A676]/50' : 'border-[#888888]/30',
            aksen: isHighlight ? 'text-[#C2A676]' : 'text-gray-400',
            badge: badgeText,
            highlight: isHighlight,
            benefit: autoBenefit,
          };
        });

        // Urutkan paket berdasarkan durasi hari (dari yang terkecil ke terbesar)
        mappedPaket.sort((a, b) => a.durasiHari - b.durasiHari);
        
        setPaketList(mappedPaket);
      } catch (error) {
        console.error("Gagal menarik data paket:", error);
      } finally {
        setLoadingPaket(false);
      }
    };

    fetchPaket();

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
    // Kirim ID asli dari database ke halaman pembayaran
    navigate('/member/bayar', { state: { paket: paketDipilih } });
  };

  const formatRupiah = (n) =>
    'Rp ' + (n || 0).toLocaleString('id-ID');

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <main className="w-full max-w-6xl mx-auto space-y-10 text-[#E0E0E0] p-4 lg:p-0">

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
      </header>

      {/* ══ FORM FILTER / SEARCH ═════════════════════════════ */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        aria-label="Filter paket membership"
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
      <section aria-label="Daftar paket membership">
        {loadingPaket ? (
           <div className="text-center py-20">
             <div className="w-10 h-10 border-4 border-[#C2A676]/30 border-t-[#C2A676] rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-gray-400 font-medium">Memuat paket membership...</p>
           </div>
        ) : paketFiltered.length === 0 ? (
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

                {/* Durasi */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className={'text-xl font-black uppercase tracking-widest ' + paket.aksen}>
                    {paket.durasi}
                  </h2>
                </div>

                {/* Harga */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">
                      {formatRupiah(paket.hargaDiskon)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">
                    Masa Berlaku: {paket.durasiHari} Hari
                  </span>
                </div>

                {/* Benefit list */}
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
      {!loadingPaket && paketList.length > 0 && (
        <section className="bg-[#1A1C1E] border border-white/5 rounded-3xl p-6 shadow-lg overflow-x-auto mb-10">
          <h2 className="text-sm font-black tracking-widest text-white uppercase mb-4">
            Perbandingan Paket
          </h2>
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4 text-gray-400 font-bold uppercase tracking-wider">Benefit Utama</th>
                {paketList.map((p) => (
                  <th key={p.id} className={'py-2 px-3 font-black uppercase text-center ' + p.aksen}>
                    {p.durasi}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                'Akses gym',
                'Loker standar',
                'Kelas grup',
                'Personal Trainer',
                'Akses sauna',
              ].map((row, i) => (
                <tr key={row} className={'border-b border-white/5 ' + (i % 2 === 0 ? '' : 'bg-[#25282c]/30')}>
                  <td className="py-2.5 pr-4 text-gray-300">{row}</td>
                  {paketList.map((p) => {
                    // Cek apakah kata kunci benefit ada di dalam array benefit paket tersebut
                    const ada = p.benefit.some((b) => b.toLowerCase().includes(row.toLowerCase().split(' ')[0]));
                    return (
                      <td key={p.id} className="py-2.5 px-3 text-center">
                        {ada
                          ? <span className="text-green-400 font-black text-sm">✓</span>
                          : <span className="text-gray-600">—</span>
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-b border-white/5 bg-[#25282c]/30">
                <td className="py-2.5 pr-4 text-gray-300 font-bold uppercase">Investasi Anda</td>
                {paketList.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 text-center font-black text-[#C2A676]">
                    {formatRupiah(p.hargaDiskon)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      )}

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