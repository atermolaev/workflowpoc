import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { loadCurrentUser } from '@/globals/auth';
import HomePage from '@/components/HomePage/HomePage';
import LoginPage from '@/components/LoginPage/LoginPage';
import RegistrationPage from '@/components/RegistrationPage/RegistrationPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return loadCurrentUser() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
