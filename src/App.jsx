// File: src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// JANGAN ADA YANG DIHAPUS

// 1. IMPORT HALAMAN DARI FOLDER PAGES DI SINI
import NamaHalamanIni from "./pages/contoh";
import AdminLayout from "./components/AdminLayout";
import MemberLayout from "./components/MemberLayout";
import Footer from "./components/Footer";
import LandingPage from "./pages/Landingpage";
import Login from "./pages/login";
import News from "./pages/news";
import DashboardMember from "./pages/dashboardmember";
import ClassSchedule from "./pages/jadwalkelas";
import AdminManageMembers from "./pages/datamember";
import DashboardAdmin from "./pages/dashboardadmin";
import AddMember from "./pages/addmember";
import AdminNotifications from "./pages/notifikasi";
import Reports from "./pages/Reports";
import ManajemenKelas from "./pages/kelolakelas";
import KelolaAlatAdmin from "./pages/StatusAlat";
import KetersediaanAlatMember from "./pages/KetersediaanAlat";


// import LoginAdmin from "./pages/LoginAdmin"; (Contoh kalau udah dibikin) abistu daftarin route nya di bawah

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Disini */}
        {/* 2. DAFTARKAN RUTE URL HALAMAN DI SINI kalo ga ada header */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/news" element={<News />} />
        
      
        {/* kalo ada header di sini:     (pilih admin atau member) */}
        <Route element={<AdminLayout />}>
          <Route path="/contohadmin" element={<DashboardAdmin />} />
          <Route path="/admin/datamember" element={<AdminManageMembers />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/add-member" element={<AdminManageMembers />} />
          <Route path="/admin/tambahmember" element={<AddMember />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/manage-classes" element={<ManajemenKelas />} />
          <Route path="/admin/manage-equipment" element={<KelolaAlatAdmin />} />
          
          
          {/* <Route path="/admin-alat" element={<HalamanKelolaAlat />} /> */}
        </Route>
      
        {/* --- RUTE MEMBER  --- */}
        <Route element={<MemberLayout />}>
        <Route path="/contohmember" element={<DashboardMember />} />
        <Route path="/member/dashboardmember" element={<DashboardMember />} />
        <Route path="/member/booking" element={<ClassSchedule />} />
        <Route path="/member/reports" element={<Reports />} />
        <Route path="/member/equipment" element={<KetersediaanAlatMember />} />
        

          {/* <Route path="/member-booking" element={<HalamanBooking />} /> */}
        </Route>

      

        
      </Routes>
    </BrowserRouter>
  );
}