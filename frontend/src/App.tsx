import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { ConnectPage } from './pages/ConnectPage';
import { AuthSuccessPage } from './pages/AuthSuccessPage';
import { HomePage } from './pages/HomePage';
import { ConverterPage } from './pages/ConverterPage';
import { SummarizerPage } from './pages/SummarizerPage';
import { MatrixPage } from './pages/MatrixPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth-success" element={<AuthSuccessPage />} />

        {/* Protected routes */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connect"
          element={
            <ProtectedRoute>
              <ConnectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/converter"
          element={
            <ProtectedRoute>
              <ConverterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summarizer"
          element={
            <ProtectedRoute>
              <SummarizerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrix"
          element={
            <ProtectedRoute>
              <MatrixPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/user-dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
