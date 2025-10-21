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
import { useAuth } from '../../hooks/useAuth';
import { ApplicationAnalytics, ApplicationService } from '../../services/applicationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalInternships: number;
  totalApplications: number;
  approvalRate: number;
  avgApplicationTime: string;
}

const AnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalInternships: 0,
    totalApplications: 0,
    approvalRate: 0,
    avgApplicationTime: '0 days',
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [applicationAnalytics, platformData] = await Promise.all([
        ApplicationService.getApplicationAnalytics(),
        // Mock platform stats - in real app, these would come from your services
        Promise.resolve({
          totalUsers: 1247,
          totalOrganizations: 89,
          totalInternships: 342,
          totalApplications: 1567,
          approvalRate: 68.5,
          avgApplicationTime: '3.2 days',
        }),
      ]);

      setAnalytics(applicationAnalytics);
      setPlatformStats(platformData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, trend, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={trend > 0 ? "trending-up" : "trending-down"} 
            size={16} 
            color={trend > 0 ? Colors.success : Colors.error} 
          />
          <Text style={[
            styles.trendText,
            { color: trend > 0 ? Colors.success : Colors.error }
          ]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
  );

  const TimeRangeButton = ({ range, label }: any) => (
    <TouchableOpacity
      style={[
        styles.timeRangeButton,
        timeRange === range && styles.timeRangeButtonActive,
      ]}
      onPress={() => setTimeRange(range)}
    >
      <Text style={[
        styles.timeRangeText,
        timeRange === range && styles.timeRangeTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Platform Analytics</Text>
          <Text style={styles.subtitle}>
            Insights and metrics for {timeRange === 'week' ? 'the last week' : 
            timeRange === 'month' ? 'the last month' :
            timeRange === 'quarter' ? 'the last quarter' : 'the last year'}
          </Text>
        </View>
      </View>

      {/* Time Range Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.timeRangeContainer}
      >
        <TimeRangeButton range="week" label="1W" />
        <TimeRangeButton range="month" label="1M" />
        <TimeRangeButton range="quarter" label="3M" />
        <TimeRangeButton range="year" label="1Y" />
      </ScrollView>

      {/* Platform Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={platformStats.totalUsers.toLocaleString()}
            trend={12.5}
            color={Colors.primary}
          />
          <StatCard
            title="Organizations"
            value={platformStats.totalOrganizations}
            trend={8.2}
            color={Colors.secondary}
          />
          <StatCard
            title="Internships"
            value={platformStats.totalInternships}
            trend={15.7}
            color={Colors.success}
          />
          <StatCard
            title="Applications"
            value={platformStats.totalApplications.toLocaleString()}
            trend={22.3}
            color={Colors.info}
          />
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.metricValue}>{platformStats.approvalRate}%</Text>
            </View>
            <Text style={styles.metricTitle}>Approval Rate</Text>
            <Text style={styles.metricDescription}>
              Successful applications vs total
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="time" size={24} color={Colors.warning} />
              <Text style={styles.metricValue}>{platformStats.avgApplicationTime}</Text>
            </View>
            <Text style={styles.metricTitle}>Avg. Response Time</Text>
            <Text style={styles.metricDescription}>
              Average time to review applications
            </Text>
          </View>
        </View>
      </View>

      {/* Application Analytics */}
      {analytics && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Application Analytics</Text>
          </View>

          {/* Status Distribution */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Application Status Distribution</Text>
            <View style={styles.statusList}>
              {analytics.statusDistribution.map((item, index) => (
                <View key={index} style={styles.statusItem}>
                  <View style={styles.statusInfo}>
                    <View style={styles.statusBarContainer}>
                      <Text style={styles.statusLabel}>
                        {item.status.replace('_', ' ')}
                      </Text>
                      <Text style={styles.statusCount}>{item.count}</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${(item.count / analytics.totalApplications) * 100}%`,
                            backgroundColor: getStatusColor(item.status)
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Monthly Trends */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Application Trends</Text>
            <View style={styles.trendsList}>
              {analytics.monthlyTrends.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendMonth}>{trend.month}</Text>
                  <View style={styles.trendBarContainer}>
                    <View 
                      style={[
                        styles.trendBar,
                        { height: Math.max(20, (trend.count / Math.max(...analytics.monthlyTrends.map(t => t.count))) * 100) }
                      ]}
                    />
                  </View>
                  <Text style={styles.trendCount}>{trend.count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Popular Categories */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Popular Categories</Text>
            <View style={styles.categoriesList}>
              {analytics.popularCategories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categoryPercentage}>
                      {Math.round((category.count / platformStats.totalInternships) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View 
                      style={[
                        styles.categoryProgressFill,
                        { 
                          width: `${(category.count / platformStats.totalInternships) * 100}%`,
                          backgroundColor: getCategoryColor(index)
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Insights & Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
        <View style={styles.insightsCard}>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color={Colors.success} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Growth Opportunity</Text>
              <Text style={styles.insightText}>
                Applications increased by 22% this month. Consider adding more tech internships.
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="warning" size={20} color={Colors.warning} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Response Time</Text>
              <Text style={styles.insightText}>
                Average response time is 3.2 days. Target improvement to under 2 days.
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="people" size={20} color={Colors.info} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>User Engagement</Text>
              <Text style={styles.insightText}>
                68% approval rate indicates good matching between candidates and opportunities.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Helper functions
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

const getCategoryColor = (index: number) => {
  const colors = [Colors.primary, Colors.secondary, Colors.success, Colors.warning, Colors.info];
  return colors[index % colors.length];
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  timeRangeContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: Colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.gray,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 12,
    color: Colors.gray,
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
  statusList: {
    // Add styles for status list
  },
  statusItem: {
    marginBottom: 12,
  },
  statusInfo: {
    // Add styles for status info
  },
  statusBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.dark,
    textTransform: 'capitalize',
    flex: 1,
  },
  statusCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  trendsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendMonth: {
    fontSize: 10,
    color: Colors.gray,
    marginBottom: 8,
  },
  trendBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: 20,
  },
  trendBar: {
    backgroundColor: Colors.primary,
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  trendCount: {
    fontSize: 10,
    color: Colors.dark,
    marginTop: 4,
    fontWeight: '600',
  },
  categoriesList: {
    // Add styles for categories list
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.dark,
    flex: 1,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
  },
  categoryProgress: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsCard: {
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
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 16,
  },
});

export default AnalyticsScreen;