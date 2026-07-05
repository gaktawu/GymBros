import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const ClassSchedule = () => {
  const [classes, setClasses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Modal Alert (ganti toast & alert browser)
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ show: false, title: '', message: '', type: 'info' });
  };

  // ─── 1. FETCH CLASSES + MY BOOKINGS + PENDING INVOICES ───
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);

      const [classesRes, bookingsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/classes`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/classes/my-bookings`, { headers: getAuthHeaders() }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE_URL}/payments/my-invoices`, { headers: getAuthHeaders() }).catch(() => ({ data: { data: [] } }))
      ]);

      const rawData = classesRes.data.data || [];
      const bookings = bookingsRes.data.data || [];
      const invoices = invoicesRes.data.data || [];

      setMyBookings(bookings);

      const pending = {};
      invoices.forEach(inv => {
        if (inv.status === 'Pending' && inv.kategori === 'Kelas') {
          const parts = inv.id_payment?.split('-');
          if (parts && parts[0] === 'KLS') pending[parts[1]] = inv;
        }
      });

      const bookedClassIds = new Set(bookings.map(b => String(b.id_kelas || b.idKelas)));
      const now = new Date();

      const mapped = rawData.map(cls => {
        const classTime = new Date(cls.waktuMulai || cls.waktu_mulai);
        const isPast = classTime < now;
        const classId = String(cls.idKelas || cls.id_kelas);
        const sisaKuota = cls.sisa_kuota !== undefined
          ? cls.sisa_kuota
          : (cls.kapasitas || 0) - (cls.total_booked || 0);

        const isBooked = bookedClassIds.has(classId);
        const hasPendingInvoice = !!pending[classId];

        return {
          id: classId,
          name: cls.namaKelas || cls.nama_kelas,
          coach: cls.pengajar_nama || cls.pelatih?.namaPelatih || "Instruktur",
          time: classTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          day: classTime.toLocaleDateString('id-ID', { weekday: 'long' }),
          rawPrice: cls.harga || 0,
          price: cls.harga ? `Rp ${cls.harga.toLocaleString('id-ID')}` : "Free",
          kapasitas: cls.kapasitas || 0,
          sisaKuota: Math.max(0, sisaKuota),
          isPast,
          isBooked,
          hasPendingInvoice,
          pendingInvoice: pending[classId] || null
        };
      });

      setClasses(mapped);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
      showAlert("Gagal Memuat", "Tidak dapat memuat jadwal kelas. Silakan refresh halaman.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    const interval = setInterval(fetchClasses, 30000);
    return () => clearInterval(interval);
  }, [fetchClasses]);

  // ─── 2. HANDLE BOOKING CLICK ───
  const handleBookingClick = (classItem) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Login Diperlukan", "Harap login terlebih dahulu untuk memesan kelas!", "warning");
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (classItem.isBooked) {
      showAlert("Sudah Terdaftar", `Anda sudah terdaftar di kelas "${classItem.name}". Cek menu "Kelas Saya" untuk detail.`, "info");
      return;
    }

    if (classItem.hasPendingInvoice) {
      navigate('/member/bayar', {
        state: {
          invoice: classItem.pendingInvoice,
          item: {
            type: 'Kelas',
            id: classItem.id,
            name: classItem.name,
            price: classItem.rawPrice,
            schedule: `${classItem.day}, ${classItem.time}`,
            coach: classItem.coach
          }
        }
      });
      return;
    }

    if (classItem.sisaKuota <= 0) {
      showAlert("Kelas Penuh", "Maaf, kelas ini sudah penuh. Silakan pilih kelas lain.", "error");
      return;
    }

    setSelectedClass(classItem);
    setShowConfirmModal(true);
  };

  // ─── 3. CONFIRM → CREATE INVOICE ───
  const confirmBooking = async () => {
    if (!selectedClass) return;
    setShowConfirmModal(false);
    setIsCreatingInvoice(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/payments/invoice`,
        {
          kategoriTransaksi: 'Kelas',
          idKelas: parseInt(selectedClass.id),
          metode: 'QRIS'
        },
        { headers: getAuthHeaders() }
      );

      const invoice = res.data;
      showAlert("Berhasil", "Kursi berhasil dikunci! Selesaikan pembayaran dalam 30 menit.", "success");

      setTimeout(() => {
        navigate('/member/bayar', {
          state: {
            invoice: invoice,
            item: {
              type: 'Kelas',
              id: selectedClass.id,
              name: selectedClass.name,
              price: selectedClass.rawPrice,
              schedule: `${selectedClass.day}, ${selectedClass.time}`,
              coach: selectedClass.coach
            }
          }
        });
      }, 1200);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.";

      if (status === 409) {
        if (message.includes('bertabrakan')) {
          showAlert("Jadwal Bertabrakan", message, "error");
        } else if (message.includes('sudah terdaftar')) {
          showAlert("Sudah Terdaftar", message, "error");
        } else if (message.includes('penuh')) {
          showAlert("Kelas Penuh", message, "error");
        } else {
          showAlert("Tidak Dapat Memesan", message, "error");
        }
        fetchClasses();
      } else if (status === 403) {
        showAlert("Membership Diperlukan", "Anda harus memiliki membership aktif untuk membooking kelas.", "error");
      } else {
        showAlert("Terjadi Kesalahan", message, "error");
      }
    } finally {
      setIsCreatingInvoice(false);
      setSelectedClass(null);
    }
  };

  const cancelBooking = () => {
    setShowConfirmModal(false);
    setSelectedClass(null);
  };

  // Warna dinamis untuk alert modal
  const alertColors = {
    success: { border: 'border-green-500/50', bg: 'bg-green-900/20', text: 'text-green-400', icon: '✓' },
    error: { border: 'border-red-500/50', bg: 'bg-red-900/20', text: 'text-red-400', icon: '✕' },
    warning: { border: 'border-yellow-500/50', bg: 'bg-yellow-900/20', text: 'text-yellow-400', icon: '⚠' },
    info: { border: 'border-blue-500/50', bg: 'bg-blue-900/20', text: 'text-blue-400', icon: 'ℹ' },
  };
  const ac = alertColors[alertModal.type] || alertColors.info;

  return (
    <main className="w-full max-w-6xl mx-auto p-6 bg-[#111315] min-h-screen text-[#E0E0E0]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black uppercase text-white">Jadwal Kelas</h2>
        <button onClick={fetchClasses} className="text-[#C2A676] text-xs font-bold hover:underline">
          REFRESH DATA
        </button>
      </div>

      <div className="mb-6 p-4 bg-[#C2A676]/10 border border-[#C2A676]/30 rounded-xl text-[#C2A676] text-xs">
        <p className="font-bold mb-1">💡 Informasi Sistem</p>
        <p>Kuota kelas diperbarui real-time. Kursi dikunci 30 menit saat invoice dibuat.</p>
      </div>

      {isLoading ? (
        <div className="text-center text-[#C2A676] font-bold py-20">MEMUAT JADWAL DARI DATABASE...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.length > 0 ? classes.map((item) => (
            <div key={item.id} className={`p-6 rounded-3xl border transition-all ${
              item.isPast ? 'bg-[#1a1a1a] border-white/5 opacity-60' : 'bg-[#1e2023] border-white/5 hover:border-[#C2A676]'
            }`}>
              <h3 className="text-lg font-black uppercase text-white">{item.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{item.day} • {item.time}</p>
              <p className="text-xs text-gray-500 mb-2">Instruktur: {item.coach}</p>

              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
                <span className="text-[#C2A676] font-bold">{item.price}</span>
                <span className={
                  item.isBooked ? "text-green-500 font-bold" :
                  item.hasPendingInvoice ? "text-yellow-500 font-bold" :
                  item.sisaKuota === 0 ? "text-red-500 font-bold" :
                  item.sisaKuota <= 2 ? "text-yellow-500 font-bold" :
                  "text-gray-500"
                }>
                  {item.isBooked
                    ? "✓ Sudah Dibeli"
                    : item.hasPendingInvoice
                      ? "⏳ Menunggu Pembayaran"
                      : `Sisa Kuota: ${item.sisaKuota}/${item.kapasitas}`
                  }
                </span>
              </div>

              <button
                onClick={() => handleBookingClick(item)}
                disabled={item.isPast || item.isBooked || (item.sisaKuota <= 0 && !item.hasPendingInvoice) || isCreatingInvoice}
                className={`w-full mt-6 py-3 font-black uppercase text-xs rounded-xl transition-all ${
                  item.isPast
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : item.isBooked
                      ? "bg-green-900/30 text-green-500 border border-green-700/50 cursor-default"
                      : item.hasPendingInvoice
                        ? "bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 hover:bg-yellow-600/30"
                        : item.sisaKuota > 0
                          ? "bg-[#C2A676] text-[#111315] hover:bg-white"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isCreatingInvoice && selectedClass?.id === item.id
                  ? "MEMBUAT INVOICE..."
                  : item.isPast
                    ? "Kelas Berakhir"
                    : item.isBooked
                      ? "Sudah Dibeli"
                      : item.hasPendingInvoice
                        ? "Lanjutkan Pembayaran"
                        : item.sisaKuota > 0
                          ? "Pesan Kelas Sekarang"
                          : "Kelas Penuh"
                }
              </button>
            </div>
          )) : (
            <p className="text-gray-500 col-span-3 text-center py-10">Tidak ada kelas tersedia saat ini.</p>
          )}
        </div>
      )}

      {/* MODAL KONFIRMASI PEMESANAN */}
      {showConfirmModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e2023] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-lg">Konfirmasi Pemesanan</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-[#E0E0E0] text-sm leading-relaxed">
                <span className="text-[#C2A676] font-bold">PENTING:</span> Sistem akan mengunci kursi selama 30 menit.
              </p>
              <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
                <li>Pastikan Anda belum mendaftar di kelas ini sebelumnya.</li>
                <li>Pastikan jadwal tidak bertabrakan dengan kelas lain.</li>
                <li>Selesaikan pembayaran dalam 30 menit.</li>
              </ul>
              <div className="bg-[#111315] rounded-xl p-4 mt-4 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Kelas yang akan dipesan:</p>
                <p className="text-white font-bold text-sm">{selectedClass.name}</p>
                <p className="text-[#C2A676] text-xs mt-1">{selectedClass.day}, {selectedClass.time}</p>
                <p className="text-white text-xs mt-2 font-bold">{selectedClass.price}</p>
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3 justify-end border-t border-white/5 bg-[#1a1a1a]">
              <button onClick={cancelBooking} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2a2a2a] hover:bg-[#333] border border-white/10 transition-all">
                Cancel
              </button>
              <button onClick={confirmBooking} disabled={isCreatingInvoice} className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#111315] bg-[#C2A676] hover:bg-white transition-all disabled:opacity-50">
                {isCreatingInvoice ? "Memproses..." : "OK, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALERT (ganti toast & alert browser) */}
      {alertModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`bg-[#1e2023] border ${ac.border} rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${ac.border} ${ac.bg} flex items-center gap-3`}>
              <span className={`text-xl ${ac.text}`}>{ac.icon}</span>
              <h3 className="text-white font-bold text-lg">{alertModal.title}</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-300 text-sm leading-relaxed">{alertModal.message}</p>
            </div>
            <div className="px-6 py-4 flex justify-end border-t border-white/5 bg-[#1a1a1a]">
              <button
                onClick={closeAlert}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#111315] bg-[#C2A676] hover:bg-white transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClassSchedule;