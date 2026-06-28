import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import App from './App.jsx';
import './i18n';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import { GOOGLE_CLIENT_ID } from './constants/auth.constant';
import { AuthProvider } from './shared/context/AuthContext';
import { ThemeProvider, useTheme } from './shared/context/ThemeContext';

const mantineTheme = createTheme({
  primaryColor: 'yellow',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: { fontFamily: 'Space Grotesk, Inter, sans-serif' },
  defaultRadius: 'md',
  colors: {
    dark: [
      '#e8e8e8', '#c4c4c4', '#9a9a9a', '#6b6b6b', '#454545',
      '#2a2a2a', '#1a1a1a', '#121212', '#0a0a0a', '#050505',
    ],
  },
});

const ThemedMantine = ({ children }) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? 'dark' : 'light';
  const primaryColor = theme === 'dark' ? 'yellow' : theme === 'edu' ? 'indigo' : 'yellow';

  const themedMantine = useMemo(
    () => createTheme({ ...mantineTheme, primaryColor }),
    [primaryColor],
  );

  return (
    <DatesProvider settings={{ consistentWeeks: true }}>
      <MantineProvider theme={themedMantine} forceColorScheme={colorScheme}>
        <ModalsProvider
          modalProps={{
            centered: true,
            overlayProps: { backgroundOpacity: 0.55, blur: 3 },
            classNames: {
              title: 'font-display font-semibold',
              header: 'border-b border-border/50',
              content: 'glass-card !bg-card',
            },
          }}
          labels={{ confirm: 'Confirm', cancel: 'Cancel' }}
        >
          {children}
        </ModalsProvider>
      </MantineProvider>
    </DatesProvider>
  );
};

const googleClientId = GOOGLE_CLIENT_ID?.trim() || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedMantine>
        <Notifications position="top-right" />
        <GoogleOAuthProvider clientId={googleClientId || 'placeholder-client-id'}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GoogleOAuthProvider>
      </ThemedMantine>
    </ThemeProvider>
  </StrictMode>,
);
