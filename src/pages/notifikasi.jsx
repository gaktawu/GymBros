import React, { useState, useEffect } from 'react';

const AdminNotifications = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [notifications, setNotifications] = useState([
        { id: "NOTIF-001", category: "Member", title: "CHECK-IN MEMBER: QR CODE VIA RFID", description: "Member GB-99201 (ADRIAN SUTANTO) melakukan check-in di Gate 1.", timestamp: "2026-05-22T19:05:00Z", status: "unread", type: "info" },
        { id: "NOTIF-002", category: "Member", title: "RIWAYAT MEDIS BARU", description: "Member GB-99245 (REZA ALDIAN) memperbarui data riwayat medis.", timestamp: "2026-05-22T15:30:00Z", status: "unread", type: "warning" },
        { id: "NOTIF-003", category: "Classes", title: "PEMBATALAN OTOMATIS: KUOTA KELAS PENUH", description: "Kelas HIIT Cardio pukul 20.00 telah penuh.", timestamp: "2026-05-22T18:45:00Z", status: "unread", type: "danger" },
        { id: "NOTIF-004", category: "Classes", title: "ABSENSI INSTRUKTUR KELAS", description: "Coach Hendra telah melakukan check-in kehadiran.", timestamp: "2026-05-22T18:15:00Z", status: "read", type: "success" },
        { id: "NOTIF-005", category: "PT", title: "PENCOCOKAN KLIEN BARU", description: "Member baru GB-99310 memerlukan PT spesialisasi Fat Loss.", timestamp: "2026-05-22T16:20:00Z", status: "unread", type: "info" },
        { id: "NOTIF-006", category: "PT", title: "EVALUASI PERFORMA FISIK", description: "Coach Rian mengunggah grafik perkembangan fisik member GB-99205.", timestamp: "2026-05-22T12:00:00Z", status: "read", type: "success" },
        { id: "NOTIF-007", category: "Finance", title: "KASIR DIGITAL (POS): PENJUALAN", description: "Transaksi POS Berhasil. Penjualan 2 botol Whey Protein.", timestamp: "2026-05-22T19:00:00Z", status: "unread", type: "success" },
        { id: "NOTIF-008", category: "Finance", title: "INVOICE OTOMATIS GENERATED", description: "Sistem recurring billing berhasil menerbitkan tagihan.", timestamp: "2026-05-22T01:00:00Z", status: "read", type: "info" },
        { id: "NOTIF-009", category: "Facilities", title: "LAPORAN KERUSAKAN ALAT", description: "Treadmill Zona B (Unit T-04) mengalami error sensor.", timestamp: "2026-05-22T14:10:00Z", status: "unread", type: "danger" },
        { id: "NOTIF-010", category: "Facilities", title: "LOG PERAWATAN RUTIN ALAT", description: "Teknisi menjadwalkan servis rutin berkala.", timestamp: "2026-05-21T10:00:00Z", status: "read", type: "warning" },
        { id: "NOTIF-011", category: "CRM", title: "PENGINGAT OTOMATIS: PAKET HABIS", description: "Sistem mengirimkan notifikasi via WhatsApp kepada 15 member.", timestamp: "2026-05-22T08:00:00Z", status: "unread", type: "info" },
        { id: "NOTIF-012", category: "CRM", title: "BROADCASTER PROMO BERHASIL", description: "Pesan massal diskon suplemen 20% telah disiarkan.", timestamp: "2026-05-21T15:00:00Z", status: "read", type: "success" }
    ]);

    const [deleteId, setDeleteId] = useState(null);

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => notif.id === id ? { ...notif, status: 'read' } : notif));
    };

    const confirmDelete = () => {
        setNotifications(notifications.filter(n => n.id !== deleteId));
        setDeleteId(null);
    };

    const categories = [
        { key: 'All', label: 'All Notifications' },
        { key: 'Member', label: 'Members' },
        { key: 'Classes', label: 'Classes' },
        { key: 'PT', label: 'Personal Trainers' },
        { key: 'Finance', label: 'Finance & POS' },
        { key: 'Facilities', label: 'Facilities' },
        { key: 'CRM', label: 'CRM & Promo' }
    ];

    const filteredNotifications = activeTab === 'All' ? notifications : notifications.filter(n => n.category === activeTab);

    const getTypeStyles = (type) => {
        switch (type) {
            case 'danger': return { border: 'border-l-4 border-l-red-500', badgeBg: 'bg-red-500/10 text-red-400' };
            case 'warning': return { border: 'border-l-4 border-l-amber-500', badgeBg: 'bg-amber-500/10 text-amber-400' };
            case 'success': return { border: 'border-l-4 border-l-emerald-500', badgeBg: 'bg-emerald-500/10 text-emerald-400' };
            default: return { border: 'border-l-4 border-l-blue-500', badgeBg: 'bg-blue-500/10 text-blue-400' };
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none bg-[#111315] p-6">
            <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex justify-between items-center shadow-xl">
                <div>
                    <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase">System Log & CRM</h4>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Notifications</h3>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
                {categories.map((cat) => (
                    <button key={cat.key} onClick={() => setActiveTab(cat.key)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === cat.key ? 'bg-[#C2A676] text-[#111315] font-black' : 'bg-[#1e2023] text-gray-400 hover:text-white border border-white/5'}`}>
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredNotifications.map((notif) => {
                    const styles = getTypeStyles(notif.type);
                    return (
                        <div key={notif.id} className={`bg-[#1e2023] border border-white/5 ${styles.border} rounded-2xl p-5 ${notif.status === 'unread' ? 'shadow-inner ring-1 ring-[#C2A676]/10' : 'opacity-70'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${styles.badgeBg}`}>{notif.category}</span>
                                <span className="text-[10px] text-gray-500">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <h5 className="text-sm font-bold text-white mb-1">{notif.title}</h5>
                            <p className="text-xs text-gray-400 mb-4">{notif.description}</p>
                            <div className="flex justify-end gap-3">
                                {notif.status === 'unread' && (
                                    <button onClick={() => markAsRead(notif.id)} className="text-[10px] font-bold text-[#C2A676] hover:underline uppercase">Mark as Read</button>
                                )}
                                <button 
                                    onClick={() => setDeleteId(notif.id)} 
                                    disabled={notif.status === 'unread'}
                                    className={`text-[10px] font-bold uppercase ${notif.status === 'unread' ? 'text-gray-700 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CUSTOM MODAL */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1e2023] border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-lg font-black text-white uppercase mb-2">Hapus Notifikasi</h3>
                        <p className="text-xs text-gray-400 mb-6">Apakah Anda yakin ingin menghapus log ini secara permanen?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl bg-gray-700 text-white text-xs font-bold uppercase hover:bg-gray-600 transition">Batal</button>
                            <button onClick={confirmDelete} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-500 transition">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;