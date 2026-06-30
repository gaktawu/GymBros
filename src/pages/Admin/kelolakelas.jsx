import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const formatRupiah = (angka) => 
  new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(angka);

const formatWaktu = (waktu) => {
  if (!waktu) return '-';
  return waktu.substring(0, 5); 
};

// --- ICON COMPONENTS ---
const IconTrendingUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
const IconCalendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const IconBarChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IconWarning = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

// --- UI COMPONENTS ---
const StatCard = React.memo(function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-[#c9a96e]/30 transition-colors">
      <div className="p-3 rounded-lg bg-[#c9a96e]/10 text-[#c9a96e]">
        <Icon />
      </div>
      <div>
        <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  );
});

function FormModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-black tracking-wide text-white uppercase">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2a2a2a] rounded-lg text-gray-400 hover:text-white transition-colors">
            <IconClose />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// 💥 MODAL HAPUS GYMBROS STYLE 💥
function DeleteAlertModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#1a1c1e] border border-white/10 rounded-3xl shadow-2xl p-6 text-center animate-scale-in z-50">
        <div className="mx-auto flex justify-center mb-5 mt-2">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
             <IconWarning />
          </div>
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Hapus Data Kelas?</h3>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed px-2">Tindakan ini tidak dapat dibatalkan. Semua jadwal dan data terkait kelas ini akan dihapus secara permanen dari basis data Gymbros.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-[#25282c] border border-white/5 hover:bg-[#333] text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-red-600/20">Ya, Hapus</button>
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
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [page, setPage] = useState(1);
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  
  // STATE: Untuk Modal Delete Custom
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, id: null });
  
  // STATE: Untuk Fitur Lihat Peserta Kelas
  const [participantsModal, setParticipantsModal] = useState({ isOpen: false, className: '', list: [] });
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const ITEMS_PER_PAGE = 5;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5000/api/v1/classes', apiConfig);
      const rawData = data.data || data;
      
      const normalized = (Array.isArray(rawData) ? rawData : []).map(item => ({
        id: item.id_kelas || item.id,
        nama_kelas: item.nama_kelas || item.namaKelas || 'Tanpa Nama',
        instruktur: item.instruktur || 'Belum Ada Instruktur',
        waktu_mulai: item.waktu_mulai || item.waktuMulai || '00:00:00',
        waktu_selesai: item.waktu_selesai || item.waktuSelesai || '00:00:00',
        harga_per_sesi: Number(item.harga_per_sesi || item.hargaPerSesi) || 0,
        kapasitas_maksimal: Number(item.kapasitas_maksimal || item.kapasitasMaksimal) || 0,
        status: (item.status_aktif || item.status) === 'Tersedia' || item.status === 'active' ? 'active' : 'inactive'
      }));
      
      setClasses(normalized);
    } catch (err) {
      console.error('Fetch error:', err);
      setClasses([]); 
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Gymbros Admin | Manage Classes";
    fetchData();
  }, [fetchData]);

  const { filtered, totalPages, validPage, paginated } = useMemo(() => {
    const q = search.toLowerCase();
    const result = classes.filter(item => {
      const matchSearch = item.nama_kelas.toLowerCase().includes(q) || item.instruktur.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'Semua Status' || item.status === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });

    const pages = Math.max(1, Math.ceil(result.length / ITEMS_PER_PAGE));
    const currentValidPage = Math.min(page, pages);
    return { filtered: result, totalPages: pages, validPage: currentValidPage, paginated: result.slice((currentValidPage - 1) * ITEMS_PER_PAGE, currentValidPage * ITEMS_PER_PAGE) };
  }, [classes, search, statusFilter, page]);

  const handleViewParticipants = async (cls) => {
    setParticipantsModal({ isOpen: true, className: cls.nama_kelas, list: [] });
    setLoadingParticipants(true);
    try {
      const token = localStorage.getItem('token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/v1/classes/${cls.id}/participants`, apiConfig);
      setParticipantsModal(prev => ({ ...prev, list: data.data || data || [] }));
    } catch (error) {
      setParticipantsModal(prev => ({ ...prev, list: [] }));
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let wMulai = formData.waktu_mulai;
    let wSelesai = formData.waktu_selesai;
    if (wMulai && wMulai.split(':').length === 2) wMulai += ':00';
    if (wSelesai && wSelesai.split(':').length === 2) wSelesai += ':00';

    const payload = {
      namaKelas: formData.nama_kelas,
      instruktur: formData.instruktur,
      waktuMulai: wMulai,
      waktuSelesai: wSelesai,
      hargaPerSesi: Number(formData.harga_per_sesi),
      kapasitasMaksimal: Number(formData.kapasitas_maksimal),
      statusAktif: formData.status === 'active' ? 'Tersedia' : 'Tidak Tersedia'
    };

    try {
      const token = localStorage.getItem('token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      if (editingClass) {
        await axios.put(`http://localhost:5000/api/v1/classes/${editingClass.id}`, payload, apiConfig);
      } else {
        await axios.post('http://localhost:5000/api/v1/classes', payload, apiConfig);
      }
      setFormModalOpen(false);
      setFormData(INITIAL_FORM_STATE);
      await fetchData(); 
    } catch (error) {
      alert("Gagal menyimpan jadwal kelas ke server!");
    } finally {
      setIsSaving(false);
    }
  }, [formData, editingClass, fetchData]);

  // FUNGSI UNTUK MEMUNCULKAN MODAL DELETE CUSTOM
  const triggerDelete = (id) => {
    setDeleteModalState({ isOpen: true, id });
  };

  // FUNGSI AKSEKUSI DELETE SETELAH DIKONFIRMASI
  const confirmDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/v1/classes/${deleteModalState.id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (error) {
      alert("Gagal menghapus kelas!");
    } finally {
      setDeleteModalState({ isOpen: false, id: null });
    }
  };

  return (
    <main className="min-h-screen bg-[#111315] text-[#E0E0E0] p-6 font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e2023; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C2A676; border-radius: 3px; }
        @keyframes scaleIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex justify-between items-center shadow-xl">
          <div>
            <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">ADMIN CONTROL PANEL</h4>
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">MANAJEMEN KELAS & JADWAL</h3>
          </div>
          <button onClick={() => { setEditingClass(null); setFormData(INITIAL_FORM_STATE); setFormModalOpen(true); }}
            className="px-6 py-3 bg-[#c9a96e] hover:bg-[#b8985d] text-[#111315] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg flex items-center gap-2">
            <IconPlus /> Tambah Kelas
          </button>
        </div>

        {/* TABEL DATA KELAS */}
        <div className="bg-[#1e2023] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex gap-4">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><IconSearch /></div>
              <input type="text" placeholder="Cari nama kelas atau instruktur..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#c9a96e] transition-colors" />
            </div>
          </div>

          {loading ? (
             <div className="p-20 text-center text-[#c9a96e] animate-pulse font-bold tracking-widest uppercase text-xs">Memuat Data Kelas...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#25282c] border-b border-white/10 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Informasi Kelas</th>
                    <th className="px-6 py-4">Jadwal & Sesi</th>
                    <th className="px-6 py-4">Kapasitas</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-[#25282c]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white uppercase">{item.nama_kelas}</div>
                        <div className="text-xs text-[#c9a96e] font-medium mt-1">Instruktur: {item.instruktur}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-mono bg-white/5 inline-block px-2 py-1 rounded text-xs">
                          {formatWaktu(item.waktu_mulai)} - {formatWaktu(item.waktu_selesai)}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">{formatRupiah(item.harga_per_sesi)} / Sesi</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-gray-300 bg-[#111315] border border-white/10 px-3 py-1.5 rounded-lg inline-block">
                          Maks {item.kapasitas_maksimal} Orang
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'active' ? 'bg-[#c9a96e]/10 text-[#c9a96e]' : 'bg-red-500/10 text-red-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleViewParticipants(item)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Lihat Peserta">
                            <IconUsers />
                          </button>
                          <button onClick={() => { setEditingClass(item); setFormData(item); setFormModalOpen(true); }} className="p-2 bg-white/5 text-gray-400 hover:text-[#c9a96e] hover:border-[#c9a96e] border border-transparent rounded-lg transition-colors" title="Edit">
                            <IconEdit />
                          </button>
                          {/* DI SINI PERUBAHANNYA: MENGGUNAKAN TRIGGER MODAL CUSTOM */}
                          <button onClick={() => triggerDelete(item.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Hapus">
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">Belum ada jadwal kelas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL LIHAT PESERTA KELAS */}
      <FormModal isOpen={participantsModal.isOpen} onClose={() => setParticipantsModal({ isOpen: false, className: '', list: [] })} title={`Peserta: ${participantsModal.className}`}>
        {loadingParticipants ? (
          <div className="py-10 text-center text-[#c9a96e] text-xs font-bold tracking-widest uppercase animate-pulse">Menarik Data Peserta...</div>
        ) : participantsModal.list.length > 0 ? (
          <div className="space-y-3">
            {participantsModal.list.map((peserta, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#111315] border border-white/5 rounded-xl">
                <div>
                  <p className="font-bold text-white text-sm uppercase">{peserta.namaLengkap || peserta.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{peserta.email || 'Tidak ada email'}</p>
                </div>
                <span className="text-[10px] bg-[#c9a96e]/20 text-[#c9a96e] px-3 py-1 rounded-full font-black uppercase">Terdaftar</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500 text-sm font-medium">Belum ada member yang mendaftar di kelas ini.</p>
          </div>
        )}
      </FormModal>

      {/* MODAL FORM TAMBAH/EDIT */}
      <FormModal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} title={editingClass ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Kelas'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nama Kelas</label>
              <input name="nama_kelas" value={formData.nama_kelas} onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})} required className="w-full px-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white focus:border-[#c9a96e] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Instruktur</label>
              <input name="instruktur" value={formData.instruktur} onChange={(e) => setFormData({...formData, instruktur: e.target.value})} required className="w-full px-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white focus:border-[#c9a96e] focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Waktu Mulai</label>
              <input type="time" name="waktu_mulai" value={formData.waktu_mulai} onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})} required className="w-full px-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white [color-scheme:dark] focus:border-[#c9a96e] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Waktu Selesai</label>
              <input type="time" name="waktu_selesai" value={formData.waktu_selesai} onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})} required className="w-full px-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white [color-scheme:dark] focus:border-[#c9a96e] focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Harga Per Sesi</label>
              <input type="number" name="harga_per_sesi" value={formData.harga_per_sesi} onChange={(e) => setFormData({...formData, harga_per_sesi: e.target.value})} required className="w-full px-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white focus:border-[#c9a96e] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kapasitas Maksimal</label>
              <input type="number" name="kapasitas_maksimal" value={formData.kapasitas_maksimal} onChange={(e) => setFormData({...formData, kapasitas_maksimal: e.target.value})} required className="w-full px-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white focus:border-[#c9a96e] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status Kelas</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-[#111315] border border-white/5 rounded-xl text-sm text-white focus:border-[#c9a96e] focus:outline-none">
              <option value="active">Tersedia / Aktif</option>
              <option value="inactive">Tidak Tersedia</option>
            </select>
          </div>
          <button type="submit" disabled={isSaving} className="w-full py-4 bg-[#c9a96e] hover:bg-[#b8985d] text-[#111315] font-black uppercase tracking-widest rounded-xl mt-4">
            {isSaving ? 'Menyimpan...' : 'Simpan Data Kelas'}
          </button>
        </form>
      </FormModal>

      {/* MODAL HAPUS DIPANGGIL DI SINI */}
      <DeleteAlertModal 
        isOpen={deleteModalState.isOpen} 
        onClose={() => setDeleteModalState({ isOpen: false, id: null })} 
        onConfirm={confirmDelete} 
      />
    </main>
  );
}

export default ManajemenKelas;