import { useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import Footer from "./Footer";

export default function MemberLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const navigate = useNavigate();

  // Daftar menu khusus Member
  const navItems = [
    { name: "Dashboard", path: "/member/dashboardmember" },
    { name: "Booking", path: "/member/booking" },
    { name: "Equipment", path: "/member/equipment" },
    { name: "Reports", path: "/member/reports" },
  ];

  // Fungsi saat tombol logout ditekan (memicu popup)
  const handleLogoutClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsLogoutPopupOpen(true);
  };

  // Fungsi eksekusi logout
  const confirmLogout = () => {
    setIsLogoutPopupOpen(false);
    navigate("/landingpage");
  };

  return (
    <>
      <style>
        {`
          @keyframes popBounce {
            0% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.05); }
            70% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          .animate-pop-bounce {
            animation: popBounce 0.4s ease-out forwards;
          }
        `}
      </style>

      {/* Header mengambang di atas */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center pt-6 px-4">
        
        {/* ================= DESKTOP NAVBAR ================= */}
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

        {/* ================= TOMBOL KANAN ================= */}
        <div className="absolute top-6 right-7 md:right-8 flex items-center gap-3">
          
          {/* Tombol Menu Mobile (Hanya muncul di layar HP) */}
          <button 
            className="md:hidden flex items-center rounded-full bg-[#1e2023] px-4 py-2 text-sm font-medium text-gray-300 ring-1 ring-white/10"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M3 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.5A.75.75 0 0 1 3.75 9h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Tombol Profil Member */}
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
      <button onClick={handleLogoutClick} className="hidden md:flex items-center rounded-full bg-[#af0909] px-4 py-2 text-sm font-medium text-gray-300 ring-1 ring-white/10 transition hover:bg-red-700 hover:text-white">Logout</button>

        </div>

        {/* ================= MODAL MOBILE MENU ================= */}
        {/* ================= MODAL MOBILE MENU ================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 md:hidden">
            
            {/* Latar Belakang Gelap (Klik untuk tutup) */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Kotak Menu Popup (Diberi class animate-pop-bounce) */}
            <div className="relative w-full max-w-sm rounded-3xl bg-[#1e2023] p-6 shadow-2xl ring-1 ring-white/10 animate-pop-bounce">
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">Navigation</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e2023] text-gray-300 ring-1 ring-white/10 transition hover:bg-[#47484c] hover:text-white"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* List Menu Mobile */}
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

               {/* Tombol Logout Mobile diubah menjadi button agar memicu popup */}
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
          
          {/* Latar Belakang Gelap */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsLogoutPopupOpen(false)}
          ></div>
          
          {/* Kotak Popup Konfirmasi (Juga pakai animasi pop-bounce) */}
          <div className="relative w-full max-w-sm rounded-2xl bg-[#1e2023] p-6 text-center shadow-2xl ring-1 ring-white/10 animate-pop-bounce">
            
            {/* Ikon Peringatan/Logout */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-[#af0909]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            
            <h3 className="mb-2 text-xl font-bold text-white">Konfirmasi Logout</h3>
            <p className="mb-6 text-sm text-gray-400">Apakah Anda yakin ingin keluar dari sesi ini?</p>
            
            {/* Tombol Aksi */}
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
    </>
  );
}