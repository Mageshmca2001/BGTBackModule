import React from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import Cookies from 'js-cookie';

import { jwtDecode } from 'jwt-decode'; // Importing jwt-decode correctly

const ProtectedRoute = ({ allowedRoles }) => {

  const token = Cookies.get('token');

  if (!token) {

    return <Navigate to="/" replace />; // Redirect to login if no token is found
  }

  try {
    // Decode the token

    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000; // Current time in seconds

    if (decoded.exp < currentTime) {

      Cookies.remove('token'); // Remove expired token

      alert('Session expired. Please log in again.');

      return <Navigate to="/" replace />;
    }

    // Extract the user's role from the decoded token

  const userRole = decoded.role;


    if (!allowedRoles.includes(userRole)) {

      return <Navigate to="/unauthorized" replace />; // Redirect if user role is not allowed
    }

    return <Outlet />; 

                                                  // Render the child routes if the role is allowed
  } catch (error) {


    Cookies.remove('token');

     // Remove token if decoding fails
     
    return <Navigate to="/" replace />;

  }
};

export default ProtectedRoute;
