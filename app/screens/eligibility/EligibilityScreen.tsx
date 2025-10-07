import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
}

export const EligibilityScreen: React.FC<EligibilityScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const { data: userData, fetchAll: fetchUser } = useFirestore('users');
  const { data: internshipData, fetchAll: fetchInternships } = useFirestore('internships');

  useEffect(() => {
    fetchUser();
    fetchInternships();
  }, []);

  useEffect(() => {
    if (userData.length > 0) {
      const currentUser = userData[0] as User;
      setUser(currentUser);
      setUserSkills(currentUser.skills || []);
    }
  }, [userData]);

  useEffect(() => {
    if (internshipData.length > 0) {
      setInternships(internshipData as Internship[]);
    }
  }, [internshipData]);

  const calculateEligibility = (internship: Internship): number => {
    const requiredSkills = internship.requiredSkills || [];
    if (requiredSkills.length === 0) return 100;

    const matchingSkills = requiredSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    return Math.round((matchingSkills.length / requiredSkills.length) * 100);
  };

  const getEligibilityColor = (percentage: number): string => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  };

  const handleCheckEligibility = (internship: Internship) => {
    const eligibilityScore = calculateEligibility(internship);
    const missingSkills = internship.requiredSkills?.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ) || [];

    Alert.alert(
      `Eligibility for ${internship.title}`,
      `Your eligibility score: ${eligibilityScore}%\n\n${
        missingSkills.length > 0 
          ? `Missing skills: ${missingSkills.join(', ')}`
          : 'You meet all required skills!'
      }`,
      [
        { text: 'OK' },
        { 
          text: 'View Skill Gap', 
          onPress: () => navigation.navigate(ScreenNames.SKILL_GAP, { 
            internship,
            missingSkills 
          })
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Internship Eligibility Checker</Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Welcome, {user.name}</Text>
          <Text style={styles.skills}>
            Your skills: {userSkills.length > 0 ? userSkills.join(', ') : 'No skills added'}
          </Text>
        </View>
      )}

      <View style={styles.internshipsSection}>
        <Text style={styles.sectionTitle}>Available Internships</Text>
        
        {internships.map((internship) => {
          const eligibilityScore = calculateEligibility(internship);
          
          return (
            <View key={internship.id} style={styles.internshipCard}>
              <Text style={styles.internshipTitle}>{internship.title}</Text>
              <Text style={styles.company}>{internship.company}</Text>
              <Text style={styles.description}>{internship.description}</Text>
              
              <View style={styles.eligibilityRow}>
                <Text style={styles.eligibilityLabel}>Eligibility Score:</Text>
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

              <TouchableOpacity
                style={styles.checkButton}
                onPress={() => handleCheckEligibility(internship)}
              >
                <Text style={styles.checkButtonText}>Check Detailed Eligibility</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => navigation.navigate(ScreenNames.APPLICATIONS, { internship })}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.cvButton}
        onPress={() => navigation.navigate(ScreenNames.CV_BUILDER)}
      >
        <Text style={styles.cvButtonText}>Build Your CV</Text>
      </TouchableOpacity>
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
  userInfo: {
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
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  skills: {
    fontSize: 14,
    color: '#666',
  },
  internshipsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  internshipCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  internshipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eligibilityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  scoreContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 10,
  },
  scoreText: {
    position: 'absolute',
    right: 8,
    top: 2,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  checkButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cvButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  cvButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});