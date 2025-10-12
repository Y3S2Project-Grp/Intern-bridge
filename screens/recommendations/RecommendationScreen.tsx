import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { AIService } from '../../services/aiService';
import { Internship } from '../../services/internshipService';

interface Recommendation {
  id: string;
  internship: Internship;
  matchScore: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  navigation: any;
}

const RecommendationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<{
    recommendedSkills: string[];
    learningPaths: string[];
    jobSuggestions: string[];
  } | null>(null);

  useEffect(() => {
    loadRecommendations();
    loadAIRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // Simulate fetching recommendations based on user profile
      const mockRecommendations = await generateMockRecommendations();
      setRecommendations(mockRecommendations);
    } catch (error) {
      Alert.alert('Error', 'Failed to load recommendations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    try {
      if (!user) return;

      const userSkills = user.skills || [];
      const userInterests = ['Technology', 'Software Development']; // Default interests

      const aiRecs = await AIService.generateCareerRecommendations(
        userSkills,
        userInterests
      );
      setAiRecommendations(aiRecs);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    }
  };

  const generateMockRecommendations = async (): Promise<Recommendation[]> => {
    // In a real app, this would come from your backend
    return [
      {
        id: '1',
        internship: {
          id: '1',
          title: 'Frontend Developer Intern',
          organizationName: 'TechCorp',
          description: 'Work on cutting-edge web applications using React and TypeScript.',
          requirements: ['React', 'JavaScript', 'HTML/CSS'],
          skills: ['React', 'TypeScript', 'CSS'],
          location: 'Remote',
          type: 'remote',
          duration: '3 months',
          stipend: 2000,
          applicationDeadline: new Date('2024-08-30'),
          startDate: new Date('2024-09-01'),
          category: 'Software Development',
          isActive: true,
          organizationId: 'org1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        matchScore: 95,
        reasons: ['Matches your React skills', 'Remote work opportunity', 'Good stipend'],
        priority: 'high',
      },
      {
        id: '2',
        internship: {
          id: '2',
          title: 'Mobile App Developer',
          organizationName: 'AppWorks',
          description: 'Develop cross-platform mobile applications using React Native.',
          requirements: ['React Native', 'JavaScript', 'Mobile Development'],
          skills: ['React Native', 'JavaScript', 'Redux'],
          location: 'Colombo',
          type: 'hybrid',
          duration: '6 months',
          stipend: 1500,
          applicationDeadline: new Date('2024-09-15'),
          startDate: new Date('2024-10-01'),
          category: 'Mobile Development',
          isActive: true,
          organizationId: 'org2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        matchScore: 85,
        reasons: ['Uses React Native', 'Hybrid work model', 'Longer duration for learning'],
        priority: 'medium',
      },
      {
        id: '3',
        internship: {
          id: '3',
          title: 'UI/UX Design Intern',
          organizationName: 'DesignStudio',
          description: 'Create beautiful user interfaces and improve user experience.',
          requirements: ['Figma', 'UI Design', 'User Research'],
          skills: ['Figma', 'Adobe XD', 'Prototyping'],
          location: 'Kandy',
          type: 'full-time',
          duration: '4 months',
          stipend: 1200,
          applicationDeadline: new Date('2024-08-20'),
          startDate: new Date('2024-09-01'),
          category: 'UI/UX Design',
          isActive: true,
          organizationId: 'org3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        matchScore: 60,
        reasons: ['Design skills development', 'Creative environment', 'Good for portfolio'],
        priority: 'low',
      },
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    await loadAIRecommendations();
    setRefreshing(false);
  };

  const handleInternshipPress = (internship: Internship) => {
    navigation.navigate(ScreenNames.INTERNSHIP_DETAILS, { internship });
  };

  const handleCheckEligibility = async (internship: Internship) => {
    try {
      if (!user) return;

      // Navigate to eligibility screen with internship data
      navigation.navigate(ScreenNames.ELIGIBILITY, { 
        internship,
        userProfile: user 
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to check eligibility');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      case 'low': return Colors.success;
      default: return Colors.gray;
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Finding the best internships for you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* AI Career Recommendations */}
        {aiRecommendations && (
          <View style={styles.aiSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>AI Career Insights</Text>
            </View>
            
            <View style={styles.aiCard}>
              <Text style={styles.aiCardTitle}>Recommended Skills to Learn</Text>
              <View style={styles.skillsContainer}>
                {aiRecommendations.recommendedSkills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.aiCardTitle}>Suggested Learning Paths</Text>
              {aiRecommendations.learningPaths.map((path, index) => (
                <View key={index} style={styles.learningPath}>
                  <Ionicons name="book" size={16} color={Colors.primary} />
                  <Text style={styles.learningPathText}>{path}</Text>
                </View>
              ))}

              <Text style={styles.aiCardTitle}>Potential Job Roles</Text>
              {aiRecommendations.jobSuggestions.map((job, index) => (
                <View key={index} style={styles.jobSuggestion}>
                  <Ionicons name="briefcase" size={16} color={Colors.secondary} />
                  <Text style={styles.jobSuggestionText}>{job}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Personalized Internship Recommendations */}
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Personalized For You</Text>
          </View>

          {recommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={Colors.gray} />
              <Text style={styles.emptyStateText}>
                No recommendations found. Update your profile to get better matches.
              </Text>
            </View>
          ) : (
            recommendations.map((rec) => (
              <View key={rec.id} style={styles.recommendationCard}>
                {/* Header with match score and priority */}
                <View style={styles.cardHeader}>
                  <View style={styles.matchScore}>
                    <Text style={[styles.matchScoreText, { color: getMatchColor(rec.matchScore) }]}>
                      {rec.matchScore}% Match
                    </Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(rec.priority) }]}>
                    <Text style={styles.priorityText}>
                      {rec.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Internship details */}
                <TouchableOpacity 
                  style={styles.internshipInfo}
                  onPress={() => handleInternshipPress(rec.internship)}
                >
                  <Text style={styles.internshipTitle}>{rec.internship.title}</Text>
                  <Text style={styles.organization}>{rec.internship.organizationName}</Text>
                  
                  <View style={styles.internshipMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location" size={14} color={Colors.gray} />
                      <Text style={styles.metaText}>{rec.internship.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={14} color={Colors.gray} />
                      <Text style={styles.metaText}>{rec.internship.duration}</Text>
                    </View>
                    {rec.internship.stipend && (
                      <View style={styles.metaItem}>
                        <Ionicons name="cash" size={14} color={Colors.gray} />
                        <Text style={styles.metaText}>${rec.internship.stipend}/mo</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {rec.internship.description}
                  </Text>
                </TouchableOpacity>

                {/* Match reasons */}
                <View style={styles.reasonsSection}>
                  <Text style={styles.reasonsTitle}>Why this matches you:</Text>
                  {rec.reasons.map((reason, index) => (
                    <View key={index} style={styles.reasonItem}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => handleInternshipPress(rec.internship)}
                  >
                    <Ionicons name="eye" size={16} color={Colors.primary} />
                    <Text style={styles.secondaryButtonText}>View Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => handleCheckEligibility(rec.internship)}
                  >
                    <Ionicons name="flash" size={16} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Check Eligibility</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Call to action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Want better recommendations?</Text>
          <Text style={styles.ctaText}>
            Update your skills, education, and preferences in your profile.
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate(ScreenNames.PROFILE)}
          >
            <Text style={styles.ctaButtonText}>Update Profile</Text>
          </TouchableOpacity>
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
  aiSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginLeft: 8,
  },
  aiCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
    marginTop: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  learningPath: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  learningPathText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
  },
  jobSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  jobSuggestionText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
  },
  recommendationsSection: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 16,
  },
  recommendationCard: {
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
    alignItems: 'center',
    marginBottom: 12,
  },
  matchScore: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
  },
  internshipInfo: {
    marginBottom: 12,
  },
  internshipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  organization: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  internshipMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  reasonsSection: {
    backgroundColor: Colors.lightBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 12,
    color: Colors.dark,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  ctaSection: {
    backgroundColor: Colors.lightPrimary,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default RecommendationScreen;