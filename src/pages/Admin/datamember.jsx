import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SCROLLBAR_STYLES = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #1e2023; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #C2A676; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4b88a; }
`;

const INITIAL_EDIT_STATE = { id: "", name: "", email: "", plan: "Basic Bro", status: "Active" };

const AdminManageMembers = () => {  
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({ search: "", status: "All", page: 1 });
  const ITEMS_PER_PAGE = 10;

  const [modalState, setModalState] = useState({ type: null, payload: null });
  const [editForm, setEditForm] = useState(INITIAL_EDIT_STATE);

  // 1. FUNGSI TARIK DATA (READ)
  // PERBAIKAN: Menambahkan parameter isBackgroundFetch agar tidak memunculkan animasi loading terus-menerus
  const fetchMemberData = useCallback(async (isBackgroundFetch = false) => {
    try {
      if (!isBackgroundFetch) setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Sesi berakhir. Silakan login kembali!");
        return navigate('/login');
      }

      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:5000/api/v1/users', apiConfig);
      const rawData = response.data.data || response.data;

      // PERBAIKAN: Memperbaiki penamaan field sesuai dengan toJSON() pada User.js Backend
      const formattedMembers = rawData.map(user => ({
        id: user.idUser || user.id, // Sesuai field backend
        name: (user.namaLengkap || 'Tanpa Nama').toUpperCase(),
        email: user.email ? user.email.toLowerCase() : '',
        plan: user.peran || "Anggota", 
        status: user.statusAkun === 'Aktif' ? 'Active' : 'Expired', // PERBAIKAN: Menggunakan statusAkun, bukan status
        joined: user.dibuatPada ? new Date(user.dibuatPada).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Baru',
        image: user.fotoProfil || null // PERBAIKAN: Menggunakan fotoProfil, bukan avatar
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Gagal menarik data anggota:", error);
    } finally {
      if (!isBackgroundFetch) setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Gymbros Admin | Manage Members";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";

    fetchMemberData(false); // Fetch pertama kali dengan animasi loading

    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, [fetchMemberData]);

  const openModal = useCallback((type, payload) => {
    setModalState({ type, payload });
    if (type === 'EDIT') setEditForm({ ...payload });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null, payload: null });
    setEditForm(INITIAL_EDIT_STATE);
  }, []);

  // 2. FUNGSI EDIT DATA (PUT)
  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        namaLengkap: editForm.name,
        email: editForm.email,
        peran: editForm.plan,
        status: editForm.status === 'Active' ? 'Aktif' : 'Nonaktif'
      };

      await axios.put(`http://localhost:5000/api/v1/users/${editForm.id}`, payload, apiConfig);
      
      // Sinkronisasi data di latar belakang agar tabel tidak kedip
      await fetchMemberData(true);
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui data anggota dari server!");
    }
  }, [editForm, fetchMemberData, closeModal]);

  // 3. FUNGSI HAPUS DATA (DELETE)
  const confirmDelete = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`http://localhost:5000/api/v1/users/${modalState.payload.id}`, apiConfig);
      
      await fetchMemberData(true);
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus anggota secara permanen!");
    }
  }, [modalState.payload, fetchMemberData, closeModal]);

  // 4. FUNGSI BAN/UNBAN (PATCH STATUS)
  const toggleStatus = useCallback(async (id) => {
    const target = members.find(m => m.id === id);
    if (!target) return;
    
    const newStatus = target.status === 'Active' ? 'Nonaktif' : 'Aktif';
    
    try {
      const token = localStorage.getItem('token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      // Kirim pembaruan ke backend
      await axios.patch(`http://localhost:5000/api/v1/users/${id}/status`, { status: newStatus }, apiConfig);
      
      // PERBAIKAN: Fetch data ulang di latar belakang (Background Fetch = true)
      // Ini akan mencegah layar berkedip saat tombol di klik
      await fetchMemberData(true); 
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah status member!");
    }
  }, [members, fetchMemberData]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, ...(key !== 'page' && { page: 1 }) }));
  }, []);

  const { filteredMembers, paginatedMembers, totalPages, totalActive } = useMemo(() => {
    const searchLower = filters.search.toLowerCase();
    
    const filtered = members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchLower) || member.id.toString().toLowerCase().includes(searchLower);
      const matchesStatus = filters.status === "All" || member.status.toLowerCase() === filters.status.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    return {
      filteredMembers: filtered,
      paginatedMembers: filtered.slice((filters.page - 1) * ITEMS_PER_PAGE, filters.page * ITEMS_PER_PAGE),
      totalPages: Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)),
      totalActive: members.filter(m => m.status === "Active").length
    };
  }, [members, filters]);

  const getStatusStyle = (status) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'text-green-400 bg-green-950/20';
    if (s === 'pending') return 'text-yellow-400 bg-yellow-950/20';
    return 'text-red-400 bg-red-950/20';
  };

  return (
    <main className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none bg-[#111315] relative z-30 pointer-events-auto p-4 md:p-6">
      <style>{SCROLLBAR_STYLES}</style>

      {/* HEADER KONTROL PANEL */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden shadow-xl">
        <div>
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">ADMIN CONTROL PANEL</h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">LIVE API MANAGEMENT</h3>
        </div>
        <div className="px-5 py-2.5 bg-[#1e2023] border border-white/10 rounded-2xl shadow-inner text-center sm:text-right">
          <span className="text-2xl font-black text-[#C2A676] block leading-none">{totalActive} <span className="text-xs text-gray-500 font-bold">/ {members.length}</span></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Active Members</span>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by name or ID Member..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-[#1e2023] border border-white/5 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C2A676]/50 transition-colors shadow-md"
            />
            <span className="absolute right-5 top-3.5">🔍</span>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-[#1e2023] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none shadow-md cursor-pointer text-gray-300"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Banned / Expired</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/tambahmember')}
          className="px-6 py-3 bg-[#C2A676] text-[#111315] hover:bg-[#d4b88a] rounded-2xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg whitespace-nowrap"
        >
          + Add Member
        </button>       
      </div>

      {/* TABEL DATA MEMBER */}
      <div className="bg-[#1e2023] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-20 text-center text-xs font-black tracking-widest text-[#C2A676] uppercase animate-pulse">
            🔄 Menghubungkan ke Database Utama...
          </div>
        ) : (
          <div className="overflow-auto max-h-[520px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="border-b border-white/10 bg-[#25282c] text-[11px] font-black tracking-widest text-gray-400 uppercase shadow-lg shadow-black/20">
                  <th className="py-4 px-6">ID Member</th>
                  <th className="py-4 px-6">Profile</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Plan Type</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium text-gray-300">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-[#25282c]/30 transition-colors duration-200">
                      <td className="py-4 px-6 font-black text-[#C2A676] tracking-wider">{member.id}</td>
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-full border-2 border-[#C2A676]/30 bg-[#25282c] flex items-center justify-center overflow-hidden">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-black text-[#C2A676]">
                              {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-white uppercase">{member.name}</td>
                      <td className="py-4 px-6 font-mono text-gray-400">{member.email}</td>
                      <td className="py-4 px-6 text-gray-300">{member.plan}</td>
                      <td className="py-4 px-6 text-gray-500">{member.joined}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openModal('EDIT', member)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase bg-white/5 border border-white/5 hover:border-[#C2A676] hover:text-[#C2A676] transition-colors">Edit</button>
                          
                          {/* TOMBOL BAN / UNBAN */}
                          <button onClick={() => toggleStatus(member.id)} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-colors ${member.status.toLowerCase() === 'active' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-[#111315]' : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-[#111315]'}`}>
                            {member.status.toLowerCase() === 'active' ? 'Ban' : 'Unban'}
                          </button>

                          <button onClick={() => openModal('DELETE', member)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500 uppercase font-bold text-sm">⚠️ No Matching Records Found in Database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && filteredMembers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#1a1c1f]">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Page {filters.page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-3 py-1.5 rounded-lg bg-[#25282c] border border-white/5 text-[10px] font-black uppercase text-gray-400 hover:text-white hover:border-[#C2A676]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-black transition-colors ${filters.page === page ? 'bg-[#C2A676] text-[#111315]' : 'bg-[#25282c] text-gray-400 hover:text-white border border-white/5'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#25282c] border border-white/5 text-[10px] font-black uppercase text-gray-400 hover:text-white hover:border-[#C2A676]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT DATA */}
      {modalState.type === 'EDIT' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-md rounded-3xl bg-[#1e2023] p-6 shadow-2xl border border-white/10 text-left z-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black text-[#C2A676] uppercase tracking-widest">MEMBER PROFILE EDIT</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">Update Member Data</h3>
              </div>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ID Member (Permanent)</label>
                <input type="text" value={editForm.id} disabled className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-gray-500 font-black cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value.toUpperCase() }))} required className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C2A676]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} required className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C2A676]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role / Plan</label>
                <select value={editForm.plan} onChange={(e) => setEditForm(p => ({ ...p, plan: e.target.value }))} className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C2A676]/50 transition-colors">
                  <option value="Admin">Admin</option>
                  <option value="Anggota">Anggota</option>
                  <option value="Pelatih">Pelatih</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Account</label>
                <select value={editForm.status} onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C2A676]/50 transition-colors">
                  <option value="Active">Active</option>
                  <option value="Expired">Nonaktif / Banned</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl bg-[#25282c] px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-[#333333] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-[#C2A676] px-4 py-2.5 text-xs font-black uppercase text-[#111315] hover:bg-[#d4b88a] transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS DATA */}
      {modalState.type === 'DELETE' && modalState.payload && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-sm rounded-3xl bg-[#1e2023] p-6 text-center shadow-2xl border border-white/10 z-50">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-bold text-lg">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Delete Member Record</h3>
            <p className="text-xs text-gray-400 px-2 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus permanen data <span className="text-white font-bold">{modalState.payload.name}</span> ({modalState.payload.id})? Database akan terhapus selamanya.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={closeModal} className="flex-1 rounded-xl bg-[#25282c] px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-[#333333] transition-colors">Batal</button>
              <button type="button" onClick={confirmDelete} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-red-500 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </main> 
  );
};

export default AdminManageMembers;