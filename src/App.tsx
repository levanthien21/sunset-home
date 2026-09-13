import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerApp from './pages/customer/CustomerApp';
import StaffApp from './pages/staff/StaffApp';
import AdminApp from './pages/admin/AdminApp';
import RoleSelection from './pages/RoleSelection';

import PayOSReturnPage from './pages/customer/PayOSReturnPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/portal" element={<RoleSelection />} />
        <Route path="/*" element={<CustomerApp />} />
        <Route path="/staff/*" element={<StaffApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/payos-return" element={<PayOSReturnPage />} />
      </Routes>
    </Router>
  );
}

export default App;
