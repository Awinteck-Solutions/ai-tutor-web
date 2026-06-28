import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { notifications } from '@mantine/notifications';
import { GOOGLE_CLIENT_ID } from '../../../constants/auth.constant';
import { capitalizeWords } from '../../../utils/page.helper';

const googleClientId = GOOGLE_CLIENT_ID?.trim();

const GoogleSignInButton = ({ onSuccess, disabled = false, label = 'continue_with' }) => {
  const [loading, setLoading] = useState(false);

  if (!googleClientId) return null;

  return (
    <div className="w-full">
      <div className={disabled || loading ? 'pointer-events-none opacity-60' : ''}>
        <GoogleLogin
          theme="outline"
          size="large"
          shape="rectangular"
          text={label}
          width="100%"
          onSuccess={async (response) => {
            if (!response.credential) return;
            setLoading(true);
            try {
              await onSuccess?.(response.credential);
            } catch (error) {
              notifications.show({
                title: 'Google sign-in failed',
                message: capitalizeWords(
                  error?.response?.data?.message || 'Could not sign in with Google',
                ),
                color: 'red',
              });
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            notifications.show({
              title: 'Google sign-in failed',
              message: 'Could not connect to Google. Try again.',
              color: 'red',
            });
          }}
        />
      </div>
    </div>
  );
};

export default GoogleSignInButton;
