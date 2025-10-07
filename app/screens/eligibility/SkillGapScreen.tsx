import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useFirestore } from '../../hooks/useFirestore';
import { User } from '../../types/common';

interface SkillGapScreenProps {
  route: any;
  navigation: any;
}

interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'course' | 'article';
  platform: string;
  url: string;
  duration?: string;
  skill: string;
}

export const SkillGapScreen: React.FC<SkillGapScreenProps> = ({ route, navigation }) => {
  const { internship, missingSkills } = route.params;
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const { data: userData } = useFirestore('users');

  useEffect(() => {
    if (userData.length > 0) {
      const currentUser = userData[0] as User;
      setUserSkills(currentUser.skills || []);
    }
    
    // Mock learning resources - in real app, this would come from APIs
    const mockResources: LearningResource[] = [
      {
        id: '1',
        title: 'React Native Crash Course',
        type: 'video',
        platform: 'YouTube',
        url: 'https://youtube.com/watch?v=example1',
        duration: '2 hours',
        skill: 'React Native'
      },
      {
        id: '2',
        title: 'JavaScript Fundamentals',
        type: 'course',
        platform: 'Coursera',
        url: 'https://coursera.org/learn/javascript',
        duration: '4 weeks',
        skill: 'JavaScript'
      },
      {
        id: '3',
        title: 'Node.js Best Practices',
        type: 'article',
        platform: 'Medium',
        url: 'https://medium.com/nodejs-best-practices',
        skill: 'Node.js'
      },
      {
        id: '4',
        title: 'Python for Beginners',
        type: 'course',
        platform: 'edX',
        url: 'https://edx.org/learn/python',
        duration: '6 weeks',
        skill: 'Python'
      },
      {
        id: '5',
        title: 'UI/UX Design Principles',
        type: 'video',
        platform: 'YouTube',
        url: 'https://youtube.com/watch?v=example2',
        duration: '1.5 hours',
        skill: 'UI/UX Design'
      }
    ];

    // Filter resources for missing skills
    const relevantResources = mockResources.filter(resource =>
      missingSkills.some(skill => 
        skill.toLowerCase().includes(resource.skill.toLowerCase()) ||
        resource.skill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    setLearningResources(relevantResources);
  }, [missingSkills, userData]);

  const handleResourcePress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const addSkillToProfile = async (skill: string) => {
    const updatedSkills = [...userSkills, skill];
    setUserSkills(updatedSkills);
    
    // In real app, update user profile in Firestore
    Alert.alert('Success', `Added ${skill} to your profile`);
  };

  const renderSkillItem = ({ item: skill }: { item: string }) => (
    <View style={styles.skillItem}>
      <Text style={styles.skillText}>{skill}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addSkillToProfile(skill)}
      >
        <Text style={styles.addButtonText}>Add to Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResourceItem = ({ item }: { item: LearningResource }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => handleResourcePress(item.url)}
    >
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <View style={[
          styles.typeBadge,
          { backgroundColor: getTypeColor(item.type) }
        ]}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.resourceDetails}>
        <Text style={styles.platformText}>Platform: {item.platform}</Text>
        <Text style={styles.skillText}>Skill: {item.skill}</Text>
        {item.duration && (
          <Text style={styles.durationText}>Duration: {item.duration}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'video': return '#FF6B6B';
      case 'course': return '#4ECDC4';
      case 'article': return '#45B7D1';
      default: return '#95A5A6';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Skill Gap Analysis</Text>
      
      <View style={styles.internshipInfo}>
        <Text style={styles.internshipName}>{internship.title}</Text>
        <Text style={styles.company}>{internship.company}</Text>
      </View>

      <View style={styles.skillsSection}>
        <Text style={styles.sectionTitle}>Missing Skills ({missingSkills.length})</Text>
        <Text style={styles.sectionSubtitle}>
          These are the skills required for this internship that you don't currently have:
        </Text>
        
        <FlatList
          data={missingSkills}
          renderItem={renderSkillItem}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.resourcesSection}>
        <Text style={styles.sectionTitle}>Learning Resources</Text>
        <Text style={styles.sectionSubtitle}>
          Here are some resources to help you learn the missing skills:
        </Text>
        
        <FlatList
          data={learningResources}
          renderItem={renderResourceItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Eligibility</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cvButton}
          onPress={() => navigation.navigate('CVBuilder')}
        >
          <Text style={styles.cvButtonText}>Build CV with New Skills</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  internshipInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  internshipName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    color: '#666',
  },
  skillsSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourcesSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
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
  resourceDetails: {
    marginTop: 4,
  },
  platformText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cvButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cvButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});