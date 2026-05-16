import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [hoveredCard, setHoveredCard] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cardsData = [
    {
      title: "WORLD-CLASS FACILITIES",
      desc: "Access premium equipment from top brands. Full power racks, extensive free weights, and modern cardio zones.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" 
    },
    {
      title: "EXPERT COACHING",
      desc: "Our certified coaches provide personal training and group classes to perfect your form and accelerate progress.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "FLEXIBLE PLANS",
      desc: "Choose a membership that fits your goals and lifestyle. No hidden fees. Cancel anytime.",
      image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=400&auto=format&fit=crop"
    }
  ];


useEffect(() => {

    document.title = "Gymbros | Unleash Your Potential";

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    const hash = window.location.hash; 
    if (hash) {
  
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
 
    
    // Cleanup function
    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  // Fungsi untuk scroll halus ke bagian tertentu
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    // Tutup menu mobile jika sedang terbuka
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#111315] text-[#E0E0E0] font-sans overflow-x-hidden selection:bg-[#C2A676] selection:text-[#111315]">
      
      {/* Custom Keyframes */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: 200%;
            animation: marquee 15s linear infinite;
          }
          
          @keyframes popBounce {
            0% { transform: scale(0.8) translateY(20px); opacity: 0; }
            60% { transform: scale(1.05) translateY(-5px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          .animate-pop-bounce {
            animation: popBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          
          /* Tambahan agar scroll keseluruhan halaman menjadi halus */
          html {
            scroll-behavior: smooth;
          }
        `}
      </style>

      {/* HEADER & NAVBAR (Tag Semantik) */}
      <header className="fixed top-0 w-full z-50 bg-[#111315]/80 backdrop-blur-md">
        <nav className="flex items-center justify-between px-5 md:px-10 py-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#555] uppercase mt-2">GYMBROS</h1>
          
          {/* Menu Desktop */}
          <ul className="hidden md:flex gap-8 text-xs font-bold tracking-widest uppercase text-[#BFBFBF] items-center">
            <li onClick={() => scrollToSection('about')} className="cursor-pointer hover:text-white transition-colors">
              About Us
            </li>
            <li onClick={() => scrollToSection('facility')} className="cursor-pointer hover:text-white transition-colors">
              Facility
            </li>
            <li className="cursor-pointer hover:text-white transition-colors">
              {/* Link ke halaman lain */}
              <a href="/news">News</a>
            </li>
          </ul>

          {/* Tombol Login Desktop */}
          <a href="/login" className="hidden md:block px-8 py-2 border border-[#C2A676] text-[#C2A676] rounded-full hover:bg-[#C2A676] hover:text-[#111315] transition-colors font-bold uppercase tracking-wider text-sm">
            Login
          </a>

          {/* Tombol Hamburger Mobile */}
          <button 
            className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="w-6 h-0.5 bg-[#C2A676] block rounded"></span>
            <span className="w-6 h-0.5 bg-[#C2A676] block rounded"></span>
            <span className="w-6 h-0.5 bg-[#C2A676] block rounded"></span>
          </button>
        </nav>
      </header>

      {/* POPUP MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 md:hidden">
          <div className="bg-[#222426] w-full max-w-sm rounded-2xl shadow-2xl border border-[#333] animate-pop-bounce p-6 relative">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#AAA] text-sm font-semibold tracking-wide">Navigation</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-8 h-8 rounded-full border border-[#444] flex items-center justify-center text-[#AAA] hover:bg-[#444] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* List Menu Mobile */}
            <ul className="flex flex-col">
              <li 
                onClick={() => scrollToSection('about')} 
                className="py-4 border-b border-[#333] text-white font-bold hover:text-[#C2A676] transition-colors cursor-pointer"
              >
                About Us
              </li>
              <li 
                onClick={() => scrollToSection('facility')} 
                className="py-4 border-b border-[#333] text-white font-bold hover:text-[#C2A676] transition-colors cursor-pointer"
              >
                Facility
              </li>
              <li className="py-4 border-b border-[#333] text-white font-bold hover:text-[#C2A676] transition-colors cursor-pointer">
                <a href="/news" className="block w-full">News</a>
              </li>
              <li className="py-4 text-[#C2A676] font-bold hover:text-white transition-colors cursor-pointer mt-2">
                <a href="/login" className="block w-full">Login</a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* MAIN CONTENT (Tag Semantik) */}
      <main>
        {/* HERO SECTION */}
        <section id="about" className="relative w-full min-h-[90vh] md:min-h-[85vh] flex items-center justify-between px-5 md:px-10 overflow-hidden pt-24 md:pt-28 pb-10 md:pb-0">
          
          {/* Layer 1: Giant Background Text (Z-0) */}
          <div className="absolute top-[40%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none w-full text-center mt-8">
            <h1 className="text-[30vw] md:text-[22vw] font-black leading-[0.8] text-[#1A1C1E] tracking-tighter select-none">
              GYM<br />BROS
            </h1>
          </div>

          {/* Layer 2: Model Image (Z-10) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[60%] md:h-[85%] w-full z-10 pointer-events-none flex items-end justify-center">
            <img 
              src="https://img.pikbest.com/origin/10/52/11/42MpIkbEsTBF8.png!bw700" 
              alt="Gymbros Model" 
              className="max-h-full w-auto object-contain object-bottom drop-shadow-2xl"
            />
          </div>

          {/* Layer 3: Transparent Foreground Text (Z-20) */}
          <div className="absolute top-[40%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-full text-center mt-8">
            <h1 className="text-[30vw] md:text-[22vw] font-black leading-[0.8] text-[#c2a6760e] tracking-tighter select-none">
              GYM<br />BROS
            </h1>
          </div>

          {/* Layer 4: Foreground Content (Z-30) */}
          <div className="relative z-30 flex flex-col md:flex-row w-full justify-between items-center md:items-center h-[80vh] md:h-full pointer-events-none">
            
            {/* Left Stats */}
            <div className="flex flex-col gap-6 md:gap-12 w-full md:w-1/3 pointer-events-auto text-center md:text-left mt-5 md:mt-0 items-center md:items-start">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">
                  5000<span className="text-[#C2A676]">+</span>
                </h2>
                <p className="text-xs md:text-sm font-semibold tracking-wide text-[#BFBFBF] mt-1 md:mt-2">Active Members</p>
              </div>
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">
                  50<span className="text-[#C2A676]">+</span>
                </h2>
                <p className="text-xs md:text-sm font-semibold tracking-wide text-[#BFBFBF] mt-1 md:mt-2">Active Equipment</p>
              </div>
            </div>

            {/* Right Info */}
            <div className="flex flex-col gap-6 w-full md:w-1/3 items-center md:items-end text-center md:text-right pointer-events-auto pb-5 md:pb-0">
              <p className="text-xs md:text-sm font-semibold text-[#E0E0E0] uppercase tracking-widest md:leading-loose leading-relaxed max-w-sm drop-shadow-md">
                Join the Gymbros Community. Unleash your potential in a powerful, supportive atmosphere. Find your bro, find your strength.
              </p>
              <a href="/login" className="px-8 md:px-10 py-3 md:py-4 bg-[#C2A676] text-[#111315] rounded font-black uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(194,166,118,0.3)]">
                Login Now
              </a>
            </div>

          </div>
        </section>

        {/* SLANTED MARQUEE */}
        <div className="relative w-[110vw] -ml-[5vw] bg-[#222526] border-y-2 border-[#444] py-3 md:py-4 -rotate-3 z-30 shadow-2xl mt-4 md:-mt-4">
          <div className="overflow-hidden">
            <div className="animate-marquee items-center text-3xl md:text-6xl font-black text-transparent [-webkit-text-stroke:1px_#666] md:[-webkit-text-stroke:2px_#666] tracking-widest uppercase flex">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="mx-4 md:mx-6 hover:text-white hover:[-webkit-text-stroke:0px] transition-all cursor-default whitespace-nowrap">
                  GYMBROS
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SERVICES SECTION */}
        <section id="facility" className="relative z-20 py-20 md:py-32 px-5 md:px-10 flex flex-col items-center pt-24">
          <div className="text-center mb-12 md:mb-16">
            <h4 className="text-[#888] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm mb-2">The Gymbros Difference</h4>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight">
              Unyielding Strength.<br />Unwavering Community.
            </h2>
          </div>

          {/* Interactive Cards Container */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 h-auto md:h-[500px] w-full max-w-6xl">
            {cardsData.map((card, index) => {
              const isHovered = hoveredCard === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(1)} 
                  className={`transition-all duration-500 ease-in-out cursor-pointer flex flex-col justify-between bg-[#1A1C1E] border p-6
                    ${isHovered 
                      ? 'border-[#C2A676] w-full max-w-sm md:w-[350px] h-[380px] md:h-[450px] shadow-[0_0_30px_rgba(194,166,118,0.1)] md:-translate-y-4' 
                      : 'border-[#333] w-full max-w-sm md:w-[280px] h-[350px] opacity-100 md:opacity-60 hover:opacity-100'
                    }`}
                >
                  {isHovered ? (
                    <div className="flex flex-col h-full animate-fade-in">
                      <h3 className="text-2xl md:text-3xl font-black uppercase text-white leading-none mb-3 md:mb-4">{card.title}</h3>
                      <p className="text-xs md:text-sm text-[#AAA] mb-4 md:mb-6 line-clamp-4">{card.desc}</p>
                      <img 
                        src={card.image} 
                        alt={card.title} 
                        className="w-full flex-grow rounded object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col h-full animate-fade-in">
                      <img 
                        src={card.image} 
                        alt={card.title} 
                        className="w-full h-32 md:h-40 rounded object-cover mb-4 md:mb-6"
                      />
                      <h3 className="text-lg md:text-xl font-black uppercase text-white leading-tight mb-2">{card.title}</h3>
                      <p className="text-xs text-[#888] line-clamp-3">{card.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER (Tag Semantik) */}
      <footer>
        <Footer />
      </footer>

    </div>
  );
};

export default LandingPage;