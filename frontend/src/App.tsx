import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { AuthSuccessPage } from './pages/AuthSuccessPage';
import { HomePage } from './pages/HomePage';
import { ConverterPage } from './pages/ConverterPage';
import { SummarizerPage } from './pages/SummarizerPage';
import { MatrixPage } from './pages/MatrixPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth-success" element={<AuthSuccessPage />} />
        <Route
          path="/"
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
      </Routes>
    </Router>
  );
}

export default App;
