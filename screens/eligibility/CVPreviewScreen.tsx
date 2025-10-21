import React, { useRef, useState, useCallback } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  Modal
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface CVPreviewScreenProps {
  route: any;
  navigation: any;
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

type TemplateType = 'modern' | 'professional' | 'creative' | 'minimal' | 'elegant' | 'bold' | 'tech' | 'academic';

export const CVPreviewScreen: React.FC<CVPreviewScreenProps> = ({ route, navigation }) => {
  const { cvData } = route.params;
  const viewShotRef = useRef<any>();
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [showTemplates, setShowTemplates] = useState(false);

  // Template configurations
  const templates = {
    modern: {
      primary: '#3498db',
      secondary: '#2c3e50',
      accent: '#e74c3c',
      background: '#ffffff',
      text: '#2c3e50'
    },
    professional: {
      primary: '#34495e',
      secondary: '#7f8c8d',
      accent: '#e67e22',
      background: '#f8f9fa',
      text: '#2c3e50'
    },
    creative: {
      primary: '#9b59b6',
      secondary: '#8e44ad',
      accent: '#e74c3c',
      background: '#ffffff',
      text: '#2c3e50'
    },
    minimal: {
      primary: '#95a5a6',
      secondary: '#7f8c8d',
      accent: '#34495e',
      background: '#ffffff',
      text: '#2c3e50'
    },
    elegant: {
      primary: '#c0392b',
      secondary: '#e74c3c',
      accent: '#16a085',
      background: '#ffffff',
      text: '#2c3e50'
    },
    bold: {
      primary: '#e74c3c',
      secondary: '#c0392b',
      accent: '#3498db',
      background: '#ffffff',
      text: '#2c3e50'
    },
    tech: {
      primary: '#27ae60',
      secondary: '#2ecc71',
      accent: '#e67e22',
      background: '#ffffff',
      text: '#2c3e50'
    },
    academic: {
      primary: '#2980b9',
      secondary: '#3498db',
      accent: '#f39c12',
      background: '#ffffff',
      text: '#2c3e50'
    }
  };

  const currentTemplate = templates[selectedTemplate];

  // Request media library permissions
  const requestMediaPermission = useCallback(async () => {
    if (hasMediaPermission) return true;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media permission:', error);
      return false;
    }
  }, [hasMediaPermission]);

  const handleShareCV = useCallback(async (format: 'image' | 'pdf' | 'text' = 'image') => {
    try {
      setIsSharing(true);
      
      if (format === 'image' && viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: 'jpg',
          quality: 0.9,
        });
        
        await Share.share({
          title: `${cvData.personalInfo.fullName}'s CV`,
          message: `Check out ${cvData.personalInfo.fullName}'s CV`,
          url: Platform.OS === 'ios' ? uri : `file://${uri}`,
        });
      } else if (format === 'text') {
        const cvText = generateCVText(cvData);
        await Share.share({
          title: `${cvData.personalInfo.fullName}'s CV`,
          message: cvText,
        });
      } else if (format === 'pdf') {
        Alert.alert('PDF Export', 'PDF export would be implemented with a PDF generation library');
      }

      Alert.alert('Success', 'CV shared successfully!');
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share CV. Please try again.');
    } finally {
      setIsSharing(false);
    }
  }, [cvData.personalInfo.fullName, cvData]);

  const handleDownloadCV = useCallback(async (format: 'image' | 'pdf' = 'image') => {
    try {
      setIsDownloading(true);
      
      const hasPermission = await requestMediaPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant media library permissions to download the CV.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (format === 'image' && viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: 'jpg',
          quality: 1.0,
        });

        const fileName = `CV_${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('CVs', asset, false);

        Alert.alert(
          'Success', 
          'CV has been saved to your photo library!',
          [{ text: 'OK' }]
        );
      } else if (format === 'pdf') {
        Alert.alert('PDF Download', 'PDF download would be implemented with a PDF generation library');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download CV. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [cvData.personalInfo.fullName, requestMediaPermission]);

  const generateCVText = (data: CVData): string => {
    let text = `CV - ${data.personalInfo.fullName}\n`;
    text += '='.repeat(50) + '\n\n';
    
    // Contact Info
    text += 'CONTACT INFORMATION\n';
    text += 'Email: ' + data.personalInfo.email + '\n';
    text += 'Phone: ' + data.personalInfo.phone + '\n';
    text += 'Location: ' + data.personalInfo.location + '\n';
    if (data.personalInfo.linkedIn) text += 'LinkedIn: ' + data.personalInfo.linkedIn + '\n';
    if (data.personalInfo.portfolio) text += 'Portfolio: ' + data.personalInfo.portfolio + '\n';
    text += '\n';
    
    // Summary
    if (data.summary) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += data.summary + '\n\n';
    }
    
    // Skills
    if (data.skills.length > 0) {
      text += 'SKILLS\n';
      text += data.skills.join(', ') + '\n\n';
    }
    
    // Experience
    if (data.experience.length > 0) {
      text += 'EXPERIENCE\n';
      data.experience.forEach(exp => {
        text += `${exp.position} at ${exp.company}\n`;
        text += `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}\n`;
        text += exp.description + '\n\n';
      });
    }
    
    // Education
    if (data.education.length > 0) {
      text += 'EDUCATION\n';
      data.education.forEach(edu => {
        text += `${edu.degree} in ${edu.field}\n`;
        text += `${edu.institution}\n`;
        text += `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        text += '\n';
      });
    }
    
    return text;
  };

  const handlePrintCV = useCallback(() => {
    Alert.alert(
      'Print CV',
      'This would open print dialog in a real application.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Print', 
          onPress: () => {
            Alert.alert('Print', 'Print simulation completed!');
          }
        }
      ]
    );
  }, []);

  const formatDate = useCallback((date: string) => {
    if (!date.trim()) return 'Present';
    
    try {
      if (date.includes('/')) {
        const [month, year] = date.split('/');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(month) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${monthNames[monthIndex]} ${year}`;
        }
      }
      return date;
    } catch (error) {
      return date || 'Present';
    }
  }, []);

  const handleEditCV = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('YouthTabs', { screen: 'Home' });
  }, [navigation]);

  // Helper function to chunk array for better layout
  const chunkArray = useCallback((array: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }, []);

  const skillChunks = chunkArray(cvData.skills, 3);

  // Template selection modal
  const TemplateModal = () => (
    <Modal
      visible={showTemplates}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTemplates(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Template</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <Ionicons name="close" size={24} color={currentTemplate.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.templatesGrid}>
            {Object.entries(templates).map(([key, template]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.templateItem,
                  { 
                    backgroundColor: template.background,
                    borderColor: selectedTemplate === key ? template.primary : '#ddd',
                    borderWidth: selectedTemplate === key ? 3 : 1
                  }
                ]}
                onPress={() => {
                  setSelectedTemplate(key as TemplateType);
                  setShowTemplates(false);
                }}
              >
                <View style={[styles.templatePreview, { backgroundColor: template.primary }]} />
                <View style={[styles.templatePreview, { backgroundColor: template.secondary, width: '70%' }]} />
                <View style={[styles.templatePreview, { backgroundColor: template.accent, width: '40%' }]} />
                <Text style={[styles.templateName, { color: template.text }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Template Selection Button */}
        <TouchableOpacity 
          style={[styles.templateButton, { backgroundColor: currentTemplate.primary }]}
          onPress={() => setShowTemplates(true)}
        >
          <Ionicons name="color-palette" size={20} color="white" />
          <Text style={styles.templateButtonText}>Change Template</Text>
        </TouchableOpacity>

        {/* CV Preview */}
        <ViewShot 
          ref={viewShotRef} 
          options={{ format: 'jpg', quality: 0.9 }}
          style={[styles.cvContainer, { backgroundColor: currentTemplate.background }]}
        >
          {/* Header Section */}
          <View style={[styles.header, { borderBottomColor: currentTemplate.primary }]}>
            <Text style={[styles.name, { color: currentTemplate.text }]}>
              {cvData.personalInfo.fullName || 'Your Name'}
            </Text>
            <Text style={[styles.title, { color: currentTemplate.secondary }]}>
              Professional CV
            </Text>
            
            <View style={styles.contactInfo}>
              {cvData.personalInfo.email && (
                <Text style={[styles.contactItem, { color: currentTemplate.text }]}>
                  {cvData.personalInfo.email}
                </Text>
              )}
              {cvData.personalInfo.phone && (
                <Text style={[styles.contactItem, { color: currentTemplate.text }]}>
                  • {cvData.personalInfo.phone}
                </Text>
              )}
              {cvData.personalInfo.location && (
                <Text style={[styles.contactItem, { color: currentTemplate.text }]}>
                  • {cvData.personalInfo.location}
                </Text>
              )}
            </View>
            
            {(cvData.personalInfo.linkedIn || cvData.personalInfo.portfolio) && (
              <View style={styles.links}>
                {cvData.personalInfo.linkedIn && (
                  <Text style={[styles.link, { color: currentTemplate.accent }]}>
                    LinkedIn: {cvData.personalInfo.linkedIn}
                  </Text>
                )}
                {cvData.personalInfo.portfolio && (
                  <Text style={[styles.link, { color: currentTemplate.accent }]}>
                    Portfolio: {cvData.personalInfo.portfolio}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Professional Summary */}
          {cvData.summary && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTemplate.text, borderBottomColor: currentTemplate.primary }]}>
                PROFESSIONAL SUMMARY
              </Text>
              <View style={styles.sectionContent}>
                <Text style={[styles.summaryText, { color: currentTemplate.text }]}>{cvData.summary}</Text>
              </View>
            </View>
          )}

          {/* Skills Section */}
          {cvData.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTemplate.text, borderBottomColor: currentTemplate.primary }]}>
                SKILLS & EXPERTISE
              </Text>
              <View style={styles.sectionContent}>
                {skillChunks.map((chunk, chunkIndex) => (
                  <View key={chunkIndex} style={styles.skillsRow}>
                    {chunk.map((skill, index) => (
                      <View key={index} style={[styles.skillChip, { backgroundColor: currentTemplate.primary }]}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Experience Section */}
          {cvData.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTemplate.text, borderBottomColor: currentTemplate.primary }]}>
                PROFESSIONAL EXPERIENCE
              </Text>
              <View style={styles.sectionContent}>
                {cvData.experience.map((exp, index) => (
                  <View key={index} style={[styles.experienceItem, { borderBottomColor: currentTemplate.secondary + '20' }]}>
                    <View style={styles.experienceHeader}>
                      <View style={styles.experienceTitle}>
                        <Text style={[styles.position, { color: currentTemplate.text }]}>{exp.position}</Text>
                        <Text style={[styles.company, { color: currentTemplate.accent }]}>{exp.company}</Text>
                      </View>
                      <Text style={[styles.dates, { color: currentTemplate.secondary }]}>
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </Text>
                    </View>
                    {exp.description && (
                      <Text style={[styles.description, { color: currentTemplate.text }]}>{exp.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Education Section */}
          {cvData.education.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTemplate.text, borderBottomColor: currentTemplate.primary }]}>
                EDUCATION
              </Text>
              <View style={styles.sectionContent}>
                {cvData.education.map((edu, index) => (
                  <View key={index} style={[styles.educationItem, { borderBottomColor: currentTemplate.secondary + '20' }]}>
                    <View style={styles.educationHeader}>
                      <View style={styles.educationTitle}>
                        <Text style={[styles.degree, { color: currentTemplate.text }]}>
                          {edu.degree} {edu.field && `in ${edu.field}`}
                        </Text>
                        <Text style={[styles.institution, { color: currentTemplate.accent }]}>{edu.institution}</Text>
                      </View>
                      <Text style={[styles.dates, { color: currentTemplate.secondary }]}>
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </Text>
                    </View>
                    {edu.gpa && (
                      <Text style={[styles.gpa, { color: currentTemplate.primary }]}>GPA: {edu.gpa}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects Section */}
          {cvData.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTemplate.text, borderBottomColor: currentTemplate.primary }]}>
                PROJECTS
              </Text>
              <View style={styles.sectionContent}>
                {cvData.projects.map((proj, index) => (
                  <View key={index} style={[styles.projectItem, { borderBottomColor: currentTemplate.secondary + '20' }]}>
                    <Text style={[styles.projectName, { color: currentTemplate.text }]}>{proj.name}</Text>
                    {proj.description && (
                      <Text style={[styles.projectDescription, { color: currentTemplate.text }]}>{proj.description}</Text>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <View style={styles.technologies}>
                        <Text style={[styles.technologiesLabel, { color: currentTemplate.secondary }]}>
                          Technologies:{' '}
                        </Text>
                        <Text style={[styles.technologiesText, { color: currentTemplate.text }]}>
                          {proj.technologies.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: currentTemplate.secondary + '20' }]}>
            <Text style={[styles.footerText, { color: currentTemplate.secondary }]}>
              Generated with InternBridge CV Builder • Template: {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
            </Text>
          </View>
        </ViewShot>

        {/* Enhanced Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Share Options */}
          <View style={styles.buttonGroup}>
            <Text style={styles.buttonGroupTitle}>Share As</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.shareButton, isSharing && styles.buttonDisabled]} 
                onPress={() => handleShareCV('image')}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="image" size={16} color="white" />
                    <Text style={styles.buttonText}>Image</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.textButton]} 
                onPress={() => handleShareCV('text')}
              >
                <Ionicons name="document-text" size={16} color="white" />
                <Text style={styles.buttonText}>Text</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.pdfButton]} 
                onPress={() => handleShareCV('pdf')}
              >
                <Ionicons name="document" size={16} color="white" />
                <Text style={styles.buttonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Download Options */}
          <View style={styles.buttonGroup}>
            <Text style={styles.buttonGroupTitle}>Download As</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.downloadButton, isDownloading && styles.buttonDisabled]} 
                onPress={() => handleDownloadCV('image')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="download" size={16} color="white" />
                    <Text style={styles.buttonText}>Image</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.pdfButton]} 
                onPress={() => handleDownloadCV('pdf')}
              >
                <Ionicons name="download" size={16} color="white" />
                <Text style={styles.buttonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Other Actions */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.printButton]} 
              onPress={handlePrintCV}
            >
              <Ionicons name="print" size={16} color="white" />
              <Text style={styles.buttonText}>Print</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.editButton]} 
              onPress={handleEditCV}
            >
              <Ionicons name="create" size={16} color="#3498db" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.homeButton]} 
              onPress={handleGoHome}
            >
              <Ionicons name="home" size={16} color="#7f8c8d" />
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TemplateModal />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  templateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cvContainer: {
    padding: 24,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 800,
  },
  header: {
    borderBottomWidth: 3,
    paddingBottom: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  contactItem: {
    fontSize: 14,
    marginHorizontal: 6,
    fontWeight: '500',
  },
  links: {
    alignItems: 'center',
  },
  link: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 2,
    paddingBottom: 6,
    letterSpacing: 1,
  },
  sectionContent: {
    paddingLeft: 4,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  skillText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  experienceItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  experienceTitle: {
    flex: 1,
    marginRight: 12,
  },
  position: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    fontWeight: '600',
  },
  dates: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 120,
    textAlign: 'right',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'left',
  },
  educationItem: {
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  educationTitle: {
    flex: 1,
    marginRight: 12,
  },
  degree: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  institution: {
    fontSize: 14,
    fontWeight: '600',
  },
  gpa: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  projectItem: {
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
    textAlign: 'left',
  },
  technologies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  technologiesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  technologiesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  actionButtons: {
    padding: 16,
    gap: 16,
  },
  buttonGroup: {
    gap: 8,
  },
  buttonGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  shareButton: {
    backgroundColor: '#3498db',
  },
  textButton: {
    backgroundColor: '#9b59b6',
  },
  pdfButton: {
    backgroundColor: '#e74c3c',
  },
  downloadButton: {
    backgroundColor: '#27ae60',
  },
  printButton: {
    backgroundColor: '#e67e22',
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7f8c8d',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
  homeButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
    color: '#2c3e50',
  },
  templatesGrid: {
    maxHeight: 400,
  },
  templateItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  templatePreview: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
    width: '100%',
  },
  templateName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default CVPreviewScreen;