import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { ScreenNames } from '../../constants/ScreenNames';
import { useAuth } from '../../hooks/useAuth';
import { Internship, InternshipService } from '../../services/internshipService';

interface Props {
  navigation: any;
  route: any;
}

const EditInternshipScreen: React.FC<Props> = ({ navigation, route }) => {
  const { internship: initialInternship } = route.params;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'deadline' | 'start' | null>(null);

  useEffect(() => {
    if (initialInternship) {
      setInternship(initialInternship);
    }
  }, [initialInternship]);

  const handleUpdateField = (field: keyof Internship, value: any) => {
    if (internship) {
      setInternship(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate && showDatePicker && internship) {
      handleUpdateField(
        showDatePicker === 'deadline' ? 'applicationDeadline' : 'startDate',
        selectedDate
      );
    }
  };

  const handleAddRequirement = (requirement: string) => {
    if (requirement.trim() && internship) {
      const newRequirements = [...(internship.requirements || []), requirement.trim()];
      handleUpdateField('requirements', newRequirements);
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    if (internship) {
      const newRequirements = internship.requirements?.filter(req => req !== requirement) || [];
      handleUpdateField('requirements', newRequirements);
    }
  };

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && internship) {
      const newSkills = [...(internship.skills || []), skill.trim()];
      handleUpdateField('skills', newSkills);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    if (internship) {
      const newSkills = internship.skills?.filter(s => s !== skill) || [];
      handleUpdateField('skills', newSkills);
    }
  };

  const validateForm = () => {
    if (!internship) return false;

    if (!internship.title?.trim()) {
      Alert.alert('Error', 'Please enter a job title');
      return false;
    }
    if (!internship.description?.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!internship.location?.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return false;
    }
    if (!internship.duration?.trim()) {
      Alert.alert('Error', 'Please enter the internship duration');
      return false;
    }
    if (!internship.category?.trim()) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!internship.requirements?.length) {
      Alert.alert('Error', 'Please add at least one requirement');
      return false;
    }
    if (new Date(internship.applicationDeadline) <= new Date()) {
      Alert.alert('Error', 'Application deadline must be in the future');
      return false;
    }
    if (new Date(internship.startDate) <= new Date()) {
      Alert.alert('Error', 'Start date must be in the future');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!internship || !validateForm()) return;

    try {
      setSaving(true);
      await InternshipService.updateInternship(internship.id!, {
        title: internship.title,
        description: internship.description,
        requirements: internship.requirements,
        skills: internship.skills,
        location: internship.location,
        type: internship.type,
        duration: internship.duration,
        stipend: internship.stipend,
        applicationDeadline: internship.applicationDeadline,
        startDate: internship.startDate,
        category: internship.category,
        isActive: internship.isActive,
      });

      Alert.alert('Success', 'Internship updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update internship');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!internship) return;

    Alert.alert(
      'Delete Internship',
      'Are you sure you want to delete this internship? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await InternshipService.deleteInternship(internship.id!);
              Alert.alert('Success', 'Internship deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate(ScreenNames.INTERNSHIP_LIST),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete internship');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = () => {
    if (!internship) return;

    const newStatus = !internship.isActive;
    handleUpdateField('isActive', newStatus);
    
    Alert.alert(
      newStatus ? 'Activate Internship' : 'Deactivate Internship',
      newStatus 
        ? 'This internship will be visible to applicants.'
        : 'This internship will be hidden from applicants.',
      [
        { text: 'Cancel', onPress: () => handleUpdateField('isActive', !newStatus) },
        { text: 'Confirm', onPress: () => {} },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading internship...</Text>
      </View>
    );
  }

  if (!internship) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Internship not found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Internship</Text>
        <Text style={styles.subtitle}>Make changes to your internship posting</Text>
      </View>

      {/* Status Toggle */}
      <View style={styles.statusSection}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>
            Status: {internship.isActive ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.statusDescription}>
            {internship.isActive 
              ? 'This internship is visible to applicants'
              : 'This internship is hidden from applicants'
            }
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.statusToggle,
            internship.isActive ? styles.statusActive : styles.statusInactive,
          ]}
          onPress={handleToggleStatus}
        >
          <View
            style={[
              styles.toggleKnob,
              internship.isActive ? styles.toggleKnobActive : styles.toggleKnobInactive,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Internship Title</Text>
          <TextInput
            style={styles.input}
            value={internship.title}
            onChangeText={(text) => handleUpdateField('title', text)}
            placeholder="Enter internship title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={internship.category}
            onChangeText={(text) => handleUpdateField('category', text)}
            placeholder="Enter category"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={internship.location}
            onChangeText={(text) => handleUpdateField('location', text)}
            placeholder="Enter location"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration</Text>
          <TextInput
            style={styles.input}
            value={internship.duration}
            onChangeText={(text) => handleUpdateField('duration', text)}
            placeholder="e.g., 3 months"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monthly Stipend</Text>
          <TextInput
            style={styles.input}
            value={internship.stipend?.toString() || ''}
            onChangeText={(text) => handleUpdateField('stipend', text ? parseInt(text) : undefined)}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important Dates</Text>
        
        <View style={styles.dateRow}>
          <View style={styles.dateInput}>
            <Text style={styles.label}>Application Deadline</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker('deadline')}
            >
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.dateText}>
                {formatDate(internship.applicationDeadline)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInput}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker('start')}
            >
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.dateText}>
                {formatDate(internship.startDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={internship.description}
          onChangeText={(text) => handleUpdateField('description', text)}
          placeholder="Describe the internship role and responsibilities..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <RequirementManager
          requirements={internship.requirements || []}
          onAddRequirement={handleAddRequirement}
          onRemoveRequirement={handleRemoveRequirement}
        />
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Skills</Text>
        <SkillManager
          skills={internship.skills || []}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="save" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={20} color={Colors.white} />
          <Text style={styles.deleteButtonText}>Delete Internship</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'deadline' ? internship.applicationDeadline : internship.startDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

// Requirement Manager Component
const RequirementManager = ({ requirements, onAddRequirement, onRemoveRequirement }: any) => {
  const [currentRequirement, setCurrentRequirement] = useState('');

  const handleAdd = () => {
    onAddRequirement(currentRequirement);
    setCurrentRequirement('');
  };

  return (
    <View>
      <View style={styles.tagInput}>
        <TextInput
          style={styles.tagInputField}
          value={currentRequirement}
          onChangeText={setCurrentRequirement}
          placeholder="Add a requirement"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={handleAdd}>
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tagsContainer}>
        {requirements.map((requirement: string, index: number) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{requirement}</Text>
            <TouchableOpacity 
              style={styles.removeTagButton}
              onPress={() => onRemoveRequirement(requirement)}
            >
              <Ionicons name="close" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// Skill Manager Component
const SkillManager = ({ skills, onAddSkill, onRemoveSkill }: any) => {
  const [currentSkill, setCurrentSkill] = useState('');

  const handleAdd = () => {
    onAddSkill(currentSkill);
    setCurrentSkill('');
  };

  return (
    <View>
      <View style={styles.tagInput}>
        <TextInput
          style={styles.tagInputField}
          value={currentSkill}
          onChangeText={setCurrentSkill}
          placeholder="Add a skill"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={handleAdd}>
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tagsContainer}>
        {skills.map((skill: string, index: number) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{skill}</Text>
            <TouchableOpacity 
              style={styles.removeTagButton}
              onPress={() => onRemoveSkill(skill)}
            >
              <Ionicons name="close" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
  statusSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.gray,
  },
  statusToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  statusActive: {
    backgroundColor: Colors.success,
  },
  statusInactive: {
    backgroundColor: Colors.gray,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  toggleKnobInactive: {
    transform: [{ translateX: 0 }],
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
  actionSection: {
    padding: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    padding: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EditInternshipScreen;