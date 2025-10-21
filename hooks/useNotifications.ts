// app/hooks/useNotifications.ts
import { useCallback, useEffect, useState } from 'react';
import { Notification, NotificationService, NotificationType } from '../services/notificationService';
import { useAuth } from './useAuth';

interface UseNotificationsResult {
  // State
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Methods
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsResult => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [notifs, count] = await Promise.all([
        NotificationService.getUserNotifications(user.id),
        NotificationService.getUnreadCount(user.id)
      ]);
      
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
      console.error('Notifications load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      setError(null);
      await NotificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      throw err;
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      await NotificationService.markAllAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      throw err;
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      setError(null);
      await NotificationService.deleteNotification(notificationId);
      
      // Update local state
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
      throw err;
    }
  }, [user, notifications]);

  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load notifications on mount and when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up real-time updates using Firebase listener
  useEffect(() => {
    if (!user) return;

    const unsubscribe = NotificationService.subscribeToUserNotifications(
      user.id,
      (realTimeNotifications) => {
        setNotifications(realTimeNotifications);
        setUnreadCount(realTimeNotifications.filter(n => !n.read).length);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    
    // Methods
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    clearError,
  };
};

// Specialized hook for notification actions
export const useNotificationActions = () => {
  const sendApplicationUpdate = useCallback(async (
    userId: string,
    internshipTitle: string,
    newStatus: string,
    applicationId: string
  ) => {
    try {
      await NotificationService.sendApplicationUpdate(
        userId,
        internshipTitle,
        newStatus,
        applicationId
      );
    } catch (error) {
      console.error('Failed to send application update notification:', error);
      throw error;
    }
  }, []);

  const sendNewInternshipNotification = useCallback(async (
    userId: string,
    internshipTitle: string,
    organizationName: string,
    internshipId: string
  ) => {
    try {
      await NotificationService.sendNewInternshipNotification(
        userId,
        internshipTitle,
        organizationName,
        internshipId
      );
    } catch (error) {
      console.error('Failed to send new internship notification:', error);
      throw error;
    }
  }, []);

  const sendEligibilityResult = useCallback(async (
    userId: string,
    internshipTitle: string,
    score: number,
    isEligible: boolean,
    eligibilityId: string
  ) => {
    try {
      await NotificationService.sendEligibilityResult(
        userId,
        internshipTitle,
        score,
        isEligible,
        eligibilityId
      );
    } catch (error) {
      console.error('Failed to send eligibility result notification:', error);
      throw error;
    }
  }, []);

  const sendProfileCompletionReminder = useCallback(async (
    userId: string,
    completionPercentage: number,
    missingSections: string[]
  ) => {
    try {
      await NotificationService.sendProfileCompletionReminder(
        userId,
        completionPercentage,
        missingSections
      );
    } catch (error) {
      console.error('Failed to send profile completion reminder:', error);
      throw error;
    }
  }, []);

  return {
    sendApplicationUpdate,
    sendNewInternshipNotification,
    sendEligibilityResult,
    sendProfileCompletionReminder,
  };
};

export default useNotifications;