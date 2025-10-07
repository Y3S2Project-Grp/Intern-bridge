import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navigation
import AppNavigator from './navigation/AppNavigator';

// Contexts
import { AuthProvider, useAuth } from './hooks/useAuth';

// Theme and styling
import { Colors } from './constants/Colors';
import { theme } from './theme/theme';

// Services
import { AIService } from './services/aiService';
import { NotificationService } from './services/notificationService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
]);

// Initialize AI service with API keys (in production, use environment variables)
AIService.initialize({
  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  openAIApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  huggingFaceToken: process.env.EXPO_PUBLIC_HUGGINGFACE_TOKEN,
});

// Main App Content Component
const AppContent = () => {
  const { isLoading } = useAuth();

  // Handle deep linking
  useEffect(() => {
    // Initialize deep linking
    // This would be set up to handle URLs like internbridge://internships/123
  }, []);

  // Handle notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Request notification permissions
        await NotificationService.requestPermission();
        
        // Get FCM token
        const token = await NotificationService.getFCMToken();
        if (token) {
          console.log('FCM Token:', token);
          // You would typically send this token to your backend
        }
      } catch (error) {
        console.error('Failed to setup notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (error: Error) => {
      console.error('Global error:', error);
      // In production, you might want to send this to an error reporting service
    };

    const promiseRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    // Set up global error handling
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => errorHandler(event.error));
      window.addEventListener('unhandledrejection', promiseRejectionHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', (event) => errorHandler(event.error));
        window.removeEventListener('unhandledrejection', promiseRejectionHandler);
      }
    };
  }, []);

  // You can show a splash screen here while loading
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* Custom loading screen can be implemented here */}
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" backgroundColor={Colors.background} />
          <AppNavigator />
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;