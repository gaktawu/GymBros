import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mengambil data yang disimpan dari halaman EditProfile
    const savedData = localStorage.getItem('gymProfileData');

    if (savedData) {
      // Jika ada data editan dari "desta", gunakan data tersebut!
      const parsedData = JSON.parse(savedData);
      setProfile({
        ...parsedData,
        nim: "24.11.6003",
        institusi: "Universitas Amikom Yogyakarta",
        membership: {
          paket: parsedData.paketMembership || "Paket 6 Bulan (Elite Bro)",
          tanggalMulai: "2025-11-01",
          masaBerlaku: parsedData.masaBerlaku || "2026-05-01",
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GYM-${(parsedData.namaLengkap || "Member").replace(/\s/g, '')}`
        },
        riwayatPembelian: [
          { id: 1, layanan: "Pembayaran Membership Bulanan", tanggal: "2026-04-01", harga: "Rp 250.000" },
          { id: 2, layanan: "Pembayaran Member Harian", tanggal: "2026-04-10", harga: "Rp 20.000" }
        ]
      });
      setLoading(false);
    } else {
      // Jika belum pernah diedit sama sekali, gunakan data awal ini
      const defaultData = {
        namaLengkap: "Faiz Anang Riyadi",
        nim: "24.11.6003",
        institusi: "Universitas Amikom Yogyakarta",
        telepon: "081234567890",
        email: "faiz@student.amikom.ac.id",
        tanggalLahir: "2004-05-12",
        avatar: "https://i.pravatar.cc/150?img=11",
        membership: {
          paket: "Paket 6 Bulan (Elite Bro)",
          tanggalMulai: "2025-11-01",
          masaBerlaku: "2026-05-01",
          qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GYM-FAIZ-24116003"
        },
        riwayatPembelian: [
          { id: 1, layanan: "Pembayaran Membership Bulanan", tanggal: "2026-04-01", harga: "Rp 300.000" },
          { id: 2, layanan: "Sewa Personal Trainer (PT) - 8 Sesi", tanggal: "2026-04-10", harga: "Rp 800.000" }
        ]
      };
      setProfile(defaultData);
      
      localStorage.setItem('gymProfileData', JSON.stringify({
        namaLengkap: defaultData.namaLengkap,
        email: defaultData.email,
        telepon: defaultData.telepon,
        tanggalLahir: defaultData.tanggalLahir,
        paketMembership: defaultData.membership.paket,
        masaBerlaku: defaultData.membership.masaBerlaku,
        avatar: defaultData.avatar
      }));
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari akun?");
    if (confirmLogout) {
      alert("Berhasil Logout!");
      navigate('/login'); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111315] flex justify-center items-center">
        <div className="text-[#C2A676] animate-pulse font-semibold text-xl">Memuat Profil...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0]">
      <section className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-[#1A1C1E] p-8 rounded-xl border border-[#333333] shadow-lg flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img src={profile.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-[#C2A676] shadow-md object-cover" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-white mb-1">{profile.namaLengkap}</h1>
            <p className="text-[#C2A676] font-medium mb-4">{profile.institusi} - {profile.nim}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-[#888888]">
              <p><strong className="text-[#E0E0E0]">Email:</strong> {profile.email}</p>
              <p><strong className="text-[#E0E0E0]">Telepon:</strong> {profile.telepon}</p>
              <p><strong className="text-[#E0E0E0]">Tanggal Lahir:</strong> {profile.tanggalLahir}</p>
            </div>
    <button 
           onClick={() => navigate('/member/edit-profile')} 
           className="mt-6 px-6 py-2 bg-transparent border border-[#C2A676] text-[#C2A676] font-semibold rounded hover:bg-[#C2A676] hover:text-[#111315] transition-all"
         >
           Edit Profil
         </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-md">
            <h2 className="text-xl font-bold text-[#C2A676] mb-4 border-b border-[#333333] pb-2">Status Keanggotaan</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#888888]">Jenis Paket</span>
                <span className="font-bold text-white">{profile.membership.paket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Tanggal Mulai</span>
                <span>{profile.membership.tanggalMulai}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Masa Berlaku</span>
                <span className="text-red-400 font-bold">{profile.membership.masaBerlaku}</span>
              </div>
            </div>
          </article>

          <article className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-md flex flex-col items-center justify-center">
            <h2 className="text-lg font-bold text-white mb-4">Akses Masuk Gym (QR Code)</h2>
            <div className="bg-white p-3 rounded-lg shadow-inner">
              <img src={profile.membership.qrCode} alt="QR Code Check-in" className="w-32 h-32" />
            </div>
            <p className="text-xs text-[#888888] mt-3">Pindai kode ini di pintu masuk GymBros</p>
          </article>
        </div>

        <article className="bg-[#1A1C1E] p-6 rounded-xl border border-[#333333] shadow-md">
          <h2 className="text-xl font-bold text-[#C2A676] mb-4 border-b border-[#333333] pb-2">Riwayat Pembelian & Layanan</h2>
          <div className="space-y-4">
            {profile.riwayatPembelian.map((trx) => (
              <div key={trx.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-[#111315] p-4 rounded border border-[#333333]">
                <div>
                  <p className="font-bold text-[#E0E0E0]">{trx.layanan}</p>
                  <p className="text-xs text-[#888888]">{trx.tanggal}</p>
                </div>
                <div className="mt-2 sm:mt-0 font-bold text-[#C2A676]">
                  {trx.harga}
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="flex justify-end pt-6 border-t border-[#333333]">
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-all shadow-md active:scale-95"
          >
            Keluar dari Akun (Logout)
          </button>
        </div>

      </section>
    </main>
  );
}