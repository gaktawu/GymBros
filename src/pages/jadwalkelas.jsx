import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://api.npoint.io/a2f67ac9f64763665cd2';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" />
      <div
        className={`relative w-full ${maxWidth} bg-[#1e2023] border border-white/10 rounded-3xl shadow-2xl transform transition-all duration-300 scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {title}
            </h3>
          </div>
        )}
        <div className="p-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const BookingConfirmationModal = ({
  isOpen,
  onClose,
  classItem,
  onConfirm,
  isLoading
}) => {
  if (!classItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Pemesanan"
    >
      <div className="space-y-4">
        <div className="bg-[#25282c] rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-black tracking-widest text-[#C2A676] uppercase mb-1">
            {classItem.category}
          </p>
          <h4 className="text-md font-black text-white uppercase tracking-tight">
            {classItem.name}
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Pelatih: <span className="text-white font-bold">{classItem.coach}</span>
          </p>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-xs text-gray-400">Harga Kelas</span>
            <span className="text-lg font-black text-[#C2A676]">
              {classItem.price}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">
            Manfaat yang Didapat
          </p>
          <ul className="space-y-1.5">
            {classItem.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-[#C2A676] mt-0.5">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#C2A676]/5 border border-[#C2A676]/20 rounded-xl p-3">
          <p className="text-xs text-[#C2A676] text-center font-medium">
            Anda akan diarahkan ke halaman pembayaran setelah menekan "Lanjut Bayar"
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest bg-[#C2A676] text-[#111315] hover:bg-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-[#111315]/30 border-t-[#111315] rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              'Lanjut Bayar'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const CancellationModal = ({
  isOpen,
  onClose,
  classItem,
  onConfirm,
  isLoading
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Alasan pembatalan wajib diisi.');
      return;
    }
    setError('');
    onConfirm(reason);
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError('');
      onClose();
    }
  };

  if (!classItem) return null;

  const priceValue = parseInt(classItem.price.replace(/[^0-9]/g, ''));
  const cancellationFee = Math.round(priceValue * 0.1);
  const formattedFee = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(cancellationFee);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Batalkan Pesanan"
    >
      <div className="space-y-4">
        <div className="bg-[#25282c] rounded-2xl p-4 border border-white/5">
          <h4 className="text-sm font-black text-white uppercase tracking-tight">
            {classItem.name}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {classItem.day}, {classItem.time}
          </p>
        </div>

        <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3">
          <p className="text-xs text-red-400 text-center font-medium">
            Pembatalan akan dikenakan potongan biaya sebesar 10% ({formattedFee})
          </p>
        </div>

        <div>
          <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2 block">
            Alasan Pembatalan <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            placeholder="Tuliskan alasan Anda membatalkan pesanan ini..."
            rows={4}
            disabled={isLoading}
            className={`w-full bg-[#25282c] border rounded-xl p-3 text-xs text-white placeholder-gray-600 resize-none focus:outline-none focus:ring-1 transition-all duration-200
              ${error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-[#C2A676]/50 focus:ring-[#C2A676]/20'}`}
          />
          {error && (
            <p className="text-[10px] text-red-400 mt-1.5 font-medium">{error}</p>
          )}
        </div>

        <p className="text-xs text-gray-300 text-center font-medium">
          Apakah anda yakin ingin membatalkan pesanan ini?
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300 disabled:opacity-50"
          >
            Tidak
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-transparent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              'Ya, Batalkan'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ClassSchedule = () => {
  const [data, setData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();
  const [bookedClasses, setBookedClasses] = useState(() => {
    return JSON.parse(localStorage.getItem('bookedClasses')) || [];
  });
  const [viewMode, setViewMode] = useState('all');
  const [selectedDay, setSelectedDay] = useState('Sen');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [bookingModal, setBookingModal] = useState({ isOpen: false, classItem: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, classItem: null });

  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [isProcessingCancellation, setIsProcessingCancellation] = useState(false);

  useEffect(() => {
    document.title = "Gymbros | Jadwal Kelas & Booking";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";
    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('bookedClasses')) || [];
    setBookedClasses(savedBookings);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const response = await axios.get(API_URL);
        setData(response.data);
        setFetchError(null);
      } catch (err) {
        setFetchError('Gagal memuat data. Silakan refresh halaman.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const classesData = data?.classes || [];
  const days = data?.days || [];
  const categories = data?.categories?.map(c => c.key) || ['Semua', 'Kekuatan', 'Kardio', 'HIIT', 'Fleksibilitas'];

  const openBookingModal = useCallback((classItem) => {
    setBookingModal({ isOpen: true, classItem });
  }, []);

  const closeBookingModal = useCallback(() => {
    setBookingModal({ isOpen: false, classItem: null });
  }, []);

  const openCancelModal = useCallback((classItem) => {
    setCancelModal({ isOpen: true, classItem });
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModal({ isOpen: false, classItem: null });
  }, []);

  const handleBookingConfirm = useCallback(() => {
    setIsProcessingBooking(true);

    setTimeout(() => {
      const classId = bookingModal.classItem?.id;
      navigate(`/member/bayarkelas?classId=${classId}`);
      closeBookingModal();
    }, 1500);
  }, [bookingModal.classItem, closeBookingModal]);

  const handleCancellationConfirm = useCallback((reason) => {
    setIsProcessingCancellation(true);

    setTimeout(() => {
      setBookedClasses(prev => prev.filter(id => id !== cancelModal.classItem.id));
      setIsProcessingCancellation(false);
      closeCancelModal();
    }, 1200);
  }, [cancelModal.classItem, closeCancelModal]);

  const handleBookingToggle = useCallback((classItem) => {
    if (bookedClasses.includes(classItem.id)) {
      openCancelModal(classItem);
    } else {
      openBookingModal(classItem);
    }
  }, [bookedClasses, openBookingModal, openCancelModal]);

  const filteredClasses = classesData.filter(item => {
    if (viewMode === 'booked') {
      return bookedClasses.includes(item.id);
    }
    const matchDay = item.day === selectedDay;
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchDay && matchCategory;
  });

  const getIntensityStyle = (intensity) => {
    if (intensity === 'Tinggi' || intensity === 'Ekstrem') {
      return 'text-red-400 bg-red-950/20';
    }
    if (intensity === 'Sedang') {
      return 'text-yellow-400 bg-yellow-950/20';
    }
    return 'text-green-400 bg-green-950/20';
  };

  if (isFetching) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-[#E0E0E0] bg-[#111315] space-y-4">
        <div className="w-10 h-10 border-4 border-[#C2A676]/20 border-t-[#C2A676] rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Memuat Jadwal...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-[#E0E0E0] bg-[#111315] space-y-4">
        <span className="text-3xl">⚠️</span>
        <h4 className="text-sm font-black text-white uppercase tracking-wider">Terjadi Kesalahan</h4>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#C2A676] text-[#111315] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all duration-300"
        >
          Refresh Halaman
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none animate-fade-in bg-[#111315]">

      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden shadow-xl">
        <div className="z-10">
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">
            ARENA GYMBROS
          </h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            {viewMode === 'all' ? 'JADWAL KELAS MINGGUAN' : 'JADWAL SAYA YANG TERDAFTAR'}
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            {viewMode === 'all'
              ? 'Pilih medan tempurmu, pesan slot lebih awal, dan lampaui batas kemampuanmu bersama para Bro lainnya.'
              : 'Berikut adalah seluruh daftar kelas aktif yang sudah Anda ambil. Datanglah 10 menit sebelum kelas dimulai!'}
          </p>
        </div>

        <div className="px-4 py-2 bg-[#1e2023] border border-white/10 rounded-full text-xs font-black tracking-wider uppercase z-10 text-center">
          <span className="text-gray-400">Total Dipesan: </span>
          <span className="text-[#C2A676]">{bookedClasses.length} Kelas</span>
        </div>
      </div>

      <div className="flex bg-[#1e2023] p-1 rounded-2xl border border-white/5 max-w-md shadow-md">
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300
            ${viewMode === 'all' ? 'bg-[#C2A676] text-[#111315] shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          🏋️‍♂️ Cari Semua Kelas
        </button>
        <button
          onClick={() => setViewMode('booked')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2
            ${viewMode === 'booked' ? 'bg-[#C2A676] text-[#111315] shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          📅 Jadwal Saya
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${viewMode === 'booked' ? 'bg-[#111315] text-[#C2A676]' : 'bg-[#25282c] text-[#C2A676]'}`}>
            {bookedClasses.length}
          </span>
        </button>
      </div>

      {viewMode === 'all' && (
        <div className="space-y-4">
          <div className="bg-[#1e2023] border border-white/5 rounded-3xl p-2 flex overflow-x-auto gap-2 sticky top-[90px] z-20 shadow-xl bg-opacity-95 backdrop-blur-md">
            {days.map((day) => {
              const isActive = selectedDay === day.key;
              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex-1 min-w-[75px] py-2.5 px-2 rounded-2xl text-center flex flex-col justify-center transition-all duration-300
                    ${isActive
                      ? 'bg-[#C2A676] text-[#111315] font-black shadow-[0_4px_15px_rgba(194,166,118,0.2)]'
                      : 'text-gray-400 hover:text-white hover:bg-[#25282c]'}`}
                >
                  <span className="text-xs font-black tracking-wider">{day.label}</span>
                  <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-[#111315]/70' : 'text-gray-600'}`}>
                    {day.date}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300
                  ${selectedCategory === cat
                    ? 'border-[#C2A676] text-[#C2A676] bg-[#C2A676]/5'
                    : 'bg-[#1e2023] border-white/5 text-gray-400 hover:text-white hover:border-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredClasses.map((item) => {
            const isBooked = bookedClasses.includes(item.id);
            const isFull = item.slotsLeft === 0;

            return (
              <div
                key={item.id}
                className={`bg-[#1e2023] border p-5 rounded-3xl flex flex-col justify-between transition-all duration-300 shadow-md group
                  ${isBooked ? 'border-[#C2A676]' : 'border-white/5 hover:border-white/10'}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black tracking-widest px-2.5 py-0.5 bg-[#25282c] border border-white/5 text-[#C2A676] rounded-full uppercase">
                      {item.category}
                    </span>

                    {viewMode === 'booked' && (
                      <span className="text-[10px] font-black text-[#C2A676] bg-[#C2A676]/10 px-2.5 py-0.5 rounded-full uppercase">
                        🗓️ {item.day}
                      </span>
                    )}
                    {viewMode === 'all' && (
                      <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${getIntensityStyle(item.intensity)}`}>
                        {item.intensity}
                      </span>
                    )}
                  </div>

                  <h3 className="text-md font-black text-white uppercase tracking-tight group-hover:text-[#C2A676] transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Pelatih: <span className="text-white font-bold">{item.coach}</span>
                  </p>

                  <div className="mt-4 border-y border-white/5 py-2.5 text-xs text-gray-300 space-y-1.5 font-medium">
                    <div className="flex items-center gap-2"><span>⏰</span> {item.time}</div>
                    <div className="flex items-center gap-2"><span>⌛</span> {item.duration}</div>
                    <div className="flex items-center gap-2"><span>💰</span> {item.price}</div>
                  </div>
                </div>

                <div className="mt-4">
                  {viewMode === 'all' && (
                    <div className="flex justify-between items-center text-xs mb-2 font-bold">
                      <span className="text-gray-500 uppercase tracking-wider">Ketersediaan</span>
                      <span className={isFull ? 'text-red-500' : 'text-white'}>
                        {isFull ? 'KUOTA PENUH' : `Sisa ${item.slotsLeft} / ${item.maxSlots} Slot`}
                      </span>
                    </div>
                  )}

                  <button
                    disabled={isFull && !isBooked}
                    onClick={() => handleBookingToggle(item)}
                    className={`w-full py-2.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all duration-300
                      ${isBooked
                        ? 'border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-transparent'
                        : isFull
                          ? 'bg-[#25282c] text-gray-600 cursor-not-allowed'
                          : 'bg-[#C2A676] text-[#111315] hover:bg-white'}`}
                  >
                    {isBooked ? 'Batalkan Pesanan' : isFull ? 'Kelas Penuh' : 'Pesan Kelas Sekarang'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1e2023] border border-white/5 p-12 text-center rounded-3xl shadow-md max-w-md mx-auto">
          <span className="text-3xl">{viewMode === 'all' ? '📭' : '🏋️‍♂️'}</span>
          <h4 className="text-sm font-black text-white uppercase tracking-wider mt-3">
            {viewMode === 'all' ? 'Kelas Tidak Ditemukan' : 'Belum Ada Kelas Dipesan'}
          </h4>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
            {viewMode === 'all'
              ? 'Tidak ada jadwal kelas untuk kombinasi filter hari ini.'
              : 'Anda belum mengambil jadwal kelas apapun minggu ini.'}
          </p>
        </div>
      )}

      <BookingConfirmationModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        classItem={bookingModal.classItem}
        onConfirm={handleBookingConfirm}
        isLoading={isProcessingBooking}
      />

      <CancellationModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        classItem={cancelModal.classItem}
        onConfirm={handleCancellationConfirm}
        isLoading={isProcessingCancellation}
      />
    </div>
  );
};

export default ClassSchedule;