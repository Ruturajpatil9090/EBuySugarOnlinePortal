// PrivateRoute.tsx
import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ComponentType;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ element: Component }) => {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'Y';

  return isAdmin ? <Component /> : <Navigate to="/publishedlist" />;
};

export default PrivateRoute;
