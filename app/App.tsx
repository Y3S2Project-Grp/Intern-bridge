import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { LogBox, Platform } from 'react-native';
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

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Helper: register for push notifications
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } else {
    alert('Must use a physical device for push notifications');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// ----------------- APP CONTENT -----------------
const AppContent = () => {
  const { isLoading } = useAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Handle deep linking
  useEffect(() => {
    // TODO: setup deep links like internbridge://internships/123
  }, []);

  // Handle notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log('Registered for push notifications:', token);
          // Optionally send token to your backend here
        }
      } catch (error) {
        console.error('Failed to setup notifications:', error);
      }
    };

    setupNotifications();

    // Listen for foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user tapping a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (error: Error) => {
      console.error('Global error:', error);
    };

    const promiseRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

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

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* Add a custom loading screen here */}
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

// ----------------- MAIN APP WRAPPER -----------------
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
