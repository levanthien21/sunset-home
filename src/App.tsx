import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import CustomerApp from './pages/customer/CustomerApp';
import StaffApp from './pages/staff/StaffApp';
import AdminApp from './pages/admin/AdminApp';
import RoleSelection from './pages/RoleSelection';
import PayOSReturnPage from './pages/customer/PayOSReturnPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/portal" element={<RoleSelection />} />
        <Route path="/staff/*" element={<StaffApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/payos-return" element={<PayOSReturnPage />} />
        <Route path="/*" element={<CustomerApp />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
