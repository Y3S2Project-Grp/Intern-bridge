import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { YouthStackParamList } from '../../navigation/YouthNavigator';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type PortfolioPreviewNavigationProp = StackNavigationProp<YouthStackParamList, 'PortfolioPreview'>;

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

const PortfolioPreviewScreen = () => {
  const navigation = useNavigation<PortfolioPreviewNavigationProp>();
  const route = useRoute();
  const { portfolioData } = route.params as { portfolioData: { projects: Project[] } };

  const handleShare = async () => {
    try {
      const projectTitles = portfolioData.projects.map(project => project.title).join(', ');
      await Share.share({
        message: `Check out my portfolio on InternBridge! Projects: ${projectTitles}`,
        title: 'My Portfolio',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share portfolio');
    }
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    Alert.alert('Download', 'Portfolio download feature coming soon!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>Professional Projects Showcase</Text>
        
        {/* Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-social" size={16} color={Colors.primary} />
            <Text style={styles.headerButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDownload}>
            <Ionicons name="download" size={16} color={Colors.primary} />
            <Text style={styles.headerButtonText}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Projects List */}
      <View style={styles.content}>
        {portfolioData.projects.map((project, index) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectIndex}>
                <Text style={styles.projectIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.projectTitleSection}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectDuration}>
                  {formatDate(project.startDate)} -{' '}
                  {project.isCurrent ? 'Present' : formatDate(project.endDate!)}
                </Text>
              </View>
            </View>

            <Text style={styles.projectDescription}>{project.description}</Text>

            {/* Technologies */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Technologies Used</Text>
              <View style={styles.technologies}>
                {project.technologies.map((tech, techIndex) => (
                  <View key={techIndex} style={styles.techTag}>
                    <Text style={styles.techText}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Links */}
            {(project.projectUrl || project.githubUrl) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Links</Text>
                <View style={styles.links}>
                  {project.projectUrl && (
                    <TouchableOpacity style={styles.linkButton}>
                      <Ionicons name="globe" size={16} color={Colors.white} />
                      <Text style={styles.linkButtonText}>Live Demo</Text>
                    </TouchableOpacity>
                  )}
                  {project.githubUrl && (
                    <TouchableOpacity style={[styles.linkButton, styles.githubButton]}>
                      <Ionicons name="logo-github" size={16} color={Colors.white} />
                      <Text style={styles.linkButtonText}>Source Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Generated by InternBridge - Bridging rural youth to opportunities
        </Text>
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
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.lightPrimary,
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  headerButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectIndex: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectIndexText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  projectTitleSection: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  projectDuration: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  technologies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techTag: {
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  techText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  links: {
    flexDirection: 'row',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  githubButton: {
    backgroundColor: Colors.dark,
  },
  linkButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    backgroundColor: Colors.dark,
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.white,
    textAlign: 'center',
  },
});

export default PortfolioPreviewScreen;