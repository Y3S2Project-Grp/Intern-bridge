import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFirestore } from '../../hooks/useFirestore';
import { User } from '../../types/common';
import { ScreenNames } from '../../constants/ScreenNames';

interface SkillGapScreenProps {
  route: any;
  navigation: any;
}

interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'course' | 'article' | 'tutorial' | 'documentation';
  platform: string;
  url: string;
  duration?: string;
  skill: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  free: boolean;
}

interface SkillProgress {
  skill: string;
  progress: number;
  resourcesCompleted: number;
  totalResources: number;
}

export const SkillGapScreen: React.FC<SkillGapScreenProps> = ({ route, navigation }) => {
  const { internship, missingSkills, userSkills = [], eligibilityScore } = route.params;
  const [currentUserSkills, setCurrentUserSkills] = useState<string[]>(userSkills);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { data: userData, update: updateUser } = useFirestore('users');

  useEffect(() => {
    loadResources();
    initializeSkillProgress();
  }, [missingSkills]);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResources: LearningResource[] = [
        {
          id: '1',
          title: 'React Native Crash Course 2024',
          type: 'video',
          platform: 'YouTube',
          url: 'https://youtube.com/watch?v=0kL6nhutjQ4',
          duration: '2.5 hours',
          skill: 'React Native',
          difficulty: 'beginner',
          rating: 4.8,
          free: true
        },
        {
          id: '2',
          title: 'Modern JavaScript From The Beginning',
          type: 'course',
          platform: 'Udemy',
          url: 'https://udemy.com/course/modern-javascript',
          duration: '21 hours',
          skill: 'JavaScript',
          difficulty: 'beginner',
          rating: 4.7,
          free: false
        },
        {
          id: '3',
          title: 'Node.js Best Practices for 2024',
          type: 'article',
          platform: 'Node.js Official',
          url: 'https://nodejs.org/en/docs/guides',
          skill: 'Node.js',
          difficulty: 'intermediate',
          free: true
        },
        {
          id: '4',
          title: 'Python for Everybody Specialization',
          type: 'course',
          platform: 'Coursera',
          url: 'https://coursera.org/specializations/python',
          duration: '8 months',
          skill: 'Python',
          difficulty: 'beginner',
          rating: 4.9,
          free: true
        },
        {
          id: '5',
          title: 'UI/UX Design Principles for Developers',
          type: 'video',
          platform: 'YouTube',
          url: 'https://youtube.com/watch?v=c9Wg6Cb_YlU',
          duration: '45 minutes',
          skill: 'UI/UX Design',
          difficulty: 'beginner',
          rating: 4.6,
          free: true
        },
        {
          id: '6',
          title: 'TypeScript Full Course for Beginners',
          type: 'tutorial',
          platform: 'FreeCodeCamp',
          url: 'https://freecodecamp.org/news/learn-typescript',
          duration: '4 hours',
          skill: 'TypeScript',
          difficulty: 'beginner',
          free: true
        },
        {
          id: '7',
          title: 'MongoDB University - Free Courses',
          type: 'course',
          platform: 'MongoDB University',
          url: 'https://university.mongodb.com',
          skill: 'MongoDB',
          difficulty: 'beginner',
          free: true
        },
        {
          id: '8',
          title: 'React Documentation - Main Concepts',
          type: 'documentation',
          platform: 'React Official',
          url: 'https://reactjs.org/docs/getting-started.html',
          skill: 'React',
          difficulty: 'beginner',
          free: true
        }
      ];

      // Filter and prioritize resources for missing skills
      const relevantResources = mockResources
        .filter(resource =>
          missingSkills.some(skill => 
            skill.toLowerCase().includes(resource.skill.toLowerCase()) ||
            resource.skill.toLowerCase().includes(skill.toLowerCase())
          )
        )
        .sort((a, b) => {
          // Prioritize free resources and beginner-friendly content
          if (a.free && !b.free) return -1;
          if (!a.free && b.free) return 1;
          if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
          if (a.difficulty !== 'beginner' && b.difficulty === 'beginner') return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

      setLearningResources(relevantResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      Alert.alert('Error', 'Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  }, [missingSkills]);

  const initializeSkillProgress = useCallback(() => {
    const progress = missingSkills.map(skill => ({
      skill,
      progress: 0,
      resourcesCompleted: 0,
      totalResources: learningResources.filter(r => 
        r.skill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(r.skill.toLowerCase())
      ).length
    }));
    setSkillProgress(progress);
  }, [missingSkills, learningResources]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadResources();
    setRefreshing(false);
  }, [loadResources]);

  const handleResourcePress = useCallback(async (resource: LearningResource) => {
    Alert.alert(
      'Open Learning Resource',
      `Open "${resource.title}" on ${resource.platform}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(resource.url);
              if (supported) {
                await Linking.openURL(resource.url);
                // Mark resource as started (in a real app, you'd track progress)
                updateSkillProgress(resource.skill, 25);
              } else {
                Alert.alert('Error', `Cannot open URL: ${resource.url}`);
              }
            } catch (error) {
              console.error('Error opening URL:', error);
              Alert.alert('Error', 'Failed to open the resource');
            }
          }
        }
      ]
    );
  }, []);

  const updateSkillProgress = useCallback((skill: string, progress: number) => {
    setSkillProgress(prev => prev.map(item => 
      item.skill === skill 
        ? { ...item, progress: Math.min(100, item.progress + progress) }
        : item
    ));
  }, []);

  const addSkillToProfile = useCallback(async (skill: string) => {
    try {
      const updatedSkills = [...currentUserSkills, skill];
      setCurrentUserSkills(updatedSkills);
      
      // Update in Firestore
      if (userData.length > 0) {
        const currentUser = userData[0] as User;
        await updateUser(currentUser.id, { skills: updatedSkills });
      }
      
      Alert.alert(
        'Skill Added! 🎉',
        `"${skill}" has been added to your profile.\n\nYour eligibility score for similar positions will improve!`,
        [
          { text: 'Great!', style: 'default' },
          {
            text: 'Update CV',
            onPress: () => navigation.navigate(ScreenNames.CV_BUILDER)
          }
        ]
      );
      
      // Remove from missing skills visual (in a real app, you'd update the parent component)
      setSkillProgress(prev => prev.filter(item => item.skill !== skill));
      
    } catch (error) {
      console.error('Error adding skill:', error);
      Alert.alert('Error', 'Failed to add skill to profile');
    }
  }, [currentUserSkills, userData, updateUser, navigation]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#95A5A6';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'video': return '#FF6B6B';
      case 'course': return '#4ECDC4';
      case 'article': return '#45B7D1';
      case 'tutorial': return '#FFA726';
      case 'documentation': return '#7E57C2';
      default: return '#95A5A6';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'video': return '🎬';
      case 'course': return '📚';
      case 'article': return '📄';
      case 'tutorial': return '🔧';
      case 'documentation': return '📖';
      default: return '📝';
    }
  };

  const renderSkillProgress = ({ item }: { item: SkillProgress }) => (
    <View style={styles.skillProgressItem}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillName}>{item.skill}</Text>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${item.progress}%` }
          ]} 
        />
      </View>
      <View style={styles.skillActions}>
        <TouchableOpacity
          style={styles.addSkillButton}
          onPress={() => addSkillToProfile(item.skill)}
        >
          <Text style={styles.addSkillButtonText}>✓ Add to Profile</Text>
        </TouchableOpacity>
        <Text style={styles.resourcesCount}>
          {item.resourcesCompleted}/{item.totalResources} resources
        </Text>
      </View>
    </View>
  );

  const renderResourceItem = ({ item }: { item: LearningResource }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => handleResourcePress(item)}
    >
      <View style={styles.resourceHeader}>
        <View style={styles.resourceType}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <View style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(item.type) }
          ]}>
            <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(item.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>{item.difficulty.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.resourceTitle}>{item.title}</Text>
      
      <View style={styles.resourceDetails}>
        <Text style={styles.platformText}>🏢 {item.platform}</Text>
        <Text style={styles.skillText}>🛠️ {item.skill}</Text>
      </View>
      
      <View style={styles.resourceMeta}>
        {item.duration && (
          <Text style={styles.metaText}>⏱️ {item.duration}</Text>
        )}
        {item.rating && (
          <Text style={styles.metaText}>⭐ {item.rating}</Text>
        )}
        <Text style={[
          styles.metaText,
          item.free ? styles.freeText : styles.paidText
        ]}>
          {item.free ? '🆓 FREE' : '💳 PAID'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const overallProgress = skillProgress.length > 0 
    ? Math.round(skillProgress.reduce((sum, item) => sum + item.progress, 0) / skillProgress.length)
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Finding the best learning resources...</Text>
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
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Skill Gap Analysis 🔍</Text>
        {eligibilityScore && (
          <Text style={styles.subtitle}>
            Your current eligibility: <Text style={styles.eligibilityScore}>{eligibilityScore}%</Text>
          </Text>
        )}
      </View>

      {/* Internship Info */}
      <View style={styles.internshipInfo}>
        <Text style={styles.internshipName}>{internship.title}</Text>
        <Text style={styles.company}>at {internship.company}</Text>
        <Text style={styles.missingSkillsCount}>
          {missingSkills.length} skill{missingSkills.length !== 1 ? 's' : ''} to learn
        </Text>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressOverview}>
        <Text style={styles.sectionTitle}>Learning Progress</Text>
        <View style={styles.overallProgress}>
          <View style={styles.overallProgressBar}>
            <View 
              style={[
                styles.overallProgressFill,
                { width: `${overallProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.overallProgressText}>{overallProgress}% Overall Progress</Text>
        </View>
      </View>

      {/* Skills Progress Section */}
      <View style={styles.skillsSection}>
        <Text style={styles.sectionTitle}>Skills to Master</Text>
        <Text style={styles.sectionSubtitle}>
          Focus on these skills to improve your eligibility for this position:
        </Text>
        
        <FlatList
          data={skillProgress}
          renderItem={renderSkillProgress}
          keyExtractor={(item) => item.skill}
          scrollEnabled={false}
          contentContainerStyle={styles.skillsList}
        />
      </View>

      {/* Learning Resources Section */}
      <View style={styles.resourcesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Learning Resources</Text>
          <Text style={styles.resourcesCount}>
            {learningResources.length} resource{learningResources.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <Text style={styles.sectionSubtitle}>
          Curated resources to help you learn the required skills efficiently:
        </Text>
        
        {learningResources.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No resources found for these skills</Text>
            <Text style={styles.emptyStateSubtext}>Try checking back later or search online</Text>
          </View>
        ) : (
          <FlatList
            data={learningResources}
            renderItem={renderResourceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Eligibility</Text>
        </TouchableOpacity>
        
        <View style={styles.primaryActions}>
          <TouchableOpacity
            style={styles.cvButton}
            onPress={() => navigation.navigate(ScreenNames.CV_BUILDER)}
          >
            <Text style={styles.cvButtonText}>📝 Update CV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skillsButton}
            onPress={() => navigation.navigate(ScreenNames.SKILLS, { skills: currentUserSkills })}
          >
            <Text style={styles.skillsButtonText}>🔧 Manage Skills</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  eligibilityScore: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  internshipInfo: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  internshipName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 8,
  },
  missingSkillsCount: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  progressOverview: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  overallProgress: {
    alignItems: 'center',
  },
  overallProgressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  overallProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  skillsSection: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  skillsList: {
    gap: 12,
  },
  skillProgressItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  skillActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addSkillButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addSkillButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resourcesCount: {
    fontSize: 11,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  resourcesSection: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resourceType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 20,
  },
  resourceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  platformText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  skillText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resourceMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  freeText: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  paidText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cvButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cvButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillsButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  skillsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SkillGapScreen;