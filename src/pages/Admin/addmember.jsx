import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- HELPER NOTIFIKASI SWEETALERT2 (VIA CDN) ---
// Memastikan script diload dan konfigurasi tema sesuai UI aplikasi
const getSwal = () => {
  if (typeof window === 'undefined' || !window.Swal) return null;
  return window.Swal.mixin({
    background: '#1e2023',
    color: '#E0E0E0',
    confirmButtonColor: '#C2A676',
    cancelButtonColor: '#374151',
    customClass: {
      popup: 'border border-white/10 rounded-2xl shadow-2xl',
      title: 'text-white font-black tracking-tight',
      htmlContainer: 'text-gray-400 text-sm',
      confirmButton: 'rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest text-[#111315] hover:bg-[#d4b88a] transition-all',
      cancelButton: 'rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all',
    }
  });
};

const Alert = {
  success: (msg, title = 'Berhasil!') => {
    getSwal()?.fire({ icon: 'success', title, text: msg, timer: 2500, showConfirmButton: true });
  },
  error: (msg, title = 'Terjadi Kesalahan') => {
    getSwal()?.fire({ icon: 'error', title, text: msg });
  },
  loading: (title = 'Memproses...', msg = 'Mohon tunggu sebentar.') => {
    const swal = getSwal();
    if (swal) {
      swal.fire({
        title: title,
        html: msg,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => window.Swal.showLoading()
      });
    }
  },
  close: () => {
    window.Swal?.close();
  },
  confirm: async (msg, title = 'Apakah Anda yakin?') => {
    const swal = getSwal();
    if (!swal) return { isConfirmed: true }; // Fallback jika script gagal dimuat
    return await swal.fire({
      icon: 'warning',
      title: title,
      text: msg,
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });
  }
};
// -----------------------------------------------

