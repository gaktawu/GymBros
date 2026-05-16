// File: src/components/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminLayout from "./AdminLayout"; // Memanggil menu navigasi
import Footer from "./Footer"; // Memanggil footer bawah

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* 1. Header (Navbar) akan selalu muncul di atas */}
      <AdminLayout />

      {/* 2. Konten Utama (Tempat halaman dari App.jsx muncul) */}
      <main className="flex-grow pt-32 pb-10 px-4 md:px-8">
        <Outlet /> 
      </main>

      {/* 3. Footer akan selalu muncul di bawah */}
      <Footer />

    </div>
  );
}