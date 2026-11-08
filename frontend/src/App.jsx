import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { DistrictProvider } from './context/DistrictContext';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DistrictProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppRoutes />
          </BrowserRouter>
        </DistrictProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
