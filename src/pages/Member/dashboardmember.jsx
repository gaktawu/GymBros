import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";

const API_BASE_URL = 'http://localhost:5000/api/v1';

const DashboardMember = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeUser, setActiveUser] = useState({ name: "LOADING...", id: "GB-00000" });

  const [membership, setMembership] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  
  const [purchasedClassesCount, setPurchasedClassesCount] = useState(0);

  const [visitorCount, setVisitorCount] = useState(0);
  const [redeemCode, setRedeemCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [attendanceDays, setAttendanceDays] = useState(0);

  const [bookingsModal, setBookingsModal] = useState({
    isOpen: false,
    loading: false,
    data: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', text: '' });

  const toastTimerRef = useRef(null);

  const showToast = useCallback((type, text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setNotification({ show: true, type, text });
    toastTimerRef.current = setTimeout(() => {
      setNotification({ show: false, type: '', text: '' });
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');

    if (!token || !userDataStr) {
      showToast('error', 'Akses Ditolak: Anda harus login terlebih dahulu!');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
      return;
    }

    const user = JSON.parse(userDataStr);
    if (user.peran !== 'Member') {
      showToast('error', 'Akses Ditolak: Halaman ini khusus untuk Member.');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setActiveUser({
      name: user.namaLengkap ? user.namaLengkap.toUpperCase() : 'MEMBER',
      id: user.idUser ? `GB-${user.idUser.toString().padStart(5, '0')}` : 'GB-00000'
    });

    const socket = io('http://localhost:5000/attendance', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log('✅ Socket Member terhubung, ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket Member error:', err.message);
    });

    socket.on('gym-count-updated', (count) => {
      setVisitorCount(count);
    });

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        try {
          const membershipRes = await axios.get(`${API_BASE_URL}/memberships/my-active`, config);
          setMembership(membershipRes.data?.data || null);
        } catch (memError) {
          setMembership(null);
        }

        try {
          const classesRes = await axios.get(`${API_BASE_URL}/classes`, config);
          const dataList = classesRes.data?.data || classesRes.data || [];
          if (Array.isArray(dataList)) setUpcomingClasses(dataList.slice(0, 2));
        } catch (clsError) {
          console.error("Gagal mengambil data kelas:", clsError);
        }

        try {
          const myClassesRes = await axios.get(`${API_BASE_URL}/classes/my-bookings`, config);
          const myBookings = myClassesRes.data?.data || [];
          setPurchasedClassesCount(myBookings.length);
        } catch (error) {
          console.error("Gagal mengambil data kelas yang dibeli:", error);
          setPurchasedClassesCount(0);
        }

        try {
          const statsRes = await axios.get(`${API_BASE_URL}/attendance/stats`, config);
          setAttendanceDays(statsRes.data?.data?.totalDays || 0);
        } catch (statsError) {
          console.error("Gagal mengambil statistik absensi:", statsError);
          setAttendanceDays(0);
        }

      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      console.log('🧹 Cleaning up Member socket');
      socket.off('gym-count-updated');
      socket.disconnect();
    };
  }, [showToast]);

  const openBookingsModal = async () => {
    if (purchasedClassesCount === 0) {
      showToast('info', 'Anda belum membeli kelas apapun.');
      return;
    }

    setBookingsModal({ isOpen: true, loading: true, data: [] });

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/classes/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookings = res.data?.data || [];
      setBookingsModal({ isOpen: true, loading: false, data: bookings });
    } catch (error) {
      console.error("Gagal memuat detail kelas:", error);
      showToast('error', 'Gagal memuat daftar kelas.');
      setBookingsModal({ isOpen: false, loading: false, data: [] });
    }
  };

  const closeBookingsModal = () => {
    setBookingsModal({ isOpen: false, loading: false, data: [] });
  };

  const handleRedeemAttendance = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) return showToast('error', 'Silakan masukkan Kode Redeem dari TV/Admin!');

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/attendance/redeem`,
        { code: redeemCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('success', response.data.message);

      if (response.data.action === 'CHECKIN') setIsCheckedIn(true);
      if (response.data.action === 'CHECKOUT') setIsCheckedIn(false);

      try {
        const statsRes = await axios.get(`${API_BASE_URL}/attendance/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendanceDays(statsRes.data?.data?.totalDays || 0);
      } catch (refreshError) {
        console.error("Gagal refresh statistik:", refreshError);
      }

      setRedeemCode("");
    } catch (error) {
      showToast('error', error.response?.data?.message || "Gagal memproses kode absensi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = "Gymbros | Dasbor Member";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";
    return () => { document.body.style.backgroundColor = originalBodyBg; };
  }, []);

  const planName = membership?.namaPaketObj ||
    membership?.paket?.nama_paket ||
    membership?.paket_membership?.nama_paket ||
    (membership ? "PAKET AKTIF" : "BELUM BERLANGGANAN");

  const planStatus = membership ? "AKTIF" : "NONAKTIF";

  return (
    <>
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

          <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden shadow-xl hover:scale-[1.01] transition-transform duration-300">
            <div className="z-10">
              <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">AREA MEMBER</h4>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                SELAMAT DATANG KEMBALI, {activeUser.name.split(' ')[0]}!
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
                "Satu-satunya latihan yang buruk adalah latihan yang tidak pernah kamu lakukan." Konsistensimu mantap, terus lampaui batas kemampuanmu hari ini!
              </p>
            </div>
            <div className={`px-4 py-2 border rounded-full text-xs font-black tracking-widest uppercase z-10 shadow-lg ${
              membership
                ? 'bg-[#C2A676]/10 border-[#C2A676]/30 text-[#C2A676] shadow-[0_0_15px_rgba(194,166,118,0.1)]'
                : 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
            }`}>
              {planName}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
                  <p className="text-2xl md:text-4xl font-black text-white">{attendanceDays}</p>
                  <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Hari Hadir</p>
                </div>
                <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
                  <p className="text-2xl md:text-4xl font-black text-[#C2A676]">{visitorCount} 👥</p>
                  <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Live Pendatang</p>
                </div>
                <div 
                  onClick={openBookingsModal}
                  className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors cursor-pointer group relative"
                >
                  <p className="text-2xl md:text-4xl font-black text-white group-hover:text-[#C2A676] transition-colors">{purchasedClassesCount}</p>
                  <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1 group-hover:text-[#C2A676]">Kelas Dibeli</p>
                  <span className="absolute top-2 right-2 text-[9px] text-gray-600 group-hover:text-[#C2A676] opacity-0 group-hover:opacity-100 transition-opacity">👁 Lihat</span>
                </div>
              </div>

              <div className="bg-[#1e2023] border border-white/5 p-6 rounded-3xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black tracking-widest text-white uppercase">Kelas Terdekat</h4>
                  <a href="/member/booking" className="text-[11px] font-black tracking-wider text-[#C2A676] uppercase hover:underline">Lihat Semua Jadwal →</a>
                </div>
                <div className="space-y-3">
                  {upcomingClasses.length > 0 ? upcomingClasses.map((cls) => {
                    const id = cls.id_kelas || Math.random();
                    const nama = cls.nama_kelas || "Kelas Gym";
                    const waktu = cls.waktu_mulai
                      ? new Date(cls.waktu_mulai).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--:--';

                    return (
                      <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#25282c] border border-white/5 rounded-2xl hover:border-[#C2A676]/40 transition-all duration-300 group">
                        <div>
                          <h5 className="text-sm font-black text-white uppercase group-hover:text-[#C2A676] transition-colors">{nama}</h5>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Pengajar: <span className="text-[#C2A676] font-medium">{cls.pengajar_nama || 'Instruktur'}</span>
                          </p>
                        </div>
                        <div className="text-xs font-bold bg-[#1e2023] border border-white/5 px-3 py-1.5 rounded-xl text-gray-300 text-center mt-2 sm:mt-0">
                          ⏰ {waktu}
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">Belum ada kelas yang dijadwalkan.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#1e2023] border border-white/5 shadow-lg p-6 rounded-3xl flex flex-col items-center justify-between text-center min-h-[400px]">
              <div>
                <h4 className="text-sm font-black tracking-widest text-white uppercase">GYM PASS DIGITAL</h4>
                <p className="text-[11px] text-gray-400 mt-1">Tunjukkan QR atau masukkan Kode Layar</p>
              </div>

              <div className="w-36 h-36 bg-white p-2 rounded-2xl flex items-center justify-center my-4 relative shadow-md group">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Gymbros-${activeUser.id}`}
                  alt="QR Code Tiket Masuk Gym"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="w-full space-y-4">
                <div>
                  <p className="text-xs font-black text-white tracking-widest uppercase">{activeUser.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{activeUser.id}</p>
                </div>

                <form onSubmit={handleRedeemAttendance} className="w-full flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan Kode Layar..."
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-[#111315] border border-[#333333] rounded-xl text-center text-sm font-black text-white tracking-widest uppercase focus:outline-none focus:border-[#C2A676] transition-colors"
                  />

                  <div className="flex gap-2 w-full mt-1">
                    {!isCheckedIn ? (
                      <button
                        type="submit"
                        disabled={isSubmitting || !membership}
                        className="w-full py-3 bg-[#C2A676] hover:bg-[#b09365] disabled:opacity-50 disabled:cursor-not-allowed text-[#111315] font-black text-xs rounded-xl uppercase tracking-wider transition-all"
                      >
                        {isSubmitting ? 'Memproses...' : 'CHECK-IN'}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 font-black text-xs rounded-xl uppercase tracking-wider transition-all"
                      >
                        {isSubmitting ? 'Memproses...' : 'CHECK-OUT'}
                      </button>
                    )}
                  </div>
                </form>

                <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${membership ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${membership ? 'text-green-500' : 'text-red-500'}`}>
                    Status Membership: {planStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {bookingsModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md p-6 border-t-4 border-[#C2A676] animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="textxl font-bold text-white tracking-tight">Kelas yang Dibeli</h2>
              <button 
                onClick={closeBookingsModal}
                className="text-gray-500 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {bookingsModal.loading ? (
              <div className="py-8 text-center text-gray-400">
                <div className="w-8 h-8 border-2 border-[#333] border-t-[#C2A676] rounded-full animate-spin mx-auto mb-3"></div>
                Memuat data kelas...
              </div>
            ) : bookingsModal.data.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="text-lg mb-1">📭</p>
                <p>Anda belum membeli kelas apapun.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {bookingsModal.data.map((booking, idx) => {
                  const kelas = booking;
                  const waktuMulai = kelas.waktu_mulai ? new Date(kelas.waktu_mulai) : null;
                  const tanggal = waktuMulai 
                    ? waktuMulai.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
                    : '-';
                  const jam = waktuMulai
                    ? waktuMulai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    : '--:--';

                  return (
                    <div 
                      key={kelas.id_booking || kelas.id_kelas || idx} 
                      className="p-4 bg-[#25282c] border border-white/5 rounded-xl hover:border-[#C2A676]/30 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-sm font-black text-white uppercase">
                          {kelas.nama_kelas || 'Kelas Gym'}
                        </h5>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          kelas.status === 'Booked' 
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {kelas.status || 'Booked'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-1">
                        👤 Coach: <span className="text-[#C2A676] font-medium">{kelas.pengajar_nama || 'Instruktur'}</span>
                      </p>
                      
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2 pt-2 border-t border-white/5">
                        <span>📅 {tanggal}</span>
                        <span>⏰ {jam}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={closeBookingsModal}
                className="px-5 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg font-medium text-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardMember;