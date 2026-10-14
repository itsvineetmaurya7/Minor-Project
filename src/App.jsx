// Connects the global auth and toast providers to the URL routes and role-protected dashboards.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ui";
import Landing from "./pages/Landing";
import { Login, Register } from "./pages/Auth";
import Customer from "./pages/Customer";
import Employee from "./pages/Employee";
import Admin from "./pages/Admin";

function Guard({ role, children }) {
  // Dashboard routes require a signed-in user with the matching role; otherwise send them to login or their own portal.
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={"/" + user.role.toLowerCase()} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/customer/:section?" element={<Guard role="CUSTOMER"><Customer /></Guard>} />
            <Route path="/employee/:section?" element={<Guard role="EMPLOYEE"><Employee /></Guard>} />
            <Route path="/admin/:section?" element={<Guard role="ADMIN"><Admin /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
