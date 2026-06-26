import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export default function EditProfile() {
  const navigate = useNavigate();
  const [modalSukses, setModalSukses] = useState(false);
  
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Menyimpan objek File asli untuk dikirim

  const [modalLogout, setModalLogout] = useState(false);
  const [animasiLogout, setAnimasiLogout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    telepon: ""
  });

  // FETCH DATA DARI DATABASE SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const res = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = res.data.data;
        
        setFormData({
          namaLengkap: userData.namaLengkap || "",
          email: userData.email || "",
          telepon: userData.noTelepon || "" // Disesuaikan dengan toJSON backend
        });
        setPreviewImage(userData.fotoProfil || "https://i.pravatar.cc/150?img=11");
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  // HANDLE PREVIEW FOTO
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      setSelectedFile(file); // Simpan objek file untuk dikirim via FormData

      // Buat preview untuk UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // UPDATE DATA KE DATABASE (Menggunakan PATCH & FormData)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const token = localStorage.getItem('token');
    
    try {
      // Wajib menggunakan FormData karena backend menggunakan multer (.single('avatar'))
      const formDataToSend = new FormData();
      formDataToSend.append('namaLengkap', formData.namaLengkap);
      formDataToSend.append('noTelepon', formData.telepon);
      
      if (selectedFile) {
        formDataToSend.append('avatar', selectedFile); 
      }

      // Backend menggunakan router.patch
      await axios.patch(`${API_BASE_URL}/users/profile`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Header wajib untuk file upload
        }
      });

      // Update data di localStorage agar UI header/sidebar langsung berubah
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      currentUser.namaLengkap = formData.namaLengkap;
      localStorage.setItem('user', JSON.stringify(currentUser));

      setModalSukses(true);
    } catch (err) {
      alert("Gagal menyimpan perubahan: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalSukses(false);
    navigate(-1); 
  };

  const handleLogoutClick = () => {
    setModalLogout(true);
    setAnimasiLogout(true);
  };

  const handleConfirmLogout = () => {
    setAnimasiLogout(false);
    setTimeout(() => {
      localStorage.clear();
      navigate('/login');
    }, 300);
  };

  const handleCancelLogout = () => {
    setAnimasiLogout(false);
    setTimeout(() => setModalLogout(false), 300);
  };

  if (isLoading) return <div className="min-h-screen bg-[#111315] flex items-center justify-center text-[#C2A676] font-black uppercase">Memuat Form...</div>;

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0] relative">

      {modalSukses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1A1C1E] p-8 rounded-3xl border border-[#C2A676] shadow-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-[#C2A676] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C2A676]">
              <svg className="w-8 h-8 text-[#C2A676]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Pembaruan Berhasil!</h3>
            <p className="text-[#888888] text-sm mb-6">Data profil dan identitas Anda telah berhasil diperbarui ke dalam sistem database.</p>
            <button 
              onClick={handleCloseModal}
              className="w-full py-3 bg-[#C2A676] text-[#111315] font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all"
            >
              Kembali ke Profil
            </button>
          </div>
        </div>
      )}

      {modalLogout && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm transition-all duration-300 ${animasiLogout ? 'bg-opacity-80' : 'bg-opacity-0'}`}>
          <div className={`bg-[#1A1C1E] p-8 rounded-3xl border border-red-500/30 shadow-2xl max-w-sm w-full text-center transition-all duration-300 ${animasiLogout ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500 animate-pulse">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <h3 className="text-xl font-black text-white uppercase mb-2">Konfirmasi Keluar</h3>
            <p className="text-[#888888] text-sm mb-6">Apakah Anda yakin ingin keluar dari akun ini?</p>
            <div className="flex gap-3">
              <button onClick={handleCancelLogout} className="flex-1 py-3 bg-[#25282c] text-gray-300 font-black uppercase text-xs rounded-xl border border-white/10 hover:bg-[#333] transition-all">
                Batal
              </button>
              <button onClick={handleConfirmLogout} className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-xs rounded-xl hover:bg-red-700 transition-all shadow-md active:scale-95">
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={`max-w-3xl mx-auto ${modalSukses || modalLogout ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="mb-6 border-b border-white/5 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">Edit Profil Saya</h1>
            <p className="text-[#888888] text-sm font-medium">Perbarui informasi identitas dan foto profil Anda.</p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Keluar
          </button>
        </div>

        <div className="bg-[#1A1C1E] p-8 rounded-3xl border border-white/5 shadow-lg">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <h2 className="text-xs font-black tracking-widest uppercase text-[#C2A676] border-b border-white/5 pb-3">Identitas & Foto</h2>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img src={previewImage} alt="Preview Foto Profil" className="w-32 h-32 rounded-full object-cover border-4 border-[#C2A676] shadow-lg" />
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <label htmlFor="avatar-upload" className="cursor-pointer px-6 py-2.5 bg-[#25282c] border border-white/10 text-white text-xs uppercase font-black tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center gap-2">
                  Pilih Foto Baru
                </label>
                <input id="avatar-upload" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
                <p className="text-[10px] uppercase font-bold text-[#888888] tracking-wider text-center">
                  Format: JPG, PNG, WEBP | Maks: 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                <input type="text" required value={formData.namaLengkap} onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})} className="p-3 rounded-xl bg-[#25282c] border border-white/5 text-white text-sm focus:outline-none focus:border-[#C2A676] transition-all" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor Telepon</label>
                <input type="text" required value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} className="p-3 rounded-xl bg-[#25282c] border border-white/5 text-white text-sm focus:outline-none focus:border-[#C2A676] transition-all" />
              </div>
              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email (Read Only)</label>
                <input type="email" readOnly value={formData.email} className="p-3 rounded-xl bg-[#111315] border border-white/5 text-gray-500 text-sm focus:outline-none cursor-not-allowed" />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3.5 bg-[#25282c] border border-white/10 text-gray-300 text-xs font-black tracking-widest uppercase rounded-xl hover:bg-[#333] transition-all">
                Batal
              </button>
              <button type="submit" disabled={isSaving} className="flex-1 py-3.5 bg-[#C2A676] text-[#111315] text-xs font-black tracking-widest uppercase rounded-xl hover:bg-white transition-all shadow-md active:scale-95 disabled:opacity-50">
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}