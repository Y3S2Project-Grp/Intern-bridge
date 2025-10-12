import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { ScreenNames } from '../../constants/ScreenNames';
import { useAuth } from '../../hooks/useAuth';
import { ApplicationAnalytics, ApplicationService } from '../../services/applicationService';
import { ProfileService } from '../../services/profileService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalInternships: number;
  totalApplications: number;
  pendingApprovals: number;
}

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalInternships: 0,
    totalApplications: 0,
    pendingApprovals: 0,
  });
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        pendingOrgs,
        applicationAnalytics,
        // In a real app, you would fetch these from your services
        totalUsers = 150,
        totalOrgs = 25,
        totalInternships = 80,
        totalApplications = 320,
      ] = await Promise.all([
        ProfileService.getPendingOrganizations(),
        ApplicationService.getApplicationAnalytics(),
        // Add other service calls here
      ]);

      setStats({
        totalUsers,
        totalOrganizations: totalOrgs,
        totalInternships,
        totalApplications,
        pendingApprovals: pendingOrgs.length,
      });

      setAnalytics(applicationAnalytics);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return Colors.success;
      case 'rejected': return Colors.error;
      case 'interview': return Colors.warning;
      case 'shortlisted': return Colors.info;
      case 'under_review': return Colors.primary;
      case 'pending': return Colors.gray;
      default: return Colors.gray;
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color={Colors.white} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.adminName}>{user?.name || 'Admin'}</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield" size={20} color={Colors.white} />
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="people"
          color={Colors.primary}
          onPress={() => navigation.navigate(ScreenNames.ANALYTICS)}
        />
        <StatCard
          title="Organizations"
          value={stats.totalOrganizations}
          icon="business"
          color={Colors.secondary}
          onPress={() => navigation.navigate(ScreenNames.ADMIN_APPROVAL)}
        />
        <StatCard
          title="Internships"
          value={stats.totalInternships}
          icon="briefcase"
          color={Colors.success}
          onPress={() => navigation.navigate(ScreenNames.INTERNSHIPS)}
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          icon="document-text"
          color={Colors.info}
          onPress={() => navigation.navigate(ScreenNames.ANALYTICS)}
        />
      </View>

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals > 0 && (
        <TouchableOpacity 
          style={styles.alertCard}
          onPress={() => navigation.navigate(ScreenNames.ADMIN_APPROVAL)}
        >
          <View style={styles.alertIcon}>
            <Ionicons name="warning" size={24} color={Colors.warning} />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Pending Approvals</Text>
            <Text style={styles.alertText}>
              {stats.pendingApprovals} organization{stats.pendingApprovals !== 1 ? 's' : ''} waiting for verification
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
        </TouchableOpacity>
      )}

      {/* Application Analytics */}
      {analytics && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Application Analytics</Text>
            <TouchableOpacity onPress={() => navigation.navigate(ScreenNames.ANALYTICS)}>
              <Text style={styles.seeAllText}>View Details</Text>
            </TouchableOpacity>
          </View>

          {/* Status Distribution */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Application Status</Text>
            <View style={styles.statusGrid}>
              {analytics.statusDistribution.map((item, index) => (
                <View key={index} style={styles.statusItem}>
                  <View style={styles.statusInfo}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(item.status) }
                      ]} 
                    />
                    <Text style={styles.statusLabel}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={styles.statusCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Popular Categories */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Popular Categories</Text>
            <View style={styles.categoriesList}>
              {analytics.popularCategories.slice(0, 5).map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <Text style={styles.categoryCount}>{category.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate(ScreenNames.ADMIN_APPROVAL)}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.lightWarning }]}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.actionTitle}>Approve Organizations</Text>
            <Text style={styles.actionDescription}>
              Review and verify organization registrations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate(ScreenNames.ANALYTICS)}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.lightInfo }]}>
              <Ionicons name="analytics" size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionTitle}>View Analytics</Text>
            <Text style={styles.actionDescription}>
              Detailed platform analytics and insights
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate(ScreenNames.INTERNSHIPS)}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.lightSuccess }]}>
              <Ionicons name="list" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionTitle}>Manage Internships</Text>
            <Text style={styles.actionDescription}>
              View and manage all internship postings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => Alert.alert('Coming Soon', 'User management feature coming soon')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.lightPrimary }]}>
              <Ionicons name="settings" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>System Settings</Text>
            <Text style={styles.actionDescription}>
              Platform configuration and settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity (Placeholder) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.emptyActivity}>
            <Ionicons name="time" size={48} color={Colors.gray} />
            <Text style={styles.emptyActivityText}>No recent activity</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 4,
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadgeText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    margin: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: Colors.gray,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  analyticsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.dark,
    textTransform: 'capitalize',
  },
  statusCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  categoriesList: {
    // Add styles for categories list
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.dark,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 16,
  },
  activityCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 32,
  },
  emptyActivityText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 16,
  },
});

export default AdminDashboardScreen;