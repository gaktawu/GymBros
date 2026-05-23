import { useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import Footer from "./Footer";

export default function MemberLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Paket Membership Akan Habis", message: "Paket Elite Anda akan berakhir dalam 7 hari. Segera perpanjang!", time: "1 jam lalu", read: false, type: "membership" },
    { id: 2, title: "Booking Kelas Dikonfirmasi", message: "Kelas HIIT Cardio Sabtu 07.00 berhasil dibooking.", time: "2 jam lalu", read: false, type: "classes" },
    { id: 3, title: "Promo: Diskon Suplemen 20%", message: "Gunakan kartu member Anda untuk diskon hingga 31 Mei.", time: "1 hari lalu", read: true, type: "promo" },
    { id: 4, title: "Laporan PT Tersedia", message: "Coach Rian mengunggah laporan perkembangan fisik bulan Mei.", time: "2 hari lalu", read: true, type: "pt" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { name: "Dashboard", path: "/member/dashboardmember" },
    { name: "Booking", path: "/member/booking" },
    { name: "Equipment", path: "/member/equipment" },
    { name: "Reports", path: "/member/reports" },
    { name: "Membership", path: "/member/membership" },
  ];

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsLogoutPopupOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutPopupOpen(false);
    navigate("/landingpage");
  };

  return (
    <div className="min-h-screen bg-[#111315]">
      <style>
        {`
          @keyframes popBounce {
            0% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.05); }
            70% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          .animate-pop-bounce { animation: popBounce 0.4s ease-out forwards; }
          .notif-scroll::-webkit-scrollbar { width: 5px; }
          .notif-scroll::-webkit-scrollbar-track { background: transparent; }
          .notif-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        `}
      </style>

      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center pt-6 px-4">

        {/* DESKTOP NAVBAR */}
        <nav className="hidden md:flex items-center gap-6 rounded-full bg-[#1e2023] px-5 py-2.5 shadow-lg ring-1 ring-white/10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-sm font-medium text-gray-300 transition hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* TOMBOL KANAN */}
        <div className="absolute top-6 right-7 md:right-8 flex items-center gap-3">

          {/* Tombol Menu Mobile */}
          <button
            className="md:hidden flex items-center rounded-full bg-[#1e2023] px-4 py-2 text-sm font-medium text-gray-300 ring-1 ring-white/10"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M3 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.5A.75.75 0 0 1 3.75 9h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>

          {/* NOTIFIKASI DROPDOWN (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="flex p-2 hover:bg-[#333333] rounded-xl text-[#888888] hover:text-[#C2A676] transition relative"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#C2A676] rounded-full border-2 border-[#111315]" />
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 top-12 w-80 bg-[#1e2023] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-pop-bounce">
                  {/* Header Dropdown */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#25282c]">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Notifikasi</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-[#C2A676] hover:text-white uppercase tracking-wider transition-colors"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* List Notifikasi */}
                  <div className="max-h-72 overflow-y-auto notif-scroll">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-gray-500">Belum ada notifikasi.</div>
                    ) : notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-[#25282c]/50 ${!notif.read ? 'bg-[#C2A676]/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-[#C2A676]' : 'bg-gray-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-gray-600 mt-1 font-medium">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer: View All */}
                  <div className="px-4 py-2.5 border-t border-white/10 bg-[#1a1c1f] text-center">
                    <Link
                      to="/member/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-[10px] font-black text-[#C2A676] uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Lihat Semua Notifikasi →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tombol Profil */}
          <Link
            to="/member/profile"
            className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10 transition hover:ring-gray-300 shadow-md"
            title="Pergi ke Profile"
          >
            <img
              src="https://i1.sndcdn.com/artworks-r6seSP84nT6z4DJx-iG01PA-t1080x1080.png"
              alt="Profile Menu"
              className="h-full w-full object-cover"
            />
          </Link>
        </div>

        {/* ================= MODAL MOBILE MENU ================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-full max-w-sm rounded-3xl bg-[#1e2023] p-6 shadow-2xl ring-1 ring-white/10 animate-pop-bounce">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e2023] text-gray-300 ring-1 ring-white/10 transition hover:bg-[#47484c] hover:text-white"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="divide-y divide-white/10">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block py-3 text-base font-medium text-gray-300 transition hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Notifikasi di Mobile Menu */}
                <Link
                  to="/member/notifications"
                  className="flex items-center justify-between py-3 text-base font-medium text-gray-300 transition hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-black text-[#C2A676] bg-[#C2A676]/10 border border-[#C2A676]/20 px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left block py-3 text-base font-medium text-[#af0909] transition hover:text-red-400"
                >
                  Log-out
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow pt-32 pb-10 px-4 md:px-8">
        <Outlet />
      </main>

      <footer>
        <Footer />
      </footer>

      {/* ================= MODAL KONFIRMASI LOGOUT ================= */}
      {isLogoutPopupOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsLogoutPopupOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-[#1e2023] p-6 text-center shadow-2xl ring-1 ring-white/10 animate-pop-bounce">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-[#af0909]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Konfirmasi Logout</h3>
            <p className="mb-6 text-sm text-gray-400">Apakah Anda yakin ingin keluar dari sesi ini?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutPopupOpen(false)}
                className="flex-1 rounded-lg bg-[#47484c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-lg bg-[#af0909] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}