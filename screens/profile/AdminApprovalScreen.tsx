import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from '../../hooks/useAuth';
import { ProfileService } from '../../services/profileService';

interface Organization {
  id: string;
  name: string;
  email: string;
  description?: string;
  website?: string;
  phone?: string;
  location?: string;
  industry?: string;
  createdAt: Date;
  documents?: string[]; // Verification documents
}

interface Props {
  navigation: any;
}

const AdminApprovalScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchQuery]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const pendingOrgs = await ProfileService.getPendingOrganizations();
      setOrganizations(pendingOrgs as Organization[]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load organizations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrganizations = () => {
    if (!searchQuery.trim()) {
      setFilteredOrganizations(organizations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = organizations.filter(org =>
      org.name.toLowerCase().includes(query) ||
      org.email.toLowerCase().includes(query) ||
      org.industry?.toLowerCase().includes(query) ||
      org.location?.toLowerCase().includes(query)
    );
    setFilteredOrganizations(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrganizations();
    setRefreshing(false);
  };

  const handleApprove = async (orgId: string) => {
    try {
      setApprovingId(orgId);
      await ProfileService.approveOrganization(orgId);
      Alert.alert('Success', 'Organization approved successfully');
      await loadOrganizations(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to approve organization');
      console.error(error);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (orgId: string) => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      setRejectingId(orgId);
      await ProfileService.rejectOrganization(orgId);
      Alert.alert('Success', 'Organization rejected');
      setShowRejectionModal(false);
      setRejectionReason('');
      await loadOrganizations(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to reject organization');
      console.error(error);
    } finally {
      setRejectingId(null);
      setSelectedOrg(null);
    }
  };

  const openRejectionModal = (org: Organization) => {
    setSelectedOrg(org);
    setShowRejectionModal(true);
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedOrg(null);
    setRejectionReason('');
  };

  const getDaysSinceCreation = (createdAt: Date) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading organizations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search organizations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{organizations.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredOrganizations.length}</Text>
          <Text style={styles.statLabel}>Showing</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {filteredOrganizations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>No Pending Organizations</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No organizations match your search' : 'All organizations have been reviewed'}
            </Text>
          </View>
        ) : (
          filteredOrganizations.map((org) => (
            <View key={org.id} style={styles.orgCard}>
              <View style={styles.orgHeader}>
                <View style={styles.orgInfo}>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <Text style={styles.orgEmail}>{org.email}</Text>
                  <Text style={styles.orgMeta}>
                    Submitted {getDaysSinceCreation(org.createdAt)} days ago
                  </Text>
                </View>
                
                <View style={styles.orgActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(org.id)}
                    disabled={approvingId === org.id}
                  >
                    {approvingId === org.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color={Colors.white} />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => openRejectionModal(org)}
                    disabled={rejectingId === org.id}
                  >
                    <Ionicons name="close" size={16} color={Colors.white} />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {org.description && (
                <Text style={styles.orgDescription} numberOfLines={2}>
                  {org.description}
                </Text>
              )}

              <View style={styles.detailsGrid}>
  {org.industry && (
    <View style={styles.detailItem}>
      <Ionicons name="business" size={14} color={Colors.gray} />
      <Text style={styles.detailText}>{org.industry}</Text>
    </View>
  )}
  
  {org.location && (
    <View style={styles.detailItem}>
      <Ionicons name="location" size={14} color={Colors.gray} />
      <Text style={styles.detailText}>{org.location}</Text>
    </View>
  )}
  
  {org.website && (
    <View style={styles.detailItem}>
      <Ionicons name="globe" size={14} color={Colors.gray} />
      <Text style={styles.detailText}>{org.website}</Text>
    </View>
  )}
  
  {org.phone && (
    <View style={styles.detailItem}>
      <Ionicons name="call" size={14} color={Colors.gray} />
      <Text style={styles.detailText}>{org.phone}</Text>
    </View>
  )}
</View>

              {org.documents && org.documents.length > 0 && (
                <View style={styles.documentsSection}>
                  <Text style={styles.documentsTitle}>Verification Documents:</Text>
                  {org.documents.map((doc, index) => (
                    <TouchableOpacity key={index} style={styles.documentItem}>
                      <Ionicons name="document-text" size={16} color={Colors.primary} />
                      <Text style={styles.documentText}>Document {index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Rejection Modal */}
      <Modal
        visible={showRejectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRejectionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reject Organization</Text>
              <TouchableOpacity onPress={closeRejectionModal}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Why are you rejecting {selectedOrg?.name}?
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Provide a reason for rejection..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRejectionModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmRejectButton]}
                onPress={() => selectedOrg && handleReject(selectedOrg.id)}
                disabled={!rejectionReason.trim() || rejectingId === selectedOrg?.id}
              >
                {rejectingId === selectedOrg?.id ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.confirmRejectButtonText}>Confirm Rejection</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.background,
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
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
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
  },
  orgCard: {
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
  orgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orgInfo: {
    flex: 1,
    marginRight: 12,
  },
  orgName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  orgEmail: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  orgMeta: {
    fontSize: 12,
    color: Colors.gray,
  },
  orgActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  approveButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  rejectButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  orgDescription: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
    marginBottom: 12,
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
    color: Colors.dark,
    marginLeft: 4,
  },
  documentsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.lightBackground,
    borderRadius: 6,
    marginBottom: 4,
  },
  documentText: {
    fontSize: 12,
    color: Colors.primary,
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
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
    color: Colors.dark,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
  },
  cancelButtonText: {
    color: Colors.dark,
    fontWeight: '600',
  },
  confirmRejectButton: {
    backgroundColor: Colors.error,
  },
  confirmRejectButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default AdminApprovalScreen;