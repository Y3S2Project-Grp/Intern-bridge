import React, { useRef } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ViewShot from 'react-native-view-shot';

interface CVPreviewScreenProps {
  route: any;
  navigation: any;
}

export const CVPreviewScreen: React.FC<CVPreviewScreenProps> = ({ route, navigation }) => {
  const { cvData } = route.params;
  const viewShotRef = useRef<any>();

  const handleShareCV = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        
        const shareOptions = {
          title: 'Share CV',
          message: 'Check out my CV',
          url: uri,
          type: 'image/jpeg',
        };

        await Share.share(
          Platform.OS === 'ios' 
            ? shareOptions 
            : { message: 'Check out my CV', url: uri }
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share CV');
    }
  };

  const handleDownloadCV = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        Alert.alert('Success', 'CV has been saved to your device');
        // In real app, you would use a library to save the image to the device
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download CV');
    }
  };

  const handlePrintCV = () => {
    Alert.alert('Print', 'Print functionality would be implemented here');
  };

  const formatDate = (date: string) => {
    if (!date) return 'Present';
    return date;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ViewShot 
          ref={viewShotRef} 
          options={{ format: 'jpg', quality: 0.9 }}
          style={styles.cvContainer}
        >
          {/* CV Header */}
          <View style={styles.header}>
            <Text style={styles.name}>{cvData.personalInfo.fullName}</Text>
            <Text style={styles.title}>Software Developer</Text>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>{cvData.personalInfo.email}</Text>
              <Text style={styles.contactItem}>• {cvData.personalInfo.phone}</Text>
              <Text style={styles.contactItem}>• {cvData.personalInfo.location}</Text>
            </View>
            
            {(cvData.personalInfo.linkedIn || cvData.personalInfo.portfolio) && (
              <View style={styles.links}>
                {cvData.personalInfo.linkedIn && (
                  <Text style={styles.link}>LinkedIn: {cvData.personalInfo.linkedIn}</Text>
                )}
                {cvData.personalInfo.portfolio && (
                  <Text style={styles.link}>Portfolio: {cvData.personalInfo.portfolio}</Text>
                )}
              </View>
            )}
          </View>

          {/* Professional Summary */}
          {cvData.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
              <Text style={styles.summaryText}>{cvData.summary}</Text>
            </View>
          )}

          {/* Skills */}
          {cvData.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SKILLS</Text>
              <View style={styles.skillsGrid}>
                {cvData.skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Experience */}
          {cvData.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXPERIENCE</Text>
              {cvData.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.position}>{exp.position}</Text>
                    <Text style={styles.dates}>
                      {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.company}>{exp.company}</Text>
                  {exp.description && (
                    <Text style={styles.description}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {cvData.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EDUCATION</Text>
              {cvData.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <Text style={styles.degree}>{edu.degree} in {edu.field}</Text>
                    <Text style={styles.dates}>
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.institution}>{edu.institution}</Text>
                  {edu.gpa && (
                    <Text style={styles.gpa}>GPA: {edu.gpa}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {cvData.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROJECTS</Text>
              {cvData.projects.map((proj, index) => (
                <View key={index} style={styles.projectItem}>
                  <Text style={styles.projectName}>{proj.name}</Text>
                  {proj.description && (
                    <Text style={styles.projectDescription}>{proj.description}</Text>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <View style={styles.technologies}>
                      <Text style={styles.technologiesLabel}>Technologies: </Text>
                      <Text style={styles.technologiesText}>
                        {proj.technologies.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ViewShot>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareCV}>
            <Text style={styles.buttonText}>Share CV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadCV}>
            <Text style={styles.buttonText}>Download CV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.printButton} onPress={handlePrintCV}>
            <Text style={styles.buttonText}>Print CV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.editButtonText}>Edit CV</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  cvContainer: {
    backgroundColor: 'white',
    padding: 24,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#2c3e50',
    paddingBottom: 16,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  contactItem: {
    fontSize: 14,
    color: '#34495e',
    marginHorizontal: 8,
  },
  links: {
    alignItems: 'center',
  },
  link: {
    fontSize: 12,
    color: '#3498db',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    paddingBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#34495e',
    textAlign: 'justify',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  experienceItem: {
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  dates: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  company: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#34495e',
    lineHeight: 18,
  },
  educationItem: {
    marginBottom: 16,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  degree: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  institution: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
    marginBottom: 2,
  },
  gpa: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  projectItem: {
    marginBottom: 16,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 12,
    color: '#34495e',
    lineHeight: 18,
    marginBottom: 4,
  },
  technologies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  technologiesLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  technologiesText: {
    fontSize: 12,
    color: '#34495e',
  },
  actionButtons: {
    padding: 16,
  },
  shareButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  downloadButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  printButton: {
    backgroundColor: '#e67e22',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f8c8d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: 'bold',
  },
});