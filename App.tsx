// App.tsx (simplified)
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { LogBox, Platform, View, ActivityIndicator, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contexts
import { AuthProvider, useAuth } from './hooks/useAuth';

// Theme and styling
import { Colors } from './constants/Colors';
import { theme } from './app/theme/theme';

// Services
import { AIService } from './services/aiService';

// Components
import NotificationHandler from './app/components/NotificationHandler';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'FirebaseError',
]);

// Safe AI service initialization
try {
  AIService.initialize({
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    openAIApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    huggingFaceToken: process.env.EXPO_PUBLIC_HUGGINGFACE_TOKEN,
  });
} catch (error) {
  console.warn('AI Service initialization failed:', error);
}

// Configure notification behavior (only if available)
if (Notifications.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Helper: register for push notifications (safe for web)
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'web') {
    console.log('Push notifications not supported on web');
    return;
  }

  if (Device.isDevice) {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use a physical device for push notifications');
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (error) {
      console.error('Error setting notification channel:', error);
    }
  }

  return token;
}

// ----------------- APP CONTENT -----------------
const AppContent = () => {
  const { isLoading, isInitializing } = useAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Handle notifications (safe for web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log('Registered for push notifications:', token);
        }
      } catch (error) {
        console.error('Failed to setup notifications:', error);
      }
    };

    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Global error handler (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const errorHandler = (error: Error) => {
      console.error('Global error:', error);
    };

    const promiseRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('error', (event) => errorHandler(event.error));
    window.addEventListener('unhandledrejection', promiseRejectionHandler);

    return () => {
      window.removeEventListener('error', (event) => errorHandler(event.error));
      window.removeEventListener('unhandledrejection', promiseRejectionHandler);
    };
  }, []);

  // Show full screen loader during initial app startup
  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading...</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" backgroundColor={Colors.background} />
          <NotificationHandler />
          {/* Expo Router will handle the navigation automatically */}
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