import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserOnlyRoute from "./components/UserOnlyRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ManageBooking from "./pages/ManageBooking";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./pages/AdminPanel";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* ✅ Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* ✅ User-only routes (accessible only to authenticated non-admin users) */}
            <Route
              path="/"
              element={
                <UserOnlyRoute>
                  <Dashboard />
                </UserOnlyRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <UserOnlyRoute>
                  <BookingPage />
                </UserOnlyRoute>
              }
            />
            <Route
              path="/confirmation"
              element={
                <UserOnlyRoute>
                  <ConfirmationPage />
                </UserOnlyRoute>
              }
            />
            <Route
              path="/manage"
              element={
                <UserOnlyRoute>
                  <ManageBooking />
                </UserOnlyRoute>
              }
            />

            {/* ✅ Admin-only routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* ✅ Error pages */}
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "10px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "#fff" },
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
