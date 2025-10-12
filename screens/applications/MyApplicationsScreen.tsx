import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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
import { Application, ApplicationService, ApplicationStatus } from '../../services/applicationService';
import { InternshipService } from '../../services/internshipService';

interface Props {
  navigation: any;
}

interface ApplicationWithDetails extends Application {
  internship?: any;
  organization?: any;
}

const MyApplicationsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      if (user) {
        const userApplications = await ApplicationService.getUserApplications(user.id);
        
        // Enhance applications with internship and organization details
        const enhancedApplications = await Promise.all(
          userApplications.map(async (app) => {
            try {
              const internship = await InternshipService.getInternship(app.internshipId);
              return {
                ...app,
                internship,
                organization: internship ? { name: internship.organizationName } : null,
              };
            } catch (error) {
              console.error('Error loading internship details:', error);
              return { ...app, internship: null, organization: null };
            }
          })
        );

        setApplications(enhancedApplications);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApplicationService.withdrawApplication(applicationId);
              Alert.alert('Success', 'Application withdrawn successfully');
              await loadApplications();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to withdraw application');
            }
          },
        },
      ]
    );
  };

  const handleViewInternship = (internship: any) => {
    if (internship) {
      navigation.navigate(ScreenNames.INTERNSHIP_DETAILS, { internship });
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED:
        return Colors.success;
      case ApplicationStatus.REJECTED:
        return Colors.error;
      case ApplicationStatus.INTERVIEW:
        return Colors.warning;
      case ApplicationStatus.SHORTLISTED:
        return Colors.info;
      case ApplicationStatus.UNDER_REVIEW:
        return Colors.primary;
      case ApplicationStatus.PENDING:
        return Colors.gray;
      case ApplicationStatus.WITHDRAWN:
        return Colors.gray;
      default:
        return Colors.gray;
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED:
        return 'checkmark-circle';
      case ApplicationStatus.REJECTED:
        return 'close-circle';
      case ApplicationStatus.INTERVIEW:
        return 'calendar';
      case ApplicationStatus.SHORTLISTED:
        return 'star';
      case ApplicationStatus.UNDER_REVIEW:
        return 'time';
      case ApplicationStatus.PENDING:
        return 'time';
      case ApplicationStatus.WITHDRAWN:
        return 'arrow-undo';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const statusCounts = {
    all: applications.length,
    [ApplicationStatus.PENDING]: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
    [ApplicationStatus.UNDER_REVIEW]: applications.filter(app => app.status === ApplicationStatus.UNDER_REVIEW).length,
    [ApplicationStatus.SHORTLISTED]: applications.filter(app => app.status === ApplicationStatus.SHORTLISTED).length,
    [ApplicationStatus.INTERVIEW]: applications.filter(app => app.status === ApplicationStatus.INTERVIEW).length,
    [ApplicationStatus.ACCEPTED]: applications.filter(app => app.status === ApplicationStatus.ACCEPTED).length,
    [ApplicationStatus.REJECTED]: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
    [ApplicationStatus.WITHDRAWN]: applications.filter(app => app.status === ApplicationStatus.WITHDRAWN).length,
  };

  const statusFilters = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: ApplicationStatus.PENDING, label: 'Pending', count: statusCounts[ApplicationStatus.PENDING] },
    { key: ApplicationStatus.UNDER_REVIEW, label: 'Under Review', count: statusCounts[ApplicationStatus.UNDER_REVIEW] },
    { key: ApplicationStatus.SHORTLISTED, label: 'Shortlisted', count: statusCounts[ApplicationStatus.SHORTLISTED] },
    { key: ApplicationStatus.INTERVIEW, label: 'Interview', count: statusCounts[ApplicationStatus.INTERVIEW] },
    { key: ApplicationStatus.ACCEPTED, label: 'Accepted', count: statusCounts[ApplicationStatus.ACCEPTED] },
    { key: ApplicationStatus.REJECTED, label: 'Rejected', count: statusCounts[ApplicationStatus.REJECTED] },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusFilters.map((statusFilter) => (
          <TouchableOpacity
            key={statusFilter.key}
            style={[
              styles.filterButton,
              filter === statusFilter.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(statusFilter.key as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === statusFilter.key && styles.filterTextActive,
              ]}
            >
              {statusFilter.label}
            </Text>
            <View style={[
              styles.countBadge,
              filter === statusFilter.key && styles.countBadgeActive,
            ]}>
              <Text style={[
                styles.countText,
                filter === statusFilter.key && styles.countTextActive,
              ]}>
                {statusFilter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id!}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>
              {filter === 'all' ? 'No Applications' : `No ${filter} Applications`}
            </Text>
            <Text style={styles.emptyStateText}>
              {filter === 'all' 
                ? "You haven't applied to any internships yet."
                : `You don't have any ${filter.toLowerCase()} applications.`
              }
            </Text>
            {filter === 'all' && (
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate(ScreenNames.INTERNSHIPS)}
              >
                <Text style={styles.browseButtonText}>Browse Internships</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.applicationCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <TouchableOpacity 
                style={styles.internshipInfo}
                onPress={() => handleViewInternship(item.internship)}
                disabled={!item.internship}
              >
                <Text style={styles.internshipTitle}>
                  {item.internship?.title || 'Internship Not Found'}
                </Text>
                <Text style={styles.organizationName}>
                  {item.organization?.name || 'Unknown Organization'}
                </Text>
              </TouchableOpacity>
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Ionicons 
                  name={getStatusIcon(item.status) as any} 
                  size={16} 
                  color={Colors.white} 
                />
                <Text style={styles.statusText}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {/* Application Details */}
            <View style={styles.applicationDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={14} color={Colors.gray} />
                  <Text style={styles.detailText}>
                    Applied: {formatDate(item.appliedAt)}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={14} color={Colors.gray} />
                  <Text style={styles.detailText}>
                    Updated: {formatDate(item.updatedAt)}
                  </Text>
                </View>
              </View>

              {item.coverLetter && (
                <Text style={styles.coverLetterPreview} numberOfLines={2}>
                  {item.coverLetter}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
              {item.status === ApplicationStatus.PENDING && (
                <TouchableOpacity
                  style={styles.withdrawButton}
                  onPress={() => handleWithdrawApplication(item.id!)}
                >
                  <Ionicons name="close-circle" size={16} color={Colors.error} />
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => handleViewInternship(item.internship)}
                disabled={!item.internship}
              >
                <Ionicons name="eye" size={16} color={Colors.primary} />
                <Text style={styles.detailsButtonText}>View Internship</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
    marginRight: 6,
  },
  filterTextActive: {
    color: Colors.white,
  },
  countBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: Colors.primaryDark,
  },
  countText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
  },
  countTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  internshipInfo: {
    flex: 1,
    marginRight: 12,
  },
  internshipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  organizationName: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  applicationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  coverLetterPreview: {
    fontSize: 12,
    color: Colors.dark,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.lightError,
    marginRight: 8,
  },
  withdrawButtonText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
    marginLeft: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.lightPrimary,
  },
  detailsButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default MyApplicationsScreen;