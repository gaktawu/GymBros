// src/pages/member/MemberNotifications.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1/notifications",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailNotif, setDetailNotif] = useState(null);
  const [toast, setToast] = useState(null);
  const [modalHapus, setModalHapus] = useState({ isOpen: false, id: null });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/mine");
      if (data && data.data) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat notifikasi", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/${id}/read`);
      
      setNotifications(prev => prev.map(n => 
        n.id_notifikasi === id ? { ...n, status_baca: 'Closed' } : n
      ));
      
      if (detailNotif && detailNotif.id_notifikasi === id) {
        setDetailNotif(prev => prev ? { ...prev, status_baca: 'Closed' } : null);
      }
      
      showToast("Notifikasi ditandai sudah dibaca");
    } catch (err) {
      showToast("Gagal mengubah status", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/${modalHapus.id}`);
      showToast("Notifikasi berhasil dihapus");
      setModalHapus({ isOpen: false, id: null });
      setDetailNotif(null);
      fetchNotifications();
    } catch (err) {
      showToast("Gagal menghapus notifikasi", "error");
    }
  };

  const viewDetail = async (notif) => {
    setDetailNotif(notif);
    if (notif.status_baca === 'Pending') {
      await markAsRead(notif.id_notifikasi);
    }
  };

  const unreadCount = notifications.filter(n => n.status_baca === 'Pending').length;

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0] relative">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded shadow-lg font-bold text-white transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      {modalHapus.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1C1E] border border-red-500 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">Hapus Notifikasi?</h3>
            <p className="text-[#888888] mb-6 text-sm">Tindakan ini menghapus data secara permanen.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setModalHapus({ isOpen: false, id: null })}
                className="flex-1 py-3 rounded bg-[#111315] border border-[#333333] text-white text-sm font-bold uppercase hover:bg-[#333333] transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded bg-red-500 text-white text-sm font-bold uppercase hover:bg-red-600 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {detailNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1C1E] border border-[#C2A676] p-8 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#C2A676] uppercase">{detailNotif.judul}</h3>
              <button onClick={() => setDetailNotif(null)} className="text-[#888888] hover:text-white font-bold">X</button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="pb-4 border-b border-[#333333] text-sm text-[#888888]">
                <p><strong className="text-white uppercase text-[10px]">Waktu:</strong> {new Date(detailNotif.waktu_dikirim).toLocaleString('id-ID')}</p>
                <p><strong className="text-white uppercase text-[10px]">Status:</strong> <span className="text-[#C2A676]">{detailNotif.status_baca}</span></p>
              </div>
              <div>
                <div className="bg-[#111315] p-4 rounded-lg border border-[#333333] text-sm text-[#E0E0E0] whitespace-pre-wrap">
                  {detailNotif.pesan}
                </div>
              </div>
            </div>
            <button
              onClick={() => setDetailNotif(null)}
              className="w-full py-3 rounded bg-[#C2A676] text-[#111315] text-sm font-bold uppercase hover:bg-[#a68d60] transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6 select-none">
        <div className="relative bg-[#1A1C1E] border border-[#333333] p-6 rounded-xl flex justify-between items-center shadow-lg">
          <div>
            <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase">Pusat Notifikasi</h4>
            <h3 className="text-3xl font-extrabold text-white uppercase tracking-tight">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-[#C2A676]/10 border border-[#C2A676]/20 px-4 py-2 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#C2A676] animate-pulse" />
              <span className="text-xs font-bold text-[#C2A676] uppercase tracking-wider">
                {unreadCount} belum dibaca
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 text-[#C2A676] font-bold animate-pulse">Memuat data...</div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-16 text-[#888888] text-sm bg-[#1A1C1E] rounded-xl border border-[#333333]">
              <div className="text-4xl mb-3">🔔</div>
              Tidak ada notifikasi saat ini.
            </div>
          ) : notifications.map((notif) => (
            <div
              key={notif.id_notifikasi}
              className={`bg-[#1A1C1E] border border-[#333333] border-l-4 rounded-xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4
                ${notif.status_baca === 'Pending' ? 'border-l-[#C2A676] shadow-inner' : 'border-l-[#333333] opacity-70'}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase 
                    ${notif.status_baca === 'Pending' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-[#111315] text-[#888888] border border-[#333333]'}`}>
                    {notif.status_baca}
                  </span>
                  <span className="text-[10px] text-[#888888]">
                    {new Date(notif.waktu_dikirim).toLocaleString('id-ID')}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-white mb-1 cursor-pointer hover:text-[#C2A676]" onClick={() => viewDetail(notif)}>
                  {notif.judul}
                </h5>
                <p className="text-xs text-[#888888] line-clamp-1">{notif.pesan}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => viewDetail(notif)}
                  className="text-xs font-bold text-[#C2A676] hover:underline"
                >
                  Detail
                </button>
                {notif.status_baca === 'Pending' && (
                  <button
                    onClick={() => markAsRead(notif.id_notifikasi)}
                    className="text-xs font-bold text-blue-400 hover:underline"
                  >
                    Tandai Dibaca
                  </button>
                )}
                <button
                  onClick={() => setModalHapus({ isOpen: true, id: notif.id_notifikasi })}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}