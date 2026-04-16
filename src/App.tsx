import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/components/HomePage/HomePage';
import RegistrationPage from '@/components/RegistrationPage/RegistrationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
