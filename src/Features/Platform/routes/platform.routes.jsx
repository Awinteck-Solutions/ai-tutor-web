import { Navigate, Route } from 'react-router-dom';
import DashboardPage from '../pages/dashboard.pages';
import TrafficPage from '../pages/traffic.pages';
import HealthPage from '../pages/health.pages';
import UsersPage from '../pages/users.pages';
import OrganizationsPage from '../pages/organizations.pages';
import InvoicesPage from '../pages/invoices.pages';

export const platformRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="traffic" element={<TrafficPage />} />
    <Route path="health" element={<HealthPage />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="organizations" element={<OrganizationsPage />} />
    <Route path="invoices" element={<InvoicesPage />} />
  </>
);
