// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/authContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

// Layouts and Pages
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import ServicesPage from "./pages/Services.tsx";
import LoginPage from "./pages/Login.tsx";
import ServiceDetailPage from "./pages/ServiceDetail.tsx";
import BookingPage from "./pages/Booking.tsx";
import RegisterPage from "./pages/Register.tsx";
import ProtectedRoute from "./components/shared/ProtectedRoutes.tsx";
import PaymentStatusPage from "./pages/PaymentStatusPage.tsx";

// --- Dashboard Related Imports ---
import CustomerReservations from "./pages/CustomerReservations.tsx";
import DashboardLayout from "./layout/DashboardLayout.tsx";
import CustomerDashboard from "./pages/DashboardCustomer.tsx";
import CustomerProfile from "./pages/CustomerProfile.tsx";
import ReservationDetailPage from "./pages/ReservationDetailPage.tsx";
import SchedulePage from "./pages/SchedulePage.tsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.tsx";

// Buat instance QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 menit
      retry: 1,
    },
  },
});

// Definisikan router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "services", element: <ServicesPage /> },
      { path: "services/:serviceId", element: <ServiceDetailPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "verify-otp", element: <VerifyOtpPage /> },
      { path: "payment/status", element: <PaymentStatusPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <DashboardLayout />,
            children: [
              { index: true, element: <CustomerDashboard /> },
              { path: "reservations", element: <CustomerReservations /> },
              {
                path: "reservations/:reservationId",
                element: <ReservationDetailPage />,
              },
              { path: "profile", element: <CustomerProfile /> },
            ],
          },
          {
            path: "booking/:serviceId",
            element: <BookingPage />,
          },
        ],
      },
    ],
  },
]);

// Render aplikasi
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

// Inisialisasi OneSignal setelah DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  // Tunggu sebentar agar aplikasi selesai load
  setTimeout(async () => {
    try {
      const { initOneSignal } = await import("./services/oneSignalService.ts");
      await initOneSignal();
    } catch (error) {
      console.error("Error inisialisasi OneSignal di main:", error);
    }
  }, 2000);
});
