import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
import { InternshipService } from '../../services/internshipService';
import { ProfileService } from '../../services/profileService';

interface Props {
  navigation: any;
}

const OrgProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [internshipStats, setInternshipStats] = useState({
    total: 0,
    active: 0,
    applications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
    try {
      if (user) {
        const userProfile = await ProfileService.getUserProfile(user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (user) {
        const internships = await InternshipService.getInternshipsByOrganization(user.id);
        const activeInternships = internships.filter(internship => internship.isActive);
        
        // This would need proper application counting in a real app
        const totalApplications = 0; // Placeholder

        setInternshipStats({
          total: internships.length,
          active: activeInternships.length,
          applications: totalApplications,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    await loadStats();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation.navigate(ScreenNames.EDIT_PROFILE, { profile });
  };

  const handleAddInternship = () => {
    navigation.navigate(ScreenNames.ADD_INTERNSHIP);
  };

  const handleViewInternships = () => {
    navigation.navigate(ScreenNames.INTERNSHIP_LIST);
  };

  const handleViewApplications = () => {
    navigation.navigate(ScreenNames.APPLICANTS_LIST);
  };

  const getVerificationStatus = () => {
    if (profile?.approved) {
      return { status: 'verified', label: 'Verified', color: Colors.success };
    } else if (profile?.rejectionReason) {
      return { status: 'rejected', label: 'Rejected', color: Colors.error };
    } else {
      return { status: 'pending', label: 'Pending Verification', color: Colors.warning };
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const verification = getVerificationStatus();

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="business" size={40} color={Colors.white} />
                </View>
              )}
            </View>
            
            <View style={styles.nameSection}>
              <Text style={styles.name}>{profile.name || 'Organization Name'}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <View style={[styles.verificationBadge, { backgroundColor: verification.color }]}>
                <Ionicons 
                  name={verification.status === 'verified' ? "checkmark-circle" : "time"} 
                  size={16} 
                  color={Colors.white} 
                />
                <Text style={styles.verificationText}>{verification.label}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={20} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Organization Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization Details</Text>
          
          {profile.description ? (
            <Text style={styles.descriptionText}>{profile.description}</Text>
          ) : (
            <TouchableOpacity style={styles.addItem} onPress={handleEditProfile}>
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.addItemText}>Add organization description</Text>
            </TouchableOpacity>
          )}

          <View style={styles.detailsGrid}>
            {profile.website && (
              <View style={styles.detailItem}>
                <Ionicons name="globe" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>{profile.website}</Text>
              </View>
            )}
            
            {profile.phone && (
              <View style={styles.detailItem}>
                <Ionicons name="call" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>{profile.phone}</Text>
              </View>
            )}
            
            {profile.location && (
              <View style={styles.detailItem}>
                <Ionicons name="location" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>{profile.location}</Text>
              </View>
            )}
            
            {profile.industry && (
              <View style={styles.detailItem}>
                <Ionicons name="business" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>{profile.industry}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{internshipStats.total}</Text>
            <Text style={styles.statLabel}>Total Internships</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{internshipStats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{internshipStats.applications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleAddInternship}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.lightPrimary }]}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Post Internship</Text>
              <Text style={styles.actionDescription}>Create new internship opportunity</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewInternships}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.lightSuccess }]}>
                <Ionicons name="list" size={24} color={Colors.success} />
              </View>
              <Text style={styles.actionTitle}>Manage Internships</Text>
              <Text style={styles.actionDescription}>View and edit your postings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewApplications}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.lightWarning }]}>
                <Ionicons name="people" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.actionTitle}>View Applications</Text>
              <Text style={styles.actionDescription}>Review candidate applications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleEditProfile}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.lightInfo }]}>
                <Ionicons name="settings" size={24} color={Colors.info} />
              </View>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionDescription}>Manage organization settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification Status Details */}
        {verification.status !== 'verified' && (
          <View style={styles.verificationSection}>
            <View style={styles.verificationHeader}>
              <Ionicons name="shield-checkmark" size={24} color={verification.color} />
              <Text style={styles.verificationSectionTitle}>Verification Status</Text>
            </View>
            
            {verification.status === 'pending' && (
              <Text style={styles.verificationMessage}>
                Your organization is pending verification. This process usually takes 1-2 business days. 
                You can still post internships, but they will be marked as unverified until approval.
              </Text>
            )}
            
            {verification.status === 'rejected' && profile.rejectionReason && (
              <View>
                <Text style={styles.verificationMessage}>
                  Your organization verification was rejected. Reason:
                </Text>
                <Text style={styles.rejectionReason}>{profile.rejectionReason}</Text>
                <TouchableOpacity style={styles.contactSupportButton}>
                  <Text style={styles.contactSupportText}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Recent Activity (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyActivity}>
            <Ionicons name="time" size={48} color={Colors.gray} />
            <Text style={styles.emptyActivityText}>No recent activity</Text>
          </View>
        </View>
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500',
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
    marginBottom: 16,
  },
  addItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
  },
  addItemText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 6,
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.lightBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 16,
  },
  verificationSection: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginLeft: 8,
  },
  verificationMessage: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
    marginBottom: 8,
  },
  rejectionReason: {
    fontSize: 14,
    color: Colors.error,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  contactSupportButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  contactSupportText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 32,
  },
  emptyActivityText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 16,
  },
  lightSuccess: {
    backgroundColor: '#d4edda',
  },
  lightWarning: {
    backgroundColor: '#fff3cd',
  },
  lightInfo: {
    backgroundColor: '#d1ecf1',
  },
});

export default OrgProfileScreen;