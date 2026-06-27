import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // 1. Ambil Data User (Sesuai dengan toJSON() di User.js backend Anda)
        const userRes = await axios.get(`${API_BASE_URL}/users/profile`, config);
        const userData = userRes.data.data;

        setProfile({
          idUser: userData.idUser,
          namaLengkap: userData.namaLengkap || "Member Gymbros",
          email: userData.email,
          telepon: userData.noTelepon || "-", // Disesuaikan dengan backend
          avatar: userData.fotoProfil || "https://i.pravatar.cc/150?img=11", // Disesuaikan dengan backend
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GYMBROS-${userData.idUser}`
        });

        // 2. Ambil Data Membership Aktif
        try {
          const memRes = await axios.get(`${API_BASE_URL}/memberships/my-active`, config);
          setMembership(memRes.data.data);
        } catch (e) {
          setMembership(null); 
        }

        // 3. Ambil Riwayat Pembelian
        try {
          const trxRes = await axios.get(`${API_BASE_URL}/transactions/my-history`, config);
          setRiwayat(trxRes.data.data || []);
        } catch (e) {
          setRiwayat([]); 
        }

      } catch (error) {
        console.error("Gagal memuat profil:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari akun?");
    if (confirmLogout) {
      localStorage.clear();
      navigate('/login'); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111315] flex justify-center items-center">
        <div className="text-[#C2A676] animate-pulse font-black uppercase tracking-widest text-xl">
          Memuat Profil...
        </div>
      </div>
    );
  }

  const planName = membership?.paket?.namaPaket || membership?.paket_membership?.nama_paket || "Belum Berlangganan";
  const planEnd = membership?.tanggalBerakhir || membership?.tanggal_berakhir ? new Date(membership.tanggalBerakhir || membership.tanggal_berakhir).toLocaleDateString('id-ID') : "-";
  const planStart = membership?.tanggalMulai || membership?.tanggal_mulai ? new Date(membership.tanggalMulai || membership.tanggal_mulai).toLocaleDateString('id-ID') : "-";

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0]">
      <section className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-[#1A1C1E] p-8 rounded-3xl border border-[#333333] shadow-lg flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img src={profile.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-[#C2A676] shadow-md object-cover" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">{profile.namaLengkap}</h1>
            <p className="text-[#C2A676] font-bold mb-4 tracking-widest uppercase text-xs">MEMBER ID: GB-{profile.idUser}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-[#888888]">
              <p><strong className="text-[#E0E0E0]">Email:</strong> {profile.email}</p>
              <p><strong className="text-[#E0E0E0]">Telepon:</strong> {profile.telepon}</p>
            </div>
            <button 
              onClick={() => navigate('/member/edit-profile')} 
              className="mt-6 px-6 py-2 bg-[#25282c] border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#C2A676] hover:text-[#111315] hover:border-transparent transition-all"
            >
              Edit Profil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="bg-[#1A1C1E] p-6 rounded-3xl border border-[#333333] shadow-md">
            <h2 className="text-sm tracking-widest uppercase font-black text-[#C2A676] mb-4 border-b border-[#333333] pb-3">Status Keanggotaan</h2>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-[#888888]">Jenis Paket</span>
                <span className="font-bold text-white uppercase">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Tanggal Mulai</span>
                <span>{planStart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Masa Berlaku</span>
                <span className={membership ? "text-green-400 font-bold" : "text-red-400 font-bold"}>{planEnd}</span>
              </div>
            </div>
          </article>

          <article className="bg-[#1A1C1E] p-6 rounded-3xl border border-[#333333] shadow-md flex flex-col items-center justify-center text-center">
            <h2 className="text-sm tracking-widest uppercase font-black text-white mb-4">Akses Masuk (QR Code)</h2>
            <div className="bg-white p-3 rounded-2xl shadow-inner">
              <img src={profile.qrCode} alt="QR Code Check-in" className="w-32 h-32" />
            </div>
            <p className="text-xs text-[#888888] mt-3 font-bold">Pindai kode ini di gerbang masuk</p>
          </article>
        </div>

        <article className="bg-[#1A1C1E] p-6 rounded-3xl border border-[#333333] shadow-md">
          <h2 className="text-sm tracking-widest uppercase font-black text-[#C2A676] mb-4 border-b border-[#333333] pb-3">Riwayat Transaksi</h2>
          <div className="space-y-3">
            {riwayat.length > 0 ? riwayat.map((trx) => (
              <div key={trx.id || trx.id_booking} className="flex flex-col sm:flex-row justify-between sm:items-center bg-[#25282c] p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="font-black text-[#E0E0E0] uppercase text-sm">{trx.nama_item || trx.layanan || 'Pembayaran Sistem'}</p>
                  <p className="text-[10px] text-[#888888] uppercase tracking-wider mt-0.5">{new Date(trx.tanggal || trx.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="mt-2 sm:mt-0 font-black text-[#C2A676] text-sm">
                  {trx.nominal || trx.harga ? `Rp ${(trx.nominal || trx.harga).toLocaleString('id-ID')}` : '-'}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada riwayat transaksi.</p>
            )}
          </div>
        </article>

        <div className="flex justify-end pt-2">
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-red-600/10 border border-red-500/30 text-red-400 text-xs tracking-widest uppercase font-black rounded-xl hover:bg-red-600 hover:text-white hover:border-transparent transition-all shadow-md active:scale-95"
          >
            Keluar dari Akun (Logout)
          </button>
        </div>

      </section>
    </main>
  );
}