
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const navigate = useNavigate();

  // Redirect to the main admin page with tabs
  useEffect(() => {
    navigate('/app/admin', { replace: true });
  }, [navigate]);

  return null;
};

export default UserManagement;
