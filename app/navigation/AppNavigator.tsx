import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { UserRole } from '../constants/Roles';
import { useAuth } from '../hooks/useAuth';
import YouthHomeScreen from '../screens/home/YouthHomeScreen';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import OrgNavigator from './OrgNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : role === UserRole.ORG ? (
          // Organization flow
          <Stack.Screen name="OrgApp" component={OrgNavigator} />
        ) : role === UserRole.ADMIN ? (
          // Admin flow
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        ) : (
          // Youth flow (default)
          <Stack.Screen name="YouthApp" component={YouthHomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;