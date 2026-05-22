import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [newReport, setNewReport] = useState({ title: '', kategori: 'Kerusakan Alat', body: '' });

  // State baru untuk mengontrol Modal Custom
  const [modalSukses, setModalSukses] = useState(false);
  const [modalHapus, setModalHapus] = useState({ isOpen: false, idToDelete: null });

  const kategoriGym = ["Kerusakan Alat", "Kebersihan Loker", "Pelayanan Trainer", "Kenyamanan Ruangan", "Akses Member"];
  const statusReport = ["Menunggu", "Diproses", "Selesai"];

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10')
      .then(response => {
        const dataProfesional = response.data.map((item, index) => ({
          ...item,
          kategori: kategoriGym[index % kategoriGym.length],
          status: statusReport[index % statusReport.length],
          tanggal: `2026-05-${(index + 1).toString().padStart(2, '0')}`,
        }));
        
        setReports(dataProfesional);
        setLoading(false);
      })
      .catch(error => {
        console.error("Terjadi kesalahan:", error);
        setLoading(false);
      });
  }, []);

  const handleSubmitReport = (e) => {
    e.preventDefault(); 
    
    const laporanBaru = {
      id: reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1, 
      title: newReport.title,
      body: newReport.body,
      kategori: newReport.kategori,
      status: "Menunggu",
      userId: 99, 
      tanggal: new Date().toISOString().split('T')[0] 
    };

    setReports([laporanBaru, ...reports]);
    setNewReport({ title: '', kategori: 'Kerusakan Alat', body: '' });
    
    // Memunculkan Custom Modal Sukses (Bukan alert bawaan)
    setModalSukses(true);
  };

  const triggerDelete = (id) => {
    // Membuka Modal Konfirmasi Hapus dan menyimpan ID yang akan dihapus
    setModalHapus({ isOpen: true, idToDelete: id });
  };

  const confirmDelete = () => {
    // Mengeksekusi penghapusan jika tombol "Ya" diklik di modal
    const updatedReports = reports.filter(report => report.id !== modalHapus.idToDelete);
    setReports(updatedReports);
    setModalHapus({ isOpen: false, idToDelete: null }); // Tutup modal
  };

  const cancelDelete = () => {
    // Menutup modal tanpa menghapus jika tombol "Tidak" diklik
    setModalHapus({ isOpen: false, idToDelete: null });
  };

  const filteredReports = reports.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case "Selesai": return "text-green-400 border-green-400";
      case "Diproses": return "text-blue-400 border-blue-400";
      default: return "text-yellow-400 border-yellow-400";
    }
  };

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0] relative">
      
      {/* ================= MODAL SUKSES (Menggantikan Alert) ================= */}
      {modalSukses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-[#1A1C1E] p-8 rounded-xl border border-[#C2A676] shadow-2xl max-w-sm w-full text-center transform transition-all">
            <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Berhasil!</h3>
            <p className="text-[#888888] mb-6">Laporan Anda berhasil dikirim dan sedang menunggu antrean proses.</p>
            <button 
              onClick={() => setModalSukses(false)}
              className="w-full py-3 bg-[#C2A676] text-[#111315] font-bold rounded hover:bg-[#a68c5b] transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS (Menggantikan Confirm) ================= */}
      {modalHapus.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-[#1A1C1E] p-8 rounded-xl border border-red-500 shadow-2xl max-w-sm w-full text-center transform transition-all">
            <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Peringatan Sistem</h3>
            <p className="text-[#888888] mb-6">Apakah Anda yakin ingin menghapus laporan ini? Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-4">
              <button 
                onClick={cancelDelete}
                className="flex-1 py-3 bg-[#111315] border border-[#333333] text-[#E0E0E0] font-bold rounded hover:bg-[#333333] transition-all"
              >
                Tidak
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-all shadow-md"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konten Halaman Utama di bawah sini */}
      <section className={`max-w-6xl mx-auto ${modalSukses || modalHapus.isOpen ? 'pointer-events-none' : ''}`}>
        <div className="mb-8 border-b border-[#333333] pb-4">
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] tracking-tight mb-2">
            Pusat Bantuan & Reports GymBros
          </h1>
          <p className="text-[#888888] text-sm">
            Sampaikan keluhan atau masukan Anda di sini. Kami siap membantu!
          </p>
        </div>

        <div className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-lg mb-10">
          <h2 className="text-xl font-bold text-[#C2A676] mb-4">Buat Laporan Baru</h2>
          <form onSubmit={handleSubmitReport} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-[#888888] mb-1">Judul Laporan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: AC di Ruang Angkat Beban Mati"
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  className="p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] focus:outline-none focus:border-[#C2A676] transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-[#888888] mb-1">Kategori Masalah</label>
                <select 
                  value={newReport.kategori}
                  onChange={(e) => setNewReport({...newReport, kategori: e.target.value})}
                  className="p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] focus:outline-none focus:border-[#C2A676] transition-all"
                >
                  {kategoriGym.map(kat => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-[#888888] mb-1">Detail Keluhan / Masukan</label>
              <textarea 
                required
                rows="3"
                placeholder="Jelaskan secara detail kendala yang Anda alami..."
                value={newReport.body}
                onChange={(e) => setNewReport({...newReport, body: e.target.value})}
                className="p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] focus:outline-none focus:border-[#C2A676] transition-all"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="mt-2 self-end px-8 py-3 bg-[#C2A676] text-[#111315] font-bold rounded hover:bg-[#a68c5b] transition-all shadow-md active:scale-95"
            >
              Kirim Laporan
            </button>
          </form>
        </div>

        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4 border-l-4 border-[#C2A676] pl-3">
          Riwayat Laporan Anda
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="mb-6 flex flex-col sm:flex-row gap-4 bg-[#1A1C1E] p-3 rounded-lg border border-[#333333]">
          <input 
            type="text" 
            placeholder="Cari riwayat laporan (Cth: Alat, Loker)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:border-[#C2A676]"
          />
        </form>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-[#C2A676] text-lg font-medium animate-pulse border border-[#C2A676] px-6 py-3 rounded-full">
              Sinkronisasi Data Reports...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((item) => (
              <article key={item.id} className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-md hover:shadow-xl hover:border-[#C2A676] transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#111315] text-[#C2A676] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#333333]">
                    {item.kategori}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md border bg-[#111315] bg-opacity-50 ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <h2 className="text-[#E0E0E0] text-lg font-bold mb-3 capitalize leading-snug line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-[#888888] text-sm mb-4 line-clamp-3 flex-grow">
                  {item.body}
                </p>
                
                <div className="mt-auto pt-4 border-t border-[#333333] flex justify-between items-center text-xs text-[#888888]">
                  <div className="flex items-center gap-2">
                    <span>Member ID: {item.userId}</span>
                    <span>•</span>
                    <span>{item.tanggal}</span>
                  </div>
                  
                  <button 
                    onClick={() => triggerDelete(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors font-medium hover:underline"
                    title="Hapus Laporan Ini"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
            
            {filteredReports.length === 0 && (
              <div className="col-span-full text-center py-10 bg-[#1A1C1E] rounded-lg border border-[#333333]">
                <p className="text-[#888888] text-lg">Tidak ada report yang sesuai dengan kata kunci.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}