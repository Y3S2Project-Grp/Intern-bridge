// app/services/notificationService.ts
import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where,
    limit,
    deleteDoc,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import {
    getMessaging,
    getToken,
    Messaging,
    onMessage
} from 'firebase/messaging';
import { Platform } from 'react-native';
import { db } from './firebaseConfig';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export enum NotificationType {
  APPLICATION_UPDATE = 'application_update',
  NEW_INTERNSHIP = 'new_internship',
  ELIGIBILITY_RESULT = 'eligibility_result',
  PROFILE_COMPLETION = 'profile_completion',
  SYSTEM_ALERT = 'system_alert',
  MESSAGE = 'message',
  GENERAL = 'general'
}

export class NotificationService {
  private static messaging: Messaging | null = null;

  static initialize() {
    // Only initialize Firebase Messaging in supported browsers
    if (Platform.OS === 'web' && this.isFirebaseMessagingSupported()) {
      try {
        this.messaging = getMessaging();
        console.log('Firebase Messaging initialized for web');
      } catch (error) {
        console.warn('Firebase Messaging not available:', error);
      }
    } else {
      console.log('Firebase Messaging not supported in this environment');
    }
  }

  // Check if Firebase Messaging is supported in current environment
  private static isFirebaseMessagingSupported(): boolean {
    if (Platform.OS !== 'web') return false;
    
    // Check for required browser APIs
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Real-time notifications listener
  static subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Notification));
      callback(notifications);
    });
  }

  static async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web' || !this.messaging) {
        console.log('Firebase Messaging not available on this platform');
        return false;
      }

      // Use the correct Notification API for web
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  static async getFCMToken(): Promise<string | null> {
    try {
      if (Platform.OS !== 'web' || !this.messaging) {
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY
      });
      
      console.log('FCM Token obtained:', token ? 'Yes' : 'No');
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  static async sendNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<string> {
    try {
      const notificationRef = doc(collection(db, 'notifications'));
      const notificationData = {
        ...notification,
        id: notificationRef.id,
        read: false,
        createdAt: new Date()
      };

      await setDoc(notificationRef, notificationData);
      
      // Only send push notification if Firebase Messaging is available
      if (this.messaging) {
        await this.sendPushNotification(notificationData);
      }

      return notificationRef.id;
    } catch (error: any) {
      throw new Error('Failed to send notification: ' + error.message);
    }
  }

  private static async sendPushNotification(notification: Notification): Promise<void> {
    try {
      console.log('Push notification would be sent:', notification);
      // Implement actual push notification sending logic here
      // This could be a Cloud Function call or direct FCM API call
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  static async getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Notification));
    } catch (error: any) {
      throw new Error('Failed to get notifications: ' + error.message);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Failed to mark notification as read: ' + error.message);
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId, 100);
      const updatePromises = notifications
        .filter(notification => !notification.read)
        .map(notification => this.markAsRead(notification.id));
      
      await Promise.all(updatePromises);
    } catch (error: any) {
      throw new Error('Failed to mark all notifications as read: ' + error.message);
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error: any) {
      throw new Error('Failed to get unread count: ' + error.message);
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error: any) {
      throw new Error('Failed to delete notification: ' + error.message);
    }
  }

  // Notification sending methods
  static async sendApplicationUpdate(
    userId: string, 
    internshipTitle: string, 
    newStatus: string,
    applicationId: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Application Update',
      body: `Your application for "${internshipTitle}" is now ${newStatus}`,
      type: NotificationType.APPLICATION_UPDATE,
      data: { applicationId, newStatus },
      actionUrl: `/applications/${applicationId}`
    });
  }

  static async sendNewInternshipNotification(
    userId: string,
    internshipTitle: string,
    organizationName: string,
    internshipId: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'New Internship Opportunity',
      body: `${organizationName} posted: ${internshipTitle}`,
      type: NotificationType.NEW_INTERNSHIP,
      data: { internshipId, organizationName },
      actionUrl: `/internships/${internshipId}`
    });
  }

  static async sendEligibilityResult(
    userId: string,
    internshipTitle: string,
    score: number,
    isEligible: boolean,
    eligibilityId: string
  ): Promise<void> {
    const status = isEligible ? 'eligible' : 'not eligible';
    
    await this.sendNotification({
      userId,
      title: 'Eligibility Results',
      body: `You are ${status} for "${internshipTitle}" (Score: ${score}%)`,
      type: NotificationType.ELIGIBILITY_RESULT,
      data: { eligibilityId, score, isEligible },
      actionUrl: `/eligibility/${eligibilityId}`
    });
  }

  static async sendProfileCompletionReminder(
    userId: string,
    completionPercentage: number,
    missingSections: string[]
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Complete Your Profile',
      body: `Your profile is ${completionPercentage}% complete. Add ${missingSections.join(', ')} to get better matches.`,
      type: NotificationType.PROFILE_COMPLETION,
      data: { completionPercentage, missingSections },
      actionUrl: '/profile/edit'
    });
  }

  static setupMessageListener(callback: (payload: any) => void): (() => void) | null {
    if (Platform.OS !== 'web' || !this.messaging) {
      console.log('Message listener not available on this platform');
      return null;
    }

    try {
      return onMessage(this.messaging, callback);
    } catch (error) {
      console.error('Failed to setup message listener:', error);
      return null;
    }
  }

  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const q = query(
        collection(db, 'notifications'),
        where('createdAt', '<', cutoffDate)
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      return querySnapshot.size;
    } catch (error: any) {
      throw new Error('Failed to cleanup notifications: ' + error.message);
    }
  }

  // Safe messaging getter for cross-platform compatibility
  static getMessagingSafe() {
    return this.messaging;
  }
}

// Initialize notification service
NotificationService.initialize();