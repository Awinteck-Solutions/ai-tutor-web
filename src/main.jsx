import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import App from './App.jsx';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
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
  return (
    <DatesProvider settings={{ consistentWeeks: true }}>
      <MantineProvider theme={mantineTheme} forceColorScheme={theme}>
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedMantine>
        <Notifications position="top-right" />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemedMantine>
    </ThemeProvider>
  </StrictMode>,
);
