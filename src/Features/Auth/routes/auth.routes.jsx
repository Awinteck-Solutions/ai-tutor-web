import { Route, Routes } from 'react-router-dom';
import AdminLoginPage from '../pages/admin.login.pages';

const AuthRoutes = () => (
  <Routes>
    <Route path="login" element={<AdminLoginPage />} />
    <Route path="admin/auth" element={<AdminLoginPage />} />
  </Routes>
);

export default AuthRoutes;
