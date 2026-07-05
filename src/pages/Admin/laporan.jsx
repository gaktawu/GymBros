// src/pages/Admin/laporan.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Laporan() {
  const [data, setData] = useState({ data: [], total: 0, stats: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");
  const [page, setPage] = useState(1);
  const [detailReport, setDetailReport] = useState(null);
  const [toast, setToast] = useState(null);
  const [modalHapus, setModalHapus] = useState({ isOpen: false, id: null });
  const limit = 10;

  const sequence = ['Pending', 'In Progress', 'Resolved', 'Closed'];

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getApiConfig = () => ({
    baseURL: "http://localhost:5000/api/v1/user-reports", 
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const api = axios.create(getApiConfig());
      const response = await api.get('/admin/dashboard', {
        params: { page, limit, search, statusFilter, sortBy }
      });
      if (response.data && response.data.data) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [page, search, statusFilter, sortBy]);

  const handleNextStatus = async (id, currentStatus) => {
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) return;
    const nextStatus = sequence[currentIndex + 1];
    
    try {
      const api = axios.create(getApiConfig());
      await api.patch(`/admin/${id}/status`, { status: nextStatus });
      showToast(`Status berhasil diubah menjadi ${nextStatus}`);
      if (detailReport) setDetailReport({ ...detailReport, status: nextStatus });
      fetchDashboard();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal mengubah status";
      showToast(errorMsg, "error");
    }
  };

  const confirmDelete = async () => {
    if (!modalHapus.id) return;
    try {
      const api = axios.create(getApiConfig());
      await api.delete(`/admin/${modalHapus.id}`);
      showToast("Laporan berhasil dihapus");
      setModalHapus({ isOpen: false, id: null });
      setDetailReport(null);
      fetchDashboard();
    } catch (err) {
      showToast("Gagal menghapus laporan", "error");
    }
  };

  const viewDetail = (report) => {
    setDetailReport(report);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'text-yellow-400 bg-yellow-400/10 border-yellow-400',
      'In Progress': 'text-blue-400 bg-blue-400/10 border-blue-400',
      'Resolved': 'text-green-400 bg-green-400/10 border-green-400',
      'Closed': 'text-gray-400 bg-gray-400/10 border-gray-400'
    };
    return colors[status] || 'text-white border-white';
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);
  const reportsData = data?.data || [];
  const statsData = data?.stats || {};

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0] relative">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded shadow-lg font-bold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      {modalHapus.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-[#1A1C1E] p-8 rounded-xl border border-red-500 shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">Hapus Laporan?</h3>
            <p className="text-[#888888] mb-6">Tindakan ini menghapus data secara permanen.</p>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalHapus({ isOpen: false, id: null });
                }} 
                className="flex-1 py-3 bg-[#111315] border border-[#333333] text-white font-bold rounded hover:bg-[#333333]"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete();
                }} 
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {detailReport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
          onClick={() => setDetailReport(null)}
        >
          <div 
            className="bg-[#1A1C1E] p-8 rounded-xl border border-[#C2A676] shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-[#C2A676]">{detailReport?.judul}</h3>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getStatusColor(detailReport?.status)}`}>{detailReport?.status}</span>
            </div>
            <div className="mb-6 pb-4 border-b border-[#333333] text-sm text-[#888888]">
              <p><strong className="text-white">Pelapor:</strong> {detailReport?.namaLengkap} ({detailReport?.email})</p>
              <p><strong className="text-white">Tanggal:</strong> {detailReport?.dibuatPada ? new Date(detailReport.dibuatPada).toLocaleString('id-ID') : '-'}</p>
            </div>
            <p className="text-[#E0E0E0] whitespace-pre-wrap mb-8">{detailReport?.pesan}</p>
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#111315] p-4 rounded-lg border border-[#333333] gap-4">
              <div className="flex flex-wrap gap-3">
                {sequence.indexOf(detailReport?.status) < sequence.length - 1 && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextStatus(detailReport.idReport, detailReport.status);
                    }} 
                    className="px-4 py-2 bg-[#C2A676] text-[#111315] font-bold rounded hover:bg-[#a68c5b] text-sm md:text-base"
                  >
                    Update ke {sequence[sequence.indexOf(detailReport.status) + 1]}
                  </button>
                )}
                {/* PERBAIKAN: Button Hapus sekarang benar-benar memanggil setModalHapus */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalHapus({ isOpen: true, id: detailReport.idReport });
                  }} 
                  className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 text-sm md:text-base"
                >
                  Hapus
                </button>
              </div>
              {/* PERBAIKAN: Button Tutup sekarang benar-benar memanggil setDetailReport(null) */}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailReport(null);
                }} 
                className="px-6 py-2 bg-[#1A1C1E] border border-[#333333] text-white rounded hover:bg-[#333333]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-[#333333] pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Dashboard Laporan Admin</h1>
          <p className="text-[#888888]">Manajemen keluhan dan laporan operasional GymBros.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {['Total', 'Pending', 'In Progress', 'Resolved', 'Closed'].map(stat => (
            <div key={stat} className="bg-[#1A1C1E] p-4 rounded-xl border border-[#333333] text-center shadow-lg">
              <h4 className="text-[#888888] text-sm uppercase font-bold mb-1">{stat}</h4>
              <p className={`text-3xl font-black ${stat === 'Total' ? 'text-[#C2A676]' : getStatusColor(stat).split(' ')[0]}`}>
                {statsData[stat] || 0}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input type="text" placeholder="Cari laporan atau pelapor..." value={search} onChange={(e) => {setSearch(e.target.value); setPage(1);}} className="flex-1 p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] outline-none focus:border-[#C2A676]" />
            <select value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}} className="p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] outline-none focus:border-[#C2A676]">
              <option value="">Semua Status</option>
              {sequence.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => {setSortBy(e.target.value); setPage(1);}} className="p-3 rounded bg-[#111315] border border-[#333333] text-[#E0E0E0] outline-none focus:border-[#C2A676]">
              <option value="terbaru">Terbaru Dulu</option>
              <option value="terlama">Terlama Dulu</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#333333]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111315] text-[#888888] text-sm uppercase">
                  <th className="p-4 border-b border-[#333333]">Tgl & Waktu</th>
                  <th className="p-4 border-b border-[#333333]">Pelapor</th>
                  <th className="p-4 border-b border-[#333333]">Judul Laporan</th>
                  <th className="p-4 border-b border-[#333333]">Status</th>
                  <th className="p-4 border-b border-[#333333] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[#C2A676] animate-pulse">Memuat data...</td></tr>
                ) : !reportsData || reportsData.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[#888888]">Data tidak ditemukan</td></tr>
                ) : (
                  reportsData.map(row => (
                    <tr key={row.idReport} className="hover:bg-[#111315] border-b border-[#333333] transition-colors">
                      <td className="p-4 text-sm text-[#888888]">{row.dibuatPada ? new Date(row.dibuatPada).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="p-4 text-sm font-semibold text-[#E0E0E0]">{row.namaLengkap}</td>
                      <td className="p-4 text-sm text-[#E0E0E0] truncate max-w-[200px]">{row.judul}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        <button onClick={() => viewDetail(row)} className="text-[#C2A676] hover:underline text-sm font-bold">Detail / Proses</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6 text-sm text-[#888888]">
            <span>Menampilkan halaman {page} dari {totalPages || 1} ({data?.total || 0} total data)</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-[#111315] rounded border border-[#333333] hover:bg-[#333333] disabled:opacity-50">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-[#111315] rounded border border-[#333333] hover:bg-[#333333] disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}