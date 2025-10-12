import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { ScreenNames } from '../../constants/ScreenNames';
import { useAuth } from '../../hooks/useAuth';
import { AIService } from '../../services/aiService';
import { InternshipService } from '../../services/internshipService';

interface Props {
  navigation: any;
}

const AddInternshipScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [] as string[],
    skills: [] as string[],
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'remote' | 'hybrid',
    duration: '',
    stipend: '',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    category: '',
  });

  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<'deadline' | 'start' | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [biasCheck, setBiasCheck] = useState({
    hasBias: false,
    issues: [] as string[],
  });

  const categories = [
    'Software Development',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Digital Marketing',
    'Business Analysis',
    'Project Management',
    'Content Writing',
    'Graphic Design',
    'Sales & Marketing',
    'Human Resources',
  ];

  const internshipTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  useEffect(() => {
    analyzeDescription();
  }, [formData.description]);

  const analyzeDescription = async () => {
    if (!formData.description || formData.description.length < 50) return;

    try {
      setAnalyzing(true);
      const biasResult = await AIService.detectBiasInJobDescription(formData.description);
      setBiasCheck(biasResult);
    } catch (error) {
      console.error('Error analyzing description:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirement)
    }));
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate && showDatePicker) {
      setFormData(prev => ({
        ...prev,
        [showDatePicker === 'deadline' ? 'applicationDeadline' : 'startDate']: selectedDate
      }));
    }
  };

  const extractSkills = async () => {
    if (!formData.description) {
      Alert.alert('Error', 'Please enter a job description first');
      return;
    }

    try {
      setAnalyzing(true);
      const extractedSkills = await AIService.extractSkillsFromJobDescription(formData.description);
      
      if (extractedSkills.length > 0) {
        setFormData(prev => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...extractedSkills])]
        }));
        Alert.alert('Success', `${extractedSkills.length} skills extracted from description`);
      } else {
        Alert.alert('Info', 'No skills could be extracted from the description');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to extract skills from description');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a job title');
      return false;
    }
    if (!formData.description.trim() || formData.description.length < 50) {
      Alert.alert('Error', 'Please enter a detailed description (at least 50 characters)');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return false;
    }
    if (!formData.duration.trim()) {
      Alert.alert('Error', 'Please enter the internship duration');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (formData.requirements.length === 0) {
      Alert.alert('Error', 'Please add at least one requirement');
      return false;
    }
    if (new Date(formData.applicationDeadline) <= new Date()) {
      Alert.alert('Error', 'Application deadline must be in the future');
      return false;
    }
    if (new Date(formData.startDate) <= new Date()) {
      Alert.alert('Error', 'Start date must be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (biasCheck.hasBias) {
      Alert.alert(
        'Potential Bias Detected',
        `We found potential bias in your job description:\n\n${biasCheck.issues.join('\n')}\n\nDo you want to proceed anyway?`,
        [
          { text: 'Edit Description', style: 'cancel' },
          { text: 'Proceed', onPress: submitInternship },
        ]
      );
    } else {
      await submitInternship();
    }
  };

  const submitInternship = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post an internship');
      return;
    }

    try {
      setLoading(true);

      const internshipData = {
        title: formData.title,
        description: formData.description,
        organizationId: user.id,
        organizationName: user.name,
        requirements: formData.requirements,
        skills: formData.skills,
        location: formData.location,
        type: formData.type,
        duration: formData.duration,
        stipend: formData.stipend ? parseInt(formData.stipend) : undefined,
        applicationDeadline: formData.applicationDeadline,
        startDate: formData.startDate,
        category: formData.category,
      };

      const internshipId = await InternshipService.createInternship(internshipData);
      
      Alert.alert(
        'Success',
        'Internship posted successfully!',
        [
          {
            text: 'View Internship',
            onPress: () => navigation.navigate(ScreenNames.INTERNSHIP_DETAILS, { 
              internship: { ...internshipData, id: internshipId } 
            })
          },
          {
            text: 'Post Another',
            onPress: () => {
              setFormData({
                title: '',
                description: '',
                requirements: [],
                skills: [],
                location: '',
                type: 'full-time',
                duration: '',
                stipend: '',
                applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                category: '',
              });
              setBiasCheck({ hasBias: false, issues: [] });
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post internship');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Post New Internship</Text>
        <Text style={styles.subtitle}>
          Fill in the details below to create a new internship opportunity
        </Text>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Internship Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="e.g., Frontend Developer Intern"
            placeholderTextColor={Colors.gray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={formData.category ? styles.categorySelected : styles.categoryPlaceholder}>
              {formData.category || 'Select a category'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="e.g., Colombo, Remote"
            placeholderTextColor={Colors.gray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Work Type *</Text>
          <View style={styles.typeOptions}>
            {internshipTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  formData.type === type.value && styles.typeOptionActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
              >
                <Text style={[
                  styles.typeOptionText,
                  formData.type === type.value && styles.typeOptionTextActive,
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration *</Text>
          <TextInput
            style={styles.input}
            value={formData.duration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
            placeholder="e.g., 3 months, 6 months"
            placeholderTextColor={Colors.gray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monthly Stipend (Optional)</Text>
          <View style={styles.stipendInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.stipendField}
              value={formData.stipend}
              onChangeText={(text) => setFormData(prev => ({ ...prev, stipend: text.replace(/[^0-9]/g, '') }))}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={Colors.gray}
            />
            <Text style={styles.stipendLabel}>/ month</Text>
          </View>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important Dates</Text>
        
        <View style={styles.dateRow}>
          <View style={styles.dateInput}>
            <Text style={styles.label}>Application Deadline *</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker('deadline')}
            >
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.dateText}>
                {formatDate(formData.applicationDeadline)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInput}>
            <Text style={styles.label}>Start Date *</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker('start')}
            >
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.dateText}>
                {formatDate(formData.startDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Describe the internship role, responsibilities, and what the intern will learn..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor={Colors.gray}
        />
        <Text style={styles.charCount}>
          {formData.description.length} characters
          {analyzing && ' • Analyzing...'}
        </Text>

        {biasCheck.hasBias && (
          <View style={styles.biasWarning}>
            <Ionicons name="warning" size={16} color={Colors.warning} />
            <Text style={styles.biasText}>
              Potential bias detected: {biasCheck.issues.join(', ')}
            </Text>
          </View>
        )}
      </View>

      {/* Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements *</Text>
        <Text style={styles.sectionSubtitle}>
          List the mandatory requirements for this position
        </Text>
        
        <View style={styles.tagInput}>
          <TextInput
            style={styles.tagInputField}
            value={currentRequirement}
            onChangeText={setCurrentRequirement}
            placeholder="Add a requirement (e.g., Python experience)"
            onSubmitEditing={handleAddRequirement}
            placeholderTextColor={Colors.gray}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddRequirement}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {formData.requirements.map((requirement, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{requirement}</Text>
              <TouchableOpacity 
                style={styles.removeTagButton}
                onPress={() => handleRemoveRequirement(requirement)}
              >
                <Ionicons name="close" size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <View style={styles.skillsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Preferred Skills</Text>
            <Text style={styles.sectionSubtitle}>
              Skills that would be beneficial but not required
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={extractSkills}
            disabled={analyzing}
          >
            <Ionicons name="sparkles" size={16} color={Colors.white} />
            <Text style={styles.aiButtonText}>
              {analyzing ? 'Extracting...' : 'AI Extract'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tagInput}>
          <TextInput
            style={styles.tagInputField}
            value={currentSkill}
            onChangeText={setCurrentSkill}
            placeholder="Add a skill (e.g., React, Figma)"
            onSubmitEditing={handleAddSkill}
            placeholderTextColor={Colors.gray}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddSkill}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {formData.skills.map((skill, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{skill}</Text>
              <TouchableOpacity 
                style={styles.removeTagButton}
                onPress={() => handleRemoveSkill(skill)}
              >
                <Ionicons name="close" size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            <Ionicons name="rocket" size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>Post Internship</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    formData.category === item && styles.categoryOptionActive,
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, category: item }));
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    formData.category === item && styles.categoryOptionTextActive,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'deadline' ? formData.applicationDeadline : formData.startDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.dark,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'right',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categorySelected: {
    fontSize: 16,
    color: Colors.dark,
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: Colors.gray,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    margin: 4,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: Colors.white,
  },
  stipendInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    padding: 12,
    fontSize: 16,
    color: Colors.gray,
  },
  stipendField: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  stipendLabel: {
    padding: 12,
    fontSize: 14,
    color: Colors.gray,
  },
  dateRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    fontSize: 16,
    color: Colors.dark,
    marginLeft: 8,
  },
  biasWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightWarning,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  biasText: {
    fontSize: 12,
    color: Colors.dark,
    marginLeft: 8,
    flex: 1,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  aiButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInputField: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.dark,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  removeTagButton: {
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryOptionActive: {
    backgroundColor: Colors.lightPrimary,
  },
  categoryOptionText: {
    fontSize: 16,
    color: Colors.dark,
  },
  categoryOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default AddInternshipScreen;