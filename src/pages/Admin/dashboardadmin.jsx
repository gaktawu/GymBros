import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

// Format ke Rupiah
const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(angka || 0);

const ICON_PATHS = {
  Menu: "M4 6h16M4 12h16M4 18h16",
  X: "M6 18L18 6M6 6l12 12",
  Users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-12 0v1z",
  Edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  Trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  Check: "M5 13l4 4L19 7",
  Alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  Clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  Package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V10l8 4m0-10v10",
  Search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  MessageSquare: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  TrendingUp: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  Activity: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  Calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
};

const Icon = React.memo(({ name, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {ICON_PATHS[name] && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON_PATHS[name]} />}
  </svg>
));

const StatCard = React.memo(({ title, icon, value, subtitle, trendIcon, trendValue, isPositive }) => (
  <div className="bg-[#1A1C1E] p-6 rounded-2xl border border-[#333333] shadow-sm hover:border-[#C2A676]/30 transition group">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-semibold text-[#888888]">{title}</span>
      <div className="p-2.5 bg-[#C2A676]/10 text-[#C2A676] rounded-xl group-hover:bg-[#C2A676]/20 transition">
        <Icon name={icon} />
      </div>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="flex items-center gap-1 mt-2 text-xs text-[#888888]">
      {trendIcon && <Icon name={trendIcon} className={`w-3 h-3 ${isPositive ? 'text-[#C2A676]' : 'text-red-400'}`} />}
      {trendValue && <span className={isPositive ? 'text-[#C2A676]' : 'text-red-400'}>{trendValue}</span>}
      <span>{subtitle}</span>
    </div>
  </div>
));

// Disesuaikan dengan struktur DB Anda
const INITIAL_FORM_STATE = {
  nama_paket: '', 
  durasi_hari: 30, 
  harga: ''
};

export default function DashboardAdmin() {
  const [classes, setClasses] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', description: '', onConfirm: () => {}, type: 'danger' });
  const [toastConfig, setToastConfig] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const ITEMS_PER_PAGE = 5;

  const showToast = useCallback((message, type = 'success') => {
    setToastConfig({ isVisible: true, message, type });
    setTimeout(() => setToastConfig(prev => ({ ...prev, isVisible: false })), 4000);
  }, []);

  // 1. CEK TOKEN
  useEffect(() => {
    document.title = "Gymbros | Dashboard Admin";
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      alert("Akses Ditolak: Anda harus login terlebih dahulu!");
      window.location.href = '/login'; 
      return;
    }

    const user = JSON.parse(userData);
    if (user.peran !== 'Admin') {
      alert("Akses Ditolak: Halaman ini khusus untuk Administrator.");
      window.location.href = '/login'; 
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthChecked(true); 
  }, []);

 // 2. FETCH DATA DARI DATABASE (READ)
  const fetchMembershipData = useCallback(async () => {
    setIsLoading(true);
    try {
      // --- TARIK DATA PAKET ---
      const packageRes = await axios.get("http://localhost:5000/api/v1/paket-membership");
      const packageData = packageRes.data.data || packageRes.data;
      
      const normalizedData = packageData.map(item => ({
        ...item,
        id: item.id_paket, 
        hargaNum: Number(item.harga), 
        isActive: item.status_aktif === 'Tersedia' 
      }));
      setClasses(normalizedData);

      // --- TARIK DATA USERS (BARU) ---
      const userRes = await axios.get("http://localhost:5000/api/v1/users");
      const userData = userRes.data.data || userRes.data;
      
      // Opsional: Jika Anda hanya ingin menghitung user dengan peran 'Member' saja
      // const memberAsli = userData.filter(user => user.peran === 'Member').length;
      
      // Mengganti angka 124 dengan total panjang data dari database
      setTotalMembers(userData.length); 

      // --- DATA LAPORAN (MASIH DUMMY) ---
      setTotalReports(3); 
      setLastUpdate(new Date());

    } catch (err) {
      console.error("Gagal memuat API:", err);
      showToast('Gagal menarik data dari server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  useEffect(() => {
    if (isAuthChecked) fetchMembershipData();
  }, [isAuthChecked, fetchMembershipData]);

  useEffect(() => {
    if (editingClass) {
      setFormData({
        nama_paket: editingClass.nama_paket,
        durasi_hari: editingClass.durasi_hari,
        harga: editingClass.hargaNum // Ambil versi angkanya
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [editingClass]);

  // 3. SUBMIT (POST/PUT) DENGAN FORMAT CAMELCASE YANG DIMINTA BACKEND
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // KUNCI JAWABAN: Sesuaikan penamaan dengan error validasi di gambar
    const payload = {
      namaPaket: formData.nama_paket, // CamelCase!
      durasiHari: Number(formData.durasi_hari), // CamelCase!
      harga: Number(formData.harga),
      statusAktif: "Tersedia" // Nilai default saat membuat
    };

    try {
      if (editingClass) {
        await axios.put(`http://localhost:5000/api/v1/paket-membership/${editingClass.id_paket}`, payload);
        showToast('Data paket berhasil diperbarui!');
      } else {
        await axios.post("http://localhost:5000/api/v1/paket-membership", payload);
        showToast('Paket baru berhasil ditambahkan!');
      }
      
      setEditingClass(null);
      setFormData(INITIAL_FORM_STATE);
      await fetchMembershipData(); 

    } catch (error) {
      console.error("Gagal menyimpan:", error);
      showToast(error.response?.data?.message || 'Gagal menyimpan data ke database', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData, editingClass, showToast, fetchMembershipData]);

  // 4. HAPUS DATA (DELETE)
  const handleDelete = useCallback((cls) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Paket',
      description: `Apakah Anda yakin ingin menghapus paket "${cls.nama_paket}"?`,
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/v1/paket-membership/${cls.id_paket}`);
          showToast('Paket berhasil dihapus!');
          if (editingClass?.id_paket === cls.id_paket) setEditingClass(null);
          await fetchMembershipData(); 
        } catch (error) {
          console.error("Gagal menghapus:", error);
          showToast('Gagal menghapus data', 'error');
        } finally {
          setModalConfig(p => ({ ...p, isOpen: false }));
        }
      }
    });
  }, [editingClass, showToast, fetchMembershipData]);

  // 5. UBAH STATUS (Tersedia / Tidak Tersedia)
  const handleToggleStatus = useCallback(async (id) => {
    const target = classes.find(c => c.id_paket === id);
    if (!target) return;

    const newStatus = target.status_aktif === 'Tersedia' ? 'Tidak Tersedia' : 'Tersedia';

    try {
      await axios.patch(`http://localhost:5000/api/v1/paket-membership/${id}/status`, {
        statusAktif: newStatus
      });
      showToast(`Paket "${target.nama_paket}" telah menjadi ${newStatus}.`);
      await fetchMembershipData(); 
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      showToast('Gagal merubah status paket dari server.', 'error');
    }
  }, [classes, showToast, fetchMembershipData]);


  // --- STATISTIK & FILTER ---
  const stats = useMemo(() => {
    const activePackages = classes.filter(c => c.isActive).length;
    const totalRevenue = classes.reduce((sum, c) => sum + (c.hargaNum || 0), 0);
    const avgPrice = classes.length ? totalRevenue / classes.length : 0;
    const activationRate = classes.length ? Math.round((activePackages / classes.length) * 100) : 0;
    
    return { activePackages, inactivePackages: classes.length - activePackages, totalRevenue, avgPrice, activationRate };
  }, [classes]);

  const { filteredClasses, displayedClasses, totalPages } = useMemo(() => {
    const filtered = classes.filter(cls => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = cls.nama_paket?.toLowerCase().includes(q) || String(cls.id_paket)?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? cls.isActive : !cls.isActive);
      return matchesSearch && matchesStatus;
    });
    
    const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const displayed = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return { filteredClasses: filtered, displayedClasses: displayed, totalPages: pages };
  }, [classes, searchQuery, statusFilter, currentPage]);

  const handlePageChange = (direction) => {
    setCurrentPage(p => direction === 'next' ? Math.min(totalPages, p + 1) : Math.max(1, p - 1));
  };

  return (
    <div className="min-h-screen bg-[#111315] font-sans">
      {/* MODAL KONFIRMASI */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1A1C1E] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#333333]">
            <div className="flex items-center gap-3 text-[#C2A676] mb-4">
              <div className="p-2 bg-[#C2A676]/10 rounded-lg"><Icon name="Alert" className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-white">{modalConfig.title}</h3>
            </div>
            <p className="text-[#888888] text-sm mb-6 leading-relaxed">{modalConfig.description}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))} className="px-4 py-2 text-[#888888] hover:bg-[#333333] rounded-xl text-sm font-semibold transition">{modalConfig.cancelText}</button>
              <button onClick={modalConfig.onConfirm} className="px-5 py-2 bg-[#C2A676] text-[#111315] hover:bg-[#C2A676]/90 rounded-xl text-sm font-semibold transition">{modalConfig.confirmText}</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI */}
      {toastConfig.isVisible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#1A1C1E] text-[#E0E0E0] px-5 py-3.5 rounded-xl shadow-2xl border border-[#333333]">
          <div className="p-1 bg-[#C2A676]/20 text-[#C2A676] rounded-md"><Icon name="Check" className="w-4 h-4" /></div>
          <p className="text-sm font-medium">{toastConfig.message}</p>
        </div>
      )}

      <div className="flex">
        <div className="flex-1 min-w-0">
          <main className="p-4 lg:p-8 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="sticky top-[72px] z-30 bg-[#111315]/95 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-6 lg:mb-8 border-b border-[#333333]/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Dashboard Admin</h1>
                  <p className="text-sm text-[#888888] mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? 'bg-amber-500' : 'bg-[#C2A676]'}`} />
                    API Terhubung: {lastUpdate.toLocaleTimeString('id-ID')}
                  </p>
                </div>
                <button onClick={fetchMembershipData} disabled={isLoading} className="px-5 py-2.5 bg-[#C2A676] text-[#111315] rounded-xl text-sm font-semibold hover:bg-[#C2A676]/90 transition disabled:opacity-50 flex items-center gap-2 shadow-md">
                  <Icon name={isLoading ? 'Clock' : 'Package'} className="w-4 h-4" />
                  {isLoading ? 'Menghubungkan...' : 'Sinkronisasi API'}
                </button>
              </div>
            </div>

            <div>
              {/* KARTU STATISTIK ATAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard title="Total Paket" icon="Package" value={isLoading ? '...' : classes.length} trendIcon="TrendingUp" trendValue="+3" subtitle="dari bulan lalu" isPositive />
                <StatCard title="Paket Tersedia" icon="Check" value={isLoading ? '...' : stats.activePackages} subtitle={`${stats.inactivePackages} paket habis`} />
                <StatCard title="Jumlah Member" icon="Users" value={isLoading ? '...' : totalMembers} trendIcon="TrendingUp" trendValue="+12%" subtitle="pertumbuhan" isPositive />
                <StatCard title="Laporan Masuk" icon="MessageSquare" value={isLoading ? '...' : totalReports} subtitle={totalReports > 5 ? 'Perlu ditindaklanjuti' : 'Semua aman'} />
              </div>

              {/* KARTU STATISTIK BAWAH */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
                {[
                  { label: "Total Potensi Pendapatan", icon: "TrendingUp", val: formatRupiah(stats.totalRevenue) },
                  { label: "Rata-rata Harga", icon: "Calendar", val: formatRupiah(stats.avgPrice) },
                  { label: "Tingkat Ketersediaan", icon: "Activity", val: `${stats.activationRate}%` }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#1A1C1E] p-5 rounded-2xl border border-[#333333] flex items-center gap-4">
                    <div className="p-3 bg-[#C2A676]/10 rounded-xl"><Icon name={item.icon} className="w-6 h-6 text-[#C2A676]" /></div>
                    <div>
                      <p className="text-xs text-[#888888] font-medium">{item.label}</p>
                      <p className="text-lg font-bold text-white">{isLoading ? '...' : item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                
                {/* BAGIAN TABEL */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-[#1A1C1E] border border-[#333333] rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 lg:p-6 border-b border-[#333333] bg-[#1A1C1E]">
                      <div className="text-center mb-4">
                        <h2 className="font-bold text-white">Manajemen Akses Paket</h2>
                        <p className="text-xs text-[#888888] mt-1">Kelola paket membership gym Anda</p>
                      </div>
                      
                      <form className="flex items-center justify-center gap-3" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative w-full max-w-sm">
                          <span className="absolute inset-y-0 left-3 flex items-center text-[#888888]"><Icon name="Search" className="w-4 h-4" /></span>
                          <input type="text" placeholder="Cari ID / Nama..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" />
                        </div>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-[#333333] rounded-xl text-xs font-medium bg-[#111315] text-[#E0E0E0] focus:outline-none focus:border-[#C2A676] h-[38px]">
                          <option value="all">Semua Status</option>
                          <option value="active">Tersedia</option>
                          <option value="inactive">Tidak Tersedia</option>
                        </select>
                      </form>
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
                            <tr><td colSpan="4" className="py-12 text-center text-[#888888] font-medium"><div className="w-6 h-6 border-2 border-[#C2A676]/30 border-t-[#C2A676] rounded-full animate-spin mx-auto mb-3"></div>Menarik data dari Database...</td></tr>
                          ) : displayedClasses.length === 0 ? (
                            <tr><td colSpan="4" className="py-8 text-center text-[#888888] font-medium">Data paket tidak ditemukan.</td></tr>
                          ) : displayedClasses.map(cls => (
                            <tr key={cls.id_paket} className="hover:bg-[#333333]/30 transition">
                              <td className="py-4 px-6">
                                <div className="font-semibold text-white">{cls.nama_paket}</div>
                                <div className="text-xs text-[#888888] mt-0.5">ID: {cls.id_paket} | Durasi: {cls.durasi_hari} Hari</div>
                              </td>
                              <td className="py-4 px-6 font-medium text-[#C2A676]">{formatRupiah(cls.hargaNum)}</td>
                              <td className="py-4 px-6">
                                <button onClick={() => handleToggleStatus(cls.id_paket)} className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm transition ${cls.isActive ? 'bg-[#C2A676]/10 text-[#C2A676] hover:bg-[#C2A676]/20' : 'bg-[#333333] text-[#888888] hover:bg-[#333333]/80'}`}>
                                  {cls.status_aktif}
                                </button>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={() => setEditingClass(cls)} className="p-1.5 text-[#888888] hover:text-[#C2A676] hover:bg-[#C2A676]/10 rounded-lg transition"><Icon name="Edit" className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(cls)} className="p-1.5 text-[#888888] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"><Icon name="Trash" className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="p-4 border-t border-[#333333] flex items-center justify-between bg-[#111315]/30">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange('prev')} className="px-3 py-1.5 border border-[#333333] rounded-xl text-xs font-semibold text-[#888888] bg-[#1A1C1E] hover:bg-[#333333] disabled:opacity-50 transition shadow-sm">Prev</button>
                        <span className="text-xs font-medium text-[#888888]">Halaman {currentPage} dari {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange('next')} className="px-3 py-1.5 border border-[#333333] rounded-xl text-xs font-semibold text-[#888888] bg-[#1A1C1E] hover:bg-[#333333] disabled:opacity-50 transition shadow-sm">Next</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* BAGIAN FORM KINI HANYA MEMUAT INPUT YANG ADA DI DATABASE */}
                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-[#1A1C1E] border border-[#333333] rounded-2xl shadow-sm p-4 lg:p-6 sticky top-24">
                    <h2 className="font-bold text-white mb-1">{editingClass ? 'Edit Paket Membership' : 'Tambah Paket Baru'}</h2>
                    <p className="text-xs text-[#888888] mb-4">{editingClass ? 'Perbarui detail paket yang dipilih' : 'Isi formulir sesuai data di database'}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Nama Paket</label>
                        <input type="text" required value={formData.nama_paket} onChange={(e) => setFormData({ ...formData, nama_paket: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" placeholder="Contoh: Paket Premium" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Harga (IDR)</label>
                          <input type="number" required value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" placeholder="500000" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Durasi (Hari)</label>
                          <input type="number" required value={formData.durasi_hari} onChange={(e) => setFormData({ ...formData, durasi_hari: e.target.value })} className="w-full px-3 py-2 border border-[#333333] rounded-xl text-sm focus:outline-none focus:border-[#C2A676] bg-[#111315] text-[#E0E0E0] transition placeholder-[#888888]" placeholder="30" />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {editingClass && <button type="button" onClick={() => setEditingClass(null)} disabled={isLoading} className="flex-1 py-2.5 border border-[#333333] text-[#888888] rounded-xl text-sm font-semibold hover:bg-[#333333] transition disabled:opacity-50">Batal</button>}
                        <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-[#C2A676] text-[#111315] hover:bg-[#C2A676]/90 rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50 flex justify-center items-center gap-2">
                           {isLoading && <div className="w-4 h-4 border-2 border-[#111315]/30 border-t-[#111315] rounded-full animate-spin" />}
                           {editingClass ? 'Simpan Data' : 'Tambah Paket'}
                        </button>
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