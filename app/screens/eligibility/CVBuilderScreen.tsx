import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useFirestore } from '../../hooks/useFirestore';
import { User } from '../../types/common';

interface CVBuilderScreenProps {
  navigation: any;
}

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  summary: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  demoUrl?: string;
}

export const CVBuilderScreen: React.FC<CVBuilderScreenProps> = ({ navigation }) => {
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      portfolio: ''
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    summary: ''
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { data: userData } = useFirestore('users');

  useEffect(() => {
    if (userData.length > 0) {
      const currentUser = userData[0] as User;
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: currentUser.name,
          email: currentUser.email,
          location: currentUser.location || ''
        },
        skills: currentUser.skills || []
      }));
    }
  }, [userData]);

  const addSkill = () => {
    if (currentSkill.trim() && !cvData.skills.includes(currentSkill.trim())) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: []
    };
    
    setCvData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (id: string) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const generateAISuggestions = async () => {
    // Mock AI suggestions - in real app, this would call an AI service
    const mockSuggestions = [
      "Highlight your experience with React Native and mobile development",
      "Emphasize your problem-solving skills and project management experience",
      "Include specific metrics and achievements in your experience descriptions",
      "Add any open-source contributions or personal projects",
      "Mention your ability to work in agile development environments"
    ];
    
    setAiSuggestions(mockSuggestions);
    Alert.alert('AI Suggestions', 'CV suggestions have been generated!');
  };

  const handlePreviewCV = () => {
    navigation.navigate('CVPreview', { cvData });
  };

  const handleSaveCV = async () => {
    // In real app, save to Firestore
    Alert.alert('Success', 'CV has been saved successfully!');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>CV Builder</Text>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {Object.entries(cvData.personalInfo).map(([key, value]) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
              value={value}
              onChangeText={(text) => setCvData(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, [key]: text }
              }))}
            />
          ))}
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write a brief summary about yourself..."
            value={cvData.summary}
            onChangeText={(text) => setCvData(prev => ({ ...prev, summary: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillInputContainer}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              placeholder="Add a skill..."
              value={currentSkill}
              onChangeText={setCurrentSkill}
              onSubmitEditing={addSkill}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skillsContainer}>
            {cvData.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <Text style={styles.removeSkillText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {cvData.education.map((edu) => (
            <View key={edu.id} style={styles.educationItem}>
              <TextInput
                style={styles.input}
                placeholder="Institution"
                value={edu.institution}
                onChangeText={(text) => updateEducation(edu.id, 'institution', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Degree"
                value={edu.degree}
                onChangeText={(text) => updateEducation(edu.id, 'degree', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Field of Study"
                value={edu.field}
                onChangeText={(text) => updateEducation(edu.id, 'field', text)}
              />
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Start Date"
                  value={edu.startDate}
                  onChangeText={(text) => updateEducation(edu.id, 'startDate', text)}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="End Date"
                  value={edu.endDate}
                  onChangeText={(text) => updateEducation(edu.id, 'endDate', text)}
                />
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeEducation(edu.id)}
              >
                <Text style={styles.removeButtonText}>Remove Education</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addSectionButton} onPress={addEducation}>
            <Text style={styles.addSectionButtonText}>+ Add Education</Text>
          </TouchableOpacity>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {cvData.experience.map((exp) => (
            <View key={exp.id} style={styles.experienceItem}>
              <TextInput
                style={styles.input}
                placeholder="Company"
                value={exp.company}
                onChangeText={(text) => updateExperience(exp.id, 'company', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Position"
                value={exp.position}
                onChangeText={(text) => updateExperience(exp.id, 'position', text)}
              />
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Start Date"
                  value={exp.startDate}
                  onChangeText={(text) => updateExperience(exp.id, 'startDate', text)}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="End Date"
                  value={exp.endDate}
                  onChangeText={(text) => updateExperience(exp.id, 'endDate', text)}
                />
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={exp.description}
                onChangeText={(text) => updateExperience(exp.id, 'description', text)}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeExperience(exp.id)}
              >
                <Text style={styles.removeButtonText}>Remove Experience</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addSectionButton} onPress={addExperience}>
            <Text style={styles.addSectionButtonText}>+ Add Experience</Text>
          </TouchableOpacity>
        </View>

        {/* Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {cvData.projects.map((proj) => (
            <View key={proj.id} style={styles.projectItem}>
              <TextInput
                style={styles.input}
                placeholder="Project Name"
                value={proj.name}
                onChangeText={(text) => updateProject(proj.id, 'name', text)}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Project Description"
                value={proj.description}
                onChangeText={(text) => updateProject(proj.id, 'description', text)}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeProject(proj.id)}
              >
                <Text style={styles.removeButtonText}>Remove Project</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addSectionButton} onPress={addProject}>
            <Text style={styles.addSectionButtonText}>+ Add Project</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.aiButton} onPress={generateAISuggestions}>
            <Text style={styles.aiButtonText}>Get AI Suggestions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.previewButton} onPress={handlePreviewCV}>
            <Text style={styles.previewButtonText}>Preview CV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveCV}>
            <Text style={styles.saveButtonText}>Save CV</Text>
          </TouchableOpacity>
        </View>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>AI Suggestions</Text>
            {aiSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>• {suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  skillInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    marginRight: 8,
  },
  removeSkillText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  educationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  projectItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  removeButton: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  addSectionButton: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  addSectionButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 20,
  },
  aiButton: {
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsSection: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  suggestionItem: {
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});