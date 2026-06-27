import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PublicHeader from '../../components/PublicHeader';
import Footer from "../../components/Footer";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [gymClasses, setGymClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const fallbackImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";

  useEffect(() => {
    document.title = "Classes & News | GYMBROS";
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://saurav.tech/NewsAPI/top-headlines/category/health/us.json');
        const articles = response.data.articles.filter(item => item.title).slice(0, 13);
        const formattedData = articles.map((item, index) => ({
          id: `news-${index}`, 
          title: item.title,
          image: item.urlToImage || fallbackImage,
          category: item.source.name || "Health News",
          date: new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          description: item.description || "No description available for this article.",
          content: item.content || item.description || "Read the full article on the original source.",
          url: item.url 
        }));

        setNews(formattedData);
      } catch (error) {
        console.error("Error fetching news data:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    const fetchInternalClasses = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/classes');
        const data = await res.json();
        if (data.success && data.data) {
          setGymClasses(data.data.slice(0, 8));
        }
      } catch (error) {
        console.error("Error fetching internal classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchNews();
    fetchInternalClasses();
  }, []);

  return (
    <div className="min-h-screen bg-[#111315] text-[#E0E0E0] font-sans selection:bg-[#C2A676] selection:text-[#111315]">

      <header>
         <PublicHeader />
      </header>

      <main className="pt-32 pb-20 px-5 md:px-10 max-w-7xl mx-auto space-y-20">
        <section>
          <div className="text-center mb-8">
            <h4 className="text-[#C2A676] font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-2">Gymbros Internal</h4>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight">
              Upcoming Classes
            </h1>
          </div>

          <div className="bg-[#1A1C1E]/50 border border-[#333] p-6 md:p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
            {loadingClasses ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-[#333] border-t-[#C2A676] rounded-full animate-spin"></div>
              </div>
            ) : gymClasses.length === 0 ? (
              <div className="text-center text-[#888] italic h-32 flex items-center justify-center">
                Belum ada jadwal kelas yang tersedia.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gymClasses.map((cls) => {
                  const startTime = new Date(cls.waktuMulai || cls.waktu_mulai);
                  
                  const hari = startTime.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();
                  const tgl = startTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }).toUpperCase();
                  const dateText = `${hari}, ${tgl}`;
                  const timeText = startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

                  return (
                    <div 
                      key={cls.idKelas || cls.id_kelas}
                      className="group bg-[#222426] border border-[#333] hover:border-[#C2A676] rounded-3xl p-6 flex flex-col transition-all duration-300 shadow-lg h-full min-h-[260px]"
                    >
                      <div className="flex items-center gap-2 mb-6 flex-wrap">
                        <span className="px-3 py-1.5 border border-[#C2A676]/60 text-[#C2A676] text-[9px] font-black uppercase tracking-widest rounded-full">
                          {dateText}
                        </span>
                        <span className="px-3 py-1.5 bg-[#111315] text-[#E0E0E0] text-[9px] font-black uppercase tracking-widest rounded-full">
                          JAM: {timeText}
                        </span>
                      </div>

                      <h3 className="font-black text-white text-2xl md:text-3xl uppercase leading-none mb-3">
                        {cls.namaKelas || cls.nama_kelas}
                      </h3>

                      <p className="text-[#AAA] text-[10px] font-bold tracking-widest mb-8 uppercase">
                        SISA KUOTA: <span className="text-white">{cls.kapasitas} MEMBER</span>
                      </p>

                      <div className="mt-auto pt-4">
                        <a 
                          href="/login" 
                          className="block w-full py-3.5 bg-[#C2A676] text-[#111315] text-[10px] font-black uppercase tracking-widest rounded-xl text-center hover:bg-white transition-colors"
                        >
                          Booking Sekarang
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="text-center mb-8">
            <h4 className="text-[#C2A676] font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-2">The Latest Drop</h4>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight">
              Health & Fitness News
            </h1>
          </div>

          <div className="bg-[#1A1C1E]/50 border border-[#333] p-6 md:p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
            {loadingNews ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-[#333] border-t-[#C2A676] rounded-full animate-spin"></div>
                <p className="text-[#888] font-bold tracking-widest uppercase text-sm animate-pulse">Loading Intel...</p>
              </div>
            ) : ( 
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
                {news.map((article, index) => { let bentoClass = "col-span-1 row-span-1";
                  if (index === 0) bentoClass = "md:col-span-2 md:row-span-2";
                  else if (index === 3) bentoClass = "md:col-span-2 row-span-1";
                  else if (index === 6) bentoClass = "md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2";

                  return (
                    <div 
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className={`group relative overflow-hidden rounded-3xl bg-[#222426] border border-[#333] hover:border-[#C2A676] cursor-pointer transition-all duration-300 shadow-lg ${bentoClass}`}
                    >

                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                        style={{ backgroundImage: `url(${article.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-[#111315]/60 to-transparent" />

                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="px-3 py-1 bg-[#C2A676] text-[#111315] text-[10px] font-black uppercase tracking-widest rounded-full">
                            {article.category}
                          </span>
                          <span className="text-[10px] text-[#AAA] font-bold uppercase tracking-wider">
                            {article.date}
                          </span>
                        </div>
                        <h3 className={`font-black text-white uppercase leading-tight line-clamp-3 ${index === 0 || index === 6 ? 'text-2xl md:text-3xl mb-3' : 'text-lg mb-1'}`}>
                          {article.title}
                        </h3>
                        {(index === 0 || index === 6) && (
                          <p className="text-sm text-[#AAA] line-clamp-2">
                            {article.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </main>
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 p-4 md:p-10 animate-fade-bg">
          <div className="bg-[#1A1C1E] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#333] shadow-2xl relative flex flex-col md:flex-row animate-pop-bounce">
            
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#111315]/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="w-full md:w-2/5 h-64 md:h-auto">
              <img 
                src={selectedArticle.image} 
                alt="News Thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-[#C2A676] text-[#111315] text-[10px] font-black uppercase tracking-widest rounded-full">
                  {selectedArticle.category}
                </span>
                <span className="text-[10px] text-[#AAA] font-bold uppercase tracking-wider">
                  {selectedArticle.date}
                </span>
              </div>
              
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-6">
                {selectedArticle.title}
              </h2>
              
              <div className="text-sm text-[#BFBFBF] leading-relaxed space-y-4">
                <p className="font-semibold text-white">{selectedArticle.description}</p>
                <p>{selectedArticle.content}</p>
              </div>

              <div className="mt-10 border-t border-[#333] pt-6 flex items-center justify-between">
                <a 
                  href={selectedArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase font-bold tracking-widest text-[#C2A676] hover:text-white transition-colors hover:underline"
                >
                  Source: {selectedArticle.category}
                </a>

                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#888] hover:text-white transition-colors"
                >
                  ← Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <footer>
        <Footer />
      </footer>

      <style>{`
        @keyframes fadeInBg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-bg {
          animation: fadeInBg 0.3s ease forwards;
        }

        @keyframes popBounce {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          60% { transform: scale(1.03) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-pop-bounce {
          animation: popBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default NewsPage;