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
      const res = await axios.get(`${API_BASE_URL}/classes`);
      const rawData = res.data.data || [];

      const mapped = rawData.map(cls => ({
        id: cls.idKelas || cls.id_kelas,
        name: cls.namaKelas || cls.nama_kelas,
        coach: cls.pelatih?.namaPelatih || "Instruktur",
        time: new Date(cls.waktuMulai || cls.waktu_mulai).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        day: new Date(cls.waktuMulai || cls.waktu_mulai).toLocaleDateString('id-ID', { weekday: 'long' }),

        // Simpan harga asli (angka) untuk dikirim ke halaman bayar
        rawPrice: cls.harga || 0,
        price: cls.harga ? `Rp ${cls.harga.toLocaleString('id-ID')}` : "Free",

        slotsLeft: cls.kapasitas || 0
      }));

      setClasses(mapped);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // 2. Fungsi Mengarahkan ke Halaman Pembayaran
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

    // Navigasi ke halaman Universal Bayar dengan membawa "state" item kelas
    navigate('/member/bayar', {
      state: {
        item: {
          type: 'Kelas',             
          id: classItem.id,          
          name: classItem.name,      
          price: classItem.rawPrice, 
          finalPrice: classItem.rawPrice, 
          schedule: `${classItem.day}, ${classItem.time}`, 
          coach: classItem.coach     
        }
      }
    });
  };

  return (
    <main className="w-full max-w-6xl mx-auto p-6 bg-[#111315] min-h-screen text-[#E0E0E0]">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black uppercase text-white">Jadwal Kelas</h2>
        <button onClick={fetchClasses} className="text-[#C2A676] text-xs font-bold hover:underline">
          REFRESH DATA
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-[#C2A676] font-bold">MEMUAT JADWAL DARI DATABASE...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.length > 0 ? classes.map((item) => (
            <div key={item.id} className="bg-[#1e2023] p-6 rounded-3xl border border-white/5 hover:border-[#C2A676] transition-all">
              <h3 className="text-lg font-black uppercase text-white">{item.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{item.day} • {item.time}</p>

              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
                <span className="text-[#C2A676] font-bold">{item.price}</span>
                <span className="text-gray-500">Sisa Kuota: {item.slotsLeft}</span>
              </div>

              <button
                onClick={() => handleBookingClick(item)}
                disabled={item.slotsLeft <= 0}
                className={`w-full mt-6 py-3 font-black uppercase text-xs rounded-xl transition-all ${item.slotsLeft > 0
                    ? "bg-[#C2A676] text-[#111315] hover:bg-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {item.slotsLeft > 0 ? "Pesan Kelas Sekarang" : "Kelas Penuh"}
              </button>
            </div>
          )) : (
            <p className="text-gray-500 col-span-3 text-center py-10">Tidak ada kelas tersedia saat ini.</p>
          )}
        </div>
      )}
    </main>
  );
};

export default ClassSchedule;