import { Outlet } from "react-router";
import Navbar from "./layout/Navbar";
import OneSignalManager from "./components/OneSignalManager";
function App() {
  return (
    <>
      <div>
        <OneSignalManager />
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
