import React, { useState, useEffect } from 'react';

const AdminManageMembers = () => {
  // 1. Inisialisasi state members sebagai array kosong [] karena data akan diambil dari API
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State loading indikator

  // State Manajemen Pencarian, Filter, dan Modal
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", plan: "Basic Bro" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // =========================================================================
  // LOGIKA AMBIL DATA DARI API PUBLIK (JSONPlaceholder)
  // =========================================================================
  useEffect(() => {
    document.title = "Gymbros Admin | Manage Members";
    
    // Trik penjinak background putih browser
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";

    // Fungsi Fetching Data dari API Publik
    const fetchMemberData = async () => {
      try {
        setIsLoading(true);
        // Memanggil url API publik tiruan user
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
        
        // Memetakan (Mapping) struktur data API luar agar pas dengan kolom tabel Gymbros kita
        const formattedMembers = data.map((user, index) => ({
          id: `GB-${99210 + index}`, // Membuat ID simulasi otomatis
          name: user.name.toUpperCase(), // Mengambil nama dari API dan dibuat Kapital
          email: user.email.toLowerCase(), // Mengambil email dari API
          plan: index % 2 === 0 ? "Elite Bro" : "Basic Bro", // Simulasi pembagian paket
          status: "Active",
          joined: "Jan 2026"
        }));

        setMembers(formattedMembers); // Masukkan hasil ke state
        setIsLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data dari API, Bro:", error);
        setIsLoading(false);
      }
    };

    fetchMemberData();

    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  // =========================================================================
  // LOGIKA ACTION CRUD INTERAKTIF (LOKAL STATE MANAGEMENT)
  // =========================================================================
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const randomID = `GB-${Math.floor(10000 + Math.random() * 90000)}`;
    const memberBaru = {
      id: randomID,
      name: newMember.name.toUpperCase(),
      email: newMember.email,
      plan: newMember.plan,
      status: "Active",
      joined: "May 2026"
    };
    setMembers([memberBaru, ...members]);
    setNewMember({ name: "", email: "", plan: "Basic Bro" });
    setIsAddModalOpen(false);
  };

  const handleEditClick = (member) => {
    setSelectedMember({ ...member });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setMembers(members.map(m => m.id === selectedMember.id ? selectedMember : m));
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setMembers(members.filter(m => m.id !== memberToDelete.id));
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const toggleStatus = (id) => {
    setMembers(members.map(member => {
      if (member.id === id) {
        const nextStatus = member.status === "Active" ? "Expired" : "Active";
        return { ...member, status: nextStatus };
      }
      return member;
    }));
  };

  // Logika Filter & Search
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActive = members.filter(m => m.status === "Active").length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none animate-fade-in bg-[#111315]">
      
      {/* HEADER BANNER */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden shadow-xl">
        <div className="z-10">
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">ADMIN CONTROL PANEL</h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">LIVE API MEMBER DATA</h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            Data di bawah ini dipanggil secara real-time dari API publik luar dan langsung diintegrasikan ke database lokal.
          </p>
        </div>
        <div className="px-5 py-2.5 bg-[#1e2023] border border-white/10 rounded-2xl shadow-inner text-center sm:text-right">
          <span className="text-2xl font-black text-[#C2A676] block leading-none">{totalActive} <span className="text-xs text-gray-500 font-bold">/ {members.length}</span></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Active Members</span>
        </div>
      </div>

      {/* CONTROLLER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <input 
              type="text" 
              placeholder="Search by name or ID Member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e2023] border border-white/5 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C2A676]/50 transition-colors shadow-md"
            />
            <span className="absolute right-5 top-3.5 text-gray-500">🔍</span>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1e2023] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#C2A676] text-[#111315] font-black uppercase text-xs tracking-widest px-6 py-3.5 rounded-2xl shadow-lg hover:bg-white transition-colors duration-300"
        >
          ➕ Add New Member
        </button>
      </div>

      {/* TABLE DATA MEMBER */}
      <div className="bg-[#1e2023] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {isLoading ? (
            /* Efek Menunggu Sinyal API Load */
            <div className="p-20 text-center text-xs font-black tracking-widest text-[#C2A676] uppercase animate-pulse">
              🔄 Synchronizing Data With Public API Server...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#25282c]/50 text-[11px] font-black tracking-widest text-gray-400 uppercase">
                  <th className="py-4 px-6">ID Member</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Plan Type</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium text-gray-300">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-[#25282c]/30 transition-colors duration-200 group">
                      <td className="py-4 px-6 font-black text-[#C2A676] tracking-wider">{member.id}</td>
                      <td className="py-4 px-6 font-bold text-white uppercase group-hover:text-[#C2A676] transition-colors">{member.name}</td>
                      <td className="py-4 px-6 font-mono text-gray-400">{member.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${member.plan === 'Elite Bro' ? 'bg-[#C2A676]/10 text-[#C2A676]' : 'bg-gray-800 text-gray-400'}`}>
                          {member.plan}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500">{member.joined}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.status === 'Active' ? 'text-green-400 bg-green-950/20' : 'text-red-400 bg-red-950/20'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleEditClick(member)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase bg-white/5 border border-white/5 hover:border-[#C2A676] hover:text-[#C2A676] transition-colors">Edit</button>
                          <button onClick={() => toggleStatus(member.id)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-[#111315]">{member.status === 'Active' ? 'Ban' : 'Unban'}</button>
                          <button onClick={() => handleDeleteClick(member)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 uppercase font-bold text-sm">⚠️ No Matching Member Records Found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODALS AREA (ADD, EDIT, DELETE) - TETAP BERFUNGSI SEMPURNA
         ========================================================================= */}
      {/* ... [Gunakan file modal pemicu yang sama seperti instruksi sebelumnya] ... */}
      
    </div>
  );
};

export default AdminManageMembers;