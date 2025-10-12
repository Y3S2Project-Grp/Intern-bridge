import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { Education, Experience, ProfileService } from '../../services/profileService';

interface Props {
  navigation: any;
  route: any;
}

const EditProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, updateUser } = useAuth();
  const { profile: initialProfile, focusSection } = route.params || {};
  
  const [profile, setProfile] = useState(initialProfile || {});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(focusSection || 'basic');
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [availableSkills] = useState([
    'JavaScript', 'TypeScript', 'React', 'React Native', 'Node.js', 'Python',
    'Java', 'HTML', 'CSS', 'MongoDB', 'SQL', 'AWS', 'Docker', 'Git',
    'UI/UX Design', 'Figma', 'Agile', 'Scrum', 'Machine Learning', 'Data Analysis'
  ]);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (user) {
        await ProfileService.updateProfile(user.id, profile);
        await updateUser(); // Refresh user data
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      const updatedSkills = [...(profile.skills || []), newSkill.trim()];
      setProfile({ ...profile, skills: updatedSkills });
      setNewSkill('');
      setShowSkillModal(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = profile.skills?.filter((skill: string) => skill !== skillToRemove);
    setProfile({ ...profile, skills: updatedSkills });
  };

  const handleAddEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      field: '',
      startDate: new Date(),
      current: false,
    };
    const updatedEducation = [...(profile.education || []), newEducation];
    setProfile({ ...profile, education: updatedEducation });
  };

  const handleUpdateEducation = (index: number, field: string, value: any) => {
    const updatedEducation = [...(profile.education || [])];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setProfile({ ...profile, education: updatedEducation });
  };

  const handleRemoveEducation = (index: number) => {
    const updatedEducation = [...(profile.education || [])];
    updatedEducation.splice(index, 1);
    setProfile({ ...profile, education: updatedEducation });
  };

  const handleAddExperience = () => {
    const newExperience: Experience = {
      company: '',
      position: '',
      startDate: new Date(),
      current: false,
    };
    const updatedExperience = [...(profile.experience || []), newExperience];
    setProfile({ ...profile, experience: updatedExperience });
  };

  const handleUpdateExperience = (index: number, field: string, value: any) => {
    const updatedExperience = [...(profile.experience || [])];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setProfile({ ...profile, experience: updatedExperience });
  };

  const handleRemoveExperience = (index: number) => {
    const updatedExperience = [...(profile.experience || [])];
    updatedExperience.splice(index, 1);
    setProfile({ ...profile, experience: updatedExperience });
  };

  const sections = [
    { id: 'basic', title: 'Basic Info', icon: 'person' },
    { id: 'skills', title: 'Skills', icon: 'build' },
    { id: 'education', title: 'Education', icon: 'school' },
    { id: 'experience', title: 'Experience', icon: 'briefcase' },
  ];

  const renderBasicInfo = () => (
    <View style={styles.sectionContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name || ''}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={profile.location || ''}
          onChangeText={(text) => setProfile({ ...profile, location: text })}
          placeholder="Enter your location"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.bio || ''}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderSkills = () => (
    <View style={styles.sectionContent}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowSkillModal(true)}
      >
        <Ionicons name="add" size={20} color={Colors.primary} />
        <Text style={styles.addButtonText}>Add Skill</Text>
      </TouchableOpacity>

      <View style={styles.skillsContainer}>
        {profile.skills?.map((skill: string, index: number) => (
          <View key={index} style={styles.skillItem}>
            <Text style={styles.skillItemText}>{skill}</Text>
            <TouchableOpacity 
              onPress={() => handleRemoveSkill(skill)}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal
        visible={showSkillModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Skill</Text>
              <TouchableOpacity onPress={() => setShowSkillModal(false)}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Search or type a skill..."
            />

            <FlatList
              data={availableSkills.filter(skill => 
                skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                !profile.skills?.includes(skill)
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.skillOption}
                  onPress={() => {
                    setNewSkill(item);
                    handleAddSkill();
                  }}
                >
                  <Text style={styles.skillOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.skillsList}
            />

            <TouchableOpacity 
              style={styles.modalAddButton}
              onPress={handleAddSkill}
              disabled={!newSkill.trim()}
            >
              <Text style={styles.modalAddButtonText}>Add Skill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderEducation = () => (
    <View style={styles.sectionContent}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddEducation}
      >
        <Ionicons name="add" size={20} color={Colors.primary} />
        <Text style={styles.addButtonText}>Add Education</Text>
      </TouchableOpacity>

      {profile.education?.map((edu: Education, index: number) => (
        <View key={index} style={styles.educationForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Education #{index + 1}</Text>
            <TouchableOpacity onPress={() => handleRemoveEducation(index)}>
              <Ionicons name="trash" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={edu.institution}
            onChangeText={(text) => handleUpdateEducation(index, 'institution', text)}
            placeholder="Institution Name"
          />

          <TextInput
            style={styles.input}
            value={edu.degree}
            onChangeText={(text) => handleUpdateEducation(index, 'degree', text)}
            placeholder="Degree"
          />

          <TextInput
            style={styles.input}
            value={edu.field}
            onChangeText={(text) => handleUpdateEducation(index, 'field', text)}
            placeholder="Field of Study"
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleUpdateEducation(index, 'current', !edu.current)}
            >
              <Ionicons 
                name={edu.current ? "checkbox" : "square-outline"} 
                size={20} 
                color={edu.current ? Colors.primary : Colors.gray} 
              />
              <Text style={styles.checkboxLabel}>Currently studying here</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderExperience = () => (
    <View style={styles.sectionContent}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddExperience}
      >
        <Ionicons name="add" size={20} color={Colors.primary} />
        <Text style={styles.addButtonText}>Add Experience</Text>
      </TouchableOpacity>

      {profile.experience?.map((exp: Experience, index: number) => (
        <View key={index} style={styles.experienceForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Experience #{index + 1}</Text>
            <TouchableOpacity onPress={() => handleRemoveExperience(index)}>
              <Ionicons name="trash" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={exp.company}
            onChangeText={(text) => handleUpdateExperience(index, 'company', text)}
            placeholder="Company Name"
          />

          <TextInput
            style={styles.input}
            value={exp.position}
            onChangeText={(text) => handleUpdateExperience(index, 'position', text)}
            placeholder="Position"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            value={exp.description}
            onChangeText={(text) => handleUpdateExperience(index, 'description', text)}
            placeholder="Description of your role and responsibilities..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleUpdateExperience(index, 'current', !exp.current)}
            >
              <Ionicons 
                name={exp.current ? "checkbox" : "square-outline"} 
                size={20} 
                color={exp.current ? Colors.primary : Colors.gray} 
              />
              <Text style={styles.checkboxLabel}>I currently work here</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Section Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sectionNav}
        >
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionNavItem,
                activeSection === section.id && styles.sectionNavItemActive,
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Ionicons 
                name={section.icon as any} 
                size={16} 
                color={activeSection === section.id ? Colors.primary : Colors.gray} 
              />
              <Text style={[
                styles.sectionNavText,
                activeSection === section.id && styles.sectionNavTextActive,
              ]}>
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Section Content */}
        {activeSection === 'basic' && renderBasicInfo()}
        {activeSection === 'skills' && renderSkills()}
        {activeSection === 'education' && renderEducation()}
        {activeSection === 'experience' && renderExperience()}

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  sectionNav: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: Colors.lightGray,
  },
  sectionNavItemActive: {
    backgroundColor: Colors.lightPrimary,
  },
  sectionNavText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionNavTextActive: {
    color: Colors.primary,
  },
  sectionContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillItemText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
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
    padding: 16,
    width: '90%',
    maxHeight: '80%',
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
  modalInput: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  skillsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  skillOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  skillOptionText: {
    fontSize: 14,
    color: Colors.dark,
  },
  modalAddButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalAddButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  educationForm: {
    backgroundColor: Colors.lightBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  experienceForm: {
    backgroundColor: Colors.lightBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  checkboxContainer: {
    marginTop: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;