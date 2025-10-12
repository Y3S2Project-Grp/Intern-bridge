import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { ScreenNames } from '../../constants/ScreenNames';
import { useAuth } from '../../hooks/useAuth';
import { ApplicationService } from '../../services/applicationService';
import { EligibilityService } from '../../services/eligibilityService';
import { Internship } from '../../services/internshipService';

interface Props {
  navigation: any;
  route: any;
}

const InternshipDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { internship }: { internship: Internship } = route.params;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'requirements' | 'organization'>('details');

  useEffect(() => {
    checkApplicationStatus();
  }, [internship, user]);

  const checkApplicationStatus = async () => {
    if (!user) return;

    try {
      const existingApplication = await ApplicationService.getUserApplicationForInternship(
        user.id,
        internship.id!
      );
      setHasApplied(!!existingApplication);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to apply for this internship');
      navigation.navigate(ScreenNames.LOGIN);
      return;
    }

    try {
      setApplying(true);

      // Create application
      await ApplicationService.applyForInternship({
        userId: user.id,
        internshipId: internship.id!,
        organizationId: internship.organizationId,
        coverLetter: `I am excited to apply for the ${internship.title} position at ${internship.organizationName}. I believe my skills and experience make me a strong candidate for this opportunity.`,
      });

      setHasApplied(true);
      Alert.alert('Application Submitted', 'Your application has been submitted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleCheckEligibility = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to check your eligibility');
      return;
    }

    try {
      setCheckingEligibility(true);
      
      const criteria: any = {
        requiredSkills: internship.requirements || [],
        preferredSkills: internship.skills || [],
        location: internship.location,
      };

      const result = await EligibilityService.checkEligibility(
        user.id,
        internship.id!,
        user,
        criteria
      );

      setEligibilityResult(result);
      
      if (result.isEligible) {
        Alert.alert(
          'Eligibility Check', 
          `You are ${result.score}% eligible for this internship!`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Apply Now', onPress: handleApply },
          ]
        );
      } else {
        Alert.alert(
          'Eligibility Check', 
          `You are ${result.score}% eligible. Consider improving your skills before applying.`,
          [
            { text: 'View Skills Gap', onPress: () => navigation.navigate(ScreenNames.SKILL_GAP, { 
              missingSkills: result.missingSkills,
              suggestions: result.suggestions 
            })},
            { text: 'Apply Anyway', onPress: handleApply, style: 'default' },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check eligibility');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this internship: ${internship.title} at ${internship.organizationName}. ${internship.description}`,
        title: internship.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share internship');
    }
  };

  const handleSave = () => {
    // Implement save functionality
    Alert.alert('Coming Soon', 'Save functionality will be available soon');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isApplicationDeadlineNear = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const isApplicationDeadlinePassed = (deadline: Date) => {
    return new Date(deadline) < new Date();
  };

  const formatStipend = (stipend?: number) => {
    if (!stipend) return 'Unpaid';
    return `$${stipend.toLocaleString()} per month`;
  };

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
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{internship.title}</Text>
            <Text style={styles.organization}>{internship.organizationName}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color={Colors.gray} />
                <Text style={styles.metaText}>{internship.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color={Colors.gray} />
                <Text style={styles.metaText}>{internship.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="business" size={16} color={Colors.gray} />
                <Text style={styles.metaText}>{internship.type}</Text>
              </View>
            </View>

            {isApplicationDeadlineNear(internship.applicationDeadline) && !isApplicationDeadlinePassed(internship.applicationDeadline) && (
              <View style={styles.urgentBadge}>
                <Ionicons name="flash" size={14} color={Colors.white} />
                <Text style={styles.urgentText}>
                  Apply by {formatDate(internship.applicationDeadline)}
                </Text>
              </View>
            )}

            {isApplicationDeadlinePassed(internship.applicationDeadline) && (
              <View style={styles.expiredBadge}>
                <Ionicons name="close-circle" size={14} color={Colors.white} />
                <Text style={styles.expiredText}>Application Closed</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="share-social" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
              <Ionicons name="bookmark" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stipend */}
        {internship.stipend && (
          <View style={styles.stipendCard}>
            <Ionicons name="cash" size={24} color={Colors.success} />
            <View style={styles.stipendInfo}>
              <Text style={styles.stipendAmount}>{formatStipend(internship.stipend)}</Text>
              <Text style={styles.stipendLabel}>Monthly Stipend</Text>
            </View>
          </View>
        )}

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requirements' && styles.tabActive]}
            onPress={() => setActiveTab('requirements')}
          >
            <Text style={[styles.tabText, activeTab === 'requirements' && styles.tabTextActive]}>
              Requirements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'organization' && styles.tabActive]}
            onPress={() => setActiveTab('organization')}
          >
            <Text style={[styles.tabText, activeTab === 'organization' && styles.tabTextActive]}>
              Organization
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'details' && (
            <View>
              <Text style={styles.sectionTitle}>About the Internship</Text>
              <Text style={styles.description}>{internship.description}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                  <Text style={styles.detailCardTitle}>Start Date</Text>
                  <Text style={styles.detailCardValue}>
                    {formatDate(internship.startDate)}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <Ionicons name="hourglass" size={20} color={Colors.primary} />
                  <Text style={styles.detailCardTitle}>Duration</Text>
                  <Text style={styles.detailCardValue}>{internship.duration}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Ionicons name="business" size={20} color={Colors.primary} />
                  <Text style={styles.detailCardTitle}>Work Type</Text>
                  <Text style={styles.detailCardValue}>
                    {internship.type.charAt(0).toUpperCase() + internship.type.slice(1)}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <Ionicons name="document" size={20} color={Colors.primary} />
                  <Text style={styles.detailCardTitle}>Category</Text>
                  <Text style={styles.detailCardValue}>{internship.category}</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'requirements' && (
            <View>
              <Text style={styles.sectionTitle}>Requirements & Skills</Text>
              
              {internship.requirements && internship.requirements.length > 0 && (
                <View style={styles.requirementsSection}>
                  <Text style={styles.subsectionTitle}>Required Skills</Text>
                  <View style={styles.skillsContainer}>
                    {internship.requirements.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {internship.skills && internship.skills.length > 0 && (
                <View style={styles.requirementsSection}>
                  <Text style={styles.subsectionTitle}>Preferred Skills</Text>
                  <View style={styles.skillsContainer}>
                    {internship.skills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {eligibilityResult && (
                <View style={styles.eligibilitySection}>
                  <Text style={styles.subsectionTitle}>Your Eligibility</Text>
                  <View style={styles.eligibilityScore}>
                    <Text style={styles.eligibilityPercentage}>
                      {eligibilityResult.score}%
                    </Text>
                    <Text style={styles.eligibilityLabel}>Match Score</Text>
                  </View>
                  {eligibilityResult.missingSkills.length > 0 && (
                    <View style={styles.missingSkills}>
                      <Text style={styles.missingSkillsTitle}>Skills to improve:</Text>
                      {eligibilityResult.missingSkills.map((skill: string, index: number) => (
                        <Text key={index} style={styles.missingSkill}>• {skill}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'organization' && (
            <View>
              <Text style={styles.sectionTitle}>About {internship.organizationName}</Text>
              <Text style={styles.description}>
                {internship.organizationName} is looking for talented interns to join their team. 
                This internship provides an excellent opportunity to gain real-world experience 
                and develop professional skills in a supportive environment.
              </Text>
              
              <View style={styles.organizationInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="business" size={16} color={Colors.gray} />
                  <Text style={styles.infoText}>Verified Organization</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={16} color={Colors.gray} />
                  <Text style={styles.infoText}>{internship.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color={Colors.gray} />
                  <Text style={styles.infoText}>Active since 2023</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Apply Button */}
      {!isApplicationDeadlinePassed(internship.applicationDeadline) && (
        <View style={styles.footer}>
          {!hasApplied ? (
            <View style={styles.applyActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, checkingEligibility && styles.buttonDisabled]}
                onPress={handleCheckEligibility}
                disabled={checkingEligibility}
              >
                {checkingEligibility ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={styles.secondaryButtonText}>Check Eligibility</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, applying && styles.buttonDisabled]}
                onPress={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Apply Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.appliedStatus}>
              <Ionicons name="checkmark-done" size={20} color={Colors.success} />
              <Text style={styles.appliedText}>Application Submitted</Text>
            </View>
          )}
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  organization: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 4,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgentText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expiredText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  stipendCard: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stipendInfo: {
    marginLeft: 12,
  },
  stipendAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: 4,
  },
  stipendLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.dark,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailCard: {
    width: '50%',
    padding: 8,
  },
  detailCardInner: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailCardTitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    textAlign: 'center',
  },
  requirementsSection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
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
  eligibilitySection: {
    backgroundColor: Colors.lightBackground,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  eligibilityScore: {
    alignItems: 'center',
    marginBottom: 16,
  },
  eligibilityPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  eligibilityLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  missingSkills: {
    marginTop: 8,
  },
  missingSkillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  missingSkill: {
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 4,
    marginLeft: 8,
  },
  organizationInfo: {
    backgroundColor: Colors.lightBackground,
    padding: 16,
    borderRadius: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 8,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  applyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  appliedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.lightSuccess,
    borderRadius: 8,
  },
  appliedText: {
    color: Colors.success,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default InternshipDetailsScreen;