import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  RefreshControl
} from 'react-native';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getOrderRequests,
  approveOrderRequest,
  rejectOrderRequest,
  completeOrderRequest,
  getRestaurantTablesAdmin
} from '@/lib/admin-database';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  MessageSquareIcon,
  TableIcon,
  UtensilsIcon
} from 'lucide-react-native';

const isWeb = Platform.OS === 'web';

interface OrderRequest {
  id: string;
  customer_name: string;
  customer_phone?: string;
  order_type: 'dine_in' | 'takeaway';
  table_id?: string;
  requested_time: string;
  guest_count: number;
  special_requests?: string;
  status: 'pending' | 'approved' | 'rejected' | 'seated' | 'completed';
  created_at: string;
  table?: { table_number: number; };
}

interface RestaurantTable {
  id: string;
  table_number: number;
  is_active: boolean;
}

export default function OrderRequests() {
  const { restaurantId } = useAdminAuth();
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OrderRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [restaurantId, selectedStatus]);

  const fetchData = async () => {
    if (!restaurantId) return;

    try {
      const [requestsData, tablesData] = await Promise.all([
        getOrderRequests(restaurantId, selectedStatus === 'all' ? undefined : selectedStatus),
        getRestaurantTablesAdmin(restaurantId)
      ]);
      
      setRequests(requestsData);
      setTables(tablesData.filter(table => table.is_active));
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApproveRequest = async (request: OrderRequest) => {
    if (request.order_type === 'dine_in') {
      // Show table selection modal for dine-in requests
      setSelectedRequest(request);
      setShowTableModal(true);
    } else {
      // Direct approval for takeaway
      await approveRequest(request.id);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      // In a real app, you'd get the actual admin user ID
      await approveOrderRequest(requestId, 'admin-user-id');
      await fetchData();
      Alert.alert('Success', 'Request approved successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  const handleRejectRequest = (request: OrderRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      await rejectOrderRequest(selectedRequest.id, rejectionReason);
      await fetchData();
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      Alert.alert('Success', 'Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      await completeOrderRequest(requestId);
      await fetchData();
      Alert.alert('Success', 'Request marked as completed');
    } catch (error) {
      console.error('Error completing request:', error);
      Alert.alert('Error', 'Failed to complete request');
    }
  };

  const approveWithTable = async () => {
    if (!selectedRequest || !selectedTableId) {
      Alert.alert('Error', 'Please select a table');
      return;
    }

    try {
      await approveOrderRequest(selectedRequest.id, 'admin-user-id');
      await fetchData();
      setShowTableModal(false);
      setSelectedRequest(null);
      setSelectedTableId('');
      Alert.alert('Success', 'Request approved with table assignment');
    } catch (error) {
      console.error('Error approving with table:', error);
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#3b82f6';
      case 'rejected':
        return '#ef4444';
      case 'seated':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'pending':
        return '#fef3c7';
      case 'approved':
        return '#dbeafe';
      case 'rejected':
        return '#fee2e2';
      case 'seated':
        return '#d1fae5';
      case 'completed':
        return '#f3f4f6';
      default:
        return '#f3f4f6';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  const statusOptions = [
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
    { key: 'seated', label: 'Seated', count: requests.filter(r => r.status === 'seated').length },
    { key: 'completed', label: 'Completed', count: requests.filter(r => r.status === 'completed').length },
    { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
    { key: 'all', label: 'All', count: requests.length },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BellIcon size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Order Requests</Text>
        </View>
        
        <Text style={styles.headerSubtitle}>
          {requests.filter(r => r.status === 'pending').length} pending requests
        </Text>
      </View>

      {/* Status Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.statusFilter,
              selectedStatus === option.key && styles.statusFilterActive
            ]}
            onPress={() => setSelectedStatus(option.key)}
          >
            <Text style={[
              styles.statusFilterText,
              selectedStatus === option.key && styles.statusFilterTextActive
            ]}>
              {option.label}
            </Text>
            <View style={[
              styles.statusCount,
              selectedStatus === option.key && styles.statusCountActive
            ]}>
              <Text style={[
                styles.statusCountText,
                selectedStatus === option.key && styles.statusCountTextActive
              ]}>
                {option.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Requests List */}
      <ScrollView 
        style={styles.requestsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <Text style={styles.customerName}>{request.customer_name}</Text>
                <View style={styles.requestType}>
                  {request.order_type === 'dine_in' ? (
                    <UtensilsIcon size={16} color="#3b82f6" />
                  ) : (
                    <TableIcon size={16} color="#10b981" />
                  )}
                  <Text style={styles.requestTypeText}>
                    {request.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusBackground(request.status) }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) }
                ]}>
                  {request.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.requestDetails}>
              {request.order_type === 'dine_in' && (
                <View style={styles.detailRow}>
                  <UsersIcon size={16} color="#64748b" />
                  <Text style={styles.detailText}>
                    {request.guest_count} {request.guest_count === 1 ? 'guest' : 'guests'}
                  </Text>
                  {request.table && (
                    <Text style={styles.tableInfo}>• Table {request.table.table_number}</Text>
                  )}
                </View>
              )}
              
              <View style={styles.detailRow}>
                <ClockIcon size={16} color="#64748b" />
                <Text style={styles.detailText}>
                  {new Date(request.created_at).toLocaleString()}
                </Text>
              </View>

              {request.customer_phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>📞 {request.customer_phone}</Text>
                </View>
              )}
            </View>

            {request.special_requests && (
              <View style={styles.specialRequests}>
                <MessageSquareIcon size={16} color="#64748b" />
                <Text style={styles.specialRequestsText}>
                  {request.special_requests}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveRequest(request)}
                >
                  <CheckCircleIcon size={16} color="#ffffff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectRequest(request)}
                >
                  <XCircleIcon size={16} color="#ffffff" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {request.status === 'approved' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteRequest(request.id)}
                >
                  <CheckCircleIcon size={16} color="#ffffff" />
                  <Text style={styles.completeButtonText}>Mark Completed</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {requests.length === 0 && (
          <View style={styles.emptyContainer}>
            <BellIcon size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No requests found</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === 'pending' 
                ? 'No pending requests at the moment'
                : `No ${selectedStatus} requests found`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Request</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this request:
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter rejection reason..."
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmRejectRequest}
              >
                <Text style={styles.modalConfirmText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Table Selection Modal */}
      <Modal
        visible={showTableModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Table</Text>
            <Text style={styles.modalSubtitle}>
              Select a table for {selectedRequest?.customer_name}:
            </Text>
            
            <ScrollView style={styles.tableList}>
              {tables.map((table) => (
                <TouchableOpacity
                  key={table.id}
                  style={[
                    styles.tableOption,
                    selectedTableId === table.id && styles.tableOptionSelected
                  ]}
                  onPress={() => setSelectedTableId(table.id)}
                >
                  <TableIcon size={20} color={selectedTableId === table.id ? '#ffffff' : '#64748b'} />
                  <Text style={[
                    styles.tableOptionText,
                    selectedTableId === table.id && styles.tableOptionTextSelected
                  ]}>
                    Table {table.table_number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowTableModal(false);
                  setSelectedTableId('');
                  setSelectedRequest(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={approveWithTable}
              >
                <Text style={styles.modalConfirmText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Status Filters
  statusFilters: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    gap: 8,
  },
  statusFilterActive: {
    backgroundColor: '#3b82f6',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#ffffff',
  },
  statusCount: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  statusCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  statusCountTextActive: {
    color: '#ffffff',
  },

  // Requests List
  requestsList: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  requestType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestTypeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
  },
  tableInfo: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  specialRequests: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    marginBottom: 12,
  },
  specialRequestsText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 16,
  },
  tableList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  tableOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 8,
    gap: 8,
  },
  tableOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tableOptionText: {
    fontSize: 16,
    color: '#64748b',
  },
  tableOptionTextSelected: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
}); 