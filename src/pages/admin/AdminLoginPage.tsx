import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminLoginPage redirects to the unified portal at /login?tab=admin
 * as requested to ensure a single, consistent entrance for all account types.
 */
export const AdminLoginPage: React.FC = () => {
  return <Navigate to="/login?tab=admin" replace />;
};
