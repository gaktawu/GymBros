
import React, { useState, useEffect } from "react";
import axios from "axios";

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(angka);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    Menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    X: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    Users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-12 0v1z" />,
    Plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    Edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    Trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    Check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    Alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    Clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    Package: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V10l8 4m0-10v10" />,
    Search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    MessageSquare: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
    Dumbbell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 6.5h11M18 3v7m2.5-5.5v4M6 3v7M3.5 5.5v4M18 5.5h2.5M3.5 5.5H6" />,
    TrendingUp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    TrendingDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />,
    Activity: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    Calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    Eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    ArrowRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />,
    Filter: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
    Bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name] || null}
    </svg>
  );
};

const useMembership = () => {
  const [classes, setClasses] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', description: '', onConfirm: () => { }, type: 'danger' });
  const [toastConfig, setToastConfig] = useState({ isVisible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToastConfig({ isVisible: true, message, type });
    setTimeout(() => setToastConfig(prev => ({ ...prev, isVisible: false })), 4000);
  };

  const fetchMembershipData = async () => {
    try {
      setIsLoading(true);

      const packageRes = await axios.get("https://api.npoint.io/1006b0526de384fe1148");
      setClasses(packageRes.data);

      const userRes = await axios.get("https://randomuser.me/api/?results=75");
      if (userRes.data && userRes.data.results) {
        setTotalMembers(userRes.data.results.length);
      }

      setTotalReports(Math.floor(Math.random() * 15) + 3);

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Gagal memuat API:", err);
      showToast('Gagal sinkronisasi data dengan server API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipData();
  }, []);

  return {
    classes, setClasses, totalMembers, totalReports, isLoading, lastUpdate,
    modalConfig, setModalConfig, toastConfig, setToastConfig, showToast, fetchMembershipData
  };
};

export default function DashboardAdmin() {
  const {
    classes, setClasses, totalMembers, totalReports, isLoading, lastUpdate,
    modalConfig, setModalConfig, toastConfig, setToastConfig, showToast, fetchMembershipData
  } = useMembership();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingClass, setEditingClass] = useState(null);

  const [formData, setFormData] = useState({
    nama_paket: '', kategori: 'Fitness', durasi_hari: 30, harga: '',
    kuota_maksimal: '', level: 'Pemula', deskripsi: '', fasilitas: ''
  });

  useEffect(() => {
    if (editingClass) {
      setFormData({
        ...editingClass,
        fasilitas: Array.isArray(editingClass.fasilitas) ? editingClass.fasilitas.join(', ') : editingClass.fasilitas
      });
    } else {
      setFormData({
        nama_paket: '', kategori: 'Fitness', durasi_hari: 30, harga: '',
        kuota_maksimal: '', level: 'Pemula', deskripsi: '', fasilitas: ''
      });
    }
  }, [editingClass]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const facilityArray = formData.fasilitas.split(',').map(f => f.trim()).filter(f => f !== '');

    if (editingClass) {
      const updated = {
        ...formData,
        harga: Number(formData.harga),
        kuota_maksimal: Number(formData.kuota_maksimal),
        fasilitas: facilityArray
      };
      setClasses(prev => prev.map(c => c.id === editingClass.id ? updated : c));
      setEditingClass(null);
      showToast('Data kelas berhasil diperbarui!');
    } else {
      const newClass = {
        ...formData,
        id: `cls-${generateId()}`,
        harga: Number(formData.harga),
        kuota_maksimal: Number(formData.kuota_maksimal),
        jumlah_anggota: 0,
        sisa_kuota: Number(formData.kuota_maksimal),
        status_aktif: true,
        fasilitas: facilityArray
      };
      setClasses(prev => [newClass, ...prev]);
      showToast('Kelas baru berhasil terdaftar!');
    }
  };

  const handleDelete = (cls) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Kelas',
      description: `Apakah Anda yakin ingin menghapus kelas "${cls.nama_paket}"?`,
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        setClasses(prev => prev.filter(c => c.id !== cls.id));
        if (editingClass?.id === cls.id) setEditingClass(null);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        showToast('Kelas berhasil dihapus!');
      }
    });
  };

  const handleToggleStatus = (id) => {
    const cls = classes.find(c => c.id === id);
    const nextStatus = !cls.status_aktif;
    setClasses(prev => prev.map(c => c.id === id ? { ...c, status_aktif: nextStatus } : c));
    showToast(`Kelas "${cls.nama_paket}" telah ${nextStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.nama_paket?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? cls.status_aktif : !cls.status_aktif);
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const displayedClasses = filteredClasses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activePackages = classes.filter(c => c.status_aktif).length;
  const inactivePackages = classes.length - activePackages;
  const totalRevenue = classes.reduce((sum, c) => sum + (c.harga || 0), 0);
  const avgPrice = classes.length > 0 ? totalRevenue / classes.length : 0;

  return (
    <div className="min-h-screen bg-[#111315] font-sans">
      {/* Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1A1C1E] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#333333]">
            <div className="flex items-center gap-3 text-[#C2A676] mb-4">
              <div className="p-2 bg-[#C2A676]/10 rounded-lg">
                <Icon name="Alert" className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{modalConfig.title}</h3>
            </div>
            <p className="text-[#888888] text-sm mb-6 leading-relaxed">{modalConfig.description}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))} className="px-4 py-2 text-[#888888] hover:bg-[#333333] rounded-xl text-sm font-semibold transition">
                {modalConfig.cancelText}
              </button>
              <button onClick={modalConfig.onConfirm} className="px-5 py-2 bg-[#C2A676] text-[#111315] hover:bg-[#C2A676]/90 rounded-xl text-sm font-semibold transition">
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastConfig.isVisible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#1A1C1E] text-[#E0E0E0] px-5 py-3.5 rounded-xl shadow-2xl border border-[#333333]">
          <div className="p-1 bg-[#C2A676]/20 text-[#C2A676] rounded-md">
            <Icon name="Check" className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium">{toastConfig.message}</p>
        </div>
      )}

      <div className="flex">
        <div className="flex-1 min-w-0">
          <main className="p-4 lg:p-8 max-w-7xl mx-auto">
            {/* ================= STICKY HEADER SECTION ================= */}
            {/* top-[72px] = posisi tepat di bawah navbar AdminLayout (pt-6 + navbar height) */}
            <div className="sticky top-[72px] z-30 bg-[#111315]/95 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-6 lg:mb-8 border-b border-[#333333]/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Dashboard Admin</h1>
                  <p className="text-sm text-[#888888] mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#C2A676] rounded-full animate-pulse"></span>
                    API Terhubung: {lastUpdate.toLocaleTimeString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={fetchMembershipData}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-[#C2A676] text-[#111315] rounded-xl text-sm font-semibold hover:bg-[#C2A676]/90 transition disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  <Icon name={isLoading ? 'Clock' : 'Package'} className="w-4 h-4" />
                  {isLoading ? 'Menghubungkan...' : 'Sinkronisasi API'}
                </button>
              </div>
            </div>

            {/* ================= SCROLLABLE CONTENT ================= */}
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <div className="bg-[#1A1C1E] p-6 rounded-2xl border border-[#333333] shadow-sm hover:border-[#C2A676]/30 transition group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#888888]">Total Paket</span>
                    <div className="p-2.5 bg-[#C2A676]/10 text-[#C2A676] rounded-xl group-hover:bg-[#C2A676]/20 transition">
                      <Icon name="Package" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{isLoading ? '...' : classes.length}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-[#888888]">
                    <Icon name="TrendingUp" className="w-3 h-3 text-[#C2A676]" />
                    <span className="text-[#C2A676]">+{Math.floor(Math.random() * 5) + 1}</span>
                    <span>dari bulan lalu</span>
                  </div>
                </div>

                <div className="bg-[#1A1C1E] p-6 rounded-2xl border border-[#333333] shadow-sm hover:border-[#C2A676]/30 transition group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#888888]">Paket Aktif</span>
                    <div className="p-2.5 bg-[#C2A676]/10 text-[#C2A676] rounded-xl group-hover:bg-[#C2A676]/20 transition">
                      <Icon name="Check" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{isLoading ? '...' : activePackages}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-[#888888]">
                    <span>{inactivePackages} paket nonaktif</span>
                  </div>
                </div>

                <div className="bg-[#1A1C1E] p-6 rounded-2xl border border-[#333333] shadow-sm hover:border-[#C2A676]/30 transition group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#888888]">Jumlah Member</span>
                    <div className="p-2.5 bg-[#C2A676]/10 text-[#C2A676] rounded-xl group-hover:bg-[#C2A676]/20 transition">
                      <Icon name="Users" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{isLoading ? '...' : `${totalMembers}`}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-[#888888]">
                    <Icon name="TrendingUp" className="w-3 h-3 text-[#C2A676]" />
                    <span className="text-[#C2A676]">+12%</span>
                    <span>pertumbuhan</span>
                  </div>
                </div>

                <div className="bg-[#1A1C1E] p-6 rounded-2xl border border-[#333333] shadow-sm hover:border-[#C2A676]/30 transition group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-[#888888]">Laporan Masuk</span>
                    <div className="p-2.5 bg-[#C2A676]/10 text-[#C2A676] rounded-xl group-hover:bg-[#C2A676]/20 transition">
                      <Icon name="MessageSquare" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{isLoading ? '...' : `${totalReports}`}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-[#888888]">
                    <span>{totalReports > 5 ? 'Perlu ditindaklanjuti' : 'Semua aman'}</span>
                  </div>
                </div>
              </div>

              {/* Secondary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
                <div className="bg-[#1A1C1E] p-5 rounded-2xl border border-[#333333] flex items-center gap-4">
                  <div className="p-3 bg-[#C2A676]/10 rounded-xl">
                    <Icon name="TrendingUp" className="w-6 h-6 text-[#C2A676]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] font-medium">Total Pendapatan</p>
                    <p className="text-lg font-bold text-white">{isLoading ? '...' : formatRupiah(totalRevenue)}</p>
                  </div>
                </div>
                <div className="bg-[#1A1C1E] p-5 rounded-2xl border border-[#333333] flex items-center gap-4">
                  <div className="p-3 bg-[#C2A676]/10 rounded-xl">
                    <Icon name="Calendar" className="w-6 h-6 text-[#C2A676]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] font-medium">Rata-rata Harga Paket</p>
                    <p className="text-lg font-bold text-white">{isLoading ? '...' : formatRupiah(avgPrice)}</p>
                  </div>
                </div>
                <div className="bg-[#1A1C1E] p-5 rounded-2xl border border-[#333333] flex items-center gap-4">
                  <div className="p-3 bg-[#C2A676]/10 rounded-xl">
                    <Icon name="Activity" className="w-6 h-6 text-[#C2A676]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] font-medium">Tingkat Aktivasi</p>
                    <p className="text-lg font-bold text-white">{isLoading ? '...' : `${classes.length > 0 ? Math.round((activePackages / classes.length) * 100) : 0}%`}</p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Column - Package Management */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Package Table */}
                  <div className="bg-[#1A1C1E] border border-[#333333] rounded-2xl shadow-sm overflow-hidden">
                    {/* Header tabel dengan search + filter sejajar di tengah */}
                    <div className="p-4 lg:p-6 border-b border-[#333333] bg-[#1A1C1E]">
                      <div className="text-center mb-4">
                        <h2 className="font-bold text-white">Manajemen Akses Paket</h2>
                        <p className="text-xs text-[#888888] mt-1">Kelola paket membership gym Anda</p>
                      </div>
                      
                      {/* Search bar + filter sejajar di tengah */}
                      <div className="flex items-center justify-center gap-3">
                        <div className="relative w-full max-w-sm">
                          <span className="absolute inset-y-0 left-3 flex items-center text-[#888888]">
                            <Icon name="Search" className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="Cari berdasarkan nama..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]"
                          />
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                          className="px-3 py-2 border border-[#333333] rounded-xl text-xs font-medium bg-[#111315] text-[#E0E0E0] focus:outline-none focus:border-[#C2A676] h-[38px]"
                        >
                          <option value="all">Semua Status</option>
                          <option value="active">Aktif</option>
                          <option value="inactive">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#333333] text-xs font-semibold text-[#888888] uppercase tracking-wider bg-[#111315]/50">
                            <th className="py-4 px-6">Informasi Paket</th>
                            <th className="py-4 px-6">Harga</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333333] text-sm text-[#E0E0E0]">
                          {isLoading ? (
                            <tr><td colSpan="4" className="py-8 text-center text-[#888888] font-medium">Menghubungkan & memuat API eksternal...</td></tr>
                          ) : displayedClasses.length === 0 ? (
                            <tr><td colSpan="4" className="py-8 text-center text-[#888888] font-medium">Pencarian paket tidak ditemukan.</td></tr>
                          ) : displayedClasses.map(cls => (
                            <tr key={cls.id} className="hover:bg-[#333333]/30 transition">
                              <td className="py-4 px-6">
                                <div className="font-semibold text-white">{cls.nama_paket}</div>
                                <div className="text-xs text-[#888888] mt-0.5">{cls.id} | {cls.kategori} | {cls.level}</div>
                              </td>
                              <td className="py-4 px-6 font-medium text-[#C2A676]">{formatRupiah(cls.harga)}</td>
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => handleToggleStatus(cls.id)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm transition ${cls.status_aktif ? 'bg-[#C2A676]/10 text-[#C2A676] hover:bg-[#C2A676]/20' : 'bg-[#333333] text-[#888888] hover:bg-[#333333]/80'}`}
                                >
                                  {cls.status_aktif ? 'Aktif' : 'Nonaktif'}
                                </button>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={() => setEditingClass(cls)} className="p-1.5 text-[#888888] hover:text-[#C2A676] hover:bg-[#C2A676]/10 rounded-lg transition">
                                    <Icon name="Edit" className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(cls)} className="p-1.5 text-[#888888] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition">
                                    <Icon name="Trash" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="p-4 border-t border-[#333333] flex items-center justify-between bg-[#111315]/30">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 border border-[#333333] rounded-xl text-xs font-semibold text-[#888888] bg-[#1A1C1E] hover:bg-[#333333] disabled:opacity-50 transition shadow-sm">Prev</button>
                        <span className="text-xs font-medium text-[#888888]">Halaman {currentPage} dari {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 border border-[#333333] rounded-xl text-xs font-semibold text-[#888888] bg-[#1A1C1E] hover:bg-[#333333] disabled:opacity-50 transition shadow-sm">Next</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Add/Edit Form */}
                  <div className="bg-[#1A1C1E] border border-[#333333] rounded-2xl shadow-sm p-4 lg:p-6 sticky top-24">
                    <h2 className="font-bold text-white mb-1">{editingClass ? 'Edit Paket Membership' : 'Tambah Paket Baru'}</h2>
                    <p className="text-xs text-[#888888] mb-4">{editingClass ? 'Perbarui detail paket yang dipilih' : 'Isi formulir untuk menambahkan paket baru'}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Nama Paket</label>
                        <input type="text" required value={formData.nama_paket} onChange={(e) => setFormData({ ...formData, nama_paket: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" placeholder="Contoh: Paket Premium" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Kategori</label>
                          <select value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition">
                            <option value="Fitness">Fitness</option>
                            <option value="Yoga">Yoga</option>
                            <option value="Martial Arts">Martial Arts</option>
                            <option value="HIIT">HIIT</option>
                            <option value="Aquatic">Aquatic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Level</label>
                          <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition">
                            <option value="Pemula">Pemula</option>
                            <option value="Menengah">Menengah</option>
                            <option value="Lanjutan">Lanjutan</option>
                            <option value="Semua Level">Semua Level</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Harga (IDR)</label>
                          <input type="number" required value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" placeholder="500000" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Kuota</label>
                          <input type="number" required value={formData.kuota_maksimal} onChange={(e) => setFormData({ ...formData, kuota_maksimal: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" placeholder="50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Fasilitas (Pisahkan dengan koma)</label>
                        <input type="text" placeholder="Akses Gym, Locker, Shower" value={formData.fasilitas} onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Deskripsi</label>
                        <textarea rows="3" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition resize-none placeholder-[#888888]" placeholder="Deskripsi paket..." />
                      </div>
                      <div className="flex gap-2 pt-2">
                        {editingClass && <button type="button" onClick={() => setEditingClass(null)} className="flex-1 py-2.5 border border-[#333333] text-[#888888] rounded-xl text-sm font-semibold hover:bg-[#333333] transition">Batal</button>}
                        <button type="submit" className="flex-1 py-2.5 bg-[#C2A676] text-[#111315] hover:bg-[#C2A676]/90 rounded-xl text-sm font-semibold transition shadow-md">{editingClass ? 'Simpan' : 'Tambah Paket'}</button>
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