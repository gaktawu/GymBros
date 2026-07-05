import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

// ==========================================
// API CLIENT (Shared)
// ==========================================
const apiClient = axios.create();
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, Promise.reject);

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function CoachPortal() {
  // --- Tab State ---
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'profile'

  // --- Shared Alert ---
  const [alert, setAlert] = useState({ show: false, type: "info", text: "" });

  // --- Logout Modal (Shared) ---
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- Dashboard State ---
  const [coachName, setCoachName] = useState("Coach");
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  // --- Profile State ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ namaLengkap: "", noTelepon: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Auth Check & Init ---
  useEffect(() => {
    document.title = "Gymbros | Portal Coach";

    const token = localStorage.getItem("token");
    const userDataStr = localStorage.getItem("user");

    if (!token || !userDataStr) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userDataStr);
    if (user.peran !== "Coach") {
      window.location.href = "/login";
      return;
    }

    setCoachName(user.namaLengkap || "Coach");
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  // --- Alert Helper ---
  const showAlert = useCallback((type, text) => {
    setAlert({ show: true, type, text });
    setTimeout(() => setAlert({ show: false, type: "info", text: "" }), 3500);
  }, []);

  // --- Logout Handler ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showAlert("success", "Berhasil logout. Sampai jumpa!");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  // ==========================================
  // DATA FETCHING
  // ==========================================
  
  // Fetch Classes
  const fetchMyClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const res = await apiClient.get(`${API_BASE_URL}/classes/my-classes`);
      const data = res.data?.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
      showAlert("error", "Gagal memuat data kelas. Silakan coba lagi.");
    } finally {
      setLoadingClasses(false);
    }
  }, [showAlert]);

  // Fetch Profile
  const fetchProfileData = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await apiClient.get(`${API_BASE_URL}/users/profile`);
      const userData = res.data.data;

      setProfile({
        idUser: userData.idUser,
        namaLengkap: userData.namaLengkap || "Coach Gymbros",
        email: userData.email,
        telepon: userData.noTelepon || "-",
        avatar: userData.fotoProfil || "https://i.pravatar.cc/150?img=11",
        peran: userData.peran || "Coach",
        jenisKelamin: userData.jenisKelamin || "-",
      });

      setEditForm({
        namaLengkap: userData.namaLengkap || "",
        noTelepon: userData.noTelepon || "",
      });
    } catch (error) {
      console.error("Gagal memuat profil:", error);
      showAlert("error", "Gagal memuat profil. Silakan login kembali.");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchMyClasses();
    fetchProfileData();
  }, [fetchMyClasses, fetchProfileData]);

  // ==========================================
  // PROFILE ACTIONS
  // ==========================================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      if (editForm.namaLengkap) formData.append("namaLengkap", editForm.namaLengkap);
      if (editForm.noTelepon) formData.append("noTelepon", editForm.noTelepon);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await apiClient.patch(`${API_BASE_URL}/users/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert("success", res.data.message || "Profil berhasil diperbarui!");
      setIsEditModalOpen(false);
      setAvatarFile(null);
      fetchProfileData();

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.namaLengkap = editForm.namaLengkap;
        localStorage.setItem("user", JSON.stringify(userObj));
        setCoachName(editForm.namaLengkap || "Coach");
      }
    } catch (error) {
      console.error("Update profil gagal:", error);
      showAlert("error", error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const formatSchedule = (waktuMulai, waktuSelesai) => {
    const mulai = waktuMulai ? new Date(waktuMulai) : null;
    const selesai = waktuSelesai ? new Date(waktuSelesai) : null;
    if (!mulai) return { tanggal: "-", jam: "--:--" };

    const tanggal = mulai.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const jamMulai = mulai.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const jamSelesai = selesai
      ? selesai.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : "--:--";

    return { tanggal, jam: `${jamMulai} - ${jamSelesai}` };
  };

  const alertStyles = {
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    error: "bg-red-500/15 border-red-500/30 text-red-400",
    info: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    warning: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#E0E0E0] font-sans selection:bg-[#C2A676]/30">
      
      {/* --- ALERT DINAMIS (Global) --- */}
      {alert.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full border shadow-2xl text-xs font-black uppercase tracking-wider animate-[slideDown_0.3s_ease-out] backdrop-blur-sm">
          <div className={`${alertStyles[alert.type]} px-4 py-2 rounded-full border`}>
            {alert.text}
          </div>
        </div>
      )}

      {/* --- LOGOUT CONFIRMATION MODAL (Global) --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-[scaleUp_0.2s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🚪</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Konfirmasi Logout</h3>
              <p className="text-sm text-gray-400">Apakah Anda yakin ingin keluar dari akun?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-xl text-sm font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-colors"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER & NAVIGATION --- */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-2">
              Area Pelatih
            </h4>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Selamat Datang, {coachName.split(" ")[0]}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex bg-[#1a1a1e] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "dashboard"
                    ? "bg-[#C2A676] text-[#111315]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Jadwal
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "profile"
                    ? "bg-[#C2A676] text-[#111315]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Profil
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1e] border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-gray-400 hover:text-red-400 rounded-xl text-sm font-bold transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            DASHBOARD TAB
        ========================================== */}
        {activeTab === "dashboard" && (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            <p className="text-sm text-gray-400 mb-8 max-w-xl">
              Kelola jadwal mengajar dan pantau peserta kelas Anda.
            </p>

            {loadingClasses ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-[#333] border-t-[#C2A676] rounded-full animate-spin" />
                <p className="text-[#C2A676] font-black text-sm uppercase tracking-widest animate-pulse">
                  Memuat Jadwal...
                </p>
              </div>
            ) : classes.length === 0 ? (
              <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <h3 className="text-lg font-bold text-white mb-1">Belum Ada Jadwal</h3>
                <p className="text-sm text-gray-400">
                  Anda belum ditugaskan untuk mengajar kelas apapun saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {classes.map((cls) => {
                  const schedule = formatSchedule(cls.waktu_mulai, cls.waktu_selesai);
                  const participantCount = cls.participants?.length || 0;
                  const isSelected = selectedClass?.id_kelas === cls.id_kelas;
                  const isUpcoming = new Date(cls.waktu_mulai) > new Date();

                  return (
                    <div
                      key={cls.id_kelas}
                      onClick={() => setSelectedClass(isSelected ? null : cls)}
                      className={`relative bg-[#1a1a1e] border rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        isSelected
                          ? "border-[#C2A676]/50 shadow-[0_0_20px_rgba(194,166,118,0.1)]"
                          : "border-white/5 hover:border-[#C2A676]/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isUpcoming
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {isUpcoming ? "Akan Datang" : "Selesai"}
                        </span>
                        <span className="text-xs text-gray-500 font-bold">
                          {participantCount} / {cls.kapasitas} Peserta
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                        {cls.nama_kelas}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="text-[#C2A676]">📅</span>
                          <span>{schedule.tanggal}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="text-[#C2A676]">⏰</span>
                          <span>{schedule.jam}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="text-[#C2A676]">💰</span>
                          <span className="font-semibold text-emerald-400">
                            Rp {Number(cls.harga || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-[#0f0f11] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#C2A676] h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((participantCount / (cls.kapasitas || 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>

                      <p className="text-[10px] text-gray-500 mt-3 text-center">
                        {isSelected ? "Klik lagi untuk tutup" : "Klik untuk lihat peserta"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detail Peserta */}
            {selectedClass && (
              <div className="mt-8 animate-[fadeInUp_0.4s_ease-out]">
                <div className="bg-[#1a1a1e] border border-[#C2A676]/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(194,166,118,0.05)]">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase">
                        Peserta: {selectedClass.nama_kelas}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatSchedule(selectedClass.waktu_mulai, selectedClass.waktu_selesai).tanggal} • {" "}
                        {selectedClass.participants?.length || 0} orang terdaftar
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedClass.participants?.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <p className="text-2xl mb-2">🙋‍♂️</p>
                      <p>Belum ada member yang mendaftar di kelas ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedClass.participants.map((p, idx) => (
                        <div
                          key={p.id_booking || idx}
                          className="flex items-center gap-3 p-4 bg-[#0f0f11] border border-white/5 rounded-xl hover:border-[#C2A676]/20 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#C2A676]/10 border border-[#C2A676]/30 flex items-center justify-center text-[#C2A676] font-black text-sm">
                            {(p.nama_lengkap || "M").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {p.nama_lengkap || "Member"}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">{p.email || "-"}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                              p.status === "Booked"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {p.status || "Booked"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            PROFILE TAB
        ========================================== */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto animate-[fadeIn_0.4s_ease-out]">
            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-[#333] border-t-[#C2A676] rounded-full animate-spin" />
                <p className="text-[#C2A676] font-black text-sm uppercase tracking-widest animate-pulse">
                  Memuat Profil...
                </p>
              </div>
            ) : (
              <>
                <div className="bg-[#1A1C1E] p-8 rounded-3xl border border-[#333333] shadow-lg flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-[#C2A676] shadow-[0_0_20px_rgba(194,166,118,0.2)] object-cover relative z-10"
                  />

                  <div className="flex-1 text-center md:text-left relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1 justify-center md:justify-start">
                      <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                        {profile.namaLengkap}
                      </h1>
                      <span className="self-center md:self-auto text-[10px] px-3 py-1 bg-[#C2A676]/10 border border-[#C2A676]/30 text-[#C2A676] font-black uppercase tracking-widest rounded-md">
                        {profile.peran}
                      </span>
                    </div>

                    <p className="text-[#888888] text-sm mb-6 mt-2 tracking-wide">
                      Pengajar aktif di Gymbros. Kelola identitas dan kontak Anda untuk memudahkan interaksi dengan member.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm bg-[#0f0f11] p-5 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-[#888888] text-[10px] uppercase tracking-wider font-bold mb-1">Email Address</p>
                        <p className="text-white font-medium">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-[#888888] text-[10px] uppercase tracking-wider font-bold mb-1">Nomor Telepon</p>
                        <p className="text-white font-medium">{profile.telepon}</p>
                      </div>
                      <div>
                        <p className="text-[#888888] text-[10px] uppercase tracking-wider font-bold mb-1">Jenis Kelamin</p>
                        <p className="text-white font-medium">{profile.jenisKelamin}</p>
                      </div>
                      <div>
                        <p className="text-[#888888] text-[10px] uppercase tracking-wider font-bold mb-1">ID Coach</p>
                        <p className="text-[#C2A676] font-bold">GB-COACH-{profile.idUser}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="mt-6 px-6 py-2.5 bg-[#25282c] border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#C2A676] hover:text-[#111315] hover:border-[#C2A676] transition-all flex items-center justify-center gap-2 mx-auto md:mx-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Update Profil
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ==========================================
          EDIT PROFILE MODAL
      ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1A1C1E] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl animate-[scaleUp_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Edit Profil</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={editForm.namaLengkap}
                  onChange={(e) => setEditForm({ ...editForm, namaLengkap: e.target.value })}
                  className="w-full bg-[#0f0f11] border border-[#333333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C2A676] transition-colors"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Nomor Telepon</label>
                <input
                  type="text"
                  value={editForm.noTelepon}
                  onChange={(e) => setEditForm({ ...editForm, noTelepon: e.target.value })}
                  className="w-full bg-[#0f0f11] border border-[#333333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C2A676] transition-colors"
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Foto Profil Baru (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#25282c] file:text-white hover:file:bg-[#333333] cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 mt-2">Maksimal 2MB. Format JPG, PNG.</p>
              </div>

              <div className="flex gap-3 pt-4 mt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-[#25282c] hover:bg-[#333333] text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-[#C2A676] hover:bg-[#e0c28d] text-[#111315] rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}