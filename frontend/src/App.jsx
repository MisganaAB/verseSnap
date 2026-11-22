import React from 'react';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <RootLayout>
        <AppRoutes />
      </RootLayout>
    </AuthProvider>
  );
}
