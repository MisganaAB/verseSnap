import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HealthPage from '@/pages/HealthPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HealthPage />} />

      {/* Future routes will be mounted here:
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/verses" element={<VersesPage />} />
      <Route path="/streak" element={<StreakPage />} />
      <Route path="/admin" element={<AdminPage />} />
      */}

      {/* Fallback route */}
      <Route path="*" element={<HealthPage />} />
    </Routes>
  );
}
