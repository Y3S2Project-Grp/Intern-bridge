// app/components/NotificationHandler.tsx
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth'; // Go up two levels from components

// Configure Expo Notifications for mobile
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: Platform.OS === 'ios',
    shouldShowList: Platform.OS === 'ios',
  }),
});

function NotificationHandler(): null {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;

    const setupNotifications = async () => {
      try {
        if (Platform.OS === 'web') {
          // Use Firebase for web (only in supported browsers)
          if (NotificationService.getMessagingSafe()) {
            const hasPermission = await NotificationService.requestPermission();
            if (hasPermission) {
              const token = await NotificationService.getFCMToken();
              console.log('FCM Token obtained:', token ? 'Yes' : 'No');
              
              // Setup foreground message listener
              unsubscribe = NotificationService.setupMessageListener((payload) => {
                console.log('Foreground message received:', payload);
                // Handle the notification while app is in foreground
                // You can show a custom notification UI here
              });
            }
          } else {
            console.log('Firebase Messaging not supported in this browser');
          }
        } else {
          // Use Expo Notifications for mobile
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          
          if (finalStatus === 'granted') {
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);
            
            // Configure notification handling for mobile
            const subscription = Notifications.addNotificationReceivedListener(notification => {
              console.log('Notification received:', notification);
            });

            unsubscribe = () => subscription.remove();
          }
        }
      } catch (error) {
        console.error('Notification setup error:', error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return null;
}

export default NotificationHandler;