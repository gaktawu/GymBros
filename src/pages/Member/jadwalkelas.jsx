import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const ClassSchedule = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch Data dari Database
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.get(`${API_BASE_URL}/classes`, config);
      const rawData = res.data.data || res.data || [];
      
      // JARING PENANGKAP SUPER (Aman untuk format String maupun Number)
      const mapped = rawData.map(cls => {
        // parseInt akan memaksa nilai string "50000" menjadi angka 50000 dengan aman
        const hargaAsli = parseInt(cls.harga || cls.harga_per_sesi || cls.hargaPerSesi || 0, 10);
        const sisaKuota = parseInt(cls.kapasitas || cls.kapasitas_maksimal || cls.kapasitasMaksimal || 0, 10);
        const waktu = cls.waktuMulai || cls.waktu_mulai || new Date();

        return {
          id: cls.idKelas || cls.id_kelas || cls.id,
          name: cls.namaKelas || cls.nama_kelas || "Tanpa Nama",
          coach: cls.instruktur || cls.pelatih?.namaPelatih || "Instruktur",
          time: new Date(waktu).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
          day: new Date(waktu).toLocaleDateString('id-ID', { weekday: 'long' }),
          
          rawPrice: hargaAsli, 
          price: hargaAsli > 0 
            ? hargaAsli.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) 
            : "Gratis",
          
          slotsLeft: sisaKuota,
          status: cls.statusAktif || cls.status_aktif || cls.status || 'Tersedia'
        };
      });
      
      // Filter hanya kelas yang aktif
      setClasses(mapped.filter(c => c.status.toLowerCase() !== 'tidak tersedia' && c.status.toLowerCase() !== 'inactive'));
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Gymbros | Jadwal Kelas';
    const ori = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111315';
    
    fetchClasses();

    return () => { document.body.style.backgroundColor = ori; };
  }, [fetchClasses]);

  // 2. Fungsi Booking Kelas (Kirim via State Memori)
  const handleBookingClick = (classItem) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Harap login terlebih dahulu untuk memesan kelas!");
      navigate('/login');
      return;
    }

    if (classItem.slotsLeft <= 0) {
      alert("Maaf, kelas ini sudah penuh.");
      return;
    }

    // MENGIRIM DATA SECARA RAHASIA KE PAYMENT PAGE
    // Tidak butuh backend tambahan, PaymentPage akan langsung menangkap data ini!
    navigate('/member/bayar', {
      state: {
        item: {
          type: 'Booking Kelas',
          id: classItem.id,
          name: classItem.name,
          price: classItem.rawPrice,
          schedule: `${classItem.day}, ${classItem.time}`,
          coach: classItem.coach
        }
      }
    });
  };

  return (
    <main className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-[#111315] min-h-screen text-[#E0E0E0] pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-6">
        <div>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">Jadwal Kelas</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Pilih dan Booking Sesi Latihan Anda</p>
        </div>
        <button onClick={fetchClasses} className="text-[#C2A676] bg-[#C2A676]/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C2A676]/20 transition-colors">
          ↻ REFRESH DATA
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-[#C2A676]/20 border-t-[#C2A676] rounded-full animate-spin" />
           <p className="text-[#C2A676] text-xs font-black uppercase tracking-widest animate-pulse">Menarik Jadwal dari Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length > 0 ? classes.map((item) => (
            <div key={item.id} className="bg-[#1A1C1E] p-6 rounded-3xl border border-white/5 hover:border-[#C2A676]/50 hover:shadow-lg hover:shadow-[#C2A676]/5 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                  {item.day}
                </span>
                <span className="text-[#C2A676] font-mono text-sm font-bold bg-[#C2A676]/10 px-2 py-0.5 rounded-lg">
                  {item.time}
                </span>
              </div>
              
              <h3 className="text-xl font-black uppercase text-white tracking-tight">{item.name}</h3>
              <p className="text-xs text-gray-400 mt-1 mb-6 uppercase tracking-wider">Coach: <span className="text-white font-bold">{item.coach}</span></p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-end border-t border-white/5 pt-4 mb-5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Harga Sesi</p>
                    <p className="text-lg font-black text-white">{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Sisa Kuota</p>
                    <p className={`text-sm font-black ${item.slotsLeft > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.slotsLeft} Orang
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleBookingClick(item)}
                  disabled={item.slotsLeft <= 0}
                  className={`w-full py-3.5 font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md ${
                    item.slotsLeft > 0 
                    ? "bg-[#C2A676] text-[#111315] hover:bg-[#d4b88a] active:scale-95 shadow-[#C2A676]/20" 
                    : "bg-[#25282c] text-gray-600 border border-white/5 cursor-not-allowed"
                  }`}
                >
                  {item.slotsLeft > 0 ? "Pesan Kelas Sekarang" : "Kelas Penuh"}
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-[#1A1C1E] border border-white/5 rounded-3xl">
              <p className="text-4xl mb-3 opacity-50">🗓️</p>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Tidak ada jadwal kelas tersedia saat ini.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default ClassSchedule;