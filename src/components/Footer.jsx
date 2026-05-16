import { Link } from "react-router-dom";

export default function Footer() {
  return (
    // mt-auto memastikan footer selalu berada di paling bawah halaman
    <footer className="bg-[#1e2023] border-t border-white/10 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* ================= BAGIAN ATAS FOOTER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
          
          {/* Kiri: Logo dan Tagline */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-bold text-2xl tracking-widest text-white">GYMBROS</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat commodi suscipit consequuntur quasi incidunt.
            </p>
          </div>

          {/* Kanan: Social Media & Kontak */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
            
            {/* Follow Us */}
            <div>
              <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">Follow Us</h4>
              <div className="flex gap-3">
                {/* Ikon Instagram */}
                <a href="https://www.instagram.com/biji.something/" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 text-gray-400 transition hover:border-transparent hover:bg-[#47484c] hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                {/* Ikon YouTube */}
                <a href="https://www.youtube.com/@Ghepe" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 text-gray-400 transition hover:border-transparent hover:bg-[#47484c] hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.28 30.196 30.196 0 0 0 .2 3.28c.114.822.38 1.487.8 1.965a2.838 2.838 0 0 0 1.983.839c3.033.29 6.928.2 6.928.2s4.161 0 6.928-.2a2.84 2.84 0 0 0 1.985-.839 4.225 4.225 0 0 0 .788-1.965 30.136 30.136 0 0 0 .2-3.28 30.135 30.135 0 0 0-.2-3.28zM9.794 14.93V8.16l6.505 3.389-6.505 3.38z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Call Us */}
            <div>
              <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">Call Us</h4>
              <p className="text-lg font-medium text-gray-200">(+62) 856 8085</p>
            </div>

          </div>
        </div>

        {/* ================= BAGIAN BAWAH (COPYRIGHT & LINKS) ================= */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
          <p>&copy; 2026 GYM System Management. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-gray-300 transition">PRIVACY POLICY</Link>
            <Link to="/terms-conditions" className="hover:text-gray-300 transition">TERMS AND CONDITIONS</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}