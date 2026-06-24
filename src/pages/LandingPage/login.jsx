import React, { useState, useEffect } from 'react';
import Footer from "../../components/Footer";

const LoginPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State baru untuk efek loading

  useEffect(() => {
    if (isCoach) {
      document.title = "Coach Login | GYMBROS";
    } else if (isAdmin) {
      document.title = "Admin Login | GYMBROS";
    } else {
      document.title = "Member Login | GYMBROS";
    }
    setErrorMsg(''); 
    setEmail('');    
    setPassword('');
  }, [isAdmin, isCoach]);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setErrorMsg(''); 
    setIsLoading(true);

    try {
      // 1. Kirim request ke Backend Node.js
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 2. Cek apakah response dari backend sukses
      if (response.ok && data.success) {
        const loggedInUser = data.data.user;
        const token = data.data.token;

        // 3. Validasi Role: Pastikan user login di tab yang sesuai
        const expectedRole = isAdmin ? 'Admin' : isCoach ? 'Coach' : 'Member';
        
        if (loggedInUser.peran !== expectedRole) {
          setErrorMsg(`Gagal: Akun ini terdaftar sebagai ${loggedInUser.peran}, bukan ${expectedRole}.`);
          setIsLoading(false);
          return;
        }

        // 4. Simpan Token JWT dan Data User ke Local Storage Browser
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        // 5. Redirect ke halaman yang sesuai
        if (expectedRole === 'Admin') {
          window.location.href = '/contohadmin';
        } else if (expectedRole === 'Coach') {
          window.location.href = '/Dashboardcoach';
        } else {
          window.location.href = '/contohmember';
        }
      } else {
        // Tampilkan pesan error dari backend (misal: "Email atau password salah")
        setErrorMsg(data.message || 'Login gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMsg('Tidak dapat terhubung ke server. Pastikan backend menyala.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToAdmin = () => {
    setIsAdmin(true);
    setIsCoach(false);
  };

  const switchToCoach = () => {
    setIsAdmin(false);
    setIsCoach(true);
  };

  const switchToMember = () => {
    setIsAdmin(false);
    setIsCoach(false);
  };

  return (
    <div>
      <main className="min-h-screen w-full relative bg-[#111315] font-sans selection:bg-[#C2A676] selection:text-[#111315]">
        
        <header className="fixed top-0 w-full z-50 bg-[#111315]/80 backdrop-blur-md">
          <nav className="flex items-center justify-between px-5 md:px-10 py-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#555] uppercase mt-2">GYMBROS</h1>
            
            <ul className="hidden md:flex gap-8 text-xs font-bold tracking-widest uppercase text-[#BFBFBF] items-center">
              <li className="cursor-pointer hover:text-white transition-colors">
                <a href="/landingpage#about">About Us</a>
              </li>
              <li className="cursor-pointer hover:text-white transition-colors">
                <a href="/landingpage#facility">Facility</a>
              </li>
              <li className="cursor-pointer hover:text-white transition-colors">
                <a href="/news">News</a>
              </li>
            </ul>
          </nav>
        </header>

        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')`
          }}
        ></div>

        <div className="relative z-10 w-full min-h-screen flex items-center justify-center pt-20">
            
          <div className="relative w-full max-w-sm px-6 py-10 mx-4 bg-[#1A1C1E]/80 backdrop-blur-md rounded-3xl border border-[#333] shadow-2xl">
            
            <a 
              href="/landingpage" 
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#111315] border border-[#333] text-[#888] hover:text-white hover:bg-red-500/20 hover:border-red-500 transition-all"
              title="Kembali ke Landing Page"
            >
              ✕
            </a>

            <div className="text-center mb-8 mt-2">
              <h1 className="text-3xl font-black tracking-widest text-white uppercase mb-6">
                {isCoach ? "Coach Login" : isAdmin ? "Admin Login" : "Member Login"}
              </h1>
                
              <div className="flex bg-[#111315] p-1 rounded-full w-fit mx-auto border border-[#333]">
                <button 
                  type="button"
                  onClick={switchToMember}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                    !isAdmin && !isCoach ? 'bg-[#C2A676] text-[#111315]' : 'text-[#888] hover:text-white'
                  }`}
                >
                  Member
                </button>
                <button 
                  type="button"
                  onClick={switchToCoach}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                    isCoach ? 'bg-[#C2A676] text-[#111315]' : 'text-[#888] hover:text-white'
                  }`}
                >
                  Coach
                </button>
                <button 
                  type="button"
                  onClick={switchToAdmin}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                    isAdmin ? 'bg-[#C2A676] text-[#111315]' : 'text-[#888] hover:text-white'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2 animate-pulse">
                  <span>⚠️</span> {errorMsg}
                </div>
              )}
                
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C2A676] ml-2">
                  {isAdmin ? "Admin ID / Email" : isCoach ? "Coach Email" : "Member Email"}
                </label>
                <input 
                  type="email" 
                  placeholder={
                    isAdmin 
                      ? "Contoh: admin@gymbros.com" 
                      : isCoach 
                        ? "Contoh: coach@gymbros.com" 
                        : "Contoh: member@gymbros.com"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#111315] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder:text-[#555] ${
                    errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-[#333] focus:border-[#C2A676]'
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C2A676]">
                    Password
                  </label>
                </div>
                <input 
                  type="password" 
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#111315] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder:text-[#555] ${
                    errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-[#333] focus:border-[#C2A676]'
                  }`}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 font-black uppercase tracking-[0.2em] rounded-xl transition-colors mt-4 ${
                  isLoading 
                    ? 'bg-[#555] text-[#888] cursor-not-allowed' 
                    : 'bg-[#C2A676] text-[#111315] hover:bg-white'
                }`}
              >
                {isLoading ? "Memproses..." : (isAdmin ? "Access Dashboard" : isCoach ? "Access Coach Panel" : "Start Training")}
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