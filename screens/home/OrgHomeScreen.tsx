import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenNames } from '../../constants/ScreenNames';
import { useAuth } from '../../hooks/useAuth';

interface OrgHomeScreenProps {
  navigation: any;
}

export const OrgHomeScreen: React.FC<OrgHomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  const quickActions = [
    {
      id: 1,
      title: 'Post Internship',
      description: 'Create new internship opportunity',
      icon: '➕',
      screen: 'AddInternship',
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Manage Postings',
      description: 'View and edit your internships',
      icon: '📋',
      screen: ScreenNames.INTERNSHIPS,
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'View Applicants',
      description: 'Review internship applications',
      icon: '👥',
      screen: 'ApplicantsList',
      color: '#8B5CF6',
    },
    {
      id: 4,
      title: 'Organization Profile',
      description: 'Update company information',
      icon: '🏢',
      screen: ScreenNames.PROFILE,
      color: '#F59E0B',
    },
  ];

  const recentApplicants = [
    { id: 1, name: 'John Doe', position: 'Frontend Intern', status: 'New' },
    { id: 2, name: 'Jane Smith', position: 'Backend Intern', status: 'Reviewed' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{user?.organizationName || 'Organization'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(ScreenNames.PROFILE)}>
           <Image 
  source={{ uri: 'https://via.placeholder.com/40x40/1E40AF/FFFFFF?text=O' }}
  style={styles.avatar}
/>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Active Postings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Total Applicants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>New Today</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
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

        {/* Recent Applicants */}
        <View style={styles.applicantsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applicants</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ApplicantsList')}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          
          {recentApplicants.map((applicant) => (
            <View key={applicant.id} style={styles.applicantCard}>
              <View style={styles.applicantInfo}>
                <Text style={styles.applicantName}>{applicant.name}</Text>
                <Text style={styles.applicantPosition}>{applicant.position}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                applicant.status === 'New' ? styles.statusNew : styles.statusReviewed
              ]}>
                <Text style={styles.statusText}>{applicant.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Analytics Preview */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.analyticsCard}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>45%</Text>
              <Text style={styles.metricLabel}>Application Rate</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>12</Text>
              <Text style={styles.metricLabel}>Hires This Month</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>4.2★</Text>
              <Text style={styles.metricLabel}>Candidate Rating</Text>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
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
  applicantsSection: {
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
  applicantCard: {
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
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  applicantPosition: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusNew: {
    backgroundColor: '#FEF3C7',
  },
  statusReviewed: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  analyticsSection: {
    marginBottom: 20,
  },
  analyticsCard: {
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
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default OrgHomeScreen;