import React, { useState, useEffect } from 'react';

const ClassSchedule = () => {

  const [viewMode, setViewMode] = useState('all'); 
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookedClasses, setBookedClasses] = useState([1]); 

  useEffect(() => {
    document.title = "Gymbros | Class Schedule & Booking";
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#111315";
    return () => {
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);


  const days = [
    { key: 'Mon', label: 'MON', date: 'May 18' },
    { key: 'Tue', label: 'TUE', date: 'May 19' },
    { key: 'Wed', label: 'WED', date: 'May 20' },
    { key: 'Thu', label: 'THU', date: 'May 21' },
    { key: 'Fri', label: 'FRI', date: 'May 22' },
    { key: 'Sat', label: 'SAT', date: 'May 23' },
    { key: 'Sun', label: 'SUN', date: 'May 24' },
  ];


  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Flexibility'];

//jadwal kelas
  const classesData = [
    { id: 1, name: "Powerlifting Fundamentals", coach: "Coach Iron", time: "08:00 - 09:30", duration: "90 Mins", category: "Strength", day: "Mon", slotsLeft: 4, maxSlots: 12, intensity: "High" },
    { id: 2, name: "Barbell Hypertrophy", coach: "Coach Alex", time: "16:30 - 17:30", duration: "60 Mins", category: "Strength", day: "Mon", slotsLeft: 0, maxSlots: 15, intensity: "Medium" },
    { id: 3, name: "MetCon Engine", coach: "Coach Sarah", time: "19:00 - 20:00", duration: "60 Mins", category: "Cardio", day: "Mon", slotsLeft: 8, maxSlots: 20, intensity: "High" },

    { id: 4, name: "Calisthenics & Core", coach: "Coach Zack", time: "09:00 - 10:15", duration: "75 Mins", category: "Strength", day: "Tue", slotsLeft: 6, maxSlots: 10, intensity: "Medium" },
    { id: 5, name: "Savage HIIT Conditioning", coach: "Coach Sarah", time: "18:30 - 19:15", duration: "45 Mins", category: "HIIT", day: "Tue", slotsLeft: 12, maxSlots: 25, intensity: "Extreme" },
    { id: 6, name: "Fat Burn Blast", coach: "Coach Elena", time: "20:00 - 21:00", duration: "60 Mins", category: "Cardio", day: "Tue", slotsLeft: 14, maxSlots: 20, intensity: "Medium" },

    { id: 7, name: "Mobility & Deep Stretch", coach: "Coach Elena", time: "10:00 - 11:00", duration: "60 Mins", category: "Flexibility", day: "Wed", slotsLeft: 15, maxSlots: 15, intensity: "Low" },
    { id: 8, name: "Endurance Cycling", coach: "Coach Zack", time: "16:00 - 17:00", duration: "60 Mins", category: "Cardio", day: "Wed", slotsLeft: 3, maxSlots: 15, intensity: "High" },
    { id: 9, name: "Pumping Chest & Arms", coach: "Coach Iron", time: "19:00 - 20:15", duration: "75 Mins", category: "Strength", day: "Wed", slotsLeft: 2, maxSlots: 12, intensity: "High" },

    { id: 10, name: "Olympic Weightlifting", coach: "Coach Iron", time: "08:30 - 10:00", duration: "90 Mins", category: "Strength", day: "Thu", slotsLeft: 5, maxSlots: 10, intensity: "High" },
    { id: 11, name: "Boxing Conditioning", coach: "Coach Alex", time: "15:30 - 16:30", duration: "60 Mins", category: "Cardio", day: "Thu", slotsLeft: 9, maxSlots: 18, intensity: "High" },
    { id: 12, name: "AMRAP Engine Burn", coach: "Coach Sarah", time: "18:30 - 19:30", duration: "60 Mins", category: "HIIT", day: "Thu", slotsLeft: 11, maxSlots: 20, intensity: "Extreme" },

    { id: 13, name: "Iron Back & Shoulders", coach: "Coach Alex", time: "09:00 - 10:15", duration: "75 Mins", category: "Strength", day: "Fri", slotsLeft: 1, maxSlots: 12, intensity: "High" },
    { id: 14, name: "Tabata Ultimate Burnout", coach: "Coach Sarah", time: "16:30 - 17:15", duration: "45 Mins", category: "HIIT", day: "Fri", slotsLeft: 7, maxSlots: 20, intensity: "Extreme" },
    { id: 15, name: "Functional Core Fit", coach: "Coach Elena", time: "19:00 - 20:00", duration: "60 Mins", category: "Flexibility", day: "Fri", slotsLeft: 12, maxSlots: 15, intensity: "Medium" },

    { id: 16, name: "Spartan Obstacle Prep", coach: "Coach Zack", time: "07:30 - 09:00", duration: "90 Mins", category: "HIIT", day: "Sat", slotsLeft: 4, maxSlots: 25, intensity: "High" },
    { id: 17, name: "Heavy Duty Leg Day", coach: "Coach Iron", time: "10:30 - 12:00", duration: "90 Mins", category: "Strength", day: "Sat", slotsLeft: 0, maxSlots: 10, intensity: "Extreme" },
    { id: 18, name: "Yoga Flow Recovery", coach: "Coach Elena", time: "16:00 - 17:15", duration: "75 Mins", category: "Flexibility", day: "Sat", slotsLeft: 18, maxSlots: 25, intensity: "Low" },

    { id: 19, name: "Active Rest & Decompression", coach: "Coach Elena", time: "08:00 - 09:15", duration: "75 Mins", category: "Flexibility", day: "Sun", slotsLeft: 20, maxSlots: 20, intensity: "Low" },
    { id: 20, name: "Cardio Zone Shred", coach: "Coach Zack", time: "10:30 - 11:30", duration: "60 Mins", category: "Cardio", day: "Sun", slotsLeft: 11, maxSlots: 15, intensity: "Medium" }
  ];

  const handleBooking = (classId) => {
    if (bookedClasses.includes(classId)) {
      setBookedClasses(bookedClasses.filter(id => id !== classId));
    } else {
      setBookedClasses([...bookedClasses, classId]);
    }
  };

  const filteredClasses = classesData.filter(item => {
    if (viewMode === 'booked') {
      return bookedClasses.includes(item.id);
    }
    const matchDay = item.day === selectedDay;
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchDay && matchCategory;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-[#E0E0E0] select-none animate-fade-in bg-[#111315]">
      
      <div className="relative bg-gradient-to-r from-[#1e2023] to-[#25282c] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden shadow-xl">
        <div className="z-10">
          <h4 className="text-[#C2A676] text-xs font-black tracking-widest uppercase mb-1">GYMBROS ARENA</h4>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            {viewMode === 'all' ? 'WEEKLY CLASS SCHEDULE' : 'MY REGISTERED SCHEDULE'}
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            {viewMode === 'all' 
              ? 'Pilih medan tempurmu, pesan slot lebih awal, dan lampaui batas kemampuanmu bersama para Bro lainnya.'
              : 'Berikut adalah seluruh daftar kelas aktif yang sudah Anda ambil. Datanglah 10 menit sebelum kelas dimulai!'}
          </p>
        </div>
        
        <div className="px-4 py-2 bg-[#1e2023] border border-white/10 rounded-full text-xs font-black tracking-wider uppercase z-10 text-center">
          <span className="text-gray-400">Total Booked: </span>
          <span className="text-[#C2A676]">{bookedClasses.length} Classes</span>
        </div>
      </div>

      <div className="flex bg-[#1e2023] p-1 rounded-2xl border border-white/5 max-w-md shadow-md">
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300
            ${viewMode === 'all' ? 'bg-[#C2A676] text-[#111315] shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          🏋️‍♂️ Browse All Classes
        </button>
        <button
          onClick={() => setViewMode('booked')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2
            ${viewMode === 'booked' ? 'bg-[#C2A676] text-[#111315] shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          📅 My Schedule 
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
                      <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md
                        ${item.intensity === 'High' || item.intensity === 'Extreme' ? 'text-red-400 bg-red-950/20' : 
                          item.intensity === 'Medium' ? 'text-yellow-400 bg-yellow-950/20' : 'text-green-400 bg-green-950/20'}`}>
                        {item.intensity}
                      </span>
                    )}
                  </div>

                  <h3 className="text-md font-black text-white uppercase tracking-tight group-hover:text-[#C2A676] transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Coach: <span className="text-white font-bold">{item.coach}</span>
                  </p>

                  <div className="mt-4 border-y border-white/5 py-2.5 text-xs text-gray-300 space-y-1.5 font-medium">
                    <div className="flex items-center gap-2"><span>⏰</span> {item.time}</div>
                    <div className="flex items-center gap-2"><span>⌛</span> {item.duration}</div>
                  </div>
                </div>

                <div className="mt-4">
                  {viewMode === 'all' && (
                    <div className="flex justify-between items-center text-xs mb-2 font-bold">
                      <span className="text-gray-500 uppercase tracking-wider">Availability</span>
                      <span className={isFull ? 'text-red-500' : 'text-white'}>
                        {isFull ? 'FULLY BOOKED' : `${item.slotsLeft} / ${item.maxSlots} Slots Left`}
                      </span>
                    </div>
                  )}

                  <button
                    disabled={isFull && !isBooked}
                    onClick={() => handleBooking(item.id)}
                    className={`w-full py-2.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all duration-300
                      ${isBooked 
                        ? 'border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-transparent' 
                        : isFull 
                          ? 'bg-[#25282c] text-gray-600 cursor-not-allowed' 
                          : 'bg-[#C2A676] text-[#111315] hover:bg-white'}`}
                  >
                    {isBooked ? 'Cancel Booking' : isFull ? 'Class Full' : 'Book Class Now'}
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
            {viewMode === 'all' ? 'No Classes Found' : 'No Booked Classes'}
          </h4>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
            {viewMode === 'all' 
              ? 'Tidak ada jadwal kelas untuk kombinasi filter hari ini.'
              : 'Anda belum mengambil jadwal kelas apapun minggu ini.'}
          </p>
        </div>
      )}

    </div>
  );
};

export default ClassSchedule;