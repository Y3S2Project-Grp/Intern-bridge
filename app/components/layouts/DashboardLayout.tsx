import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { ScreenNames } from '../../constants/ScreenNames';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showFooter?: boolean;
  customHeader?: React.ReactNode;
}

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

  const getRoleSpecificMenu = () => {
    if (!user?.role) return [];

    const commonMenu = [
      { label: 'Profile', screen: ScreenNames.PROFILE, icon: '👤' },
      { label: 'Settings', screen: 'Settings', icon: '⚙️' },
    ];

    const roleMenus = {
      youth: [
        { label: 'Dashboard', screen: ScreenNames.YOUTH_HOME, icon: '🏠' },
        { label: 'Eligibility Check', screen: ScreenNames.ELIGIBILITY, icon: '✅' },
        { label: 'Internships', screen: ScreenNames.INTERNSHIPS, icon: '💼' },
        { label: 'My Applications', screen: ScreenNames.APPLICATIONS, icon: '📋' },
        { label: 'Career Tips', screen: 'CareerTips', icon: '💡' },
      ],
      organization: [
        { label: 'Dashboard', screen: ScreenNames.ORG_HOME, icon: '🏠' },
        { label: 'Post Internship', screen: 'AddInternship', icon: '➕' },
        { label: 'Manage Postings', screen: ScreenNames.INTERNSHIPS, icon: '📊' },
        { label: 'Applicants', screen: 'ApplicantsList', icon: '👥' },
        { label: 'Analytics', screen: 'Analytics', icon: '📈' },
      ],
      admin: [
        { label: 'Dashboard', screen: ScreenNames.ADMIN_HOME, icon: '🏠' },
        { label: 'User Management', screen: 'UserManagement', icon: '👥' },
        { label: 'Approvals', screen: 'AdminApproval', icon: '✅' },
        { label: 'Analytics', screen: 'Analytics', icon: '📊' },
        { label: 'System Settings', screen: 'SystemSettings', icon: '⚙️' },
      ],
    };

    return [...(roleMenus[user.role] || []), ...commonMenu];
  };

  const menuItems = getRoleSpecificMenu();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuPress = (screen: string) => {
    setSidebarOpen(false);
    navigation.navigate(screen as never);
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
    navigation.navigate(ScreenNames.LOGIN as never);
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
            onPress={() => navigation.navigate(ScreenNames.PROFILE as never)}
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
              <TouchableOpacity style={styles.footerButton} onPress={handleLogout}>
                <Text style={styles.footerButtonIcon}>🚪</Text>
                <Text style={styles.footerButtonText}>Logout</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: '#FFFFFF',
    zIndex: 1001,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E40AF',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
  },
  menuLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  footerButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#1E40AF',
    padding: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default DashboardLayout;