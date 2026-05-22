import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddMember = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    plan: 'Basic Bro',
    status: 'Active'
  });

  useEffect(() => {
    document.title = "Gymbros Admin | Add New Member";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";
    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate ID acak untuk member dummy baru
    const randomIdNumber = Math.floor(10000 + Math.random() * 90000);

    const newMember = {
      id: `GB-${randomIdNumber}`,
      name: `${formData.firstName} ${formData.lastName}`.toUpperCase(),
      email: formData.email.toLowerCase(),
      plan: formData.plan,
      status: formData.status,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      image: null // Akan fallback ke inisial nama di tabel
    };

    // Ambil data lokal yang sudah ada, tambahkan yang baru, lalu simpan kembali
    const existingLocalMembers = JSON.parse(localStorage.getItem('dummyMembers')) || [];
    localStorage.setItem('dummyMembers', JSON.stringify([newMember, ...existingLocalMembers]));

    // Kembali ke halaman tabel
    navigate('/admin/add-member'); 
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-[#E0E0E0] select-none bg-[#111315] relative z-30 pointer-events-auto p-4 md:p-6">

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col items-start gap-2 overflow-hidden shadow-xl">
        <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase">REGISTRATION PANEL</h4>
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">ADD NEW MEMBER</h3>
      </div>

      {/* FORM CARD */}
      <div className="bg-[#1e2023] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/50 transition-colors"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/50 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="johndoe@gymbro.com"
              className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Type */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Membership Plan</label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[#C2A676]/50 transition-colors cursor-pointer"
              >
                <option value="Basic Bro">Basic Bro</option>
                <option value="Elite Bro">Elite Bro</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[#C2A676]/50 transition-colors cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-2xl bg-[#25282c] border border-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-[#C2A676] px-6 py-4 text-xs font-black uppercase tracking-widest text-[#111315] hover:bg-[#d4b88a] transition-colors shadow-lg"
            >
              Save Member Data
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddMember;