import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const SESSIONS = [
  { id: 1, time: "08:00 - 09:30", name: "Hypertrophy Upper Body" },
  { id: 2, time: "13:00 - 14:30", name: "Fat Loss Cardio Circuit" },
  { id: 3, time: "18:30 - 20:00", name: "Powerlifting Basic" },
];

const CLASS_NOTES = {
  1: "Fokus: Compound movements (Bench Press, Rows, Shoulder Press). Rest 90 detik. Target RPE 8-9.",
  2: "Fokus: HIIT Circuit, 45 detik work / 15 detik rest. Heart rate zone 80-90%. Hydration check.",
  3: "Fokus: Teknik Squat, Deadlift, Bench. Linear progression. Spotter wajib ada.",
};

export default function DashboardCoach() {
  const [members, setMembers] = useState([]);
  const [activeSession, setActiveSession] = useState(1);
  const [attendance, setAttendance] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [manualCompletion, setManualCompletion] = useState(new Set());
  
  // State tambahan untuk menyimpan nama Coach yang login
  const [coachName, setCoachName] = useState("Coach");

  // ==========================================
  // FITUR KEAMANAN: PENGECEKAN TIKET MASUK (TOKEN)
  // ==========================================
  useEffect(() => {
    document.title = "Gymbros | Dashboard Coach";
    
    // 1. Ambil tiket (token) dan data diri dari localStorage
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');

    // 2. Jika tidak ada tiket, usir kembali ke halaman login
    if (!token || !userDataStr) {
      alert("Akses Ditolak: Anda harus login terlebih dahulu!");
      window.location.href = '/login'; // Sesuaikan dengan route login Anda
      return;
    }

    // 3. Jika punya tiket, cek apakah dia benar-benar Coach
    const user = JSON.parse(userDataStr);
    if (user.peran !== 'Coach') {
      alert("Akses Ditolak: Halaman ini khusus untuk Pelatih/Coach.");
      window.location.href = '/login'; 
      return;
    }

    // 4. Pasang tiket ke header Axios untuk API di masa depan
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 5. Tampilkan nama Coach di UI
    setCoachName(user.namaLengkap);
  }, []);
  // ==========================================

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get("https://randomuser.me/api/?results=12");
        const data = res.data.results.map((u, i) => ({
          id: i,
          name: `${u.name.first} ${u.name.last}`,
          photo: u.picture.medium,
          sessionId: Math.floor(i / 4) + 1,
        }));
        setMembers(data);
        const att = {};
        const nt = {};
        data.forEach((m) => {
          att[m.id] = false;
          nt[m.id] = "";
        });
        setAttendance(att);
        setNotes(nt);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const toggleAttendance = (id) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateNote = (id, value) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const toggleSessionCompletion = (sessionId) => {
    setManualCompletion((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const activeMembers = useMemo(() => {
    return members.filter((m) => m.sessionId === activeSession);
  }, [members, activeSession]);

  const filteredSessions = useMemo(() => {
    let sessions = SESSIONS.map((s) => ({
      ...s,
      memberCount: members.filter((m) => m.sessionId === s.id).length,
      presentCount: members.filter((m) => m.sessionId === s.id && attendance[m.id]).length,
      isCompleted: manualCompletion.has(s.id),
    }));

    if (searchQuery.trim()) {
      sessions = sessions.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.time.includes(searchQuery)
      );
    }

    if (filterStatus === "completed") {
      sessions = sessions.filter((s) => s.isCompleted);
    } else if (filterStatus === "pending") {
      sessions = sessions.filter((s) => !s.isCompleted);
    }

    return sessions;
  }, [members, attendance, searchQuery, filterStatus, manualCompletion]);

  const totalMembers = members.length;
  const completedCount = manualCompletion.size;
  const totalPresent = Object.values(attendance).filter(Boolean).length;
  const attendanceRate = totalMembers > 0 ? Math.round((totalPresent / totalMembers) * 100) : 0;

  const currentSession = SESSIONS.find((s) => s.id === activeSession);
  const isCurrentCompleted = manualCompletion.has(activeSession);

  return (
    <div className="min-h-screen bg-[#0f0f11] text-slate-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-[fadeIn_0.5s_ease-out]">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase">
            Dashboard {coachName}
          </h1>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a1a1e] border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-emerald-900/5 animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Member
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {totalMembers} <span className="text-sm font-normal text-slate-400">Klien</span>
            </div>
          </div>

          <div className="bg-[#1a1a1e] border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-emerald-900/5 animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sesi Selesai
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {completedCount} <span className="text-sm font-normal text-slate-400">/ {SESSIONS.length} Sesi</span>
            </div>
          </div>

          <div className="bg-[#1a1a1e] border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-emerald-900/5 animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Presensi
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{attendanceRate}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
            <div className="bg-[#1a1a1e] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari sesi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0f0f11] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <div className="flex gap-2">
                {["all", "completed", "pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      ${filterStatus === status
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-800 hover:border-slate-700"
                      }`}
                  >
                    {status === "all" ? "Semua" : status === "completed" ? "Selesai" : "Belum"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredSessions.map((session) => {
                const isActive = activeSession === session.id;
                const progress = session.memberCount > 0 ? (session.presentCount / session.memberCount) * 100 : 0;
                const isCompleted = session.isCompleted;

                return (
                  <button
                    key={session.id}
                    onClick={() => setActiveSession(session.id)}
                    className={`w-full text-left rounded-2xl p-5 border transition-all duration-300 group relative overflow-hidden
                      ${isActive
                        ? "bg-[#1a1a1e] border-emerald-500/40 shadow-lg shadow-emerald-900/10"
                        : "bg-[#1a1a1e]/60 border-slate-800 hover:border-slate-700 hover:bg-[#1a1a1e]"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                    )}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {session.time}
                        </span>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider border border-emerald-500/20">
                              Selesai
                            </span>
                          )}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                              ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500 group-hover:text-slate-300"}`}
                          >
                            {isActive ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`text-base font-semibold mb-3 ${isActive ? "text-white" : "text-slate-300"}`}>
                        {session.name}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>
                          {session.presentCount} / {session.memberCount} Hadir
                        </span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? "bg-emerald-500" : "bg-slate-600"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-500">
                          {isCompleted ? "Status: latihan selesai" : "Status: sedang berlangsung"}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSessionCompletion(session.id);
                          }}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer transition-all duration-200 active:scale-95
                            ${isCompleted
                              ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                              : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20"
                            }`}
                        >
                          {isCompleted ? "Batalkan" : "Tandai Selesai"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 animate-[fadeIn_0.5s_ease-out_0.5s_both]">
            {loading ? (
              <div className="h-96 flex items-center justify-center bg-[#1a1a1e] border border-slate-800 rounded-2xl">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-[#1a1a1e] border border-slate-800 rounded-2xl p-6 transition-all duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-white">{currentSession.name}</h2>
                      {isCurrentCompleted && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
                          Selesai
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{currentSession.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSessionCompletion(activeSession)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
                        ${isCurrentCompleted
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                          : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                        }`}
                    >
                      {isCurrentCompleted ? "Batalkan Selesai" : "Tandai Selesai"}
                    </button>
                    <div className="px-4 py-2 bg-slate-800 rounded-xl text-sm font-medium text-slate-300">
                      {activeMembers.length} Peserta
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f0f11] border border-slate-800 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Class Focus / Notes
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {CLASS_NOTES[activeSession]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMembers.map((member, index) => {
                    const isPresent = attendance[member.id] ?? false;
                    return (
                      <div
                        key={member.id}
                        className="bg-[#0f0f11] border border-slate-800 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-700 transition-all duration-300 animate-[fadeInUp_0.4s_ease-out_both]"
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-100 text-sm truncate">{member.name}</div>
                            <div className="text-xs text-slate-500">Member</div>
                          </div>
                          <button
                            onClick={() => toggleAttendance(member.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95
                              ${isPresent
                                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                              }`}
                          >
                            {isPresent ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Catatan performa..."
                          value={notes[member.id] || ""}
                          onChange={(e) => updateNote(member.id, e.target.value)}
                          className="w-full bg-[#1a1a1e] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}