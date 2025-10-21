import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { ScreenNames } from '../../constants/ScreenNames';
import { useFirestore } from '../../hooks/useFirestore';
import { User } from '../../types/common';

interface EligibilityScreenProps {
  navigation: any;
}

interface Internship {
  id: string;
  title: string;
  company: string;
  requiredSkills: string[];
  minEducation: string;
  location: string;
  description: string;
  type?: 'remote' | 'hybrid' | 'on-site';
  duration?: string;
  stipend?: string;
  applicationDeadline?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export const EligibilityScreen: React.FC<EligibilityScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { data: userData, fetchAll: fetchUser, loading: userLoading } = useFirestore('users');
  const { data: internshipData, fetchAll: fetchInternships, loading: internshipLoading } = useFirestore('internships');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle user data updates
  useEffect(() => {
    if (userData.length > 0) {
      const currentUser = userData[0] as User;
      setUser(currentUser);
      setUserSkills(currentUser.skills || []);
    }
  }, [userData]);

  // Handle internship data updates
  useEffect(() => {
    if (internshipData.length > 0) {
      setInternships(internshipData as Internship[]);
    }
  }, [internshipData]);

  // Update loading state
  useEffect(() => {
    setLoading(userLoading || internshipLoading);
  }, [userLoading, internshipLoading]);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([fetchUser(), fetchInternships()]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  }, [fetchUser, fetchInternships]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  // Calculate eligibility percentage based on skill matching
  const calculateEligibility = useCallback((internship: Internship): number => {
    const requiredSkills = internship.requiredSkills || [];
    if (requiredSkills.length === 0) return 100;

    const matchingSkills = requiredSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    return Math.round((matchingSkills.length / requiredSkills.length) * 100);
  }, [userSkills]);

