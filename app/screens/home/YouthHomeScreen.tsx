import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenNames } from '../../constants/ScreenNames';
import { useAuth } from '../../hooks/useAuth';

interface YouthHomeScreenProps {
  navigation: any;
}

export const YouthHomeScreen: React.FC<YouthHomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  const quickActions = [
    {
      id: 1,
      title: 'Check Eligibility',
      description: 'Find internships you qualify for',
      icon: '✅',
      screen: ScreenNames.ELIGIBILITY,
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Browse Internships',
      description: 'Explore available opportunities',
      icon: '🔍',
      screen: ScreenNames.INTERNSHIPS,
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'My Applications',
      description: 'Track your applications',
      icon: '📋',
      screen: ScreenNames.APPLICATIONS,
      color: '#8B5CF6',
    },
    {
      id: 4,
      title: 'Build CV',
      description: 'Create ATS-friendly resume',
      icon: '📄',
      screen: 'CVBuilder', // You'll need to add this to ScreenNames
      color: '#F59E0B',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Youth User'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(ScreenNames.PROFILE)}>
            <Image 
              source={require('../../assets/images/default-avatar.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Eligible</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Interviews</Text>
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

        {/* Recommended Internships */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity onPress={() => navigation.navigate(ScreenNames.INTERNSHIPS)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recommendationCard}>
            <Text style={styles.internshipTitle}>Frontend Developer Intern</Text>
            <Text style={styles.company}>Tech Solutions Inc.</Text>
            <Text style={styles.match}>95% match with your profile</Text>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Skill Development */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skill Development</Text>
          <View style={styles.skillCard}>
            <Text style={styles.skillTitle}>Complete your profile</Text>
            <Text style={styles.skillDescription}>Add your skills and education to get better matches</Text>
            <TouchableOpacity style={styles.skillButton}>
              <Text style={styles.skillButtonText}>Complete Now</Text>
            </TouchableOpacity>
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
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
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
  recommendedSection: {
    marginTop: 8,
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
  recommendationCard: {
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
  internshipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  company: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  match: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  skillsSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  skillCard: {
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
  skillTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  skillDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  skillButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  skillButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default YouthHomeScreen;