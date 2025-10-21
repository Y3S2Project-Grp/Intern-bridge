// components/DashboardLayout.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { ScreenNames } from '../../../constants/ScreenNames';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showFooter?: boolean;
  customHeader?: React.ReactNode;
}

const Colors = {
  primary: '#1E40AF',
  lightPrimary: '#DBEAFE',
  background: '#F3F4F6',
  white: '#FFFFFF',
  dark: '#1F2937',
  gray: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  lightError: '#FEE2E2',
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  showFooter = true,
  customHeader,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getRoleSpecificMenu = () => {
    if (!user?.role) return [];

    const commonMenu = [
      { label: 'Profile', screen: ScreenNames.PROFILE, icon: '👤' },
      { label: 'Settings', screen: ScreenNames.SETTINGS, icon: '⚙️' },
    ];

    const roleMenus = {
      student: [
        { label: 'Dashboard', screen: ScreenNames.YOUTH_HOME, icon: '🏠' },
        { label: 'Check Eligibility', screen: ScreenNames.ELIGIBILITY, icon: '✅' },
        { label: 'Browse Internships', screen: ScreenNames.INTERNSHIPS, icon: '💼' },
        { label: 'My Applications', screen: ScreenNames.APPLICATIONS, icon: '📋' },
        { label: 'Build CV', screen: ScreenNames.CV_BUILDER, icon: '📝' },
        { label: 'Build Portfolio', screen: ScreenNames.PORTFOLIO, icon: '🎨' },
        { label: 'Career Tips', screen: ScreenNames.CAREER_TIPS, icon: '💡' },
      ],
      employer: [
        { label: 'Dashboard', screen: ScreenNames.ORG_HOME, icon: '🏠' },
        { label: 'Post Internship', screen: ScreenNames.ADD_INTERNSHIP, icon: '➕' },
        { label: 'Manage Postings', screen: ScreenNames.MANAGE_POSTINGS, icon: '📊' },
        { label: 'Applicants', screen: ScreenNames.APPLICANTS_LIST, icon: '👥' },
        { label: 'Analytics', screen: ScreenNames.ANALYTICS, icon: '📈' },
      ],
      admin: [
        { label: 'Dashboard', screen: ScreenNames.ADMIN_HOME, icon: '🏠' },
        { label: 'User Management', screen: ScreenNames.USER_MANAGEMENT, icon: '👥' },
        { label: 'Approvals', screen: ScreenNames.ADMIN_APPROVAL, icon: '✅' },
        { label: 'Analytics', screen: ScreenNames.ANALYTICS, icon: '📊' },
        { label: 'System Settings', screen: ScreenNames.SYSTEM_SETTINGS, icon: '⚙️' },
      ],
    };

    return [...(roleMenus[user.role as keyof typeof roleMenus] || []), ...commonMenu];
  };

  const menuItems = getRoleSpecificMenu();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuPress = (screen: string) => {
    setSidebarOpen(false);
    // Use type assertion for navigation
    (navigation as any).navigate(screen);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setSidebarOpen(false);
      await logout();
      (navigation as any).navigate(ScreenNames.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E40AF" barStyle="light-content" />
      
      {/* Header */}
      {customHeader || (
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{title || 'InternBridge'}</Text>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => (navigation as any).navigate(ScreenNames.PROFILE)}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebar}>
            {/* Sidebar Header */}
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>InternBridge</Text>
              <TouchableOpacity onPress={toggleSidebar}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Text>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    route.name === item.screen && styles.menuItemActive,
                  ]}
                  onPress={() => handleMenuPress(item.screen)}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity 
                style={styles.footerButton} 
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <>
                    <Text style={styles.footerButtonIcon}>🚪</Text>
                    <Text style={styles.footerButtonText}>Logout</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            InternBridge - Bridging rural youth to opportunities
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    fontSize: 20,
    color: Colors.white,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 300,
    backgroundColor: Colors.white,
    zIndex: 1001,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  userInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemActive: {
    backgroundColor: Colors.lightPrimary,
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.dark,
    marginLeft: 12,
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.lightError,
    borderRadius: 8,
  },
  footerButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  footerButtonText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: Colors.dark,
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
  },
});

export default DashboardLayout;