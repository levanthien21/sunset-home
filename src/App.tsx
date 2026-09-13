import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerApp from './pages/customer/CustomerApp';
import StaffApp from './pages/staff/StaffApp';
import AdminApp from './pages/admin/AdminApp';
import RoleSelection from './pages/RoleSelection';

import VNPayReturnPage from './pages/customer/VNPayReturnPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/customer/*" element={<CustomerApp />} />
        <Route path="/staff/*" element={<StaffApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/vnpay-return" element={<VNPayReturnPage />} />
      </Routes>
    </Router>
  );
}

export default App;