const AddMember = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [daftarPaket, setDaftarPaket] = useState([]);
  const [isLoadingPaket, setIsLoadingPaket] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    gender: 'Laki-laki',
    role: 'Member',
    plan: ''
  });

  useEffect(() => {
    // Inject CDN SweetAlert2 secara dinamis tanpa npm install
    if (!document.getElementById('swal2-cdn')) {
      const script = document.createElement('script');
      script.id = 'swal2-cdn';
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      script.async = true;
      document.body.appendChild(script);
    }

    document.title = "Admin Gymbros | Tambah Anggota Baru";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";

    const fetchPaket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Menunggu sebentar agar CDN SweetAlert termuat jika baru pertama kali dirender
          setTimeout(() => {
            Alert.error("Akses Ditolak: Anda harus login terlebih dahulu!", "Autentikasi Gagal");
            navigate('/login');
          }, 300);
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get("http://localhost:5000/api/v1/paket-membership");
        const packages = res.data.data || res.data;

        const activePackages = packages.filter(p => p.status_aktif === 'Tersedia' && !p.is_deleted);
        setDaftarPaket(activePackages);

        if (activePackages.length > 0) {
          setFormData(prev => ({ ...prev, plan: activePackages[0].id_paket }));
        }
      } catch (error) {
        console.error("Gagal menarik daftar paket:", error);
      } finally {
        setIsLoadingPaket(false);
      }
    };

    fetchPaket();
    return () => { document.body.style.backgroundColor = originalBodyBg; };
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    setServerError('');
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Nama depan wajib diisi";
    if (!formData.lastName.trim()) newErrors.lastName = "Nama belakang wajib diisi";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "Email wajib diisi";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Format email tidak valid";

    const phoneRegex = /^[0-9]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Nomor telepon hanya boleh berisi angka";
    }

    if (!formData.password) newErrors.password = "Password wajib diisi";
    else if (formData.password.length < 8) newErrors.password = "Password minimal 8 karakter";

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password tidak cocok";
    }

    if (!formData.plan) newErrors.plan = "Paket keanggotaan wajib dipilih";
    if (!formData.role) newErrors.role = "Peran wajib dipilih";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Tambahan dialog konfirmasi sebelum menyimpan (opsional tapi bagus untuk UX)
    const confirmation = await Alert.confirm("Apakah data anggota yang dimasukkan sudah benar?", "Konfirmasi Penyimpanan");
    if (!confirmation.isConfirmed) return;

    setIsSubmitting(true);
    setServerError('');

    // Di dalam handleSubmit, tambahkan statusAkun ke payload:

    const payload = {
      namaLengkap: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      noTelepon: formData.phone,
      peran: formData.role,        // Sudah benar: "Admin", "Member", atau "Coach"
      statusAkun: 'Aktif',         // ➕ TAMBAHAN: Default status untuk member baru
      jenisKelamin: formData.gender,
      idPaket: formData.plan
    };

    try {
      Alert.loading("Menyimpan Data", "Mohon tunggu sebentar...");

      await axios.post("http://localhost:5000/api/v1/users", payload);

      Alert.close();
      Alert.success("Member berhasil ditambahkan.");
      navigate('/admin/datamember');

    } catch (error) {
      console.error("Gagal menambahkan anggota:", error);
      Alert.close();
      const message = error.response?.data?.message || "Terjadi kesalahan pada server.";
      setServerError(message);
      Alert.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/datamember');
  };

  return (
    <main className="w-full max-w-3xl mx-auto space-y-6 text-[#E0E0E0] select-none bg-[#111315] relative z-30 pointer-events-auto p-4 md:p-6">
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col items-start gap-2 shadow-xl">
        <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase">PANEL REGISTRASI</h4>
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">TAMBAH ANGGOTA BARU</h3>
      </div>

      <div className="bg-[#1e2023] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">

        {serverError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3">
            <span className="text-sm font-medium">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nama Depan</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className={`w-full bg-[#25282c] border ${errors.firstName ? 'border-red-500' : 'border-white/5'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none`} />
              {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName}</span>}
            </div>
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nama Belakang</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className={`w-full bg-[#25282c] border ${errors.lastName ? 'border-red-500' : 'border-white/5'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none`} />
              {errors.lastName && <span className="text-xs text-red-500 mt-1">{errors.lastName}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Alamat Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="johndoe@gymbro.com" className={`w-full bg-[#25282c] border ${errors.email ? 'border-red-500' : 'border-white/5'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none`} />
              {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
            </div>
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nomor Telepon</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="081234567890" className={`w-full bg-[#25282c] border ${errors.phone ? 'border-red-500' : 'border-white/5'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none`} />
              {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimal 8 karakter" className={`w-full bg-[#25282c] border ${errors.password ? 'border-red-500' : 'border-white/5'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none`} />
              {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password}</span>}
            </div>
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Konfirmasi Password</label>
              <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="Ulangi Password" className={`w-full bg-[#25282c] border ${errors.password_confirmation ? 'border-red-500' : 'border-white/5'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none`} />
              {errors.password_confirmation && <span className="text-xs text-red-500 mt-1">{errors.password_confirmation}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Jenis Kelamin</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none cursor-pointer">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Peran</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#25282c] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none cursor-pointer">
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Coach">Coach</option>
              </select>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Paket Keanggotaan</label>
            <select name="plan" value={formData.plan} onChange={handleChange} disabled={isLoadingPaket} className={`w-full bg-[#25282c] border ${errors.plan ? 'border-red-500' : 'border-white/5'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none cursor-pointer`}>
              {isLoadingPaket ? (
                <option value="">Memuat paket...</option>
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
            {errors.plan && <span className="text-xs text-red-500 mt-1">{errors.plan}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-[#25282c] border border-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingPaket || daftarPaket.length === 0}
              className="flex-1 rounded-2xl bg-[#C2A676] px-6 py-4 text-xs font-black uppercase tracking-widest text-[#111315] hover:bg-[#d4b88a] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <span>Menyimpan...</span> : <span>Simpan Data Anggota</span>}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddMember;