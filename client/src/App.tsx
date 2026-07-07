import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { useAuth } from "./hooks/useAuth.tsx";
import { Login } from "./pages/Login";
import { Dashboard } from "./Pages/Dashboard";
import { ClassRoomDetail } from "./Pages/ClassRoomDetail";
import { LandingPage } from "./Pages/LandingPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import type { JSX } from "react/jsx-dev-runtime";
import { VirtualClassSession } from "./components/StudentComponents/VirtualClassSession";
// ------------------------------------------------------------------
// NUEVO COMPONENTE DE PROTECCIÓN BASADO EN ROLES
// ------------------------------------------------------------------

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: ("teacher" | "student")[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 💡 BLOQUEO DE SEGURIDAD INTERMEDIO:
  // Mientras estamos verificando el token con el backend, no renderizamos nada ni redirigimos
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">
          Restaurando sesión segura...
        </p>
      </div>
    );
  }

  // Si terminó de cargar y realmente no hay usuario, al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario no está autorizado para esta ruta específica
  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "teacher" ? "/dashboard" : "/mis-clases"}
        replace
      />
    );
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==========================================
              SECTOR 1: PÚBLICO (Entra todo el mundo) 
              ========================================== */}
          {/* Aquí podrías poner una Landing Page de tu academia */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* ==========================================
              SECTOR 2: SOLO PROFESORES (Dashboard Administrativo) 
              ========================================== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ==========================================
              SECTOR 3: AULAS VIRTUALES (Alumnos y Profesores)
              ========================================== */}
          {/* Vista principal para que el alumno vea su lista de clases */}
          <Route
            path="/mis-clases"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* El detalle de la sala (donde se hacen las tareas) */}
          {/* Permitimos que entren ambos: el alumno para hacerlas, el profe para corregirlas/crearlas */}
          <Route
            path="/sala/:id"
            element={
              <ProtectedRoute allowedRoles={["teacher", "student"]}>
                <ClassRoomDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/live/:id"
            element={
              <ProtectedRoute allowedRoles={["teacher", "student"]}>
                <VirtualClassSession  />
              </ProtectedRoute>
            }
          />

          {/* ==========================================
              RUTAS COMODÍN (Fallback) 
              ========================================== */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
