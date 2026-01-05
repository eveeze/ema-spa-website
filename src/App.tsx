// src/App.tsx
import { Outlet } from "react-router-dom";
// Hapus import AnimatePresence dan motion jika tidak dipakai komponen lain
import Navbar from "./layout/Navbar";
import OneSignalManager from "./components/OneSignalManager";

function App() {
  // Hapus useLocation karena tidak lagi dipakai untuk key animasi global

  return (
    <>
      <OneSignalManager />
      {/* Jika Navbar ini untuk landing page, sebaiknya dipisah layoutnya. 
          Tapi jika struktur Anda begini, biarkan saja. */}
      <Navbar />

      {/* ✅ PERBAIKAN: Hapus AnimatePresence & motion.main di sini. 
          Biarkan Outlet merender DashboardLayout tanpa di-unmount paksa. */}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}

export default App;
