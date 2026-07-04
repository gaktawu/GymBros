import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Sesuaikan BASE_URL dengan port backend Anda
const API_BASE_URL = 'http://localhost:5000/api/v1';

const DashboardMember = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false); 
  const [activeUser, setActiveUser] = useState({ name: "LOADING...", id: "GB-00000" });
  
  // State untuk menyimpan data dari Database
  const [membership, setMembership] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // STATE UNTUK ALERT DINAMIS (CUSTOM TOAST)
  // ==========================================
  const [notification, setNotification] = useState({ show: false, type: '', text: '' });

  // Fungsi untuk memunculkan notifikasi
  const showToast = (type, text) => {
    setNotification({ show: true, type, text });
    // Sembunyikan otomatis setelah 3.5 detik
    setTimeout(() => {
      setNotification({ show: false, type: '', text: '' });
    }, 3500);
  };
  // ==========================================

  // ==========================================
  // FITUR KEAMANAN & FETCHING DATA
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');

    if (!token || !userDataStr) {
      showToast('error', 'Akses Ditolak: Anda harus login terlebih dahulu!');
      // Beri jeda 2 detik agar user sempat membaca pesan sebelum dialihkan
      setTimeout(() => { window.location.href = '/login'; }, 2000);
      return;
    }

    const user = JSON.parse(userDataStr);
    if (user.peran !== 'Member') {
      showToast('error', 'Akses Ditolak: Halaman ini khusus untuk Member Gym.');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
      return;
    }

    // Set Header Auth secara eksplisit untuk keamanan
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    // Set global default axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setActiveUser({
      name: user.namaLengkap ? user.namaLengkap.toUpperCase() : 'MEMBER',
      id: user.idUser ? `GB-${user.idUser.toString().padStart(5, '0')}` : 'GB-00000'
    });

    // Fungsi Fetching Data Dashboard
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // 1. Ambil Data Membership Aktif
        try {
          const membershipRes = await axios.get(`${API_BASE_URL}/memberships/my-active`, config);
          if (membershipRes.data && membershipRes.data.data) {
            setMembership(membershipRes.data.data); 
          }
        } catch (memError) {
          if (memError.response?.status === 404) {
            setMembership(null); // Wajar jika belum beli paket
          } else {
            console.error("Gagal mengambil data membership:", memError);
          }
        }

        // 2. Ambil Jadwal Kelas
        try {
          const classesRes = await axios.get(`${API_BASE_URL}/classes`, config);
          const dataList = classesRes.data?.data || classesRes.data || [];
          
          if (Array.isArray(dataList)) {
            // Ambil 2 kelas terdekat
            setUpcomingClasses(dataList.slice(0, 2)); 
          }
        } catch (clsError) {
          console.error("Gagal mengambil data kelas:", clsError);
        }

      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  // ==========================================

  // ==========================================
  // FUNGSI CHECK-IN KE DATABASE
  // ==========================================
  const handleCheckIn = async () => {
    try {
      showToast('info', 'Memproses check-in...');
      
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(`${API_BASE_URL}/attendance/checkin`, {}, config);
      setIsCheckedIn(true);
      
      showToast('success', response.data.message || "Berhasil Check-In ke Gym!");
    } catch (error) {
      console.error(error);
      showToast('error', error.response?.data?.message || "Gagal Check-In. Pastikan paket aktif/belum check-in.");
    }
  };

  useEffect(() => {
    document.title = "Gymbros | Dasbor Member";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";
    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  // Menyiapkan Fallback Data
  const planName = membership?.paket?.namaPaket || membership?.paket_membership?.nama_paket || "BELUM BERLANGGANAN";
  const planStatus = membership ? "AKTIF" : "NONAKTIF";

  return (
    <>
      {/* UI ALERT / TOAST DINAMIS */}
      {notification.show && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl border text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-500/20 border-red-500/50 text-red-500' 
            : notification.type === 'success'
            ? 'bg-green-500/20 border-green-500/50 text-green-400'
            : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
        }`}>
          {notification.text}
        </div>
      )}

      {isLoading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#111315] gap-4">
           <div className="w-12 h-12 border-4 border-[#333] border-t-[#C2A676] rounded-full animate-spin"></div>
           <div className="text-[#C2A676] font-black text-xl tracking-widest uppercase animate-pulse">MEMUAT DATA...</div>
        </div>
      ) : (
        <main className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none animate-fade-in bg-[#111315] pb-10">
          
          {/* HEADER BANNER */}
          <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden shadow-xl hover:scale-[1.01] transition-transform duration-300">
            <div className="z-10">
              <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">AREA MEMBER</h4>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">SELAMAT DATANG KEMBALI, {activeUser.name.split(' ')[0]}!</h3>
              <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
                "Satu-satunya latihan yang buruk adalah latihan yang tidak pernah kamu lakukan." Konsistensimu mantap, terus lampaui batas kemampuanmu hari ini!
              </p>
            </div>
            <div className="px-4 py-2 bg-[#C2A676]/10 border border-[#C2A676]/30 rounded-full text-[#C2A676] text-xs font-black tracking-widest uppercase z-10 shadow-[0_0_15px_rgba(194,166,118,0.1)]">
              {planName}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              
              {/* STATS */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
                  <p className="text-2xl md:text-4xl font-black text-[#C2A676]">0</p>
                  <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Hari Hadir</p>
                </div>
                <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
                  <p className="text-2xl md:text-4xl font-black text-white">0 🔥</p>
                  <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Rentetan Hari</p>
                </div>
                <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
                  <p className="text-2xl md:text-4xl font-black text-white">0</p>
                  <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Total Jam</p>
                </div>
              </div>

              {/* DAFTAR KELAS DINAMIS */}
              <div className="bg-[#1e2023] border border-white/5 p-6 rounded-3xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black tracking-widest text-white uppercase">Kelas Terdekat</h4>
                  <a href="/member/booking" className="text-[11px] font-black tracking-wider text-[#C2A676] uppercase hover:underline">Lihat Semua Jadwal →</a>
                </div>
                <div className="space-y-3">
                  {upcomingClasses.length > 0 ? upcomingClasses.map((cls) => {
                    const id = cls.idKelas || cls.id_kelas || Math.random();
                    const nama = cls.namaKelas || cls.nama_kelas || "Kelas Gym";
                    const kapasitas = cls.kapasitas || 0;
                    
                    const rawDate = cls.waktuMulai || cls.waktu_mulai;
                    const timeText = (rawDate && !isNaN(new Date(rawDate).getTime())) 
                      ? new Date(rawDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                      : '--:--';

                    return (
                      <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#25282c] border border-white/5 rounded-2xl hover:border-[#C2A676]/40 transition-all duration-300 group">
                        <div>
                          <h5 className="text-sm font-black text-white uppercase group-hover:text-[#C2A676] transition-colors">{nama}</h5>
                          <p className="text-xs text-gray-400 mt-0.5">Kapasitas: <span className="text-[#C2A676] font-medium">{kapasitas} Orang</span></p>
                        </div>
                        <div className="text-xs font-bold bg-[#1e2023] border border-white/5 px-3 py-1.5 rounded-xl text-gray-300 text-center sm:text-right mt-2 sm:mt-0">
                          ⏰ {timeText}
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">Belum ada kelas yang dijadwalkan.</p>
                  )}
                </div>
              </div>

            </div>

            {/* BAGIAN TIKET / QR CODE CHECK-IN */}
            <div className="bg-[#1e2023] border border-white/5 shadow-lg p-6 rounded-3xl flex flex-col items-center justify-between text-center min-h-[350px]">
              <div>
                <h4 className="text-sm font-black tracking-widest text-white uppercase">GYM PASS DIGITAL</h4>
                <p className="text-[11px] text-gray-400 mt-1">Gunakan ini untuk masuk di gerbang</p>
              </div>
              
              <div className="w-44 h-44 bg-white p-3 rounded-2xl flex items-center justify-center my-4 relative shadow-md group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Gymbros-${activeUser.id}`} 
                  alt="QR Code Tiket Masuk Gym" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="w-full space-y-3">
                <p className="text-xs font-black text-white tracking-widest uppercase">{activeUser.name}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest -mt-2">{activeUser.id}</p>
                
                {isCheckedIn ? (
                  <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-xs font-bold uppercase tracking-wider">
                    Selesai Check-In! Selamat Berlatih 💪
                  </div>
                ) : (
                  <button 
                    onClick={handleCheckIn}
                    className="w-full py-2 bg-[#C2A676] hover:bg-[#b09365] active:scale-95 transition-all text-black font-black text-xs rounded-xl uppercase tracking-wider"
                  >
                    Scan & Check-In
                  </button>
                )}

                <div className="flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${membership ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${membership ? 'text-green-500' : 'text-red-500'}`}>
                    Status: {planStatus}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </main>
      )}
    </>
  );
};

export default DashboardMember;