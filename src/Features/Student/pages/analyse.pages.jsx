import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import AnalyseStudentPage from '../../../shared/pages/AnalyseStudentPage';

const StudentSelfAnalysePage = () => {
  const { user, organizationId } = useAuth();
  if (!user?.id) return <Navigate to="/student/dashboard" replace />;

  return (
    <AnalyseStudentPage
      basePath="/student"
      backLabel="Back to dashboard"
      studentIdOverride={user.id}
      organizationIdOverride={organizationId}
    />
  );
};

export default StudentSelfAnalysePage;
