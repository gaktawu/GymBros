import React, { useEffect, useState } from 'react'; // 1. Menambahkan useState

const DashboardMember = () => {
  // State untuk mensimulasikan check-in (Conditional Rendering)
  const [isCheckedIn, setIsCheckedIn] = useState(false); 

  const memberData = {
    name: "ALEXANDER BRO",
    id: "GB-99210",
    joinDate: "Januari 2026",
    planType: "KEANGGOTAAN ELITE BRO",
    status: "AKTIF",
    expiryDate: "31 Desember 2026",
    gymCapacity: 42, 
    monthlyGoal: { target: 20, achieved: 14 }, 
    stats: {
      attendanceThisMonth: 14,
      workoutStreak: 5,
      totalHours: 28
    },
    upcomingClasses: [
      { id: 1, name: "Dasar-Dasar Powerlifting", coach: "Coach Iron", time: "Hari Ini, 18:30", zone: "Area Power Rack" },
      { id: 2, name: "Kondisi HIIT", coach: "Coach Sarah", time: "Besok, 08:00", zone: "Zona Kardio" }
    ]
  };

  useEffect(() => {
    document.title = "Gymbros | Dasbor Member";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";
    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  return (
    <main className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none animate-fade-in bg-[#111315]">
      
      {/* BAGIAN HERO / WELCOME */}
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden shadow-xl hover:scale-[1.01] transition-transform duration-300">
        <div className="z-10">
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">AREA MEMBER</h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">SELAMAT DATANG KEMBALI, BRO!</h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            "Satu-satunya latihan yang buruk adalah latihan yang tidak pernah kamu lakukan." Konsistensimu mantap, terus lampaui batas kemampuanmu hari ini!
          </p>
        </div>
        <div className="px-4 py-2 bg-[#C2A676]/10 border border-[#C2A676]/30 rounded-full text-[#C2A676] text-xs font-black tracking-widest uppercase z-10 shadow-[0_0_15px_rgba(194,166,118,0.1)]">
          {memberData.planType}
        </div>
      </div>

      {/* METRIC UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KAPASITAS GYM */}
        <div className="bg-[#1e2023] border border-white/5 p-5 rounded-3xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-black text-gray-400 tracking-wider uppercase">STATUS LIVE</h4>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Meteran Kapasitas Gym</h3>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Kondisi keramaian alat latihan saat ini di Gymbros pusat.</p>
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#C2A676] uppercase tracking-wider">Status: Optimal</span>
              <span className="text-white">{memberData.gymCapacity}% Terisi</span>
            </div>
            <div className="w-full bg-[#25282c] h-3 rounded-full overflow-hidden p-[2px] border border-white/5">
              <div 
                className="bg-gradient-to-r from-green-500 to-[#C2A676] h-full rounded-full transition-all duration-500"
                style={{ width: `${memberData.gymCapacity}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* TARGET BULANAN */}
        <div className="bg-[#1e2023] border border-white/5 p-5 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-gray-400 tracking-wider uppercase">PANTAU TARGET</h4>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Konsistensi Target Bulanan</h3>
          </div>
          <div className="flex items-center justify-between my-3">
            <p className="text-xs text-gray-400 max-w-[200px]">Sisa <span className="text-white font-bold">{memberData.monthlyGoal.target - memberData.monthlyGoal.achieved} sesi latihan</span> lagi untuk mencapai target bulananmu.</p>
            <div className="text-right">
              <span className="text-2xl font-black text-white">{memberData.monthlyGoal.achieved}</span>
              <span className="text-gray-500 font-bold">/{memberData.monthlyGoal.target} Hari</span>
            </div>
          </div>
          <div className="w-full bg-[#25282c] h-3 rounded-full overflow-hidden p-[2px] border border-white/5">
            <div 
              className="bg-[#C2A676] h-full rounded-full transition-all duration-500"
              style={{ width: `${(memberData.monthlyGoal.achieved / memberData.monthlyGoal.target) * 100}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* STATISTIK & JADWAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* STATS COUNTER */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
              <p className="text-2xl md:text-4xl font-black text-[#C2A676]">{memberData.stats.attendanceThisMonth}</p>
              <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Hari Hadir</p>
            </div>
            <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
              <p className="text-2xl md:text-4xl font-black text-white">{memberData.stats.workoutStreak} 🔥</p>
              <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Rentetan Hari</p>
            </div>
            <div className="bg-[#1e2023] border border-white/5 p-4 text-center rounded-2xl shadow-md hover:border-[#C2A676]/30 transition-colors">
              <p className="text-2xl md:text-4xl font-black text-white">{memberData.stats.totalHours}</p>
              <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase mt-1">Total Jam</p>
            </div>
          </div>

          {/* JADWAL KELAS */}
          <div className="bg-[#1e2023] border border-white/5 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-black tracking-widest text-white uppercase">Kelas Terjadwal Hari Ini</h4>
              <a href="/member/booking" className="text-[11px] font-black tracking-wider text-[#C2A676] uppercase hover:underline">Lihat Semua Jadwal →</a>
            </div>
            <div className="space-y-3">
              {memberData.upcomingClasses.map((cls) => (
                <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#25282c] border border-white/5 rounded-2xl hover:border-[#C2A676]/40 transition-all duration-300 group">
                  <div>
                    <h5 className="text-sm font-black text-white uppercase group-hover:text-[#C2A676] transition-colors">{cls.name}</h5>
                    <p className="text-xs text-gray-400 mt-0.5">bersama <span className="text-[#C2A676] font-medium">{cls.coach}</span> | {cls.zone}</p>
                  </div>
                  <div className="text-xs font-bold bg-[#1e2023] border border-white/5 px-3 py-1.5 rounded-xl text-gray-300 text-center sm:text-right">
                    ⏰ {cls.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BRO-TIP */}
          <div className="bg-[#1A1C1E] border-l-4 border-[#C2A676] p-4 rounded-r-2xl shadow-md">
            <p className="text-xs font-black tracking-wider text-[#C2A676] uppercase">💡 BRO-TIP HARI INI</p>
            <p className="text-xs text-gray-300 mt-1 italic">
              "Konsumsi protein sekitar 1.6 - 2.2 gram per kilogram berat badan Anda setiap hari untuk memaksimalkan proses hipertrofi otot setelah melakukan latihan berat."
            </p>
          </div>

        </div>

        {/* QR CODE / DIGITAL PASS */}
        <div className="bg-[#1e2023] border border-white/5 shadow-lg p-6 rounded-3xl flex flex-col items-center justify-between text-center min-h-[350px]">
          <div>
            <h4 className="text-sm font-black tracking-widest text-white uppercase">GYM PASS DIGITAL</h4>
            <p className="text-[11px] text-gray-400 mt-1">Pindai kode ini di terminal gerbang untuk masuk/check-in</p>
          </div>
          
          <div className="w-44 h-44 bg-white p-3 rounded-2xl flex items-center justify-center my-4 relative shadow-md group">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Gymbros-Alex-GB-99210" 
              alt="QR Code Tiket Masuk Gym" 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="w-full space-y-3">
            <p className="text-xs font-black text-white tracking-widest uppercase">{memberData.name}</p>
            
            {/* 3. IMPLEMENTASI CONDITIONAL RENDERING */}
            {isCheckedIn ? (
              <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-xs font-bold uppercase tracking-wider">
                Selesai Check-In! Selamat Berlatih 💪
              </div>
            ) : (
              <button 
                onClick={() => setIsCheckedIn(true)}
                className="w-full py-2 bg-[#C2A676] hover:bg-[#b09365] active:scale-95 transition-all text-black font-black text-xs rounded-xl uppercase tracking-wider"
              >
                Simulasi Scan QR
              </button>
            )}

            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Status: {memberData.status}</span>
            </div>
          </div>
        </div>

      </div>

    </main>
  );
};

export default DashboardMember;