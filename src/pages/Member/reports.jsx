// src/pages/Member/reports.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ judul: "", pesan: "" });
  const [isEditing, setIsEditing] = useState(null);
  const [detailReport, setDetailReport] = useState(null);
  const [toast, setToast] = useState(null);
  const [modalHapus, setModalHapus] = useState({ isOpen: false, id: null });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Perbaikan 1: baseURL diarahkan ke modul user-reports (tanpa slash di akhir agar konsisten saat di-concat)
  const getApiConfig = () => ({
    baseURL: "http://localhost:5000/api/v1/user-reports", 
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const api = axios.create(getApiConfig());
      // Perbaikan 2: Mengakses base path (menghasilkan GET /api/v1/user-reports)
      const { data } = await api.get("/");
      if (data && data.data) {
        setReports(data.data);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat laporan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const api = axios.create(getApiConfig());
      if (isEditing) {
        // Perbaikan 3: Menghasilkan PUT /api/v1/user-reports/:id
        await api.put(`/${isEditing}`, formData);
        showToast("Laporan berhasil diupdate");
      } else {
        // Perbaikan 4: Menghasilkan POST /api/v1/user-reports
        await api.post("/", formData);
        showToast("Laporan berhasil dibuat");
      }
      setFormData({ judul: "", pesan: "" });
      setIsEditing(null);
      fetchReports();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menyimpan laporan";
      showToast(errorMsg, "error");
    }
  };

  const handleEdit = (report) => {
    setFormData({ judul: report.judul || "", pesan: report.pesan || "" });
    setIsEditing(report.idReport);
    setDetailReport(null);
    window.scrollTo(0, 0);
  };

  const confirmDelete = async () => {
    try {
      const api = axios.create(getApiConfig());
      // Perbaikan 5: Menghasilkan DELETE /api/v1/user-reports/:id
      await api.delete(`/${modalHapus.id}`);
      showToast("Laporan berhasil dihapus");
      setModalHapus({ isOpen: false, id: null });
      setDetailReport(null);
      fetchReports();
    } catch (err) {
      showToast("Gagal menghapus laporan", "error");
    }
  };

  const viewDetail = async (id) => {
    try {
      const api = axios.create(getApiConfig());
      // Perbaikan 6: Menghasilkan GET /api/v1/user-reports/:id
      const { data } = await api.get(`/${id}`);
      if (data && data.data) {
        setDetailReport(data.data);
      }
    } catch (err) {
      showToast("Gagal memuat detail", "error");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'text-yellow-400 border-yellow-400',
      'In Progress': 'text-blue-400 border-blue-400',
      'Resolved': 'text-green-400 border-green-400',
      'Closed': 'text-gray-400 border-gray-400'
    };
    return colors[status] || 'text-white border-white';
  };

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0] relative">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded shadow-lg font-bold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      {modalHapus.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-[#1A1C1E] p-8 rounded-xl border border-red-500 shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">Hapus Laporan?</h3>
            <p className="text-[#888888] mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-4">
              <button onClick={() => setModalHapus({ isOpen: false, id: null })} className="flex-1 py-3 bg-[#111315] border border-[#333333] text-white font-bold rounded hover:bg-[#333333]">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded hover:bg-red-600">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {detailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1C1E] p-8 rounded-xl border border-[#C2A676] shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-bold text-[#C2A676] mb-2">{detailReport?.judul}</h3>
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border bg-[#111315] ${getStatusColor(detailReport?.status)}`}>{detailReport?.status}</span>
              <span className="text-xs text-[#888888]">
                {detailReport?.dibuatPada ? new Date(detailReport.dibuatPada).toLocaleString('id-ID') : '-'}
              </span>
            </div>
            <p className="text-[#E0E0E0] whitespace-pre-wrap mb-8">{detailReport?.pesan}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDetailReport(null)} className="px-6 py-2 bg-[#111315] border border-[#333333] text-white rounded hover:bg-[#333333]">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="mb-8 border-b border-[#333333] pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Laporan Member</h1>
          <p className="text-[#888888]">Sampaikan kendala, keluhan, atau masukan Anda.</p>
        </div>

        <div className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-lg mb-10">
          <h2 className="text-xl font-bold text-[#C2A676] mb-4">{isEditing ? "Edit Laporan" : "Buat Laporan Baru"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-[#888888] mb-1">Judul</label>
              <input required type="text" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} className="p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] focus:border-[#C2A676] outline-none" placeholder="Masukkan judul..." />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[#888888] mb-1">Pesan / Detail</label>
              <textarea required rows="4" value={formData.pesan} onChange={(e) => setFormData({...formData, pesan: e.target.value})} className="p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] focus:border-[#C2A676] outline-none" placeholder="Jelaskan secara detail..."></textarea>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(null); setFormData({judul: "", pesan: ""}); }} className="px-6 py-3 bg-[#111315] border border-[#333333] text-white font-bold rounded">Batal</button>
              )}
              <button type="submit" className="px-8 py-3 bg-[#C2A676] text-[#111315] font-bold rounded hover:bg-[#a68c5b]">{isEditing ? "Simpan Perubahan" : "Kirim Laporan"}</button>
            </div>
          </form>
        </div>

        <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-[#C2A676] pl-3">Riwayat Laporan Anda</h2>

        {loading ? (
          <div className="text-center text-[#C2A676] py-10 animate-pulse">Memuat data...</div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center text-[#888888] py-10 bg-[#1A1C1E] rounded-xl border border-[#333333]">Belum ada laporan yang dibuat.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((item) => (
              <div key={item.idReport} className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md border bg-[#111315] ${getStatusColor(item.status)}`}>{item.status}</span>
                  <span className="text-xs text-[#888888]">{item.dibuatPada ? new Date(item.dibuatPada).toLocaleDateString('id-ID') : '-'}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{item.judul}</h3>
                <p className="text-[#888888] text-sm line-clamp-2 mb-4 flex-grow">{item.pesan}</p>
                <div className="flex gap-3 pt-4 border-t border-[#333333]">
                  <button onClick={() => viewDetail(item.idReport)} className="text-sm text-[#C2A676] hover:underline">Detail</button>
                  <button onClick={() => handleEdit(item)} className="text-sm text-blue-400 hover:underline">Edit</button>
                  <button onClick={() => setModalHapus({ isOpen: true, id: item.idReport })} className="text-sm text-red-400 hover:underline">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}