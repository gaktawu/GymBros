import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PublicHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (sectionId) => {
    setIsMobileMenuOpen(false);
    
    if (location.pathname === '/' || location.pathname === '/landingpage') {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes popBounce {
            0% { transform: scale(0.8) translateY(20px); opacity: 0; }
            60% { transform: scale(1.05) translateY(-5px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          .animate-pop-bounce {
            animation: popBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}
      </style>

      <header className="fixed top-0 w-full z-50 bg-[#111315]/80 backdrop-blur-md">
        <nav className="flex items-center justify-between px-5 md:px-10 py-4">
          <h1 
            onClick={() => navigate('/')}
            className="text-2xl md:text-3xl font-black tracking-widest text-[#555] uppercase mt-2 cursor-pointer hover:text-[#C2A676] transition-colors"
          >
            GYMBROS
          </h1>
          <ul className="hidden md:flex gap-8 text-xs font-bold tracking-widest uppercase text-[#BFBFBF] items-center">
            <li onClick={() => handleNavigation('about')} className="cursor-pointer hover:text-white transition-colors">
              About Us
            </li>
            <li onClick={() => handleNavigation('facility')} className="cursor-pointer hover:text-white transition-colors">
              Facility
            </li>
            <li onClick={() => handleNavigation('pricing')} className="cursor-pointer hover:text-white transition-colors">
              Pricing
            </li>
            <li className="cursor-pointer hover:text-white transition-colors">
              <a href="/news">News</a>
            </li>
          </ul>

          <a href="/login" className="hidden md:block px-8 py-2 border border-[#C2A676] text-[#C2A676] rounded-full hover:bg-[#C2A676] hover:text-[#111315] transition-colors font-bold uppercase tracking-wider text-sm">
            Login
          </a>
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

            <ul className="flex flex-col">
              <li onClick={() => handleNavigation('about')} className="py-4 border-b border-[#333] text-white font-bold hover:text-[#C2A676] transition-colors cursor-pointer">
                About Us
              </li>
              <li onClick={() => handleNavigation('facility')} className="py-4 border-b border-[#333] text-white font-bold hover:text-[#C2A676] transition-colors cursor-pointer">
                Facility
              </li>
              <li onClick={() => handleNavigation('pricing')} className="py-4 border-b border-[#333] text-white font-bold hover:text-[#C2A676] transition-colors cursor-pointer">
                Pricing
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
    </>
  );
};

export default PublicHeader;