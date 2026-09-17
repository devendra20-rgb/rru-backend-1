import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { PaletteMode } from '@mui/material';
import { createAppTheme } from './theme/theme';
import App from './App.tsx';
import './index.css';

import { GlobalToastProvider } from './components/common/GlobalToastProvider';
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';
import { ColorModeContext } from './context/ColorModeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/** Wrapper that owns the color-mode state so ThemeProvider can be dynamic. */
function Root() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('rru-color-mode');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next: PaletteMode = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem('rru-color-mode', next);
          return next;
        });
      },
    }),
    [],
  );

  const appTheme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <GlobalToastProvider>
          <App />
        </GlobalToastProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Root />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>,
);
