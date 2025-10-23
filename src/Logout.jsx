
// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  
  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  
  handleLogout();

  return null; 
};

export default Logout;
