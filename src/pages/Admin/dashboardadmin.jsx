import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

const ICON_PATHS = {
  Users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-12 0v1z",
  Edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  Trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  Check: "M5 13l4 4L19 7",
  Alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  Package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V10l8 4m0-10v10",
  Search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  ChevronLeft: "M15 19l-7-7 7-7",
  ChevronRight: "M9 5l7 7-7 7",
  Refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  Money: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  Key: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.828l7.257-7.257A6 6 0 1115 7h.01z"
};

const Icon = React.memo(({ name, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {ICON_PATHS[name] && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON_PATHS[name]} />}
  </svg>
));

const StatCard = React.memo(({ title, icon, value, subtitle }) => (
  <div className="bg-[#1A1C1E] p-6 rounded-2xl border border-[#333333] shadow-sm hover:border-[#C2A676]/30 transition group">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-semibold text-[#888888]">{title}</span>
      <div className="p-2.5 bg-[#C2A676]/10 text-[#C2A676] rounded-xl group-hover:bg-[#C2A676]/20 transition"><Icon name={icon} /></div>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subtitle && <div className="mt-2 text-xs text-[#888888]">{subtitle}</div>}
  </div>
));

const INITIAL_FORM_STATE = { nama_paket: '', tipe_paket: 'Berjangka', durasi_hari: 30, harga: '', diskon: 0 };

