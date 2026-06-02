import React, { useState } from 'react';

const MemberNotifications = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [notifications, setNotifications] = useState([
        { id: "NOTIF-M001", category: "Membership", title: "PAKET MEMBERSHIP AKAN HABIS", description: "Paket Elite Anda akan berakhir dalam 7 hari (29 Mei 2026). Segera perpanjang untuk tetap menikmati fasilitas.", timestamp: "2026-05-22T08:00:00Z", status: "unread", type: "warning" },
        { id: "NOTIF-M002", category: "Membership", title: "PEMBAYARAN BERHASIL", description: "Pembayaran bulanan Rp 450.000 untuk paket Elite berhasil dikonfirmasi. Berlaku hingga 22 Juni 2026.", timestamp: "2026-05-22T09:15:00Z", status: "read", type: "success" },
        { id: "NOTIF-M003", category: "Classes", title: "BOOKING KELAS DIKONFIRMASI", description: "Booking kelas HIIT Cardio pukul 07.00 pada Sabtu, 24 Mei 2026 telah berhasil dikonfirmasi.", timestamp: "2026-05-22T10:30:00Z", status: "unread", type: "success" },
        { id: "NOTIF-M004", category: "Classes", title: "PENGINGAT: KELAS BESOK", description: "Kelas Yoga Morning Anda dijadwalkan besok pukul 06.30. Harap hadir 10 menit lebih awal.", timestamp: "2026-05-22T18:00:00Z", status: "unread", type: "info" },
        { id: "NOTIF-M005", category: "Classes", title: "KELAS DIBATALKAN OLEH INSTRUKTUR", description: "Maaf, kelas Zumba pukul 17.00 hari ini dibatalkan karena instruktur berhalangan. Kredit sesi dikembalikan.", timestamp: "2026-05-22T14:00:00Z", status: "unread", type: "danger" },
        { id: "NOTIF-M006", category: "PT", title: "SESI PT DIJADWALKAN", description: "Coach Rian telah menjadwalkan sesi Personal Training Anda pada Jumat, 23 Mei 2026 pukul 16.00.", timestamp: "2026-05-21T13:00:00Z", status: "read", type: "info" },
        { id: "NOTIF-M007", category: "PT", title: "LAPORAN PERKEMBANGAN FISIK", description: "Coach Rian telah mengunggah laporan perkembangan fisik bulan Mei 2026 Anda. Lihat selengkapnya.", timestamp: "2026-05-20T12:00:00Z", status: "read", type: "success" },
        { id: "NOTIF-M008", category: "PT", title: "PROGRAM LATIHAN DIPERBARUI", description: "Program latihan mingguan Anda telah diperbarui oleh Coach Rian sesuai target Fat Loss bulan ini.", timestamp: "2026-05-19T10:00:00Z", status: "read", type: "info" },
        { id: "NOTIF-M009", category: "Facilities", title: "ALAT FAVORIT DALAM PERAWATAN", description: "Treadmill Zona B (Unit T-04) sedang dalam perbaikan. Estimasi selesai: 25 Mei 2026.", timestamp: "2026-05-22T11:00:00Z", status: "unread", type: "warning" },
        { id: "NOTIF-M010", category: "Facilities", title: "FASILITAS BARU TERSEDIA", description: "Area Functional Training baru telah dibuka di lantai 2. Nikmati peralatan terbaru kami!", timestamp: "2026-05-18T09:00:00Z", status: "read", type: "success" },
        { id: "NOTIF-M011", category: "Promo", title: "PROMO KHUSUS MEMBER: DISKON 20%", description: "Dapatkan diskon 20% untuk semua suplemen di toko gym hingga 31 Mei 2026. Tunjukkan kartu member Anda.", timestamp: "2026-05-21T15:00:00Z", status: "unread", type: "info" },
        { id: "NOTIF-M012", category: "Promo", title: "REFERRAL BONUS DITERIMA", description: "Selamat! Anda mendapatkan bonus 1 bulan gratis karena berhasil mengajak teman bergabung.", timestamp: "2026-05-20T08:00:00Z", status: "read", type: "success" },
    ]);

    const [deleteId, setDeleteId] = useState(null);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'read' } : n));
    };

    const confirmDelete = () => {
        setNotifications(notifications.filter(n => n.id !== deleteId));
        setDeleteId(null);
    };

    const categories = [
        { key: 'All', label: 'All Notifications' },
        { key: 'Membership', label: 'Membership' },
        { key: 'Classes', label: 'Classes' },
        { key: 'PT', label: 'Personal Trainer' },
        { key: 'Facilities', label: 'Facilities' },
        { key: 'Promo', label: 'Promo & Reward' },
    ];

    const filteredNotifications = activeTab === 'All'
        ? notifications
        : notifications.filter(n => n.category === activeTab);

    const getTypeStyles = (type) => {
        switch (type) {
            case 'danger':  return { border: 'border-l-4 border-l-red-500',     badgeBg: 'bg-red-500/10 text-red-400' };
            case 'warning': return { border: 'border-l-4 border-l-amber-500',   badgeBg: 'bg-amber-500/10 text-amber-400' };
            case 'success': return { border: 'border-l-4 border-l-emerald-500', badgeBg: 'bg-emerald-500/10 text-emerald-400' };
            default:        return { border: 'border-l-4 border-l-blue-500',    badgeBg: 'bg-blue-500/10 text-blue-400' };
        }
    };

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none bg-[#111315] p-6">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex justify-between items-center shadow-xl">
                <div>
                    <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase">Pusat Notifikasi</h4>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Notifications</h3>
                </div>
                {unreadCount > 0 && (
                    <div className="flex items-center gap-2 bg-[#C2A676]/10 border border-[#C2A676]/20 px-4 py-2 rounded-2xl">
                        <span className="w-2 h-2 rounded-full bg-[#C2A676] animate-pulse" />
                        <span className="text-xs font-black text-[#C2A676] uppercase tracking-wider">
                            {unreadCount} belum dibaca
                        </span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveTab(cat.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                            ${activeTab === cat.key
                                ? 'bg-[#C2A676] text-[#111315] font-black'
                                : 'bg-[#1e2023] text-gray-400 hover:text-white border border-white/5'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-sm">
                        <div className="text-4xl mb-3">🔔</div>
                        Tidak ada notifikasi di kategori ini.
                    </div>
                ) : filteredNotifications.map((notif) => {
                    const styles = getTypeStyles(notif.type);
                    return (
                        <div
                            key={notif.id}
                            className={`bg-[#1e2023] border border-white/5 ${styles.border} rounded-2xl p-5
                                ${notif.status === 'unread' ? 'shadow-inner ring-1 ring-[#C2A676]/10' : 'opacity-70'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${styles.badgeBg}`}>
                                    {notif.category}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {new Date(notif.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                            </div>
                            <h5 className="text-sm font-bold text-white mb-1">{notif.title}</h5>
                            <p className="text-xs text-gray-400 mb-4">{notif.description}</p>
                            <div className="flex justify-end gap-3">
                                {notif.status === 'unread' && (
                                    <button
                                        onClick={() => markAsRead(notif.id)}
                                        className="text-[10px] font-bold text-[#C2A676] hover:underline uppercase"
                                    >
                                        Tandai Dibaca
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeleteId(notif.id)}
                                    disabled={notif.status === 'unread'}
                                    className={`text-[10px] font-bold uppercase
                                        ${notif.status === 'unread'
                                            ? 'text-gray-700 cursor-not-allowed'
                                            : 'text-red-500 hover:text-red-400'}`}
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1e2023] border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-lg font-black text-white uppercase mb-2">Hapus Notifikasi</h3>
                        <p className="text-xs text-gray-400 mb-6">Apakah Anda yakin ingin menghapus notifikasi ini secara permanen?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2 rounded-xl bg-gray-700 text-white text-xs font-bold uppercase hover:bg-gray-600 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-500 transition"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberNotifications;