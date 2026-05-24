import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const formatRupiah = (angka) => 
  new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(angka);

const formatWaktu = (waktu) => {
  if (!waktu) return '-';
  return waktu.substring(0, 5); 
};

const IconTrendingUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconCalendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconBarChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconLoader = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const IconWarning = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const StatCard = React.memo(function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-[#c9a96e]/20 text-[#c9a96e]">
        <Icon />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
});

function FormModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2a2a2a] rounded-lg text-gray-400 hover:text-white transition-colors">
            <IconClose />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function DeleteAlertModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#1a1a1a] border border-red-500/30 rounded-2xl shadow-2xl p-6 text-center animate-scale-in">
        <div className="mx-auto flex justify-center mb-4">
          <IconWarning />
        </div>
        <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">Hapus Data Kelas?</h3>
        <p className="text-sm text-gray-400 mb-6">Tindakan ini tidak dapat dibatalkan. Semua data terkait kelas ini akan dihapus secara permanen dari basis data.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-xl text-sm font-semibold transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-red-600/20">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

const INITIAL_FORM_STATE = {
  nama_kelas: '',
  instruktur: '',
  waktu_mulai: '',
  waktu_selesai: '',
  harga_per_sesi: '',
  kapasitas_maksimal: '',
  status: 'active'
};

