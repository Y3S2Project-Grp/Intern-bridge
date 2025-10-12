import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { YouthStackParamList } from '../../navigation/YouthNavigator';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type PortfolioBuilderNavigationProp = StackNavigationProp<YouthStackParamList, 'PortfolioBuilder'>;
type PortfolioBuilderRouteProp = RouteProp<YouthStackParamList, 'PortfolioBuilder'>;

interface ProjectForm {
  id: string;
  title: string;
  description: string;
  technologies: string;
  projectUrl: string;
  githubUrl: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

const PortfolioBuilderScreen = () => {
  const navigation = useNavigation<PortfolioBuilderNavigationProp>();
  const route = useRoute<PortfolioBuilderRouteProp>();
  
  // Safer way to get projectId with proper typing
  const projectId = route.params?.projectId;

  const [form, setForm] = useState<ProjectForm>({
    id: projectId || `project-${Date.now()}`,
    title: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const [errors, setErrors] = useState<Partial<ProjectForm>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId]);

  const loadProjectData = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingProject = {
        id: id,
        title: 'E-Commerce Website',
        description: 'A full-stack e-commerce platform with React and Node.js',
        technologies: 'React, Node.js, MongoDB, Express',
        projectUrl: 'https://myproject.com',
        githubUrl: 'https://github.com/username/ecommerce',
        startDate: '2024-01-15',
        endDate: '2024-03-20',
        isCurrent: false,
      };
      setForm(existingProject);
    } catch (error) {
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectForm> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    if (!form.technologies.trim()) {
      newErrors.technologies = 'Technologies are required';
    }
    if (!form.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!form.isCurrent && !form.endDate) {
      newErrors.endDate = 'End date is required for completed projects';
    }

    // Validate date format (basic validation)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (form.startDate && !dateRegex.test(form.startDate)) {
      newErrors.startDate = 'Please use YYYY-MM-DD format';
    }
    if (form.endDate && !dateRegex.test(form.endDate)) {
      newErrors.endDate = 'Please use YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const projectData = {
        ...form,
        technologies: form.technologies.split(',').map(tech => tech.trim()),
      };

      // In a real app, you would save to your backend/state management
      console.log('Saving project:', projectData);

      Alert.alert(
        'Success',
        projectId ? 'Project updated successfully!' : 'Project added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save current project logic here
      const projectData = {
        ...form,
        technologies: form.technologies.split(',').map(tech => tech.trim()),
      };
      
      console.log('Saving project:', projectData);

      // Reset form for new project
      setForm({
        id: `project-${Date.now()}`,
        title: '',
        description: '',
        technologies: '',
        projectUrl: '',
        githubUrl: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
      });
      setErrors({});

      Alert.alert('Success', 'Project added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field: keyof ProjectForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCurrentProjectToggle = (value: boolean) => {
    updateForm('isCurrent', value);
    if (value) {
      // Clear end date when marking as current
      updateForm('endDate', '');
    }
  };

  if (isLoading && projectId) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading project...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {projectId ? 'Edit Project' : 'Add New Project'}
        </Text>
        <Text style={styles.subtitle}>
          Showcase your work and skills to potential employers
        </Text>
      </View>

      <View style={styles.form}>
        {/* Project Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Enter project title"
            value={form.title}
            onChangeText={(value) => updateForm('title', value)}
            editable={!isLoading}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Project Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Description *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe your project, your role, and key achievements..."
            value={form.description}
            onChangeText={(value) => updateForm('description', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Technologies */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Technologies Used *</Text>
          <TextInput
            style={[styles.input, errors.technologies && styles.inputError]}
            placeholder="React, Node.js, MongoDB, Express (comma separated)"
            value={form.technologies}
            onChangeText={(value) => updateForm('technologies', value)}
            editable={!isLoading}
          />
          {errors.technologies && <Text style={styles.errorText}>{errors.technologies}</Text>}
        </View>

        {/* URLs */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Live Project URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://yourproject.com"
              value={form.projectUrl}
              onChangeText={(value) => updateForm('projectUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>GitHub Repository</Text>
            <TextInput
              style={styles.input}
              placeholder="https://github.com/username/repo"
              value={form.githubUrl}
              onChangeText={(value) => updateForm('githubUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={[styles.input, errors.startDate && styles.inputError]}
              placeholder="YYYY-MM-DD"
              value={form.startDate}
              onChangeText={(value) => updateForm('startDate', value)}
              editable={!isLoading}
            />
            {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>End Date *</Text>
            <TextInput
              style={[styles.input, errors.endDate && styles.inputError]}
              placeholder="YYYY-MM-DD"
              value={form.endDate}
              onChangeText={(value) => updateForm('endDate', value)}
              editable={!form.isCurrent && !isLoading}
              placeholderTextColor={form.isCurrent ? Colors.lightGray : Colors.gray}
            />
            {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
          </View>
        </View>

        {/* Current Project Switch */}
        <View style={styles.switchGroup}>
          <Text style={styles.label}>Currently working on this project</Text>
          <Switch
            value={form.isCurrent}
            onValueChange={handleCurrentProjectToggle}
            trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            thumbColor={Colors.white}
            disabled={isLoading}
          />
        </View>
        {form.isCurrent && (
          <Text style={styles.helperText}>
            End date will be automatically set when you mark this as completed
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Ionicons name="save" size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : (projectId ? 'Update Project' : 'Save Project')}
          </Text>
        </TouchableOpacity>

        {!projectId && (
          <TouchableOpacity 
            style={[styles.addAnotherButton, isLoading && styles.disabledButton]} 
            onPress={handleAddAnother}
            disabled={isLoading}
          >
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.addAnotherButtonText}>
              {isLoading ? 'Saving...' : 'Save & Add Another'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.cancelButton, isLoading && styles.disabledButton]} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    paddingTop: 40,
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
  form: {
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
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    minHeight: 100,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: Colors.gray,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addAnotherButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  addAnotherButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.gray,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PortfolioBuilderScreen;