import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { Application, ApplicationService, ApplicationStatus } from '../../services/applicationService';
import { ProfileService } from '../../services/profileService';

interface Props {
  navigation: any;
  route: any;
}

interface Applicant extends Application {
  user?: any;
  internship?: any;
}

const ApplicantsListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { internshipId } = route.params;
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [internship, setInternship] = useState<any>(null);

  useEffect(() => {
    loadApplicants();
  }, [internshipId, user]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      
      const [applicationsList, internshipDetails] = await Promise.all([
        ApplicationService.getInternshipApplications(internshipId),
        // This would be fetched from your internship service
        Promise.resolve({ id: internshipId, title: 'Internship Position' }), // Mock data
      ]);

      setInternship(internshipDetails);

      // Enhance applications with user details
      const enhancedApplicants = await Promise.all(
        applicationsList.map(async (app) => {
          try {
            const userProfile = await ProfileService.getUserProfile(app.userId);
            return {
              ...app,
              user: userProfile,
              internship: internshipDetails,
            };
          } catch (error) {
            console.error('Error loading user profile:', error);
            return { ...app, user: null, internship: internshipDetails };
          }
        })
      );

      setApplicants(enhancedApplicants);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applicants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplicants();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (applicantId: string, newStatus: ApplicationStatus, feedback?: string) => {
    try {
      setUpdatingStatus(true);
      await ApplicationService.updateApplicationStatus(applicantId, newStatus, feedback);
      
      Alert.alert('Success', `Application ${newStatus.replace('_', ' ').toLowerCase()}`);
      setShowActionModal(false);
      setSelectedApplicant(null);
      await loadApplicants();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update application status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApplicantPress = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowActionModal(true);
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED: return Colors.success;
      case ApplicationStatus.REJECTED: return Colors.error;
      case ApplicationStatus.INTERVIEW: return Colors.warning;
      case ApplicationStatus.SHORTLISTED: return Colors.info;
      case ApplicationStatus.UNDER_REVIEW: return Colors.primary;
      case ApplicationStatus.PENDING: return Colors.gray;
      default: return Colors.gray;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: applicants.length,
    [ApplicationStatus.PENDING]: applicants.filter(app => app.status === ApplicationStatus.PENDING).length,
    [ApplicationStatus.UNDER_REVIEW]: applicants.filter(app => app.status === ApplicationStatus.UNDER_REVIEW).length,
    [ApplicationStatus.SHORTLISTED]: applicants.filter(app => app.status === ApplicationStatus.SHORTLISTED).length,
    [ApplicationStatus.INTERVIEW]: applicants.filter(app => app.status === ApplicationStatus.INTERVIEW).length,
    [ApplicationStatus.ACCEPTED]: applicants.filter(app => app.status === ApplicationStatus.ACCEPTED).length,
    [ApplicationStatus.REJECTED]: applicants.filter(app => app.status === ApplicationStatus.REJECTED).length,
  };

  const statusFilters = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: ApplicationStatus.PENDING, label: 'Pending', count: statusCounts[ApplicationStatus.PENDING] },
    { key: ApplicationStatus.UNDER_REVIEW, label: 'Review', count: statusCounts[ApplicationStatus.UNDER_REVIEW] },
    { key: ApplicationStatus.SHORTLISTED, label: 'Shortlisted', count: statusCounts[ApplicationStatus.SHORTLISTED] },
    { key: ApplicationStatus.INTERVIEW, label: 'Interview', count: statusCounts[ApplicationStatus.INTERVIEW] },
    { key: ApplicationStatus.ACCEPTED, label: 'Accepted', count: statusCounts[ApplicationStatus.ACCEPTED] },
    { key: ApplicationStatus.REJECTED, label: 'Rejected', count: statusCounts[ApplicationStatus.REJECTED] },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading applicants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Applicants</Text>
        <Text style={styles.subtitle}>{internship?.title}</Text>
        <Text style={styles.applicantCount}>
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search applicants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              statusFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(filter.key as any)}
          >
            <Text style={[
              styles.filterText,
              statusFilter === filter.key && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterCount,
              statusFilter === filter.key && styles.filterCountActive,
            ]}>
              <Text style={[
                styles.filterCountText,
                statusFilter === filter.key && styles.filterCountTextActive,
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Applicants List */}
      <FlatList
        data={filteredApplicants}
        keyExtractor={(item) => item.id!}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>No Applicants</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || statusFilter !== 'all' 
                ? 'No applicants match your current filters'
                : 'No one has applied to this internship yet'
              }
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.applicantCard}
            onPress={() => handleApplicantPress(item)}
          >
            <View style={styles.applicantHeader}>
              <View style={styles.applicantInfo}>
                <Text style={styles.applicantName}>
                  {item.user?.name || 'Unknown User'}
                </Text>
                <Text style={styles.applicantEmail}>
                  {item.user?.email || 'No email'}
                </Text>
                {item.user?.location && (
                  <Text style={styles.applicantLocation}>
                    <Ionicons name="location" size={12} color={Colors.gray} />
                    {item.user.location}
                  </Text>
                )}
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.applicantDetails}>
              <Text style={styles.applyDate}>
                Applied: {formatDate(item.appliedAt)}
              </Text>
              
              {item.user?.skills && item.user.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  {item.user.skills.slice(0, 3).map((skill: string, index: number) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {item.user.skills.length > 3 && (
                    <Text style={styles.moreSkills}>
                      +{item.user.skills.length - 3} more
                    </Text>
                  )}
                </View>
              )}
            </View>

            {item.coverLetter && (
              <Text style={styles.coverLetterPreview} numberOfLines={2}>
                "{item.coverLetter}"
              </Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Application</Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            {selectedApplicant && (
              <>
                <Text style={styles.modalApplicantName}>
                  {selectedApplicant.user?.name}
                </Text>
                <Text style={styles.modalApplicantEmail}>
                  {selectedApplicant.user?.email}
                </Text>
                <Text style={styles.modalCurrentStatus}>
                  Current Status: {selectedApplicant.status.replace('_', ' ')}
                </Text>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.shortlistButton]}
                    onPress={() => handleUpdateStatus(selectedApplicant.id!, ApplicationStatus.SHORTLISTED)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Ionicons name="star" size={16} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Shortlist</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.interviewButton]}
                    onPress={() => handleUpdateStatus(selectedApplicant.id!, ApplicationStatus.INTERVIEW)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Ionicons name="calendar" size={16} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Interview</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleUpdateStatus(selectedApplicant.id!, ApplicationStatus.ACCEPTED)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleUpdateStatus(selectedApplicant.id!, ApplicationStatus.REJECTED)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Ionicons name="close" size={16} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 16,
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
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  applicantCount: {
    fontSize: 14,
    color: Colors.gray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.dark,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '500',
    marginRight: 4,
  },
  filterTextActive: {
    color: Colors.white,
  },
  filterCount: {
    backgroundColor: Colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountActive: {
    backgroundColor: Colors.primaryDark,
  },
  filterCountText: {
    fontSize: 10,
    color: Colors.dark,
    fontWeight: '600',
  },
  filterCountTextActive: {
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
  },
  applicantCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicantInfo: {
    flex: 1,
    marginRight: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 2,
  },
  applicantEmail: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  applicantLocation: {
    fontSize: 12,
    color: Colors.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  applicantDetails: {
    marginBottom: 8,
  },
  applyDate: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 10,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  coverLetterPreview: {
    fontSize: 12,
    color: Colors.dark,
    lineHeight: 16,
    fontStyle: 'italic',
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
    paddingLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  modalApplicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  modalApplicantEmail: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
  },
  modalCurrentStatus: {
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 20,
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
  },
  actionButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  shortlistButton: {
    backgroundColor: Colors.info,
  },
  interviewButton: {
    backgroundColor: Colors.warning,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
});

export default ApplicantsListScreen;