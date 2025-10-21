// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Index() {
  const { user, isLoading, isInitializing } = useAuth();
  
  if (isLoading || isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }
  
  // Redirect based on auth state
  return <Redirect href={user ? "/youth" : "/auth"} />;
}