import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';

const LoginPage = () => {
  // State untuk Switch Member/Admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State untuk menampung ketikan user di form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State BARU untuk menampung pesan error
  const [errorMsg, setErrorMsg] = useState('');

  // Ubah judul tab browser & reset error ketika ganti tab Member/Admin
  useEffect(() => {
    document.title = isAdmin ? "Admin Login | GYMBROS" : "Member Login | GYMBROS";
    setErrorMsg(''); // Hilangkan pesan error jika user ganti mode login
    setEmail('');    // Kosongkan form juga biar rapi
    setPassword('');
  }, [isAdmin]);

  // Fungsi saat tombol login ditekan (Dummy Validation)
  const handleLogin = (e) => {
    e.preventDefault(); // Mencegah halaman ke-refresh
    setErrorMsg(''); // Reset error sebelum ngecek

    if (isAdmin) {
      // Cek Sandi Admin
      if (email === 'admin@gymbros.com' && password === 'admin123') {
        window.location.href = '/contohadmin'; // Arahkan ke rute admin
      } else {
        // Tampilkan error di UI, bukan di alert
        setErrorMsg('Email atau Password Admin salah!');
      }
    } else {
      // Cek Sandi Member
      if (email === 'member@gymbros.com' && password === 'member123') {
        window.location.href = '/contohmember'; // Arahkan ke rute member
      } else {
        // Tampilkan error di UI, bukan di alert
        setErrorMsg('Email atau Password Member salah!');
      }
    }
  };

  return (
    <div>
        <main className="min-h-screen w-full relative bg-[#111315] font-sans selection:bg-[#C2A676] selection:text-[#111315]">
        
        <header className="fixed top-0 w-full z-50 bg-[#111315]/80 backdrop-blur-md">
            <nav className="flex items-center justify-between px-5 md:px-10 py-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#555] uppercase mt-2">GYMBROS</h1>
            
            {/* Menu Desktop */}
            <ul className="hidden md:flex gap-8 text-xs font-bold tracking-widest uppercase text-[#BFBFBF] items-center">
                <li className="cursor-pointer hover:text-white transition-colors">
                    <a href="/landingpage#about">About Us</a>
                </li>
                <li  className="cursor-pointer hover:text-white transition-colors">
                    <a href="/landingpage#facility">Facility</a>
                </li>
                <li className="cursor-pointer hover:text-white transition-colors">
                {/* Link ke halaman lain */}
                <a href="/news">News</a>
                </li>
            </ul>
            </nav>
            </header>

        {/* Background Image (Diturunkan opacity agar form lebih jelas) */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none"
            style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')`
            }}
        ></div>

        {/* AREA TENGAH UNTUK CARD LOGIN */}
        <div className="relative z-10 w-full min-h-screen flex items-center justify-center pt-20">
            
            {/* Login Card Container */}
            <div className="relative w-full max-w-sm px-6 py-10 mx-4 bg-[#1A1C1E]/80 backdrop-blur-md rounded-3xl border border-[#333] shadow-2xl">
            
            {/* Tombol X untuk keluar */}
            <a 
                href="/landingpage" 
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#111315] border border-[#333] text-[#888] hover:text-white hover:bg-red-500/20 hover:border-red-500 transition-all"
                title="Kembali ke Landing Page"
            >
                ✕
            </a>

            {/* Header & Switch */}
            <div className="text-center mb-8 mt-2">
                <h1 className="text-3xl font-black tracking-widest text-white uppercase mb-6">
                {isAdmin ? "Admin Login" : "Member Login"}
                </h1>
                
                {/* Switch Toggle */}
                <div className="flex bg-[#111315] p-1 rounded-full w-fit mx-auto border border-[#333]">
                <button 
                    type="button"
                    onClick={() => setIsAdmin(false)}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                    !isAdmin ? 'bg-[#C2A676] text-[#111315]' : 'text-[#888] hover:text-white'
                    }`}
                >
                    Member
                </button>
                <button 
                    type="button"
                    onClick={() => setIsAdmin(true)}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                    isAdmin ? 'bg-[#C2A676] text-[#111315]' : 'text-[#888] hover:text-white'
                    }`}
                >
                    Admin
                </button>
                </div>
            </div>

            {/* FORM LOGIN */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                
                {/* --- KOTAK PERINGATAN ERROR MUNCUL DI SINI JIKA ADA ERROR --- */}
                {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2 animate-pulse">
                    <span>⚠️</span> {errorMsg}
                </div>
                )}
                
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C2A676] ml-2">
                    {isAdmin ? "Admin ID / Email" : "Member Email"}
                </label>
                <input 
                    type="email" 
                    placeholder={isAdmin ? "Contoh: admin@gymbros.com" : "Contoh: member@gymbros.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-[#111315] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder:text-[#555] ${
                    errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-[#333] focus:border-[#C2A676]'
                    }`}
                    required
                />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C2A676]">
                    Password
                    </label>
                </div>
                <input 
                    type="password" 
                    placeholder={isAdmin ? "Sandi: admin123" : "Sandi: member123"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-[#111315] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder:text-[#555] ${
                    errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-[#333] focus:border-[#C2A676]'
                    }`}
                    required
                />
                </div>

                {/* Submit Button */}
                <button 
                type="submit"
                className="w-full py-4 bg-[#C2A676] text-[#111315] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-colors mt-4"
                >
                {isAdmin ? "Access Dashboard" : "Start Training"}
                </button>
            </form>
            </div>
        
        </div>
        </main>
    

        <footer>
            <Footer />
        </footer>
     </div>            
  );
};

export default LoginPage;