  // Get color based on eligibility percentage
  const getEligibilityColor = useCallback((percentage: number): string => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    if (percentage >= 40) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  }, []);

  // Get eligibility level text
  const getEligibilityLevel = useCallback((percentage: number): string => {
    if (percentage >= 80) return 'Highly Eligible';
    if (percentage >= 60) return 'Moderately Eligible';
    if (percentage >= 40) return 'Partially Eligible';
    return 'Low Eligibility';
  }, []);

  // Find missing skills for a specific internship
  const getMissingSkills = useCallback((internship: Internship): string[] => {
    return internship.requiredSkills?.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ) || [];
  }, [userSkills]);

  // Handle eligibility check with detailed analysis
  const handleCheckEligibility = useCallback((internship: Internship) => {
    const eligibilityScore = calculateEligibility(internship);
    const missingSkills = getMissingSkills(internship);
    const eligibilityLevel = getEligibilityLevel(eligibilityScore);

    Alert.alert(
      `Eligibility for ${internship.title}`,
      `Your eligibility score: ${eligibilityScore}%\nEligibility Level: ${eligibilityLevel}\n\n${
        missingSkills.length > 0 
          ? `Missing ${missingSkills.length} skill(s): ${missingSkills.join(', ')}`
          : '🎉 Excellent! You meet all required skills!'
      }`,
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'View Skill Gap Analysis', 
          onPress: () => navigation.navigate(ScreenNames.SKILL_GAP, { 
            internship,
            missingSkills,
            userSkills,
            eligibilityScore
          })
        },
        {
          text: 'Build CV',
          onPress: () => navigation.navigate(ScreenNames.CV_BUILDER)
        }
      ]
    );
  }, [calculateEligibility, getMissingSkills, getEligibilityLevel, navigation]);

  // Handle internship application
  const handleApply = useCallback((internship: Internship) => {
    const eligibilityScore = calculateEligibility(internship);
    
    if (eligibilityScore < 40) {
      Alert.alert(
        'Low Eligibility',
        `Your eligibility score is ${eligibilityScore}%. We recommend improving your skills before applying.\n\nWould you like to see skill improvement suggestions?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Suggestions', 
            onPress: () => navigation.navigate(ScreenNames.SKILL_GAP, { 
              internship,
              missingSkills: getMissingSkills(internship)
            })
          }
        ]
      );
    } else {
      navigation.navigate(ScreenNames.APPLICATIONS, { internship });
    }
  }, [calculateEligibility, getMissingSkills, navigation]);

  // Render internship type badge
  const renderTypeBadge = useCallback((type: string = 'on-site') => {
    const typeConfig = {
      'remote': { color: '#4CAF50', backgroundColor: '#E8F5E8' },
      'hybrid': { color: '#FF9800', backgroundColor: '#FFF3E0' },
      'on-site': { color: '#2196F3', backgroundColor: '#E3F2FD' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['on-site'];

    return (
      <View style={[styles.typeBadge, { backgroundColor: config.backgroundColor }]}>
        <Text style={[styles.typeText, { color: config.color }]}>
          {type.toUpperCase()}
        </Text>
      </View>
    );
  }, []);

  // Render experience level badge
  const renderExperienceBadge = useCallback((level: string = 'beginner') => {
    const levelConfig = {
      'beginner': { color: '#4CAF50', text: 'BEGINNER' },
      'intermediate': { color: '#FF9800', text: 'INTERMEDIATE' },
      'advanced': { color: '#F44336', text: 'ADVANCED' }
    };

    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner;

    return (
      <View style={[styles.experienceBadge, { borderColor: config.color }]}>
        <Text style={[styles.experienceText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading internships...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Internship Eligibility Checker</Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Welcome, {user.name} 👋</Text>
          <Text style={styles.skills}>
            Your skills: {userSkills.length > 0 ? userSkills.join(', ') : 'No skills added yet'}
          </Text>
          <Text style={styles.skillCount}>
            {userSkills.length} skill(s) registered
          </Text>
        </View>
      )}

      <View style={styles.internshipsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Internships</Text>
          <Text style={styles.internshipCount}>({internships.length} positions)</Text>
        </View>
        
        {internships.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No internships available at the moment</Text>
            <Text style={styles.emptyStateSubtext}>Check back later for new opportunities</Text>
          </View>
        ) : (
          internships.map((internship) => {
            const eligibilityScore = calculateEligibility(internship);
            const eligibilityLevel = getEligibilityLevel(eligibilityScore);
            
            return (
              <View key={internship.id} style={styles.internshipCard}>
                {/* Header with title and badges */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.internshipTitle}>{internship.title}</Text>
                    <Text style={styles.company}>{internship.company}</Text>
                  </View>
                  <View style={styles.badgesContainer}>
                    {renderTypeBadge(internship.type)}
                    {renderExperienceBadge(internship.experienceLevel)}
                  </View>
                </View>

                {/* Internship details */}
                <View style={styles.detailsRow}>
                  <Text style={styles.detailItem}>📍 {internship.location}</Text>
                  {internship.duration && (
                    <Text style={styles.detailItem}>⏱️ {internship.duration}</Text>
                  )}
                  {internship.stipend && (
                    <Text style={styles.detailItem}>💰 {internship.stipend}</Text>
                  )}
                </View>

                {/* Description */}
                <Text style={styles.description} numberOfLines={3}>
                  {internship.description}
                </Text>

                {/* Required skills */}
                {internship.requiredSkills && internship.requiredSkills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Text style={styles.skillsLabel}>Required Skills:</Text>
                    <View style={styles.skillsList}>
                      {internship.requiredSkills.slice(0, 4).map((skill, index) => {
                        const hasSkill = userSkills.some(userSkill => 
                          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                          skill.toLowerCase().includes(userSkill.toLowerCase())
                        );
                        
                        return (
                          <View 
                            key={index} 
                            style={[
                              styles.skillTag,
                              hasSkill ? styles.skillMatch : styles.skillMissing
                            ]}
                          >
                            <Text style={styles.skillTagText}>
                              {skill} {hasSkill ? '✓' : '✗'}
                            </Text>
                          </View>
                        );
                      })}
                      {internship.requiredSkills.length > 4 && (
                        <Text style={styles.moreSkillsText}>
                          +{internship.requiredSkills.length - 4} more
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Eligibility section */}
                <View style={styles.eligibilitySection}>
                  <View style={styles.eligibilityHeader}>
                    <Text style={styles.eligibilityLabel}>Eligibility Score</Text>
                    <Text style={[styles.eligibilityLevel, { color: getEligibilityColor(eligibilityScore) }]}>
                      {eligibilityLevel}
                    </Text>
                  </View>
                  
                  <View style={styles.scoreContainer}>
                    <View 
                      style={[
                        styles.scoreBar, 
                        { 
                          width: `${eligibilityScore}%`,
                          backgroundColor: getEligibilityColor(eligibilityScore)
                        }
                      ]} 
                    />
                    <Text style={styles.scoreText}>{eligibilityScore}%</Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => handleCheckEligibility(internship)}
                  >
                    <Text style={styles.checkButtonText}>Detailed Analysis</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      eligibilityScore < 40 && styles.applyButtonDisabled
                    ]}
                    onPress={() => handleApply(internship)}
                    disabled={eligibilityScore < 40}
                  >
                    <Text style={styles.applyButtonText}>
                      {eligibilityScore < 40 ? 'Improve Skills First' : 'Apply Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Call to action */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.cvButton}
          onPress={() => navigation.navigate(ScreenNames.CV_BUILDER)}
        >
          <Text style={styles.cvButtonText}>🚀 Build Your Professional CV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skillsButton}
          onPress={() => navigation.navigate(ScreenNames.SKILL_GAP, { userSkills })}
        >
          <Text style={styles.skillsButtonText}>🔧 Improve Your Skills</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  skills: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  skillCount: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  internshipsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  internshipCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  internshipCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  internshipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  company: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  badgesContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  experienceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  experienceText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillMatch: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  skillMissing: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreSkillsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  eligibilitySection: {
    marginBottom: 16,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eligibilityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  eligibilityLevel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreContainer: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 12,
    transition: 'width 0.3s ease-in-out',
  },
  scoreText: {
    position: 'absolute',
    right: 12,
    top: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  checkButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ctaSection: {
    gap: 12,
    marginBottom: 30,
  },
  cvButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cvButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillsButton: {
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  skillsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EligibilityScreen;