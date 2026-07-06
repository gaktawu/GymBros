import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL_CLASSES = 'http://localhost:5000/api/v1/classes';
const API_URL_COACHES = 'http://localhost:5000/api/v1/users/coaches';

const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

const getErrorMessage = (error, fallback) => {
    if (!error.response) return 'Tidak dapat terhubung ke server. Cek koneksi Anda.';
    const { status, data } = error.response;
    if (data?.message) return data.message;
    switch (status) {
        case 400: return 'Data yang dikirim tidak valid atau kurang lengkap.';
        case 401: return 'Sesi Anda telah berakhir, silakan login kembali.';
        case 403: return 'Anda tidak memiliki akses untuk melakukan aksi ini.';
        case 404: return 'Data tidak ditemukan.';
        case 500: return 'Terjadi kesalahan pada server. Coba lagi nanti.';
        default: return fallback;
    }
};

const EMPTY_FORM = { nama_kelas: '', pengajar: '', waktu_mulai: '', waktu_selesai: '', kapasitas: '', harga: '' };
const EMPTY_MODAL = { isOpen: false, type: 'add', data: null };
const EMPTY_CONFIRM = { isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Ya', cancelText: 'Batal', variant: 'danger' };

export default function KelolaKelas() {
    const [classes, setClasses] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [modalConfig, setModalConfig] = useState(EMPTY_MODAL);
    const [participantModal, setParticipantModal] = useState({ isOpen: false, loading: false, data: [] });
    const [alertMsg, setAlertMsg] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    
    const [confirmModal, setConfirmModal] = useState(EMPTY_CONFIRM);

    const showAlert = useCallback((type, message) => {
        setAlertMsg({ type, message });
        setTimeout(() => setAlertMsg(null), 4000);
    }, []);

    const showConfirm = useCallback(({ title, message, onConfirm, confirmText = 'Ya', cancelText = 'Batal', variant = 'danger' }) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, confirmText, cancelText, variant });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmModal(EMPTY_CONFIRM);
    }, []);

    const fetchClasses = useCallback(async () => {
        try {
            const response = await apiClient.get(`${API_URL_CLASSES}/admin/all`, {
                params: { search: searchTerm, page, limit },
            });
            const payload = response.data;
            const classData = payload.data || [];
            setClasses(Array.isArray(classData) ? classData : []);
            setTotalPages(payload.meta?.totalPages || payload.totalPages || 1);
        } catch (error) {
            console.error('Error memuat kelas:', error.response || error);
            setClasses([]);
        }
    }, [searchTerm, page]);

    const fetchCoaches = useCallback(async () => {
        try {
            const response = await apiClient.get(API_URL_COACHES);
            const users = response.data.data || [];
            setCoaches(Array.isArray(users) ? users : []);
        } catch (error) {
            console.error('Gagal memuat data coach:', error.response || error);
            setCoaches([]);
        }
    }, []);

    const fetchDataLengkap = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchClasses(), fetchCoaches()]);
        setLoading(false);
    }, [fetchClasses, fetchCoaches]);

    useEffect(() => {
        fetchDataLengkap();
    }, [fetchDataLengkap]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setPage(1);
            fetchClasses();
        }, 400);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    useEffect(() => {
        fetchClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const isValidId = (id) => id !== undefined && id !== null && id !== 'undefined' && id !== '' && !isNaN(Number(id));

    const fetchParticipants = async (classId) => {
        if (!isValidId(classId)) {
            showAlert('error', 'ID kelas tidak valid.');
            return;
        }
        try {
            setParticipantModal({ isOpen: true, loading: true, data: [] });
            const response = await apiClient.get(`${API_URL_CLASSES}/${classId}/participants`);
            setParticipantModal({ isOpen: true, loading: false, data: response.data.data || [] });
        } catch (error) {
            showAlert('error', getErrorMessage(error, 'Gagal memuat peserta kelas.'));
            setParticipantModal({ isOpen: false, loading: false, data: [] });
        }
    };

    const handleOpenModal = (type, data = null) => {
        if (type === 'edit' && data) {
            const formatDateForInput = (isoString) => {
                if (!isoString) return '';
                const date = new Date(isoString);
                const offset = date.getTimezoneOffset() * 60000;
                return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
            };

            setFormData({
                nama_kelas: data.nama_kelas || '',
                pengajar: data.id_coach != null ? String(data.id_coach) : '',
                waktu_mulai: formatDateForInput(data.waktu_mulai),
                waktu_selesai: formatDateForInput(data.waktu_selesai),
                kapasitas: data.kapasitas != null ? String(data.kapasitas) : '',
                harga: data.harga != null ? String(data.harga) : ''
            });
        } else {
            setFormData(EMPTY_FORM);
        }
        setModalConfig({ isOpen: true, type, data });
    };

    const closeModal = () => {
        setModalConfig(EMPTY_MODAL);
        setFormData(EMPTY_FORM);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.waktu_selesai && formData.waktu_mulai) {
            const start = new Date(formData.waktu_mulai);
            const end = new Date(formData.waktu_selesai);
            if (end <= start) {
                showAlert('error', 'Waktu selesai harus lebih besar dari waktu mulai.');
                return;
            }
        }
        
        try {
            const dMulai = formData.waktu_mulai ? new Date(formData.waktu_mulai) : new Date();
            const hariHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const namaHari = hariHari[dMulai.getDay()];

            const extractTime = (datetimeStr) => {
                if (!datetimeStr || !datetimeStr.includes('T')) return '00:00';
                return datetimeStr.split('T')[1].substring(0, 5);
            };

            const payload = {
                nama_kelas: formData.nama_kelas.trim(),
                pengajar: Number(formData.pengajar),
                hari: namaHari,
                jam_mulai: extractTime(formData.waktu_mulai),
                jam_selesai: extractTime(formData.waktu_selesai),
                waktu_mulai: new Date(formData.waktu_mulai).toISOString(),
                waktu_selesai: new Date(formData.waktu_selesai).toISOString(),
                kapasitas: Number(formData.kapasitas),
                harga: Number(formData.harga)
            };

            if (modalConfig.type === 'add') {
                await apiClient.post(API_URL_CLASSES, payload);
                showAlert('success', 'Kelas berhasil ditambahkan!');
            } else {
                if (!isValidId(modalConfig.data?.id_kelas)) {
                    showAlert('error', 'ID kelas tidak valid, tidak bisa memperbarui.');
                    return;
                }
                await apiClient.put(`${API_URL_CLASSES}/${modalConfig.data.id_kelas}`, payload);
                showAlert('success', 'Kelas berhasil diperbarui!');
            }
            closeModal();
            await fetchClasses();
        } catch (error) {
            showAlert('error', getErrorMessage(error, 'Terjadi kesalahan saat memproses data'));
        }
    };

    const handleDelete = (id) => {
        if (!isValidId(id)) return;
        
        showConfirm({
            title: 'Konfirmasi Arsipkan',
            message: 'Yakin ingin mengarsipkan kelas ini? Kelas yang diarsipkan tidak akan terlihat oleh member.',
            confirmText: 'Ya, Arsipkan',
            cancelText: 'Batal',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`${API_URL_CLASSES}/${id}`);
                    showAlert('success', 'Kelas berhasil diarsipkan!');
                    await fetchClasses();
                } catch (error) {
                    showAlert('error', getErrorMessage(error, 'Gagal mengarsipkan kelas.'));
                }
                closeConfirm();
            }
        });
    };

    return (
        <div className="p-6 bg-[#0f0f0f] min-h-screen">
            <style>{`
                @keyframes slideFadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-modal { animation: scaleUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-alert { animation: slideFadeIn 300ms ease-out forwards; }
                input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
            `}</style>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Manajemen Kelas</h1>
                    <p className="text-gray-400 text-sm mt-1">Kelola jadwal, kapasitas, dan pengajar kelas.</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="bg-yellow-500 hover:bg-yellow-400 text-[#0f0f0f] px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap"
                >
                    + Tambah Kelas
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama kelas atau pengajar..."
                    className="w-full max-w-md border border-[#333333] rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow bg-[#0f0f0f] text-white"
                />
            </div>

            {alertMsg && (
                <div className={`animate-alert mb-6 p-4 rounded-lg flex items-center border ${alertMsg.type === 'success' ? 'bg-[#1a2a1a] border-green-900/50 text-green-400' : 'bg-[#2a1a1a] border-red-900/50 text-red-400'
                    }`}>
                    <span className="font-medium">{alertMsg.message}</span>
                </div>
            )}

            <div className="bg-[#1a1a1a] rounded-xl shadow-sm border border-[#2a2a2a] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1a1a1a] text-gray-400 text-sm uppercase tracking-wider border-b border-[#2a2a2a]">
                                <th className="px-6 py-4 font-semibold">Nama Kelas</th>
                                <th className="px-6 py-4 font-semibold">Pengajar</th>
                                <th className="px-6 py-4 font-semibold">Jadwal</th>
                                <th className="px-6 py-4 font-semibold">Kapasitas</th>
                                <th className="px-6 py-4 font-semibold">Harga</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a] text-gray-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : classes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">Belum ada kelas yang terdaftar.</td>
                                </tr>
                            ) : (
                                classes.map((cls, index) => {
                                    const rowKey = cls.id_kelas != null ? `class-${cls.id_kelas}` : `row-${index}`;
                                    const hasValidId = isValidId(cls.id_kelas);
                                    const isArchived = cls.is_deleted === true || cls.status === 'Completed';

                                    return (
                                        <tr
                                            key={rowKey}
                                            className={`transition-colors duration-200 ${isArchived
                                                ? 'bg-gray-900/40 opacity-60'
                                                : 'hover:bg-[#1a1a0f]/30'
                                                }`}
                                        >
                                            <td className={`px-6 py-4 font-medium ${isArchived ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {cls.nama_kelas || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{cls.pengajar_nama || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full font-medium ${isArchived
                                                        ? 'bg-gray-800 text-gray-500'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                        }`}>
                                                        {cls.waktu_mulai ? new Date(cls.waktu_mulai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) : '-'}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {cls.waktu_mulai ? new Date(cls.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''} -
                                                        {cls.waktu_selesai ? new Date(cls.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{cls.kapasitas || 0} Org</td>
                                            <td className={`px-6 py-4 font-semibold ${isArchived ? 'text-gray-600' : 'text-emerald-400'}`}>
                                                Rp {Number(cls.harga || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isArchived ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                                                        Diarsipkan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                        Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => hasValidId && fetchParticipants(cls.id_kelas)}
                                                        disabled={!hasValidId}
                                                        className={`p-2 rounded-lg transition-colors ${hasValidId ? 'text-blue-400 hover:bg-blue-500/10' : 'text-gray-600 cursor-not-allowed'}`}
                                                        title="Lihat Peserta"
                                                    >
                                                        👥
                                                    </button>
                                                    <button
                                                        onClick={() => hasValidId && !isArchived && handleOpenModal('edit', cls)}
                                                        disabled={!hasValidId || isArchived}
                                                        className={`p-2 rounded-lg transition-colors ${hasValidId && !isArchived
                                                            ? 'text-amber-400 hover:bg-amber-500/10'
                                                            : 'text-gray-600 cursor-not-allowed'
                                                            }`}
                                                        title={isArchived ? 'Kelas sudah diarsipkan' : 'Edit'}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => hasValidId && !isArchived && handleDelete(cls.id_kelas)}
                                                        disabled={!hasValidId || isArchived}
                                                        className={`p-2 rounded-lg transition-colors ${hasValidId && !isArchived
                                                            ? 'text-red-400 hover:bg-red-500/10'
                                                            : 'text-gray-600 cursor-not-allowed'
                                                            }`}
                                                        title={isArchived ? 'Kelas sudah diarsipkan' : 'Arsipkan'}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && classes.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] text-sm text-gray-400">
                        <span>Halaman {page} dari {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className={`px-3 py-1.5 rounded-lg ${page <= 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white bg-[#2a2a2a] hover:bg-[#333333]'}`}
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className={`px-3 py-1.5 rounded-lg ${page >= totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-white bg-[#2a2a2a] hover:bg-[#333333]'}`}
                            >
                                Berikutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-modal border-t-4 border-yellow-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {modalConfig.type === 'add' ? 'Tambah Kelas Baru' : 'Edit Kelas'}
                            </h2>
                            <button type="button" onClick={closeModal} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Nama Kelas</label>
                                    <input type="text" required value={formData.nama_kelas} onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })} className="w-full border border-[#333333] rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow bg-[#0f0f0f] text-white" placeholder="Contoh: Muay Thai Dasar" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Pengajar (Coach)</label>
                                    <select required value={formData.pengajar} onChange={(e) => setFormData({ ...formData, pengajar: e.target.value })} className="w-full border border-[#333333] rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow bg-[#0f0f0f] text-white">
                                        <option value="">Pilih Coach...</option>
                                        {coaches.map((coach, idx) => (
                                            <option key={coach.idUser != null ? `coach-${coach.idUser}` : `coach-idx-${idx}`} value={coach.idUser}>
                                                {coach.namaLengkap}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Jadwal Mulai</label>
                                    <input type="datetime-local" required value={formData.waktu_mulai} onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })} className="w-full border border-[#333333] rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow bg-[#0f0f0f] text-white" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Jadwal Selesai</label>
                                    <input type="datetime-local" required value={formData.waktu_selesai} onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })} className="w-full border border-[#333333] rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow bg-[#0f0f0f] text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Kapasitas</label>
                                    <input type="number" required min="1" value={formData.kapasitas} onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })} className="w-full border border-[#333333] rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow bg-[#0f0f0f] text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Harga (Rp)</label>
                                    <input type="number" required min="0" value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} className="w-full border border-[#333333] rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow bg-[#0f0f0f] text-white" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-5 py-2 text-gray-300 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg font-medium transition-colors">Batal</button>
                                <button type="submit" className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-[#0f0f0f] rounded-lg font-semibold shadow transition-colors">Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi — pengganti window.confirm */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className={`bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-modal border-t-4 ${confirmModal.variant === 'danger' ? 'border-red-500' : 'border-yellow-500'}`}>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{confirmModal.message}</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeConfirm}
                                className="px-4 py-2 text-gray-300 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg font-medium transition-colors"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`px-4 py-2 rounded-lg font-semibold shadow transition-colors ${confirmModal.variant === 'danger' ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-[#0f0f0f]'}`}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Peserta */}
            {participantModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal border-t-4 border-blue-500">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Daftar Peserta</h2>
                            <button type="button" onClick={() => setParticipantModal({ isOpen: false, loading: false, data: [] })} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
                        </div>

                        {participantModal.loading ? (
                            <div className="py-8 text-center text-gray-400">
                                Memuat data peserta...
                            </div>
                        ) : participantModal.data.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">Belum ada peserta terdaftar di kelas ini.</div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {participantModal.data.map((p, idx) => (
                                    <div key={p.booking_id != null ? `booking-${p.booking_id}` : (p.user_id != null ? `user-${p.user_id}` : `participant-${idx}`)} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                        <div>
                                            <p className="text-white font-medium">{p.nama_lengkap || 'Unknown'}</p>
                                            <p className="text-gray-500 text-sm">{p.email || '-'}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                            p.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {p.status || 'pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}