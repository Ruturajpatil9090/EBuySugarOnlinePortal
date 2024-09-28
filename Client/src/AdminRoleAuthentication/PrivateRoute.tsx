import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ComponentType;
  restrictToUserType2?: boolean; // Optional prop to restrict access to user_type 2
}

const PrivateRoute: FC<PrivateRouteProps> = ({ element: Component, restrictToUserType2 = false }) => {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'Y';
  const userType2 = sessionStorage.getItem('user_type') === '2';

  if (isAdmin) {
    // Admins have access to everything
    return <Component />;
  }

  if (restrictToUserType2 && userType2) {
    // Only allow user_type 2 to access restricted routes
    return <Component />;
  }

  // Redirect if none of the conditions match
  return <Navigate to="/publishedlist" />;
};

export default PrivateRoute;
