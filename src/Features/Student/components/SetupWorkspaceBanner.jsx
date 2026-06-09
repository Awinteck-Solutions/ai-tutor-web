import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { GradientButton } from '../../../shared/components/GradientButton';
import { useAuth } from '../../../shared/context/AuthContext';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { provisionWorkspace } from '../services/student.services';

const SetupWorkspaceBanner = () => {
  const { fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      await provisionWorkspace();
      await fetchProfile();
      notifications.show({
        title: 'Workspace ready',
        message: 'Your free personal learning space is set up.',
        color: 'green',
      });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alert-warning flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm">
        No learning workspace linked yet. Create a free personal space or ask your school for an invite.
      </p>
      <GradientButton type="button" className="!px-3 !py-2 text-sm" disabled={loading} onClick={handleSetup}>
        {loading ? 'Setting up…' : 'Create free workspace'}
      </GradientButton>
    </div>
  );
};

export default SetupWorkspaceBanner;
