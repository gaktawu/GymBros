import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminManageMembers = () => {
  const [members, setMembers] = useState([
    { id: "GB-99210", name: "ALEXANDER BRO", email: "alex@gymbros.com", plan: "Elite Bro", status: "Active", joined: "Jan 2026" },
    { id: "GB-99211", name: "BUDI SQUAT", email: "budi@gymbros.com", plan: "Basic Bro", status: "Active", joined: "Feb 2026" },
    { id: "GB-99212", name: "CHRIS GAINS", email: "chris@gymbros.com", plan: "Elite Bro", status: "Pending", joined: "Mar 2026" }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState({ id: "", name: "", email: "", plan: "Basic Bro", status: "Active" });
  const [newMember, setNewMember] = useState({ name: "", email: "", plan: "Basic Bro" });
  const [memberToDelete, setMemberToDelete] = useState({ id: "", name: "" });

  useEffect(() => {
    document.title = "Gymbros Admin | Manage Members";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";

    const fetchMemberData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://dummyjson.com/users?limit=10');
        
        const formattedMembers = response.data.users.map((user, index) => ({
          id: `GB-${99200 + user.id}`,
          name: `${user.firstName} ${user.lastName}`.toUpperCase(),
          email: user.email.toLowerCase(),
          plan: user.age > 30 ? "Elite Bro" : "Basic Bro",
          status: index % 4 === 0 ? "Expired" : "Active",
          joined: "Jan 2026"
        }));

        setMembers(formattedMembers);
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

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const randomID = `GB-${Math.floor(10000 + Math.random() * 90000)}`;
    const memberBaru = {
      id: randomID,
      name: newMember.name.toUpperCase(),
      email: newMember.email.toLowerCase(),
      plan: newMember.plan,
      status: "Active",
      joined: "May 2026"
    };
    
    setMembers([memberBaru, ...members]);
    setNewMember({ name: "", email: "", plan: "Basic Bro" });
    setIsAddModalOpen(false);
  };

  const handleEditClick = (e, member) => {
    e.preventDefault();
    e.stopPropagation(); // Amankan klik dari hambatan luar
    setSelectedMember({ ...member });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setMembers((prev) =>
      prev.map((m) => (m.id === selectedMember.id ? { ...selectedMember } : m))
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = (e, member) => {
    e.preventDefault();
    e.stopPropagation(); // Amankan klik dari hambatan luar
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = (e) => {
    e.preventDefault();
    setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
    setIsDeleteModalOpen(false);
  };

  const toggleStatus = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === id) {
          const nextStatus = member.status === "Active" ? "Expired" : "Active";
          return { ...member, status: nextStatus };
        }
        return member;
      })
    );
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || member.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalActive = members.filter(m => m.status === "Active").length;

  return (
    /* ⚡ PERUBAHAN KRUSIAL: z-30 dan pointer-events-auto memaksa halaman ini bisa diklik menebus rintangan invisibel */
    <div className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none bg-[#111315] relative z-30 pointer-events-auto">
      
      {/* BANNER */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden shadow-xl">
        <div>
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">ADMIN CONTROL PANEL</h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">LIVE API MANAGEMENT</h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            Database keanggotaan sinkron secara real-time via Axios. Anda dapat menambahkan, mengubah profil, atau mencabut hak akses member.
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
            <span className="absolute right-5 top-3.5">🔍</span>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1e2023] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none shadow-md cursor-pointer text-gray-300"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
        
        {/* TOMBOL TAMBAH */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#C2A676] text-[#111315] font-black uppercase text-xs tracking-widest px-6 py-3.5 rounded-2xl shadow-lg hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer relative z-40"
        >
          <span>➕</span> Add New Member
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e2023] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-xs font-black tracking-widest text-[#C2A676] uppercase animate-pulse">
              🔄 Axios Synchronizing With DummyJSON Server...
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
                    <tr key={member.id} className="hover:bg-[#25282c]/30 transition-colors duration-200">
                      <td className="py-4 px-6 font-black text-[#C2A676] tracking-wider">{member.id}</td>
                      <td className="py-4 px-6 font-bold text-white uppercase">{member.name}</td>
                      <td className="py-4 px-6 font-mono text-gray-400">{member.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${member.plan === 'Elite Bro' ? 'bg-[#C2A676]/10 text-[#C2A676]' : 'bg-gray-800 text-gray-400'}`}>
                          {member.plan}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500">{member.joined}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${member.status.toLowerCase() === 'active' ? 'text-green-400 bg-green-950/20' : 
                            member.status.toLowerCase() === 'pending' ? 'text-yellow-400 bg-yellow-950/20' : 'text-red-400 bg-red-950/20'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={(e) => handleEditClick(e, member)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase bg-white/5 border border-white/5 hover:border-[#C2A676] hover:text-[#C2A676] cursor-pointer">Edit</button>
                          <button type="button" onClick={(e) => toggleStatus(e, member.id)} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-colors ${member.status.toLowerCase() === 'active' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-[#111315]' : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-[#111315]'}`}>{member.status.toLowerCase() === 'active' ? 'Ban' : 'Unban'}</button>
                          <button type="button" onClick={(e) => handleDeleteClick(e, member)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 uppercase font-bold text-sm">⚠️ No Matching Records Found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL 1: TAMBAH MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-3xl bg-[#1e2023] p-6 shadow-2xl border border-white/10 text-left z-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black text-[#C2A676] uppercase tracking-widest">REGISTRATION DESK</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">Add New Gym Member</h3>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" placeholder="E.G. JOHN DOE" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} required className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" placeholder="johndoe@example.com" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} required className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Membership</label>
                <select value={newMember.plan} onChange={(e) => setNewMember({ ...newMember, plan: e.target.value })} className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none">
                  <option value="Basic Bro">Basic Bro</option>
                  <option value="Elite Bro">Elite Bro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl bg-[#25282c] px-4 py-2.5 text-xs font-black uppercase text-white">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-[#C2A676] px-4 py-2.5 text-xs font-black uppercase text-[#111315]">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MEMBER */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-3xl bg-[#1e2023] p-6 shadow-2xl border border-white/10 text-left z-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black text-[#C2A676] uppercase tracking-widest">MEMBER PROFILE EDIT</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">Update Member Data</h3>
              </div>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ID Member (Permanent)</label>
                <input type="text" value={selectedMember.id} disabled className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-gray-500 font-black" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" value={selectedMember.name || ""} onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value.toUpperCase() })} required className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={selectedMember.email || ""} onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })} required className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Membership</label>
                <select value={selectedMember.plan || "Basic Bro"} onChange={(e) => setSelectedMember({ ...selectedMember, plan: e.target.value })} className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none" >
                  <option value="Basic Bro">Basic Bro</option>
                  <option value="Elite Bro">Elite Bro</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Account</label>
                <select value={selectedMember.status || "Active"} onChange={(e) => setSelectedMember({ ...selectedMember, status: e.target.value })} className="w-full bg-[#25282c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none" >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl bg-[#25282c] px-4 py-2.5 text-xs font-black uppercase text-white">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-[#C2A676] px-4 py-2.5 text-xs font-black uppercase text-[#111315]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS */}
      {isDeleteModalOpen && memberToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative w-full max-w-sm rounded-3xl bg-[#1e2023] p-6 text-center shadow-2xl border border-white/10 z-50">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-bold text-lg">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Delete Member Record</h3>
            <p className="text-xs text-gray-400 px-2 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus permanen data <span className="text-white font-bold">{memberToDelete.name}</span> ({memberToDelete.id})? Database akan terhapus selamanya.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-xl bg-[#25282c] px-4 py-2.5 text-xs font-black uppercase text-white">Batal</button>
              <button type="button" onClick={(e) => confirmDelete(e)} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black uppercase text-white">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminManageMembers;