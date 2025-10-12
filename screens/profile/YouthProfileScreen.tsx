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
import { ProfileService } from '../../services/profileService';

interface Props {
  navigation: any;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  gpa?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description?: string;
}

const YouthProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user) {
        const userProfile = await ProfileService.getUserProfile(user.id);
        setProfile(userProfile);
        calculateCompletionPercentage(userProfile);
      }
    } catch (error) {
      console.error('Profile load error:', error);
      // If profile service fails, use basic user data
      if (user) {
        const basicProfile = {
          name: user.name,
          email: user.email,
          location: user.location || '',
          skills: user.skills || [],
          education: user.education || [],
          experience: user.experience || [],
          bio: user.bio || '',
          avatar: user.photoURL || ''
        };
        setProfile(basicProfile);
        calculateCompletionPercentage(basicProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionPercentage = (userProfile: any) => {
    let completedFields = 0;
    const totalFields = 8;

    if (userProfile?.name) completedFields++;
    if (userProfile?.email) completedFields++;
    if (userProfile?.location) completedFields++;
    if (userProfile?.skills?.length > 0) completedFields++;
    if (userProfile?.education?.length > 0) completedFields++;
    if (userProfile?.experience?.length > 0) completedFields++;
    if (userProfile?.bio) completedFields++;
    if (userProfile?.avatar) completedFields++;

    const percentage = Math.round((completedFields / totalFields) * 100);
    setCompletionPercentage(percentage);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { 
      profile,
      onProfileUpdate: loadProfile 
    });
  };

  const handleAddEducation = () => {
    navigation.navigate('EditProfile', { 
      profile,
      focusSection: 'education',
      onProfileUpdate: loadProfile 
    });
  };

  const handleAddExperience = () => {
    navigation.navigate('EditProfile', { 
      profile,
      focusSection: 'experience',
      onProfileUpdate: loadProfile 
    });
  };

  const handleSkillPress = (skill: string) => {
    navigation.navigate(ScreenNames.INTERNSHIPS, { 
      initialFilters: { skills: [skill] } 
    });
  };

  const handleMyCV = () => {
    navigation.navigate('CVBuilder');
  };

  const handleSavedItems = () => {
    Alert.alert('Coming Soon', 'Saved items feature will be available soon!');
  };

  const handleSettings = () => {
    Alert.alert('Coming Soon', 'Settings feature will be available soon!');
  };

  const handleApplications = () => {
    navigation.navigate(ScreenNames.APPLICATIONS);
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return Colors.success;
    if (percentage >= 50) return Colors.warning;
    return Colors.error;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return dateString;
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

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.navigate(ScreenNames.LOGIN)}
        >
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={Colors.white} />
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.nameSection}>
              <Text style={styles.name}>{profile?.name || 'Your Name'}</Text>
              <Text style={styles.email}>{profile?.email || user.email}</Text>
              <Text style={styles.role}>Student / Youth</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={20} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Completion */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>Profile Completion</Text>
            <Text style={[styles.completionPercentage, { color: getCompletionColor(completionPercentage) }]}>
              {completionPercentage}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${completionPercentage}%`,
                  backgroundColor: getCompletionColor(completionPercentage)
                }
              ]} 
            />
          </View>
          {completionPercentage < 100 && (
            <Text style={styles.completionHint}>
              Complete your profile to get better internship matches
            </Text>
          )}
        </View>

        {/* Bio Section */}
        {profile?.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.addSection} onPress={handleEditProfile}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
            <Text style={styles.addSectionText}>Add a bio to introduce yourself</Text>
          </TouchableOpacity>
        )}

        {/* Location */}
        {profile?.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationItem}>
              <Ionicons name="location" size={16} color={Colors.gray} />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          </View>
        )}

        {/* Skills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {profile?.skills && profile.skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.skillTag}
                  onPress={() => handleSkillPress(skill)}
                >
                  <Text style={styles.skillText}>{skill}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity style={styles.addItem} onPress={handleEditProfile}>
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.addItemText}>Add your skills</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity onPress={handleAddEducation}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {profile?.education && profile.education.length > 0 ? (
            profile.education.map((edu: Education, index: number) => (
              <View key={index} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.educationDegree}>{edu.degree}</Text>
                  <Text style={styles.educationPeriod}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </Text>
                </View>
                <Text style={styles.educationInstitution}>{edu.institution}</Text>
                {edu.field && (
                  <Text style={styles.educationField}>{edu.field}</Text>
                )}
                {edu.gpa && (
                  <Text style={styles.educationGPA}>GPA: {edu.gpa}</Text>
                )}
              </View>
            ))
          ) : (
            <TouchableOpacity style={styles.addItem} onPress={handleAddEducation}>
              <Ionicons name="school" size={20} color={Colors.primary} />
              <Text style={styles.addItemText}>Add your education</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <TouchableOpacity onPress={handleAddExperience}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {profile?.experience && profile.experience.length > 0 ? (
            profile.experience.map((exp: Experience, index: number) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experiencePosition}>{exp.position}</Text>
                  <Text style={styles.experiencePeriod}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                {exp.description && (
                  <Text style={styles.experienceDescription}>{exp.description}</Text>
                )}
              </View>
            ))
          ) : (
            <TouchableOpacity style={styles.addItem} onPress={handleAddExperience}>
              <Ionicons name="briefcase" size={20} color={Colors.primary} />
              <Text style={styles.addItemText}>Add your experience</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <TouchableOpacity style={styles.statItem} onPress={handleApplications}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Interviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Offers</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleMyCV}>
            <Ionicons name="document-text" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>My CV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleSavedItems}>
            <Ionicons name="heart" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleSettings}>
            <Ionicons name="settings" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Settings</Text>
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
    padding: 20,
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
    textAlign: 'center',
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
    position: 'relative',
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
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
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
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
  completionCard: {
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
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  completionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completionHint: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  bioText: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addSectionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  addItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addItemText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
  educationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    flex: 1,
  },
  educationPeriod: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 8,
  },
  educationInstitution: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  educationField: {
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 2,
  },
  educationGPA: {
    fontSize: 12,
    color: Colors.success,
    fontStyle: 'italic',
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  experiencePosition: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    flex: 1,
  },
  experiencePeriod: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 8,
  },
  experienceCompany: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 18,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    margin: 16,
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.dark,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default YouthProfileScreen;