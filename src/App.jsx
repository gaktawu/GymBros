// File: src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// JANGAN ADA YANG DIHAPUS

// 1. IMPORT HALAMAN DARI FOLDER PAGES DI SINI
import NamaHalamanIni from "./pages/contoh";
import AdminLayout from "./components/AdminLayout";
import MemberLayout from "./components/MemberLayout";
// import LoginAdmin from "./pages/LoginAdmin"; (Contoh kalau udah dibikin) abistu daftarin route nya di bawah

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Disini */}
        {/* 2. DAFTARKAN RUTE URL HALAMAN DI SINI kalo ga ada header */}
        <Route path="/contoh" element={<NamaHalamanIni />} />
        

        {/* kalo ada header di sini:     (pilih admin atau member) */}
        <Route element={<AdminLayout />}>
          <Route path="/contohheader" element={<NamaHalamanIni />} />
          {/* <Route path="/admin-alat" element={<HalamanKelolaAlat />} /> */}
        </Route>
      
        {/* --- RUTE MEMBER (Dibungkus MemberLayout) --- */}
        <Route element={<MemberLayout />}>
          {/* <Route path="/member-booking" element={<HalamanBooking />} /> */}
        </Route>

        
      </Routes>
    </BrowserRouter>
  );
}