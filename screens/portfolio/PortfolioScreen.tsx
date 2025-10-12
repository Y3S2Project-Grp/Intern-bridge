import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { YouthStackParamList } from '../../navigation/YouthNavigator';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type PortfolioScreenNavigationProp = StackNavigationProp<YouthStackParamList, 'Portfolio'>;

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

const PortfolioScreen = () => {
  const navigation = useNavigation<PortfolioScreenNavigationProp>();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load saved projects (in a real app, this would come from your backend)
    const savedProjects = [
      {
        id: '1',
        title: 'E-Commerce Website',
        description: 'A full-stack e-commerce platform with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        githubUrl: 'https://github.com/username/ecommerce',
        startDate: '2024-01-15',
        endDate: '2024-03-20',
        isCurrent: false,
      },
    ];
    setProjects(savedProjects);
  }, []);

  const handleAddProject = () => {
    navigation.navigate('PortfolioBuilder');
  };

  const handleEditProject = (projectId: string) => {
    navigation.navigate('PortfolioBuilder', { projectId });
  };

  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProjects(projects.filter(project => project.id !== projectId));
          },
        },
      ]
    );
  };

  const handlePreviewPortfolio = () => {
    navigation.navigate('PortfolioPreview', { portfolioData: { projects } });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>
          Showcase your projects and skills to potential employers
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleAddProject}>
          <Ionicons name="add" size={24} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Add New Project</Text>
        </TouchableOpacity>

        {projects.length > 0 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePreviewPortfolio}>
            <Ionicons name="eye" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Preview Portfolio</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Projects List */}
      <View style={styles.projectsSection}>
        <Text style={styles.sectionTitle}>My Projects ({projects.length})</Text>
        
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>No projects yet</Text>
            <Text style={styles.emptyStateText}>
              Start by adding your first project to showcase your skills
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddProject}>
              <Text style={styles.emptyStateButtonText}>Add Your First Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <View style={styles.projectActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditProject(project.id)}
                  >
                    <Ionicons name="create" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteProject(project.id)}
                  >
                    <Ionicons name="trash" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.projectDescription}>{project.description}</Text>
              
              <View style={styles.technologies}>
                {project.technologies.map((tech, index) => (
                  <View key={index} style={styles.techTag}>
                    <Text style={styles.techText}>{tech}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.projectMeta}>
                <Text style={styles.projectDate}>
                  {project.startDate} {project.endDate ? `- ${project.endDate}` : '- Present'}
                </Text>
                {project.githubUrl && (
                  <TouchableOpacity style={styles.linkButton}>
                    <Ionicons name="logo-github" size={16} color={Colors.dark} />
                    <Text style={styles.linkText}>GitHub</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 20,
  },
  quickActions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  projectsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    flex: 1,
  },
  projectActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  technologies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  techTag: {
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  techText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: Colors.dark,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default PortfolioScreen;