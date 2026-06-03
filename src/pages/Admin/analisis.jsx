import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  Users,
  Clock,
  Award,
  RefreshCw,
  Activity,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const revenueData = [
  { name: "Sen", membership: 1200000, pt: 800000 },
  { name: "Sel", membership: 1500000, pt: 950000 },
  { name: "Rab", membership: 1100000, pt: 700000 },
  { name: "Kam", membership: 1800000, pt: 1200000 },
  { name: "Jum", membership: 2000000, pt: 1400000 },
  { name: "Sab", membership: 2500000, pt: 1800000 },
  { name: "Min", membership: 1900000, pt: 1100000 },
];

const productData = [
  { name: "PT 10 Sesi", value: 45, color: "#d4af37" },
  { name: "PT 30 Sesi", value: 30, color: "#c5a028" },
  { name: "Member Bulanan", value: 15, color: "#8b7355" },
  { name: "Member 3 Bulan", value: 10, color: "#6b5a3e" },
];

const coachData = [
  { name: "Andi", sessions: 42, hours: 84, rating: 4.9 },
  { name: "Budi", sessions: 38, hours: 76, rating: 4.7 },
  { name: "Citra", sessions: 35, hours: 70, rating: 4.8 },
  { name: "Dewi", sessions: 28, hours: 56, rating: 4.6 },
  { name: "Eko", sessions: 25, hours: 50, rating: 4.5 },
];

const attendanceData = [
  { time: "06:00", members: 12 },
  { time: "08:00", members: 28 },
  { time: "10:00", members: 15 },
  { time: "12:00", members: 22 },
  { time: "16:00", members: 35 },
  { time: "18:00", members: 48 },
  { time: "20:00", members: 30 },
  { time: "21:00", members: 18 },
];

const memberGrowthData = [
  { month: "Jan", active: 45, new: 12, churned: 3 },
  { month: "Feb", active: 52, new: 15, churned: 4 },
  { month: "Mar", active: 58, new: 10, churned: 2 },
  { month: "Apr", active: 64, new: 18, churned: 5 },
  { month: "Mei", active: 72, new: 14, churned: 3 },
  { month: "Jun", active: 75, new: 16, churned: 4 },
];

const retentionData = [
  { month: "Jan", rate: 78 },
  { month: "Feb", rate: 82 },
  { month: "Mar", rate: 80 },
  { month: "Apr", rate: 85 },
  { month: "Mei", rate: 88 },
  { month: "Jun", rate: 86 },
];

const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
};

const MetricCard = ({ icon: Icon, label, value, prefix, suffix, subtext }) => (
  <motion.div
    variants={fadeIn}
    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#d4af37]/30 transition-colors duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-[#d4af37]/10 rounded-xl">
        <Icon size={20} className="text-[#d4af37]" />
      </div>
    </div>
    <p className="text-[#888] text-sm mb-1">{label}</p>
    <h3 className="text-2xl font-bold text-white mb-1">
      <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
    </h3>
    {subtext && <p className="text-[#666] text-xs">{subtext}</p>}
  </motion.div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-white">{title}</h2>
    <p className="text-[#666] text-sm mt-1">{subtitle}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-[#888] text-xs mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: Rp {entry.value ? entry.value.toLocaleString("id-ID") : 0}
        </p>
      ))}
    </div>
  );
};

const CustomTooltipSimple = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-[#888] text-xs mb-1">{label}</p>
      <p className="text-white text-sm font-medium">
        {payload[0].value !== undefined ? payload[0].value : ""}
      </p>
    </div>
  );
};

export default function Analystic() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalRevenue = 12450000;
  const activeMembers = 75;
  const retentionRate = 86;
  const totalSessions = 168;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <motion.div variants={fadeIn} className="mb-10">
          <h1 className="text-3xl font-bold text-white">Dashboard Analisis</h1>
          <p className="text-[#666] mt-1">Pantau performa akumulatif bisnis gym Anda secara real-time</p>
        </motion.div>

        {/* METRICS */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <MetricCard
            icon={DollarSign}
            label="Total Pendapatan"
            value={totalRevenue}
            prefix="Rp "
            subtext="Kumulatif membership & PT"
          />
          <MetricCard
            icon={Users}
            label="Member Aktif"
            value={activeMembers}
            suffix=" orang"
            subtext="Kontrak masih berjalan"
          />
          <MetricCard
            icon={RefreshCw}
            label="Rasio Perpanjangan"
            value={retentionRate}
            suffix="%"
            subtext="Rata-rata memperpanjang"
          />
          <MetricCard
            icon={Activity}
            label="Total Sesi Latihan"
            value={totalSessions}
            suffix=" sesi"
            subtext="Semua pelatih"
          />
        </motion.div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <motion.div variants={fadeIn} className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <SectionHeader title="Tren Pendapatan" subtitle="Perbandingan membership vs personal training" />
            <div className="h-72">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="gradMember" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradPt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b7355" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b7355" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `Rp${v / 1000000}jt`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="membership" name="Membership" stroke="#d4af37" fill="url(#gradMember)" strokeWidth={2} />
                    <Area type="monotone" dataKey="pt" name="Personal Training" stroke="#8b7355" fill="url(#gradPt)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <SectionHeader title="Produk Paling Laris" subtitle="Distribusi penjualan paket" />
            <div className="h-64">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={1200}
                    >
                      {productData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipSimple />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-3 mt-2">
              {productData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#aaa]">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <motion.div variants={fadeIn} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <SectionHeader title="Jam Terbang Pelatih" subtitle="Performa & utilisasi coach" />
            <div className="space-y-5">
              {coachData.map((coach, idx) => (
                <motion.div
                  key={coach.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] font-bold text-sm">
                    {coach.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{coach.name}</span>
                      <span className="text-xs text-[#888]">{coach.sessions} sesi • {coach.hours} jam</span>
                    </div>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(coach.sessions / 42) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-[#d4af37] rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#d4af37]">
                    <Award size={14} />
                    {coach.rating}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <SectionHeader title="Tingkat Kehadiran Kelas" subtitle="Jam ramai member di gym" />
            <div className="h-72">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="time" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="members" fill="#d4af37" radius={[6, 6, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 p-4 bg-[#d4af37]/5 rounded-xl border border-[#d4af37]/10">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[#d4af37] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Jam Puncak: 18:00 - 20:00</p>
                  <p className="text-xs text-[#888] mt-0.5">Pertimbangkan untuk menambah slot kelas pada jam ramai</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CHARTS ROW 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={fadeIn} className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <SectionHeader title="Pertumbuhan Member" subtitle="Aktivasi, churn, dan retensi" />
            <div className="h-72">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={memberGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line type="monotone" dataKey="active" name="Aktif" stroke="#d4af37" strokeWidth={2} dot={{ fill: "#d4af37" }} />
                    <Line type="monotone" dataKey="new" name="Baru" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
                    <Line type="monotone" dataKey="churned" name="Churn" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <SectionHeader title="Rasio Perpanjangan" subtitle="Retention rate 6 bulan terakhir" />
            <div className="h-56">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retentionData}>
                    <defs>
                      <linearGradient id="gradRetention" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => [`${value}%`, "Retention"]}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#22c55e" fill="url(#gradRetention)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#22c55e]/5 rounded-xl border border-[#22c55e]/10">
                <span className="text-sm text-[#aaa]">Target Retensi</span>
                <span className="text-sm font-semibold text-[#22c55e]">90%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#ef4444]/5 rounded-xl border border-[#ef4444]/10">
                <span className="text-sm text-[#aaa]">Gap</span>
                <span className="text-sm font-semibold text-[#ef4444]">-4%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}