// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/useAuth'; // Import both
import { UserRole } from '../constants/Roles';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutContent />
    </AuthProvider>
  );
}

function LayoutContent() {
  const { user, role, isLoading, isInitializing } = useAuth();

  // Show loading state
  if (isInitializing || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  // Determine initial route based on auth state
  const getInitialRouteName = () => {
    if (!user) return 'auth';
    
    // Safer approach without type assertion
    if (!role) return 'auth';
    
    switch (role) {
      case UserRole.ORG: return 'org';
      case UserRole.ADMIN: return 'admin';
      default: return 'youth';
    }
  };
 return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName={getInitialRouteName()}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="org" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="youth" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}