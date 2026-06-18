import { Navigate, Route, useParams } from 'react-router-dom';
import DashboardPage from '../pages/dashboard.pages';
import TrafficPage from '../pages/traffic.pages';
import HealthPage from '../pages/health.pages';
import UsersPage from '../pages/users.pages';
import OrganizationsPage from '../pages/organizations.pages';
import InvoicesPage from '../pages/invoices.pages';
import PaymentsPage from '../pages/payments.pages';
import ContentPage from '../pages/content.pages';
import EmailsPage from '../pages/emails.pages';
import { UserPreviewPage, OrganizationPreviewPage } from '../pages/preview.pages';
import {
  platformOrganizationPreviewPath,
  platformUserPreviewPath,
} from '../platform.paths';

const LegacyUserPreviewRedirect = () => {
  const { userId } = useParams();
  return <Navigate to={platformUserPreviewPath(userId)} replace />;
};

const LegacyOrganizationPreviewRedirect = () => {
  const { organizationId } = useParams();
  return <Navigate to={platformOrganizationPreviewPath(organizationId)} replace />;
};

/** Route elements nested under /platform — do not wrap in another <Routes>. */
export const platformRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="traffic" element={<TrafficPage />} />
    <Route path="health" element={<HealthPage />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="users/:userId/preview" element={<UserPreviewPage />} />
    <Route path="organizations" element={<OrganizationsPage />} />
    <Route path="organizations/:organizationId/preview" element={<OrganizationPreviewPage />} />
    <Route path="invoices" element={<InvoicesPage />} />
    <Route path="payments" element={<PaymentsPage />} />
    <Route path="content" element={<ContentPage />} />
    <Route path="emails" element={<EmailsPage />} />
    {/* Legacy URLs — redirect to nested preview routes */}
    <Route path="preview/users/:userId" element={<LegacyUserPreviewRedirect />} />
    <Route path="preview/organizations/:organizationId" element={<LegacyOrganizationPreviewRedirect />} />
  </>
);
