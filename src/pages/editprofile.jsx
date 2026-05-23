import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const navigate = useNavigate();
  const [modalSukses, setModalSukses] = useState(false);

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
      setFormData(JSON.parse(savedData));
    }
  }, []);

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
            
            <div className="flex flex-col">
              <label className="text-sm text-[#888888] mb-1">Link URL Foto Profil</label>
              <input 
                type="text" 
                placeholder="Masukkan link gambar (contoh: https://imgur.com/foto.jpg)"
                value={formData.avatar}
                onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                className="p-3 rounded bg-[#111315] border border-[#333333] text-white focus:outline-none focus:border-[#C2A676] transition-all"
              />
              <p className="text-xs text-[#888888] mt-1">*Bisa menggunakan link gambar apapun dari internet.</p>
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