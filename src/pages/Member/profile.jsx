import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const EMPTY_CONFIRM = { isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Ya', cancelText: 'Batal', variant: 'danger' };

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [riwayat, setRiwayat] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState(EMPTY_CONFIRM);
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
        const userRes = await axios.get(`${API_BASE_URL}/users/profile`, config);
        const userData = userRes.data.data;

        setProfile({
          idUser: userData.idUser,
          namaLengkap: userData.namaLengkap || "Member Gymbros",
          email: userData.email,
          telepon: userData.noTelepon || "-",
          avatar: userData.fotoProfil || "https://i.pravatar.cc/150?img=11",
          peran: userData.peran || "Member",
          jenisKelamin: userData.jenisKelamin || "-",
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GYMBROS-${userData.idUser}`
        });

        try {
          const memRes = await axios.get(`${API_BASE_URL}/memberships/my-active`, config);
          setMembership(memRes.data.data);
        } catch (e) {
          setMembership(null); 
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

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setHistoryLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const res = await axios.get(`${API_BASE_URL}/payments/history?page=${page}&limit=5&search=${search}`, config);
        setRiwayat(res.data.data || []);
        setMeta(res.data.meta || null);
      } catch (error) {
        console.error("Gagal memuat riwayat transaksi:", error);
        setRiwayat([]);
        setMeta(null);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); 
    setSearch(searchInput);
  };

  const showConfirm = ({ title, message, onConfirm, confirmText = 'Ya', cancelText = 'Batal', variant = 'danger' }) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, confirmText, cancelText, variant });
  };

  const closeConfirm = () => {
    setConfirmModal(EMPTY_CONFIRM);
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari akun? Anda perlu login kembali untuk mengakses fitur member.',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        localStorage.clear();
        navigate('/login');
        closeConfirm();
      }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Lunas': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Gagal': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
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

  const planName = membership?.namaPaketObj || "Belum Berlangganan";
  const planStart = membership?.tglMulai 
    ? new Date(membership.tglMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "-";
  const planEnd = membership?.tglBerakhir 
    ? new Date(membership.tglBerakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "-";
  const isExpired = membership?.tglBerakhir ? new Date() > new Date(membership.tglBerakhir) : true;

  return (
    <main className="min-h-screen bg-[#111315] p-6 md:p-10 font-sans text-[#E0E0E0]">
      <style>{`
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-modal { animation: scaleUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <section className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-[#1A1C1E] p-8 rounded-3xl border border-[#333333] shadow-lg flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img src={profile.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-[#C2A676] shadow-md object-cover" />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center md:justify-start">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">{profile.namaLengkap}</h1>
              <span className="self-center md:self-auto text-[10px] px-2 py-0.5 bg-[#C2A676]/10 border border-[#C2A676]/30 text-[#C2A676] font-black uppercase tracking-wider rounded-md">
                {profile.peran}
              </span>
            </div>
            <p className="text-[#C2A676] font-bold mb-4 tracking-widest uppercase text-xs">MEMBER ID: GB-{profile.idUser}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-[#888888]">
              <p><strong className="text-[#E0E0E0]">Email:</strong> {profile.email}</p>
              <p><strong className="text-[#E0E0E0]">Telepon:</strong> {profile.telepon}</p>
              <p><strong className="text-[#E0E0E0]">Jenis Kelamin:</strong> {profile.jenisKelamin}</p>
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
            <h2 className="text-sm tracking-widest uppercase font-black text-[#C2A676] mb-4 border-b border-[#333333] pb-3">
              Status Keanggotaan
            </h2>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between items-center">
                <span className="text-[#888888]">Jenis Paket</span>
                <span className="font-bold text-white uppercase bg-[#25282c] px-3 py-1 rounded-lg border border-white/10">
                  {planName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888]">Tanggal Mulai</span>
                <span className="text-gray-300">{planStart}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888]">Masa Berlaku</span>
                <span className={!isExpired && membership ? "text-green-400 font-black" : "text-red-400 font-black"}>
                  {planEnd} {isExpired && membership ? '(Kadaluarsa)' : ''}
                </span>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#333333] pb-3 mb-4 gap-4">
            <h2 className="text-sm tracking-widest uppercase font-black text-[#C2A676]">Riwayat Transaksi</h2>
            <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Cari ID, Kelas..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-[#111315] border border-[#333333] rounded-l-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#C2A676] w-full sm:w-48"
              />
              <button type="submit" className="bg-[#C2A676] text-[#111315] px-3 py-1.5 rounded-r-lg font-bold text-sm hover:bg-[#e0c28d] transition">
                Cari
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {historyLoading ? (
              <p className="text-sm text-[#C2A676] animate-pulse text-center py-4">Memuat data...</p>
            ) : riwayat.length > 0 ? (
              riwayat.map((trx) => (
                <div key={trx.id_payment} className="flex flex-col sm:flex-row justify-between sm:items-center bg-[#25282c] p-4 rounded-2xl border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-[#E0E0E0] uppercase text-sm">{trx.nama_item}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${getStatusColor(trx.status)}`}>
                        {trx.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888888] font-mono">ID: {trx.id_payment}</p>
                    <p className="text-[10px] text-[#888888] uppercase tracking-wider mt-0.5">
                      {trx.tanggal ? new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} | {trx.metode}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 font-black text-[#C2A676] text-lg sm:text-right">
                    Rp {trx.nominal ? trx.nominal.toLocaleString('id-ID') : '0'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Data transaksi tidak ditemukan.</p>
            )}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#333333]">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage || historyLoading}
                className="px-4 py-2 bg-[#25282c] text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-[#333333] transition"
              >
                &laquo; Sebelumnya
              </button>
              <span className="text-xs text-[#888888] font-bold">
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!meta.hasNextPage || historyLoading}
                className="px-4 py-2 bg-[#25282c] text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-[#333333] transition"
              >
                Selanjutnya &raquo;
              </button>
            </div>
          )}
        </article>

        <div className="flex justify-end pt-2 pb-10">
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-red-600/10 border border-red-500/30 text-red-400 text-xs tracking-widest uppercase font-black rounded-xl hover:bg-red-600 hover:text-white hover:border-transparent transition-all shadow-md active:scale-95"
          >
            Keluar dari Akun (Logout)
          </button>
        </div>

      </section>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`bg-[#1A1C1E] rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-modal border-t-4 ${confirmModal.variant === 'danger' ? 'border-red-500' : 'border-[#C2A676]'}`}>
            <div className="mb-5">
              <h3 className="text-lg font-black text-white mb-2 tracking-wide">{confirmModal.title}</h3>
              <p className="text-[#888888] text-sm leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 text-[#E0E0E0] bg-[#25282c] hover:bg-[#333333] rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-white/10"
              >
                {confirmModal.cancelText}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider shadow transition-colors ${
                  confirmModal.variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-[#C2A676] hover:bg-[#e0c28d] text-[#111315]'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}