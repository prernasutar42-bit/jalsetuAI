import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { MapPage } from '../pages/MapPage';
import { AlertsPage } from '../pages/AlertsPage';
import { SafetyPage } from '../pages/SafetyPage';
import { AdminPage } from '../pages/AdminPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AdminRoute } from './AdminRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
