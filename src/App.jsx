// File: src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// JANGAN ADA YANG DIHAPUS

// 1. IMPORT HALAMAN DARI FOLDER PAGES DI SINI
import NamaHalamanIni from "./pages/Member/contoh";
import AdminLayout from "./components/AdminLayout";
import MemberLayout from "./components/MemberLayout";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage/Landingpage";
import Login from "./pages/LandingPage/login";
import News from "./pages/LandingPage/news";
import DashboardMember from "./pages/Member/dashboardmember";
import ClassSchedule from "./pages/Member/jadwalkelas";
import AdminManageMembers from "./pages/Admin/datamember";
import DashboardAdmin from "./pages/Admin/dashboardadmin";
import AddMember from "./pages/Admin/addmember";
import AdminNotifications from "./pages/Admin/notifikasi";
import Reports from "./pages/Member/reports";
import ManajemenKelas from "./pages/Admin/kelolakelas";
import KelolaAlatAdmin from "./pages/Admin/StatusAlat";
import KetersediaanAlatMember from "./pages/Member/KetersediaanAlat";
import MemberNotifications from "./pages/Member/NotifikasiMember";
import Bayar from "./pages/Member/bayar";
import Membership from "./pages/Member/membership";
import Profile from "./pages/Member/profile";
import EditProfile from "./pages/Member/editprofile";
import Payment from "./pages/Member/PaymentPage";
import DashboardCoach from "./pages/Coach/DashboardCoach";
import Analystic from "./pages/Admin/analisis";
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
        <Route path="/Dashboardcoach" element={<DashboardCoach />} />
        
      
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
          <Route path="/admin/analytics" element={<Analystic />} />
          
          
          {/* <Route path="/admin-alat" element={<HalamanKelolaAlat />} /> */}
        </Route>
      
        {/* --- RUTE MEMBER  --- */}
        <Route element={<MemberLayout />}>
        <Route path="/contohmember" element={<DashboardMember />} />
        <Route path="/member/dashboardmember" element={<DashboardMember />} />
        <Route path="/member/booking" element={<ClassSchedule />} />
        <Route path="/member/reports" element={<Reports />} />
        <Route path="/member/equipment" element={<KetersediaanAlatMember />} />
        <Route path="/member/notifications" element={<MemberNotifications />} />
        <Route path="/member/membership" element={<Membership />} />
        <Route path="/member/bayar" element={<Bayar />} />
        <Route path="/member/profile" element={<Profile />} />
        <Route path="/member/edit-profile" element={<EditProfile />} />
        <Route path="/member/bayarkelas" element={<Payment />} />
          {/* <Route path="/member-booking" element={<HalamanBooking />} /> */}
        </Route>

      

        
      </Routes>
    </BrowserRouter>
  );
}