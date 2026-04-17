import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './redux/store';
import HomePage from '@/components/HomePage/HomePage';
import LoginPage from '@/components/LoginPage/LoginPage';
import RegistrationPage from '@/components/RegistrationPage/RegistrationPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
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