function ManajemenKelas() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [page, setPage] = useState(1);
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, id: null });
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('https://api.npoint.io/98e24fd33e9dee7ea83c', { timeout: 10000 });
        const normalized = (Array.isArray(data) ? data : []).map((item, idx) => ({
          id: item.id || `cls-${String(idx + 1).padStart(3, '0')}`,
          nama_kelas: item.nama_kelas || 'Tanpa Nama Kelas',
          instruktur: item.instruktur || 'Belum Ada Instruktur',
          waktu_mulai: item.waktu_mulai || '00:00:00',
          waktu_selesai: item.waktu_selesai || '00:00:00',
          harga_per_sesi: Number(item.harga_per_sesi) || 0,
          kapasitas_maksimal: Number(item.kapasitas_maksimal) || 0,
          status: item.status?.toLowerCase() || 'active'
        }));
        setClasses(normalized);
      } catch (err) {
        console.error('Fetch error:', err);
        setClasses([
          { id:'cls-001', nama_kelas:'Cardio Kickboxing', instruktur:'Gerry Christian', waktu_mulai:'15:00:00', waktu_selesai:'16:00:00', harga_per_sesi:85000, kapasitas_maksimal:20, status:'active' },
          { id:'cls-002', nama_kelas:'Powerlifting Basic', instruktur:'Alex Bro', waktu_mulai:'18:30:00', waktu_selesai:'20:00:00', harga_per_sesi:120000, kapasitas_maksimal:10, status:'active' },
          { id:'cls-003', nama_kelas:'Yoga Flow', instruktur:'Sarah Jenkins', waktu_mulai:'08:00:00', waktu_selesai:'09:00:00', harga_per_sesi:75000, kapasitas_maksimal:15, status:'inactive' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { filtered, totalPages, validPage, paginated } = useMemo(() => {
    const q = search.toLowerCase();
    const result = classes.filter(item => {
      const matchSearch = item.nama_kelas.toLowerCase().includes(q) || item.instruktur.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'Semua Status' || item.status === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });

    const pages = Math.max(1, Math.ceil(result.length / ITEMS_PER_PAGE));
    const currentValidPage = Math.min(page, pages);
    const paginatedItems = result.slice((currentValidPage - 1) * ITEMS_PER_PAGE, currentValidPage * ITEMS_PER_PAGE);

    return { filtered: result, totalPages: pages, validPage: currentValidPage, paginated: paginatedItems };
  }, [classes, search, statusFilter, page]);

  useEffect(() => {
    if (page !== validPage) setPage(validPage);
  }, [validPage, page]);

  const stats = useMemo(() => {
    const active = classes.filter(c => c.status === 'active');
    const totalRevenue = active.reduce((sum, c) => sum + c.harga_per_sesi, 0);
    const avgPrice = active.length ? Math.round(totalRevenue / active.length) : 0;
    const activationRate = classes.length ? Math.round((active.length / classes.length) * 100) : 0;
    return { totalRevenue, avgPrice, activationRate };
  }, [classes]);

  const openAdd = useCallback(() => {
    setEditingClass(null);
    setFormData(INITIAL_FORM_STATE);
    setFormModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingClass(item);
    setFormData({ ...item });
    setFormModalOpen(true);
  }, []);

  const triggerDelete = useCallback((id) => {
    setDeleteModalState({ isOpen: true, id });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteModalState.id) {
      setClasses(prev => prev.filter(item => item.id !== deleteModalState.id));
    }
    setDeleteModalState({ isOpen: false, id: null });
  }, [deleteModalState.id]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    let wMulai = formData.waktu_mulai;
    let wSelesai = formData.waktu_selesai;
    if (wMulai && wMulai.split(':').length === 2) wMulai += ':00';
    if (wSelesai && wSelesai.split(':').length === 2) wSelesai += ':00';

    const payload = {
      ...formData,
      waktu_mulai: wMulai,
      waktu_selesai: wSelesai,
      harga_per_sesi: Number(formData.harga_per_sesi),
      kapasitas_maksimal: Number(formData.kapasitas_maksimal),
    };

    if (editingClass) {
      setClasses(prev => prev.map(item => item.id === editingClass.id ? { ...item, ...payload } : item));
    } else {
      setClasses(prev => {
        const newId = `cls-${String(prev.length + 1).padStart(3, '0')}`;
        return [{ ...payload, id: newId }, ...prev];
      });
    }
    
    setFormModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
  }, [formData, editingClass]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="text-[#c9a96e]"><IconLoader /></div>
          <p className="text-sm">Memuat data API...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-gray-300 p-6 font-sans">
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={IconTrendingUp} label="Total Pendapatan Sesi" value={formatRupiah(stats.totalRevenue)} />
          <StatCard icon={IconCalendar} label="Rata-rata Harga Sesi" value={formatRupiah(stats.avgPrice)} />
          <StatCard icon={IconBarChart} label="Kelas Aktif" value={`${stats.activationRate}%`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold text-white text-center mb-1">Manajemen Kelas Gym</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Kelola jadwal dan harga sesi instruktur</p>
              
              <form className="flex flex-col sm:flex-row gap-3 mb-4" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IconSearch />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari kelas atau instruktur..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:border-[#c9a96e] transition-colors cursor-pointer"
                >
                  <option>Semua Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-[#2a2a2a] text-xs uppercase tracking-wider text-gray-500">
                    <th className="text-left px-6 py-3 font-medium">Kelas & Instruktur</th>
                    <th className="text-left px-6 py-3 font-medium">Jadwal</th>
                    <th className="text-left px-6 py-3 font-medium">Sesi & Kuota</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-[#222] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{item.nama_kelas}</div>
                        <div className="text-xs text-[#c9a96e] font-medium mt-0.5">{item.instruktur}</div>
                        <div className="text-[10px] text-gray-600 mt-1">{item.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{formatWaktu(item.waktu_mulai)} - {formatWaktu(item.waktu_selesai)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{formatRupiah(item.harga_per_sesi)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.kapasitas_maksimal} Orang</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          item.status === 'active' 
                            ? 'bg-[#c9a96e]/10 text-[#c9a96e] border-[#c9a96e]/30' 
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-[#c9a96e]/10 rounded-lg text-gray-400 hover:text-[#c9a96e] transition-colors" title="Edit">
                            <IconEdit />
                          </button>
                          <button onClick={() => triggerDelete(item.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors" title="Hapus">
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-600 text-sm">
                        Tidak ada data yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a]">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-xs font-medium bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Prev
                </button>
                <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-xs font-medium bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 h-fit">
            <h2 className="text-lg font-semibold text-white mb-1">Tambah Kelas Baru</h2>
            <p className="text-sm text-gray-500 mb-6">Jadwalkan sesi kelas dan instruktur baru</p>
            
            <button onClick={openAdd}
              className="w-full py-3 bg-[#c9a96e] hover:bg-[#b8985d] text-[#0f0f0f] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              <IconPlus />
              Tambah Kelas
            </button>

            <div className="mt-6 pt-6 border-t border-[#2a2a2a] space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Kelas</span>
                <span className="text-white font-medium">{classes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kelas Aktif</span>
                <span className="text-[#c9a96e] font-medium">{classes.filter(i => i.status === 'active').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kelas Nonaktif</span>
                <span className="text-gray-400 font-medium">{classes.filter(i => i.status === 'inactive').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FormModal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} title={editingClass ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Kelas'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Nama Kelas</label>
              <input 
                name="nama_kelas" 
                value={formData.nama_kelas}
                onChange={handleInputChange}
                required
                placeholder="Cth: Cardio Kickboxing"
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a96e] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Instruktur</label>
              <input 
                name="instruktur" 
                value={formData.instruktur}
                onChange={handleInputChange}
                required
                placeholder="Cth: Gerry Christian"
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a96e] transition-colors" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Waktu Mulai</label>
              <input 
                type="time"
                name="waktu_mulai" 
                value={formData.waktu_mulai}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:border-[#c9a96e] transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Waktu Selesai</label>
              <input 
                type="time"
                name="waktu_selesai" 
                value={formData.waktu_selesai}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:border-[#c9a96e] transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Harga Per Sesi (IDR)</label>
              <input 
                type="number" 
                name="harga_per_sesi" 
                value={formData.harga_per_sesi}
                onChange={handleInputChange}
                required 
                min="0" 
                placeholder="85000"
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a96e] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Kapasitas Maksimal</label>
              <input 
                type="number" 
                name="kapasitas_maksimal" 
                value={formData.kapasitas_maksimal}
                onChange={handleInputChange}
                required 
                min="1" 
                placeholder="20"
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a96e] transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Status Kelas</label>
            <div className="flex gap-3">
              {['active', 'inactive'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider border transition-all ${
                    formData.status === s
                      ? s === 'active' 
                        ? 'bg-[#c9a96e]/20 border-[#c9a96e] text-[#c9a96e]' 
                        : 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-[#0f0f0f] border-[#2a2a2a] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-3 bg-[#c9a96e] hover:bg-[#b8985d] text-[#0f0f0f] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas Baru'}
            </button>
          </div>
        </form>
      </FormModal>

      <DeleteAlertModal 
        isOpen={deleteModalState.isOpen} 
        onClose={() => setDeleteModalState({ isOpen: false, id: null })} 
        onConfirm={confirmDelete} 
      />
    </main>
  );
}

export default ManajemenKelas;