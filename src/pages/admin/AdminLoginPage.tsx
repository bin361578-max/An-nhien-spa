import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminLoginPage redirects to the unified entrance at /login.
 * Authentication role is automatically determined by the server.
 */
export const AdminLoginPage: React.FC = () => {
  return <Navigate to="/login" replace />;
};
