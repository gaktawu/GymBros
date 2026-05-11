import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function MemberLayout() {
  // State untuk membuka/menutup menu di HP
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Daftar menu sesuai PDF (hanya contoh, sesuaikan link-nya nanti)
  const menuItems = [
    { name: "Dashboard", path: "/member-dashboard", icon: "📊" },
    { name: "Membership", path: "/member-membership", icon: "👥" },
    { name: "Kelola Kelas", path: "/member-kelas", icon: "📅" },
    { name: "Kelola Alat", path: "/member-alat", icon: "🏋️‍♂️" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      
      {/* --- TOPBAR MOBILE (Tampil hanya di layar kecil) --- */}
      <header className="md:hidden flex items-center justify-between bg-[#1e1f22] p-4 text-white">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 text-white p-1 rounded">💪</div>
          <span className="font-bold text-lg">GYM MEMBER</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none"
        >
          {/* Ikon Hamburger Sederhana */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* --- SIDEBAR DESKTOP & DROP-DOWN MOBILE --- */}
      <aside className={`
        ${isMobileMenuOpen ? "flex" : "hidden"} 
        md:flex flex-col w-full md:w-64 bg-[#1e1f22] text-white transition-all duration-300
      `}>
        {/* Logo (Sembunyi di Mobile karena sudah ada di Topbar) */}
        <div className="hidden md:flex items-center gap-3 p-6 mb-4">
          <div className="bg-blue-500 text-white p-2 rounded text-xl">💪</div>
          <span className="font-bold text-xl tracking-wider">GYM MEMBER</span>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#47484c] hover:text-white transition"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bagian Bawah: Settings & Profile (Sesuai Referensi Gambar) */}
        <div className="p-4 border-t border-[#4c4e51] mt-auto">
          <Link to="/member-settings" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition">
            <span>⚙️</span> Settings
          </Link>
          <button className="flex items-center gap-3 px-4 py-2 mb-4 text-red-400 hover:text-red-300 transition w-full text-left">
            <span>🚪</span> Logout
          </button>
          
          {/* Profil User (Bisa diklik menuju halaman profil) */}
          <Link to="/member-profile" className="flex items-center gap-3 p-3 bg-[#1e2023] hover:bg-[#4c4e51] rounded-lg transition cursor-pointer">
            <img 
              src="https://ui-avatars.com/api/?name=Member+Gym&background=2563eb&color=fff" 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Member Gym</span>
              <span className="text-xs text-gray-400">member@gym.com</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* --- KONTEN UTAMA (Tempat 15 frame temanmu disuntikkan) --- */}
      <main className="flex-1 bg-gray-50 flex flex-col overflow-y-auto max-h-screen">
        <div className="p-4 md:p-8 flex-1">
          {/* Outlet ini ibarat "lubang" tempat halaman React di render */}
          <Outlet /> 
        </div>
        
        {/* FOOTER GLOBAL */}
        <footer className="text-center p-4 text-sm text-gray-500 mt-auto border-t">
          &copy; 2026 GYM System Management. All rights reserved.
        </footer>
      </main>

    </div>
  );
}