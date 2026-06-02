import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from "../../components/Footer";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fallbackImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";

  useEffect(() => {
    document.title = "Health & News | GYMBROS";

    const fetchNews = async () => {
      try {
        const response = await axios.get('https://saurav.tech/NewsAPI/top-headlines/category/health/us.json');
        
        const articles = response.data.articles.filter(item => item.title).slice(0, 10);

        const formattedData = articles.map((item, index) => ({
          id: index, 
          title: item.title,
          image: item.urlToImage || fallbackImage,
          category: item.source.name || "Health News",
          date: new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          description: item.description || "No description available for this article.",
          content: item.content || item.description || "Read the full article on the original source.",
          url: item.url 
        }));

        setNews(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-[#111315] text-[#E0E0E0] font-sans selection:bg-[#C2A676] selection:text-[#111315]">
      
      {/* HEADER & NAVBAR */}
      <header className="fixed top-0 w-full z-40 bg-[#111315]/90 backdrop-blur-md">
        <nav className="flex items-center justify-between px-5 md:px-10 py-4">
          <a href="/" className="text-2xl md:text-3xl font-black tracking-widest text-[#555] hover:text-white transition-colors uppercase">
            GYMBROS
          </a>
          
          <ul className="hidden md:flex gap-8 text-xs font-bold tracking-widest uppercase text-[#BFBFBF] items-center">
            <li><a href="/landingpage/#about" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="/landingpage/#facility" className="hover:text-white transition-colors">Facility</a></li>
            <li><a href="/news" className="text-[#C2A676]">News</a></li>
          </ul>

          <a href="/login" className="hidden md:block px-6 py-2 border border-[#C2A676] text-[#C2A676] rounded-full hover:bg-[#C2A676] hover:text-[#111315] transition-colors font-bold uppercase tracking-wider text-xs">
            Login
          </a>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-32 pb-20 px-5 md:px-10 max-w-7xl mx-auto">
        
        <div className="text-center mb-12">
          <h4 className="text-[#C2A676] font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-2">The Latest Drop</h4>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight">
            Health & <br/> Fitness News
          </h1>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-[#333] border-t-[#C2A676] rounded-full animate-spin"></div>
            <p className="text-[#888] font-bold tracking-widest uppercase text-sm animate-pulse">Loading Intel...</p>
          </div>
        ) : (
          
          /* BENTO GRID LAYOUT */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {news.map((article, index) => {
              
              let bentoClass = "col-span-1 row-span-1";
              if (index === 0) bentoClass = "md:col-span-2 md:row-span-2";
              else if (index === 3) bentoClass = "md:col-span-2 row-span-1";
              else if (index === 6) bentoClass = "md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2";

              return (
                <div 
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`group relative overflow-hidden rounded-3xl bg-[#1A1C1E] border border-[#333] hover:border-[#C2A676] cursor-pointer transition-all duration-300 shadow-lg ${bentoClass}`}
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
                    <h3 className={`font-black text-white leading-tight line-clamp-3 ${index === 0 || index === 6 ? 'text-2xl md:text-3xl mb-3' : 'text-lg mb-1'}`}>
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
      </main>

      {/* POPUP MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 p-4 md:p-10 animate-fade-bg">
          
          {/* Kotak Modal dengan Animasi Bounce */}
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
                
                {/* TAUTAN SUMBER BERITA */}
                <a 
                  href={selectedArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase font-bold tracking-widest text-[#C2A676] hover:text-white transition-colors hover:underline"
                  title="Baca artikel asli"
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

      {/* Styles Animasi */}
      <style>{`
        /* Animasi untuk Background Hitam Transparan */
        @keyframes fadeInBg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-bg {
          animation: fadeInBg 0.3s ease forwards;
        }

        /* Animasi Bounce Khusus untuk Kotak Popup */
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