export default function DashboardAdmin() {
  const [classes, setClasses] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [socket, setSocket] = useState(null);
  const [activeGymCount, setActiveGymCount] = useState(0);
  const [liveCode, setLiveCode] = useState("------");
  const [codeExpiry, setCodeExpiry] = useState(null);
  // ===================================

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', description: '', onConfirm: () => { }, type: 'danger', confirmText: '', cancelText: '' });
  const [toastConfig, setToastConfig] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const toastTimerRef = useRef(null);
  const ITEMS_PER_PAGE = 5;

  // ✅ FIX: Cleanup timer saat unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastConfig({ isVisible: true, message, type });
    toastTimerRef.current = setTimeout(() => setToastConfig(prev => ({ ...prev, isVisible: false })), 4000);
  }, []);

  // === SOCKET CONNECTION ===
  // ✅ FIX: Hilangkan showToast dari dependency array untuk mencegah reconnect loop
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token tidak ada, skip socket');
      return;
    }


    const newSocket = io(`${BASE_URL}/attendance`, {
      withCredentials: true,
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket terhubung, ID:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    newSocket.on('error', (err) => {
      console.error('❌ Server error:', err.message || err);
    });

    newSocket.on('gym-count-updated', (count) => setActiveGymCount(count));

    newSocket.on('new-dynamic-code', (data) => {
      setLiveCode(data.code);
      setCodeExpiry(new Date(data.expiresAt));
      // ✅ FIX: Panggil showToast via ref-like pattern agar tidak trigger re-render effect
      // Karena kita tidak bisa include showToast di dependency, kita pakai cara ini:
      // (showToast sudah stable karena useCallback dengan [] dependency sebenarnya,
      // tapi untuk aman kita biarkan ESLint warning saja atau pakai ref)
      setToastConfig({ isVisible: true, message: 'Kode Redeem baru berhasil di-generate!', type: 'success' });
      toastTimerRef.current = setTimeout(() => setToastConfig(prev => ({ ...prev, isVisible: false })), 4000);
    });

    setSocket(newSocket);
    return () => {
      console.log('🧹 Cleaning up socket connection');
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Intentionally empty: hanya mount sekali

  const handleGenerateCode = useCallback(() => {
    if (socket) socket.emit('admin-generate-code');
  }, [socket]);
  // =========================

  // ✅ FIX: Gunakan Promise.allSettled untuk paralel + filter member only
  const fetchMembershipData = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const [packageRes, userRes, revRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/api/v1/paket-membership/admin/all`, apiConfig),
        axios.get(`${BASE_URL}/api/v1/users`, apiConfig),
        axios.get(`${BASE_URL}/api/v1/payments/revenue`, apiConfig)
      ]);

      // 1. Handle Paket Membership
      if (packageRes.status === 'fulfilled') {
        const packageData = packageRes.value.data.data || packageRes.value.data;
        const normalizedData = packageData.map(item => {
          const isDeleted = item.is_deleted === true || item.is_deleted === 'true' || item.is_deleted === 1 || item.deleted_at !== null;
          const rawActive = item.status_aktif === 'Tersedia' || item.statusAktif === 'Tersedia';
          return {
            ...item,
            id_paket: item.id_paket || item.id,
            hargaNum: Number(item.harga),
            diskonVal: Number(item.diskon) || 0,
            isDeleted,
            isActive: rawActive && !isDeleted
          };
        });
        setClasses(normalizedData);
      } else {
        console.error("Gagal menarik paket dari API Admin:", packageRes.reason);
      }

      // 2. Handle Total Member (✅ FIX: hanya hitung user dengan role Member)
      if (userRes.status === 'fulfilled') {
        const userData = userRes.value.data.data || userRes.value.data;
        const memberCount = Array.isArray(userData) 
          ? userData.filter(u => (u.role || u.peran) === 'Member').length 
          : 0;
        setTotalMembers(memberCount);
      } else {
        console.error("Gagal menarik data users:", userRes.reason);
        setTotalMembers(0);
      }

      // 3. Handle Revenue
      if (revRes.status === 'fulfilled') {
        const revData = revRes.value.data.data || revRes.value.data;
        setTotalRevenue(revData.totalPendapatan || 0);
        setMonthlyRevenue(revData.pendapatanBulanIni || 0);
      } else {
        console.error("Gagal menarik data pendapatan:", revRes.reason);
        setTotalRevenue(0);
        setMonthlyRevenue(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!localStorage.getItem('token') || !userData) {
      window.location.href = '/login';
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'Admin' && user.peran !== 'Admin') {
      window.location.href = '/login';
      return;
    }
    fetchMembershipData();
  }, [fetchMembershipData]);

  useEffect(() => {
    if (editingClass) {
      setFormData({
        nama_paket: editingClass.nama_paket,
        tipe_paket: editingClass.durasi_hari === 1 ? 'Harian' : 'Berjangka',
        durasi_hari: editingClass.durasi_hari,
        harga: editingClass.hargaNum,
        diskon: editingClass.diskonVal || 0
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [editingClass]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

    const payload = {
      namaPaket: formData.nama_paket,
      durasiHari: formData.tipe_paket === 'Harian' ? 1 : Number(formData.durasi_hari),
      harga: Number(formData.harga),
      diskon: Number(formData.diskon),
      statusAktif: "Tersedia"
    };

    try {
      if (editingClass) {
        await axios.put(`${BASE_URL}/api/v1/paket-membership/${editingClass.id_paket}`, payload, apiConfig);
        showToast('Data paket berhasil diperbarui!');
      } else {
        await axios.post(`${BASE_URL}/api/v1/paket-membership`, payload, apiConfig);
        showToast('Paket baru berhasil ditambahkan!');
      }
      setEditingClass(null);
      setFormData(INITIAL_FORM_STATE);
      await fetchMembershipData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan ke database', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData, editingClass, showToast, fetchMembershipData]);

  const handleDelete = useCallback((cls) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Paket',
      description: `Apakah Anda yakin ingin menghapus paket "${cls.nama_paket}"? Paket ini tidak akan muncul lagi di dashboard member.`,
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`${BASE_URL}/api/v1/paket-membership/${cls.id_paket}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          showToast('Paket berhasil di-soft delete!');
          if (editingClass?.id_paket === cls.id_paket) setEditingClass(null);
          await fetchMembershipData();
        } catch (error) {
          showToast('Gagal menghapus data dari server', 'error');
        } finally {
          setModalConfig(p => ({ ...p, isOpen: false }));
        }
      }
    });
  }, [editingClass, showToast, fetchMembershipData]);

  const handleToggleStatus = useCallback(async (id) => {
    const target = classes.find(c => c.id_paket === id);
    if (!target) return;

    const token = localStorage.getItem('token');
    const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

    if (target.isDeleted) {
      setModalConfig({
        isOpen: true,
        title: 'Pulihkan Paket',
        description: `Apakah Anda yakin ingin memulihkan paket "${target.nama_paket}"?`,
        type: 'success',
        confirmText: 'Ya, Pulihkan',
        cancelText: 'Batal',
        onConfirm: async () => {
          try {
            await axios.post(`${BASE_URL}/api/v1/paket-membership/${id}/restore`, {}, apiConfig);
            showToast(`Paket "${target.nama_paket}" berhasil dipulihkan!`);
            await fetchMembershipData();
          } catch (error) {
            showToast('Gagal memulihkan data. Periksa routing backend Anda.', 'error');
          } finally {
            setModalConfig(p => ({ ...p, isOpen: false }));
          }
        }
      });
      return;
    }

    const newStatus = target.status_aktif === 'Tersedia' || target.statusAktif === 'Tersedia' ? 'Tidak Tersedia' : 'Tersedia';
    try {
      await axios.patch(`${BASE_URL}/api/v1/paket-membership/${id}/status`, { statusAktif: newStatus }, apiConfig);
      showToast(`Status paket "${target.nama_paket}" diubah menjadi ${newStatus}.`);
      await fetchMembershipData();
    } catch (error) {
      showToast('Gagal mengubah status paket.', 'error');
    }
  }, [classes, showToast, fetchMembershipData]);

  const stats = useMemo(() => {
    const activePackages = classes.filter(c => c.isActive).length;
    const deletedPackages = classes.filter(c => c.isDeleted).length;
    return {
      activePackages,
      inactivePackages: classes.length - activePackages - deletedPackages,
      deletedPackages
    };
  }, [classes]);

  const { filteredClasses, displayedClasses, totalPages } = useMemo(() => {
    const filtered = classes.filter(cls => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = cls.nama_paket?.toLowerCase().includes(q) || String(cls.id_paket)?.toLowerCase().includes(q);
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = cls.isActive;
      else if (statusFilter === 'inactive') matchesStatus = !cls.isActive && !cls.isDeleted;
      else if (statusFilter === 'deleted') matchesStatus = cls.isDeleted;
      return matchesSearch && matchesStatus;
    });
    const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const displayed = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return { filteredClasses: filtered, displayedClasses: displayed, totalPages: pages };
  }, [classes, searchQuery, statusFilter, currentPage]);

  return (
    <div className="min-h-screen bg-[#111315] font-sans">
      {/* Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1A1C1E] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#333333]">
            <div className={`flex items-center gap-3 mb-4 ${modalConfig.type === 'danger' ? 'text-red-400' : 'text-green-400'}`}>
              <div className={`p-2 rounded-lg ${modalConfig.type === 'danger' ? 'bg-red-400/10' : 'bg-green-400/10'}`}>
                <Icon name="Alert" className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{modalConfig.title}</h3>
            </div>
            <p className="text-[#888888] text-sm mb-6 leading-relaxed">{modalConfig.description}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))} className="px-4 py-2 text-[#888888] hover:bg-[#333333] rounded-xl text-sm font-semibold transition">{modalConfig.cancelText}</button>
              <button onClick={modalConfig.onConfirm} className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${modalConfig.type === 'danger' ? 'bg-red-500 text-white hover:bg-red-500/90' : 'bg-green-500 text-white hover:bg-green-500/90'}`}>{modalConfig.confirmText}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastConfig.isVisible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#1A1C1E] text-[#E0E0E0] px-5 py-3.5 rounded-xl shadow-2xl border border-[#333333]">
          <div className="p-1 bg-[#C2A676]/20 text-[#C2A676] rounded-md"><Icon name="Check" className="w-4 h-4" /></div>
          <p className="text-sm font-medium">{toastConfig.message}</p>
        </div>
      )}

      <div className="flex">
        <div className="flex-1 min-w-0">
          <main className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="sticky top-[72px] z-30 bg-[#111315]/95 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-6 lg:mb-8 border-b border-[#333333]/50">
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Dashboard Admin</h1>
            </div>

            <div>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
                <StatCard title="Pendapatan Bulan Ini" icon="Money" value={isLoading ? '...' : formatRupiah(monthlyRevenue)} />
                <StatCard title="Total Pendapatan" icon="Money" value={isLoading ? '...' : formatRupiah(totalRevenue)} />
                <StatCard title="Total Paket" icon="Package" value={isLoading ? '...' : classes.length} />
                <StatCard title="Paket Tersedia" icon="Check" value={isLoading ? '...' : stats.activePackages} subtitle={`${stats.inactivePackages} nonaktif, ${stats.deletedPackages} dihapus`} />
                <StatCard title="Jumlah Member" icon="Users" value={isLoading ? '...' : totalMembers} />
              </div>

              {/* Live Attendance Control */}
              <div className="bg-gradient-to-r from-[#1A1C1E] to-[#111315] border border-[#333333] rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Icon name="Users" className="text-[#C2A676]" /> Live Gym Attendance
                  </h2>
                  <p className="text-[#888888] text-sm">
                    Saat ini ada <strong className="text-[#C2A676] text-lg">{activeGymCount}</strong> member sedang berlatih di dalam Gym.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 bg-[#111315] p-4 rounded-xl border border-[#333333]">
                  <div className="text-center">
                    <p className="text-xs text-[#888888] font-semibold uppercase tracking-wider mb-1">Kode Redeem Aktif</p>
                    <p className="text-3xl font-black text-white tracking-widest">{liveCode}</p>
                    {codeExpiry && (
                      <p className="text-xs text-red-400 mt-1">
                        Berlaku s/d: {codeExpiry.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleGenerateCode}
                    className="px-6 py-3 bg-[#C2A676] text-[#111315] font-bold rounded-xl hover:bg-[#C2A676]/90 transition flex items-center gap-2"
                  >
                    <Icon name="Key" className="w-5 h-5" /> Generate Baru
                  </button>
                </div>
              </div>

              {/* Table & Form */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-[#1A1C1E] border border-[#333333] rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 lg:p-6 border-b border-[#333333] bg-[#1A1C1E]">
                      <form className="flex items-center justify-center gap-3" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative w-full max-w-sm">
                          <span className="absolute inset-y-0 left-3 flex items-center text-[#888888]"><Icon name="Search" className="w-4 h-4" /></span>
                          <input type="text" placeholder="Cari ID / Nama..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" />
                        </div>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-[#333333] rounded-xl text-xs font-medium bg-[#111315] text-[#E0E0E0] focus:outline-none focus:border-[#C2A676] h-[38px]">
                          <option value="all">Semua Status</option>
                          <option value="active">Tersedia</option>
                          <option value="inactive">Tidak Tersedia</option>
                          <option value="deleted">Dihapus (Soft Delete)</option>
                        </select>
                      </form>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#333333] text-xs font-semibold text-[#888888] uppercase tracking-wider bg-[#111315]/50">
                            <th className="py-4 px-6">Informasi Paket</th>
                            <th className="py-4 px-6">Harga & Diskon</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333333] text-sm text-[#E0E0E0]">
                          {isLoading ? (
                            <tr><td colSpan="4" className="py-12 text-center text-[#888888]">Memuat data...</td></tr>
                          ) : displayedClasses.length === 0 ? (
                            <tr><td colSpan="4" className="py-8 text-center text-[#888888]">Data tidak ditemukan.</td></tr>
                          ) : displayedClasses.map(cls => (
                            <tr key={cls.id_paket} className={`hover:bg-[#333333]/30 transition ${cls.isDeleted ? 'opacity-60 bg-red-500/5' : ''}`}>
                              <td className="py-4 px-6">
                                <div className="font-semibold text-white flex items-center gap-2">
                                  {cls.nama_paket}
                                  {cls.durasi_hari === 1 && <span className="text-[10px] bg-[#333] px-2 py-0.5 rounded text-gray-300">Harian</span>}
                                  {cls.isDeleted && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">Dihapus</span>}
                                  {!cls.isDeleted && !cls.isActive && <span className="text-[10px] bg-[#333] px-2 py-0.5 rounded text-gray-300">Nonaktif</span>}
                                </div>
                                <div className="text-xs text-[#888888] mt-0.5">ID: {cls.id_paket} | Durasi: {cls.durasi_hari} Hari</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-medium text-[#C2A676]">{formatRupiah(cls.hargaNum)}</div>
                                {cls.diskonVal > 0 && <div className="text-xs text-green-400 mt-0.5">Diskon: {cls.diskonVal}%</div>}
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => handleToggleStatus(cls.id_paket)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm transition ${cls.isDeleted
                                      ? 'bg-red-950/30 text-red-400 border border-red-900/50 cursor-pointer hover:bg-red-900/50'
                                      : cls.isActive
                                        ? 'bg-[#C2A676]/10 text-[#C2A676] hover:bg-[#C2A676]/20'
                                        : 'bg-[#333333] text-[#888888] hover:bg-[#333333]/80'
                                    }`}
                                >
                                  {cls.isDeleted ? 'Dihapus' : (cls.status_aktif || 'Tidak Tersedia')}
                                </button>
                              </td>
                              <td className="py-4 px-6 text-right">
                                {cls.isDeleted ? (
                                  <button
                                    onClick={() => handleToggleStatus(cls.id_paket)}
                                    className="px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ml-auto"
                                  >
                                    <Icon name="Refresh" className="w-3.5 h-3.5" />
                                    Pulihkan
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button onClick={() => setEditingClass(cls)} className="p-1.5 text-[#888888] hover:text-[#C2A676] hover:bg-[#C2A676]/10 rounded-lg transition"><Icon name="Edit" className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(cls)} className="p-1.5 text-[#888888] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"><Icon name="Trash" className="w-4 h-4" /></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-[#333333]">
                        <div className="text-xs text-[#888888]">
                          Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredClasses.length)} dari {filteredClasses.length} data
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#333333] text-[#E0E0E0] hover:bg-[#333333] disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${currentPage === page ? 'bg-[#C2A676] text-[#111315]' : 'text-[#888888] hover:bg-[#333333]'}`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#333333] text-[#E0E0E0] hover:bg-[#333333] disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            Next
                            <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-[#1A1C1E] border border-[#333333] rounded-2xl shadow-sm p-4 lg:p-6 sticky top-24">
                    <h2 className="font-bold text-white mb-1">{editingClass ? 'Edit Paket Membership' : 'Tambah Paket Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Tipe Paket</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-[#E0E0E0] cursor-pointer">
                            <input type="radio" checked={formData.tipe_paket === 'Berjangka'} onChange={() => setFormData({ ...formData, tipe_paket: 'Berjangka' })} className="accent-[#C2A676]" /> Berjangka
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#E0E0E0] cursor-pointer">
                            <input type="radio" checked={formData.tipe_paket === 'Harian'} onChange={() => setFormData({ ...formData, tipe_paket: 'Harian' })} className="accent-[#C2A676]" /> Harian
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Nama Paket</label>
                        <input type="text" required value={formData.nama_paket} onChange={(e) => setFormData({ ...formData, nama_paket: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none bg-[#111315] text-[#E0E0E0]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Harga (Rp)</label>
                          <input type="number" required value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none bg-[#111315] text-[#E0E0E0]" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Durasi (Hari)</label>
                          <input type="number" required disabled={formData.tipe_paket === 'Harian'} value={formData.tipe_paket === 'Harian' ? 1 : formData.durasi_hari} onChange={(e) => setFormData({ ...formData, durasi_hari: e.target.value })} className={`w-full px-3 py-2 border border-[#333333] rounded-xl text-sm bg-[#111315] text-[#E0E0E0] ${formData.tipe_paket === 'Harian' ? 'opacity-50' : ''}`} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        {editingClass && <button type="button" onClick={() => setEditingClass(null)} className="flex-1 py-2.5 border border-[#333333] text-[#888888] rounded-xl text-sm font-semibold hover:bg-[#333333]">Batal</button>}
                        <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-[#C2A676] text-[#111315] hover:bg-[#C2A676]/90 rounded-xl text-sm font-semibold">{editingClass ? 'Simpan' : 'Tambah'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}