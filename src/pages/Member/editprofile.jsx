import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const navigate = useNavigate();
  const [modalSukses, setModalSukses] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    namaLengkap: "Faiz Anang Riyadi",
    email: "faiz@student.amikom.ac.id",
    telepon: "081234567890",
    tanggalLahir: "2004-05-12",
    paketMembership: "Paket 6 Bulan (Elite Bro)", 
    masaBerlaku: "2026-05-01",                  
    avatar: "https://i.pravatar.cc/150?img=11"
  });

  useEffect(() => {
    const savedData = localStorage.getItem('gymProfileData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed);
      setPreviewImage(parsed.avatar);
    } else {
      setPreviewImage(formData.avatar);
    }
  }, []);

  // Handler upload foto dari local storage
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.');
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewImage(base64String);
        setFormData(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Data paketMembership dan masaBerlaku tetap ikut tersimpan tanpa bisa diedit
    localStorage.setItem('gymProfileData', JSON.stringify(formData));
    setModalSukses(true);
  };

  const handleCloseModal = () => {
    setModalSukses(false);
    navigate(-1); 
  };

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0] relative">

      {/* ================= MODAL SUKSES TEMA GYM ================= */}
      {modalSukses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-[#1A1C1E] p-8 rounded-xl border border-[#C2A676] shadow-2xl max-w-sm w-full text-center transform transition-all">
            <div className="w-16 h-16 bg-[#C2A676] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C2A676]">
              <svg className="w-8 h-8 text-[#C2A676]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pembaruan Berhasil!</h3>
            <p className="text-[#888888] mb-6">Data profil dan identitas Anda telah berhasil diperbarui ke dalam sistem.</p>
            <button 
              onClick={handleCloseModal}
              className="w-full py-3 bg-[#C2A676] text-[#111315] font-bold rounded hover:bg-[#a68c5b] transition-all"
            >
              Kembali ke Profil
            </button>
          </div>
        </div>
      )}

      {/* Konten Halaman Edit */}
      <section className={`max-w-3xl mx-auto ${modalSukses ? 'pointer-events-none opacity-50' : ''}`}>

        <div className="mb-6 border-b border-[#333333] pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-[#FFFFFF] tracking-tight mb-2">Edit Profil Saya</h1>
            <p className="text-[#888888] text-sm">Perbarui informasi identitas dan foto profil Anda.</p>
          </div>
        </div>

        <div className="bg-[#1A1C1E] p-8 rounded-xl border border-[#333333] shadow-lg">
          <form onSubmit={handleSave} className="flex flex-col gap-6">

            <h2 className="text-lg font-bold text-[#C2A676] border-b border-[#333333] pb-2">Identitas & Foto</h2>

            {/* ================= UPLOAD FOTO PROFIL DARI LOCAL ================= */}
            <div className="flex flex-col items-center gap-4">
              {/* Preview Foto Profil */}
              <div className="relative">
                <img 
                  src={previewImage || formData.avatar} 
                  alt="Preview Foto Profil"
                  className="w-32 h-32 rounded-full object-cover border-2 border-[#C2A676] shadow-lg"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#C2A676] rounded-full flex items-center justify-center border-2 border-[#1A1C1E]">
                  <svg className="w-4 h-4 text-[#111315]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
              </div>

              {/* Input File Upload */}
              <div className="flex flex-col items-center gap-2 w-full">
                <label 
                  htmlFor="avatar-upload"
                  className="cursor-pointer px-6 py-2.5 bg-[#111315] border border-[#C2A676] text-[#C2A676] font-semibold rounded-lg hover:bg-[#C2A676] hover:text-[#111315] transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                  Pilih Foto dari Perangkat
                </label>
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-[#888888] text-center">
                  Format: JPG, PNG, WEBP | Maksimal 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-[#888888] mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})}
                  className="p-3 rounded bg-[#111315] border border-[#333333] text-white focus:outline-none focus:border-[#C2A676] transition-all"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-[#888888] mb-1">Tanggal Lahir</label>
                <input 
                  type="date" 
                  required
                  value={formData.tanggalLahir}
                  onChange={(e) => setFormData({...formData, tanggalLahir: e.target.value})}
                  className="p-3 rounded bg-[#111315] border border-[#333333] text-white focus:outline-none focus:border-[#C2A676] transition-all"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-[#888888] mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="p-3 rounded bg-[#111315] border border-[#333333] text-white focus:outline-none focus:border-[#C2A676] transition-all"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-[#888888] mb-1">Nomor Telepon</label>
                <input 
                  type="text" 
                  required
                  value={formData.telepon}
                  onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                  className="p-3 rounded bg-[#111315] border border-[#333333] text-white focus:outline-none focus:border-[#C2A676] transition-all"
                />
              </div>
            </div>

            {/* Peringatan Membership (Hanya Tampilan, Tidak Bisa Diedit) */}
            <div className="mt-4 p-4 bg-[#111315] border border-[#333333] rounded-lg">
              <p className="text-sm text-[#888888] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#C2A676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Untuk mengubah paket membership atau melakukan perpanjangan, silakan hubungi Administrator GymBros.
              </p>
            </div>

            <div className="flex gap-4 mt-6 justify-end border-t border-[#333333] pt-6">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-[#111315] border border-[#333333] text-[#E0E0E0] font-bold rounded hover:bg-[#333333] transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-[#C2A676] text-[#111315] font-bold rounded hover:bg-[#a68c5b] transition-all shadow-md active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}