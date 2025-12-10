// src/App.tsx
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./layout/Navbar";
import OneSignalManager from "./components/OneSignalManager";

function App() {
  const location = useLocation();

  return (
    <>
      <OneSignalManager />
      <Navbar />

      {/* Transition antar halaman */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
          className="min-h-screen"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </>
  );
}

export default App;
