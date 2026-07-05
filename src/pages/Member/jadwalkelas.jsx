import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const ClassSchedule = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();

  // 1. Fetch Data dari Database
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/classes`);
      const rawData = res.data.data || [];

      const now = new Date();

      const mapped = rawData.map(cls => {
        const classTime = new Date(cls.waktuMulai || cls.waktu_mulai);
        const isPast = classTime < now;

        return {
          id: cls.idKelas || cls.id_kelas,
          name: cls.namaKelas || cls.nama_kelas,
          coach: cls.pelatih?.namaPelatih || "Instruktur",
          time: classTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          day: classTime.toLocaleDateString('id-ID', { weekday: 'long' }),
          rawPrice: cls.harga || 0,
          price: cls.harga ? `Rp ${cls.harga.toLocaleString('id-ID')}` : "Free",
          slotsLeft: cls.kapasitas || 0,
          isPast: isPast
        };
      });

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

  // 2. Handler untuk membuka modal konfirmasi
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

    setSelectedClass(classItem);
    setShowConfirmModal(true);
  };

  // 3. Handler ketika user menekan "OK" pada modal
  const confirmBooking = () => {
    if (!selectedClass) return;

    setShowConfirmModal(false);
    
    // Navigasi ke halaman Universal Bayar
    navigate('/member/bayar', {
      state: {
        item: {
          type: 'Kelas',
          id: selectedClass.id,
          name: selectedClass.name,
          price: selectedClass.rawPrice,
          finalPrice: selectedClass.rawPrice,
          schedule: `${selectedClass.day}, ${selectedClass.time}`,
          coach: selectedClass.coach
        }
      }
    });
    
    setSelectedClass(null);
  };

  // 4. Handler ketika user menekan "Cancel" pada modal
  const cancelBooking = () => {
    setShowConfirmModal(false);
    setSelectedClass(null);
  };

  return (
    <main className="w-full max-w-6xl mx-auto p-6 bg-[#111315] min-h-screen text-[#E0E0E0]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black uppercase text-white">Jadwal Kelas</h2>
        <button onClick={fetchClasses} className="text-[#C2A676] text-xs font-bold hover:underline">
          REFRESH DATA
        </button>
      </div>

      {/* WARNING BANNER */}
      <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl flex items-start gap-3 text-yellow-500 text-xs">
        <span className="text-lg leading-none">⚠️</span>
        <p className="leading-relaxed">
          <strong>Perhatian:</strong> Sistem menerapkan sistem <span className="italic">real-time checking</span>. 
          Transaksi Anda bisa dibatalkan otomatis jika terdeteksi jadwal yang bentrok 
          dengan kelas Anda yang lain, atau jika kuota kelas habis saat konfirmasi pembayaran dari bank diterima.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-[#C2A676] font-bold">MEMUAT JADWAL DARI DATABASE...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.length > 0 ? classes.map((item) => (
            <div key={item.id} className={`p-6 rounded-3xl border transition-all ${item.isPast ? 'bg-[#1a1a1a] border-white/5 opacity-60' : 'bg-[#1e2023] border-white/5 hover:border-[#C2A676]'}`}>
              <h3 className="text-lg font-black uppercase text-white">{item.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{item.day} • {item.time}</p>

              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
                <span className="text-[#C2A676] font-bold">{item.price}</span>
                <span className={item.slotsLeft > 0 ? "text-gray-500" : "text-red-500 font-bold"}>
                  Sisa Kuota: {item.slotsLeft}
                </span>
              </div>

              <button
                onClick={() => handleBookingClick(item)}
                disabled={item.slotsLeft <= 0 || item.isPast}
                className={`w-full mt-6 py-3 font-black uppercase text-xs rounded-xl transition-all ${
                  item.isPast 
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : item.slotsLeft > 0
                      ? "bg-[#C2A676] text-[#111315] hover:bg-white"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {item.isPast ? "Kelas Berakhir" : item.slotsLeft > 0 ? "Pesan Kelas Sekarang" : "Kelas Penuh"}
              </button>
            </div>
          )) : (
            <p className="text-gray-500 col-span-3 text-center py-10">Tidak ada kelas tersedia saat ini.</p>
          )}
        </div>
      )}

      {/* MODAL KONFIRMASI CUSTOM */}
      {showConfirmModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e2023] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-lg">Konfirmasi Pemesanan</h3>
            </div>
            
            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-[#E0E0E0] text-sm leading-relaxed">
                <span className="text-[#C2A676] font-bold">PENTING:</span> Sistem akan memverifikasi jadwal Anda.
              </p>
              
              <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
                <li>Pastikan Anda belum mendaftar di kelas ini sebelumnya.</li>
                <li>Pastikan jadwal kelas ini tidak bertabrakan dengan kelas lain yang sudah Anda pesan.</li>
              </ul>

              <div className="bg-[#111315] rounded-xl p-4 mt-4 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Kelas yang akan dipesan:</p>
                <p className="text-white font-bold text-sm">{selectedClass.name}</p>
                <p className="text-[#C2A676] text-xs mt-1">{selectedClass.day}, {selectedClass.time}</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 flex gap-3 justify-end border-t border-white/5 bg-[#1a1a1a]">
              <button
                onClick={cancelBooking}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2a2a2a] hover:bg-[#333] border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#111315] bg-[#C2A676] hover:bg-white transition-all"
              >
                OK, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClassSchedule;