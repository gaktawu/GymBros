import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddMember = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk menyimpan daftar paket dari database
  const [daftarPaket, setDaftarPaket] = useState([]);
  const [isLoadingPaket, setIsLoadingPaket] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Laki-laki',
    role: 'Anggota',
    plan: '' // Akan diisi otomatis dengan ID paket pertama setelah data ditarik
  });

  // 1. CEK OTENTIKASI & TARIK DATA PAKET UNTUK DROPDOWN
  useEffect(() => {
    document.title = "Admin Gymbros | Tambah Anggota Baru";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";

    const setupAndFetch = async () => {
      try {
        // Ambil tiket (token) dari localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          alert("Akses Ditolak: Anda harus login terlebih dahulu!");
          navigate('/login');
          return;
        }

        // Pasang tiket ke header Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Tarik data paket membership dari backend
        const res = await axios.get("http://localhost:5000/api/v1/paket-membership");
        const packages = res.data.data || res.data;
        
        // Filter hanya paket yang aktif/tersedia
        const activePackages = packages.filter(p => p.status_aktif === 'Tersedia');
        setDaftarPaket(activePackages);

        // Otomatis pilih paket pertama di dropdown jika ada datanya
        if (activePackages.length > 0) {
          setFormData(prev => ({ ...prev, plan: activePackages[0].id_paket }));
        }

      } catch (error) {
        console.error("Gagal menarik daftar paket:", error);
      } finally {
        setIsLoadingPaket(false);
      }
    };

    setupAndFetch();

    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, [navigate]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setSuccessAnim(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. FUNGSI SUBMIT KE BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Bungkusan Data (Payload)
    // PERHATIAN: Sesuaikan nama properti ini (camelCase/snake_case) dengan validator Backend Anda!
    const payload = {
      namaLengkap: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email.toLowerCase(),
      nomorTelepon: formData.phone,
      jenisKelamin: formData.gender,
      peran: formData.role,
      idPaket: formData.plan, 
      status: 'Aktif'
    };

    try {
      // Menembak data ke API Backend (Asumsi rutenya adalah /users)
      await axios.post("http://localhost:5000/api/v1/users", payload);

      setIsSuccess(true);
      setTimeout(() => {
        // Setelah sukses, kembali ke halaman dashboard atau muat ulang form
        setIsSuccess(false);
        setFormData({ ...formData, firstName: '', lastName: '', email: '', phone: '' });
      }, 2000);

    } catch (error) {
      console.error("Gagal menambahkan anggota:", error);
      alert(error.response?.data?.message || "Gagal menyimpan data ke database. Cek console/network!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-3xl mx-auto space-y-6 text-[#E0E0E0] select-none bg-[#111315] relative z-30 pointer-events-auto p-4 md:p-6">

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col items-start gap-2 overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#C2A676]/5 hover:border-[#C2A676]/20">
        <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase">PANEL REGISTRASI</h4>
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">TAMBAH ANGGOTA BARU</h3>
      </div>

      {/* FORM CARD */}
      <div className="bg-[#1e2023] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 hover:border-white/10">
        {isSuccess ? (
          <div className={`flex flex-col items-center justify-center gap-4 py-12 text-center transition-all duration-700 ease-out ${successAnim ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <div className="w-16 h-16 rounded-full bg-[#C2A676]/20 flex items-center justify-center mb-2 transition-transform duration-500 hover:scale-110">
              <svg className="w-8 h-8 text-[#C2A676]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Anggota Berhasil Ditambahkan</h3>
            <p className="text-sm text-gray-400">Data telah tersimpan di Database Gymbros.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Depan */}
              <div className="group transition-all duration-500">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#C2A676] transition-colors duration-300">Nama Depan</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={isSubmitting}
                  className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/50 focus:ring-1 focus:ring-[#C2A676]/20 focus:shadow-lg focus:shadow-[#C2A676]/10 transition-all duration-300 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Nama Belakang */}
              <div className="group transition-all duration-500">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#C2A676] transition-colors duration-300">Nama Belakang</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={isSubmitting}
                  className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/50 focus:ring-1 focus:ring-[#C2A676]/20 focus:shadow-lg focus:shadow-[#C2A676]/10 transition-all duration-300 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="group transition-all duration-500">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#C2A676] transition-colors duration-300">Alamat Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="johndoe@gymbro.com"
                  disabled={isSubmitting}
                  className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/50 focus:ring-1 focus:ring-[#C2A676]/20 focus:shadow-lg focus:shadow-[#C2A676]/10 transition-all duration-300 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="group transition-all duration-500">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#C2A676] transition-colors duration-300">Nomor Telepon</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+62 812-3456-7890"
                  disabled={isSubmitting}
                  className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C2A676]/50 focus:ring-1 focus:ring-[#C2A676]/20 focus:shadow-lg focus:shadow-[#C2A676]/10 transition-all duration-300 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jenis Kelamin */}
              <div className="group transition-all duration-500">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#C2A676] transition-colors duration-300">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[#C2A676]/50 focus:ring-1 focus:ring-[#C2A676]/20 focus:shadow-lg focus:shadow-[#C2A676]/10 transition-all duration-300 hover:border-white/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Peran */}
              <div className="group transition-all duration-500">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#C2A676] transition-colors duration-300">Peran</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[#C2A676]/50 focus:ring-1 focus:ring-[#C2A676]/20 focus:shadow-lg focus:shadow-[#C2A676]/10 transition-all duration-300 hover:border-white/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Anggota">Member</option>
                  <option value="Pelatih">Coach</option>
                </select>
              </div>
            </div>

            {/* Paket Keanggotaan DINAMIS dari Database */}
            <div className="group transition-all duration-500">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#C2A676] transition-colors duration-300">Paket Keanggotaan</label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                disabled={isSubmitting || isLoadingPaket}
                className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[#C2A676]/50 focus:ring-1 focus:ring-[#C2A676]/20 focus:shadow-lg focus:shadow-[#C2A676]/10 transition-all duration-300 hover:border-white/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
              >
                {isLoadingPaket ? (
                  <option value="">Memuat paket dari database...</option>
                ) : daftarPaket.length === 0 ? (
                  <option value="">Belum ada paket tersedia</option>
                ) : (
                  daftarPaket.map(paket => (
                    <option key={paket.id_paket} value={paket.id_paket}>
                      {paket.nama_paket} - Rp {Number(paket.harga).toLocaleString('id-ID')}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* TOMBOL AKSI */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-[#25282c] border border-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingPaket || daftarPaket.length === 0}
                className="flex-1 rounded-2xl bg-[#C2A676] px-6 py-4 text-xs font-black uppercase tracking-widest text-[#111315] hover:bg-[#d4b88a] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#C2A676]/20 active:translate-y-0 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#111315]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <span>Simpan Data Anggota</span>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </main>
  );
};

export default AddMember;