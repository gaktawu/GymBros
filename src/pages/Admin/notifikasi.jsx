// src/pages/admin/AdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [detailNotif, setDetailNotif] = useState(null);

  const getApiConfig = () => ({
    baseURL: "http://localhost:5000/api/v1/notifications", 
    headers: { 
      Authorization: `Bearer ${localStorage.getItem("token") || ""}` 
    }
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const api = axios.create(getApiConfig());
      const response = await api.get('/admin/all');
      
      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Gagal memuat semua notifikasi';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const confirmDelete = async () => {
    try {
      const api = axios.create(getApiConfig());
      await api.delete(`/${deleteId}`); 
      
      setNotifications(notifications.filter(n => n.id_notifikasi !== deleteId));
      showToast('Data berhasil dihapus');
      setDeleteId(null);
      setDetailNotif(null);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Gagal menghapus data';
      showToast(errorMsg, 'error');
      setDeleteId(null);
    }
  };

  const viewDetail = (notif) => {
    setDetailNotif(notif);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400';
      case 'In Progress': return 'text-blue-400 bg-blue-400/10 border-blue-400';
      case 'Resolved': return 'text-green-400 bg-green-400/10 border-green-400';
      case 'Closed': return 'text-gray-400 bg-gray-400/10 border-gray-400';
      default: return 'text-white border-white';
    }
  };

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0] relative">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded shadow-lg font-bold text-white transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8 border-b border-[#333333] pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Semua Notifikasi</h1>
          <p className="text-[#888888]">Log sistem dan riwayat notifikasi user GymBros.</p>
        </div>

        <div className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-lg mb-8">
          <div className="overflow-x-auto rounded-lg border border-[#333333]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111315] text-[#888888] text-sm uppercase">
                  <th className="p-4 border-b border-[#333333]">Nama User</th>
                  <th className="p-4 border-b border-[#333333]">Judul Notifikasi</th>
                  <th className="p-4 border-b border-[#333333]">Status</th>
                  <th className="p-4 border-b border-[#333333]">Waktu Kirim</th>
                  <th className="p-4 border-b border-[#333333] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[#C2A676] animate-pulse">Memuat data table...</td></tr>
                ) : !notifications || notifications.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[#888888]">Tidak ada data notifikasi tersimpan.</td></tr>
                ) : (
                  notifications.map((notif) => (
                    <tr key={notif.id_notifikasi} className="hover:bg-[#111315] border-b border-[#333333] transition-colors">
                      <td className="p-4 text-sm font-bold text-white">
                        {notif.nama_lengkap || `User ID: ${notif.id_user}`}
                      </td>
                      <td className="p-4 text-sm text-[#E0E0E0]">{notif.judul}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusStyle(notif.status_baca)}`}>
                          {notif.status_baca}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#888888]">
                        {new Date(notif.waktu_dikirim).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        <button onClick={() => viewDetail(notif)} className="text-blue-400 hover:underline text-sm font-bold">Detail</button>
                        <button onClick={() => setDeleteId(notif.id_notifikasi)} className="text-red-500 hover:underline text-sm font-bold">Hapus</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detailNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1C1E] border border-[#C2A676] p-8 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#C2A676] uppercase">Detail Log Notifikasi</h3>
              <button onClick={() => setDetailNotif(null)} className="text-[#888888] hover:text-white font-bold">X</button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="pb-4 border-b border-[#333333] text-sm text-[#888888] grid grid-cols-2 gap-4">
                <div>
                  <p><strong className="text-white uppercase text-[10px]">Nama User:</strong></p>
                  <p className="font-bold text-white">
                    {detailNotif.nama_lengkap || `User ID: ${detailNotif.id_user}`}
                  </p>
                </div>
                <div>
                  <p><strong className="text-white uppercase text-[10px]">Status:</strong></p>
                  <p className="font-bold text-[#C2A676]">{detailNotif.status_baca}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[#888888] uppercase font-bold">Judul</p>
                <p className="text-sm text-white font-bold">{detailNotif.judul}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#888888] uppercase font-bold">Pesan Lengkap</p>
                <div className="bg-[#111315] p-4 rounded-lg border border-[#333333] text-sm text-[#E0E0E0] whitespace-pre-wrap mt-1">
                  {detailNotif.pesan}
                </div>
              </div>
            </div>
            <button onClick={() => setDetailNotif(null)} className="w-full py-3 rounded bg-[#111315] border border-[#333333] text-white text-sm font-bold uppercase hover:bg-[#333333] transition">Tutup</button>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1C1E] border border-red-500 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">Hapus Log?</h3>
            <p className="text-[#888888] mb-6 text-sm">Apakah Anda yakin ingin menghapus data notifikasi ini dari database?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded bg-[#111315] border border-[#333333] text-white text-sm font-bold uppercase hover:bg-[#333333] transition">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded bg-red-500 text-white text-sm font-bold uppercase hover:bg-red-600 transition">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}