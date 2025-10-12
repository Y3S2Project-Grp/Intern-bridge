// app/navigation/AppNavigator.tsx
import React from 'react';
import { UserRole } from '../constants/Roles';
import { useAuth } from '../hooks/useAuth';
import YouthHomeScreen from '../screens/home/YouthHomeScreen';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import OrgNavigator from './OrgNavigator';

const AppNavigator = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Return the appropriate navigator component without NavigationContainer
  if (!user) {
    return <AuthNavigator />;
  } else if (role === UserRole.ORG) {
    return <OrgNavigator />;
  } else if (role === UserRole.ADMIN) {
    return <AdminNavigator />;
  } else {
    return <YouthHomeScreen />;
  }
};

export default AppNavigator;