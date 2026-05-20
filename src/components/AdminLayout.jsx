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
    Dumbbell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 6.5h11M18 3v7m2.5-5.5v4M6 3v7M3.5 5.5v4M18 5.5h2.5M3.5 5.5H6" />
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

      // 3. Simulasi jumlah laporan masuk dari member secara dinamis
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

export default function AdminLayout() {
  const {
    classes, setClasses, totalMembers, totalReports, isLoading, lastUpdate,
    modalConfig, setModalConfig, toastConfig, setToastConfig, showToast, fetchMembershipData
  } = useMembership();


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
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

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans">
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Icon name="Alert" className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{modalConfig.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{modalConfig.description}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-semibold transition">
                {modalConfig.cancelText}
              </button>
              <button onClick={modalConfig.onConfirm} className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-semibold transition">
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastConfig.isVisible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl">
          <div className="p-1 bg-green-500/20 text-green-400 rounded-md">
            <Icon name="Check" className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium">{toastConfig.message}</p>
        </div>
      )}

      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-gray-400 p-4 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 flex flex-col min-h-screen shadow-xl`}>
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl text-white shadow-lg">
                <Icon name="Package" className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-wider">GYMBROS</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
              <Icon name="X" />
            </button>
          </div>
          
          {/* DAFTAR MENU SIDEBAR */}
          <nav className="space-y-1.5 flex-1">
            {/* Menu 1: Membership (Aktif) */}
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition duration-200">
              <Icon name="Package" />
              <span>Membership</span>
            </a>

            {/* Menu 2: Cek Member */}
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl font-medium transition duration-200">
              <Icon name="Users" />
              <span>Cek Member</span>
            </a>

            {/* Menu 3: Kelola Alat Gym */}
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl font-medium transition duration-200">
              <Icon name="Dumbbell" />
              <span>Kelola Alat Gym</span>
            </a>
          </nav>
        </aside>      

        <div className="flex-1 min-w-0">
          {/* TOP HEADER */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-600">
              <Icon name="Menu" />
            </button>

            <div className="relative w-56 lg:w-96">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Icon name="Search" className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari berdasarkan nama..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-gray-50/50 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs lg:text-sm font-bold tracking-wider text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 uppercase">
                Administrator
              </span>
            </div>
          </header>

          <main className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Dashboard Membership</h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  API Terhubung: {lastUpdate.toLocaleTimeString('id-ID')}
                </p>
              </div>
              <button
                onClick={fetchMembershipData}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                <Icon name={isLoading ? 'Clock' : 'Package'} className="w-4 h-4" />
                {isLoading ? 'Menghubungkan...' : 'Sinkronisasi API'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500">Total Paket</span>
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Icon name="Package" /></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{isLoading ? '...' : classes.length}</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500">Paket Aktif</span>
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><Icon name="Check" /></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{isLoading ? '...' : classes.filter(c => c.status_aktif).length}</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500">Jumlah Semua Member</span>
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Icon name="Users" /></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{isLoading ? '...' : `${totalMembers} Orang`}</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500">Laporan Masuk</span>
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Icon name="MessageSquare" /></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{isLoading ? '...' : `${totalReports} Berkas`}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="xl:col-span-2">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="font-bold text-gray-900">Manajemen Akses Paket</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-medium bg-white focus:outline-none"
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
                        <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/30">
                          <th className="py-4 px-6">Informasi Paket</th>
                          <th className="py-4 px-6">Harga</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                        {isLoading ? (
                          <tr><td colSpan="4" className="py-8 text-center text-gray-400 font-medium">Menghubungkan & memuat API eksternal...</td></tr>
                        ) : displayedClasses.length === 0 ? (
                          <tr><td colSpan="4" className="py-8 text-center text-gray-400 font-medium">Pencarian paket tidak ditemukan.</td></tr>
                        ) : displayedClasses.map(cls => (
                          <tr key={cls.id} className="hover:bg-gray-50/50 transition">
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-900">{cls.nama_paket}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{cls.id} | {cls.kategori} | {cls.level}</div>
                            </td>
                            <td className="py-4 px-6 font-medium text-gray-900">{formatRupiah(cls.harga)}</td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleStatus(cls.id)}
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm transition ${cls.status_aktif ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                {cls.status_aktif ? 'Aktif' : 'Nonaktif'}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => { setEditingClass(cls); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                  <Icon name="Edit" className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(cls)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
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
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm">Prev</button>
                      <span className="text-xs font-medium text-gray-500">Halaman {currentPage} dari {totalPages}</span>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm">Next</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="xl:col-span-1">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 lg:p-6 sticky top-24">
                  <h2 className="font-bold text-gray-900 mb-4">{editingClass ? 'Edit Paket Membership' : 'Tambah Paket Baru'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Paket</label>
                      <input type="text" required value={formData.nama_paket} onChange={(e) => setFormData({ ...formData, nama_paket: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kategori</label>
                        <select value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition bg-white">
                          <option value="Fitness">Fitness</option>
                          <option value="Yoga">Yoga</option>
                          <option value="Martial Arts">Martial Arts</option>
                          <option value="HIIT">HIIT</option>
                          <option value="Aquatic">Aquatic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Level</label>
                        <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition bg-white">
                          <option value="Pemula">Pemula</option>
                          <option value="Menengah">Menengah</option>
                          <option value="Lanjutan">Lanjutan</option>
                          <option value="Semua Level">Semua Level</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Harga (IDR)</label>
                        <input type="number" required value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kuota</label>
                        <input type="number" required value={formData.kuota_maksimal} onChange={(e) => setFormData({ ...formData, kuota_maksimal: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Fasilitas (Pisahkan dengan koma)</label>
                      <input type="text" placeholder="Akses Gym, Locker, Shower" value={formData.fasilitas} onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Deskripsi</label>
                      <textarea rows="3" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      {editingClass && <button type="button" onClick={() => setEditingClass(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Batal</button>}
                      <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-semibold transition shadow-md">{editingClass ? 'Simpan' : 'Tambah Paket'}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}