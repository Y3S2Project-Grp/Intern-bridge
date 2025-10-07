import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
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
  id?: string;
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
  MESSAGE = 'message'
}

export class NotificationService {
  private static messaging: Messaging | null = null;

  // Initialize notifications
  static initialize() {
    if (Platform.OS === 'web') {
      this.messaging = getMessaging();
    }
  }

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web' || !this.messaging) {
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Get FCM token
  static async getFCMToken(): Promise<string | null> {
    try {
      if (Platform.OS !== 'web' || !this.messaging) {
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY
      });
      
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  // Create and send notification
  static async sendNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<string> {
    try {
      const notificationRef = doc(collection(db, 'notifications'));
      const notificationData: Notification = {
        ...notification,
        id: notificationRef.id,
        read: false,
        createdAt: new Date()
      };

      await setDoc(notificationRef, notificationData);

      // In a real app, you would also send push notification via FCM
      await this.sendPushNotification(notificationData);

      return notificationRef.id;
    } catch (error: any) {
      throw new Error('Failed to send notification: ' + error.message);
    }
  }

  // Send push notification (simplified - would integrate with FCM in production)
  private static async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // This would integrate with Firebase Cloud Messaging
      // For React Native, you might use @react-native-firebase/messaging
      console.log('Push notification would be sent:', notification);
      
      // Example FCM send code (for web):
      /*
      if (this.messaging) {
        // Get user's FCM token from Firestore and send message
        // This is a simplified implementation
      }
      */
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Notification);
    } catch (error: any) {
      throw new Error('Failed to get notifications: ' + error.message);
    }
  }

  // Mark notification as read
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

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId, 100);
      const updatePromises = notifications
        .filter(notification => !notification.read)
        .map(notification => this.markAsRead(notification.id!));
      
      await Promise.all(updatePromises);
    } catch (error: any) {
      throw new Error('Failed to mark all notifications as read: ' + error.message);
    }
  }

  // Get unread notification count
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

  // Send application status update notification
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

  // Send new internship notification
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

  // Send eligibility result notification
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

  // Send profile completion reminder
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

  // Set up message listener (for web)
  static setupMessageListener(callback: (payload: any) => void): (() => void) | null {
    if (Platform.OS !== 'web' || !this.messaging) {
      return null;
    }

    return onMessage(this.messaging, callback);
  }

  // Clean up old notifications (admin function)
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
}

// Initialize notification service
NotificationService.initialize();