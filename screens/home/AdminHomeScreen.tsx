import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenNames } from '../../constants/ScreenNames';
import { useAuth } from '../../hooks/useAuth';

interface AdminHomeScreenProps {
  navigation: any;
}

export const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  const adminActions = [
    {
      id: 1,
      title: 'User Management',
      description: 'Manage all users and roles',
      icon: '👥',
      screen: 'UserManagement',
      color: '#3B82F6',
    },
    {
      id: 2,
      title: 'Organization Approvals',
      description: 'Review pending organization registrations',
      icon: '✅',
      screen: 'AdminApproval',
      color: '#10B981',
    },
    {
      id: 3,
      title: 'System Analytics',
      description: 'View platform performance metrics',
      icon: '📊',
      screen: 'Analytics',
      color: '#8B5CF6',
    },
    {
      id: 4,
      title: 'Content Moderation',
      description: 'Monitor internships and applications',
      icon: '🛡️',
      screen: 'ContentModeration',
      color: '#F59E0B',
    },
  ];

  const pendingApprovals = [
    { id: 1, name: 'Tech Innovations Ltd', type: 'Organization', days: 2 },
    { id: 2, name: 'StartUp Solutions', type: 'Organization', days: 1 },
  ];

  const systemStats = {
    totalUsers: 1250,
    totalOrganizations: 45,
    pendingApprovals: 8,
    activeInternships: 120,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.userName}>Welcome, {user?.name || 'Admin'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(ScreenNames.PROFILE)}>
            <Image 
              source={require('../../assets/images/default-avatar.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* System Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{systemStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{systemStats.totalOrganizations}</Text>
              <Text style={styles.statLabel}>Organizations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{systemStats.pendingApprovals}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{systemStats.activeInternships}</Text>
              <Text style={styles.statLabel}>Internships</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Admin Actions</Text>
        <View style={styles.actionsGrid}>
          {adminActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Text style={styles.iconText}>{action.icon}</Text>
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending Approvals */}
        <View style={styles.pendingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Approvals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminApproval')}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          
          {pendingApprovals.map((item) => (
            <View key={item.id} style={styles.approvalCard}>
              <View style={styles.approvalInfo}>
                <Text style={styles.approvalName}>{item.name}</Text>
                <Text style={styles.approvalType}>{item.type}</Text>
              </View>
              <View style={styles.approvalMeta}>
                <Text style={styles.daysText}>{item.days}d ago</Text>
                <TouchableOpacity style={styles.reviewButton}>
                  <Text style={styles.reviewButtonText}>Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text>👤</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New user registration</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text>🏢</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Organization profile updated</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text>📝</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New internship posted</Text>
                <Text style={styles.activityTime}>6 hours ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Health */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthMetric}>
              <Text style={styles.healthValue}>99.8%</Text>
              <Text style={styles.healthLabel}>Uptime</Text>
            </View>
            <View style={styles.healthMetric}>
              <Text style={styles.healthValue}>1.2s</Text>
              <Text style={styles.healthLabel}>Avg. Response</Text>
            </View>
            <View style={styles.healthMetric}>
              <Text style={styles.healthValue}>256</Text>
              <Text style={styles.healthLabel}>Active Sessions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  overviewCard: {
    backgroundColor: '#1E40AF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  pendingSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  approvalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  approvalType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  approvalMeta: {
    alignItems: 'flex-end',
  },
  daysText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  reviewButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  healthSection: {
    marginBottom: 20,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthMetric: {
    alignItems: 'center',
    flex: 1,
  },
  healthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  healthLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default AdminHomeScreen;