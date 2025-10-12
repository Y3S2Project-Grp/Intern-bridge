import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
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
import { ApplicationService } from '../../services/applicationService';
import { Internship, InternshipFilter, InternshipService } from '../../services/internshipService';

interface Props {
  navigation: any;
  route: any;
}

const InternshipListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<InternshipFilter>({
    category: '',
    type: '',
    location: '',
    skills: [],
    minStipend: 0,
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
  ];

  const types = ['full-time', 'part-time', 'remote', 'hybrid'];
  const locations = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Remote', 'Other'];

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async (loadMore: boolean = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
      }

      const result = await InternshipService.getInternships(filters, 10);
      if (loadMore) {
        setInternships(prev => [...prev, ...result.internships]);
      } else {
        setInternships(result.internships);
      }
      setHasMore(result.internships.length === 10); // Assuming page size of 10
    } catch (error) {
      Alert.alert('Error', 'Failed to load internships');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInternships();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const searchResults = await InternshipService.searchInternships(searchQuery, filters);
      setInternships(searchResults);
    } catch (error) {
      Alert.alert('Error', 'Failed to search internships');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId: string) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to apply for internships');
      return;
    }

    try {
      setApplyingId(internshipId);
      
      // Check if already applied
      const existingApplication = await ApplicationService.getUserApplicationForInternship(
        user.id,
        internshipId
      );

      if (existingApplication) {
        Alert.alert('Already Applied', 'You have already applied for this internship');
        return;
      }

      // Create application
      await ApplicationService.applyForInternship({
        userId: user.id,
        internshipId,
        organizationId: internships.find(i => i.id === internshipId)?.organizationId || '',
        coverLetter: `I am excited to apply for this internship opportunity. I believe my skills and experience make me a strong candidate.`,
      });

      Alert.alert('Success', 'Application submitted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to apply for internship');
    } finally {
      setApplyingId(null);
    }
  };

  const handleFilterChange = (key: keyof InternshipFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      type: '',
      location: '',
      skills: [],
      minStipend: 0,
    });
    setSearchQuery('');
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    await loadInternships(true);
  };

  const formatStipend = (stipend?: number) => {
    if (!stipend) return 'Unpaid';
    return `$${stipend.toLocaleString()}/month`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isApplicationDeadlineNear = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isApplicationDeadlinePassed = (deadline: Date) => {
    return new Date(deadline) < new Date();
  };

  const filteredInternships = internships.filter(internship => {
    if (isApplicationDeadlinePassed(internship.applicationDeadline)) {
      return false;
    }
    return true;
  });

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Internships</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterOptions}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      filters.category === category && styles.filterOptionActive,
                    ]}
                    onPress={() => handleFilterChange('category', 
                      filters.category === category ? '' : category
                    )}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.category === category && styles.filterOptionTextActive,
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.filterOptions}>
                {types.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filters.type === type && styles.filterOptionActive,
                    ]}
                    onPress={() => handleFilterChange('type', 
                      filters.type === type ? '' : type
                    )}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.type === type && styles.filterOptionTextActive,
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Location</Text>
              <View style={styles.filterOptions}>
                {locations.map(location => (
                  <TouchableOpacity
                    key={location}
                    style={[
                      styles.filterOption,
                      filters.location === location && styles.filterOptionActive,
                    ]}
                    onPress={() => handleFilterChange('location', 
                      filters.location === location ? '' : location
                    )}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.location === location && styles.filterOptionTextActive,
                    ]}>
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stipend Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Stipend</Text>
              <View style={styles.stipendInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.stipendInputField}
                  placeholder="0"
                  keyboardType="numeric"
                  value={filters.minStipend ? filters.minStipend.toString() : ''}
                  onChangeText={(text) => handleFilterChange('minStipend', 
                    text ? parseInt(text) : 0
                  )}
                />
                <Text style={styles.stipendLabel}>/month</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => {
                setShowFilters(false);
                loadInternships();
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const InternshipCard = ({ internship }: { internship: Internship }) => (
    <TouchableOpacity
      style={styles.internshipCard}
      onPress={() => navigation.navigate(ScreenNames.INTERNSHIP_DETAILS, { internship })}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.internshipTitle}>{internship.title}</Text>
          <Text style={styles.organization}>{internship.organizationName}</Text>
        </View>
        {isApplicationDeadlineNear(internship.applicationDeadline) && (
          <View style={styles.urgentBadge}>
            <Ionicons name="flash" size={12} color={Colors.white} />
            <Text style={styles.urgentText}>Deadline Soon</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={14} color={Colors.gray} />
          <Text style={styles.detailText}>{internship.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={14} color={Colors.gray} />
          <Text style={styles.detailText}>{internship.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="business" size={14} color={Colors.gray} />
          <Text style={styles.detailText}>{internship.type}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash" size={14} color={Colors.gray} />
          <Text style={styles.detailText}>{formatStipend(internship.stipend)}</Text>
        </View>
      </View>

      {/* Skills */}
      {internship.skills && internship.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {internship.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {internship.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{internship.skills.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {internship.description}
      </Text>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.deadline}>
          Apply by {formatDate(internship.applicationDeadline)}
        </Text>
        <TouchableOpacity
          style={[
            styles.applyButton,
            applyingId === internship.id && styles.applyButtonDisabled,
          ]}
          onPress={() => handleApply(internship.id!)}
          disabled={applyingId === internship.id}
        >
          {applyingId === internship.id ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="send" size={16} color={Colors.white} />
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && internships.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading internships...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search internships, skills, companies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(filters.category || filters.type || filters.location || filters.minStipend > 0) && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.category && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>{filters.category}</Text>
                <TouchableOpacity onPress={() => handleFilterChange('category', '')}>
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
            {filters.type && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>{filters.type}</Text>
                <TouchableOpacity onPress={() => handleFilterChange('type', '')}>
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
            {filters.location && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>{filters.location}</Text>
                <TouchableOpacity onPress={() => handleFilterChange('location', '')}>
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
            {filters.minStipend > 0 && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>${filters.minStipend}+</Text>
                <TouchableOpacity onPress={() => handleFilterChange('minStipend', 0)}>
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Internships List */}
      <FlatList
        data={filteredInternships}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => <InternshipCard internship={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>No Internships Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || Object.values(filters).some(val => val) 
                ? 'Try adjusting your search or filters'
                : 'No internships available at the moment'
              }
            </Text>
            {(searchQuery || Object.values(filters).some(val => val)) && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search & Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadMoreText}>Loading more internships...</Text>
            </View>
          ) : internships.length > 0 ? (
            <View style={styles.endOfList}>
              <Text style={styles.endOfListText}>No more internships to show</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />

      <FilterModal />
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.dark,
  },
  filterButton: {
    padding: 8,
  },
  activeFilters: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
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
    lineHeight: 20,
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: Colors.white,
    fontWeight: '500',
  },
  internshipCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  internshipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  organization: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgentText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 10,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    color: Colors.gray,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  applyButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.gray,
  },
  endOfList: {
    padding: 16,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
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
  filterContent: {
    maxHeight: 400,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.dark,
  },
  filterOptionTextActive: {
    color: Colors.white,
  },
  stipendInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: Colors.gray,
  },
  stipendInputField: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  stipendLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.dark,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default InternshipListScreen;