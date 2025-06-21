import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  Platform,
  FlatList
} from 'react-native';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getRestaurantTablesAdmin,
  createRestaurantTable,
  updateRestaurantTable,
  deleteRestaurantTable
} from '@/lib/admin-database';
import { 
  TableIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  QrCodeIcon,
  SettingsIcon
} from 'lucide-react-native';

interface RestaurantTable {
  id: string;
  table_number: number;
  is_active: boolean;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
}

export default function TableManagement() {
  const { restaurantId } = useAdminAuth();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [formData, setFormData] = useState({
    table_number: '',
    is_active: true,
  });

  useEffect(() => {
    fetchTables();
  }, [restaurantId]);

  const fetchTables = async () => {
    if (!restaurantId) return;

    try {
      const tablesData = await getRestaurantTablesAdmin(restaurantId);
      setTables(tablesData.sort((a, b) => a.table_number - b.table_number));
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTable = async () => {
    if (!restaurantId || !formData.table_number) {
      Alert.alert('Error', 'Please enter a table number');
      return;
    }

    const tableNumber = parseInt(formData.table_number);
    if (isNaN(tableNumber) || tableNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid table number');
      return;
    }

    // Check for duplicate table numbers
    const existingTable = tables.find(t => 
      t.table_number === tableNumber && 
      (!editingTable || t.id !== editingTable.id)
    );
    
    if (existingTable) {
      Alert.alert('Error', 'A table with this number already exists');
      return;
    }

    try {
      if (editingTable) {
        await updateRestaurantTable(editingTable.id, {
          table_number: tableNumber,
          is_active: formData.is_active,
        });
      } else {
        await createRestaurantTable(restaurantId, tableNumber);
      }

      await fetchTables();
      handleCloseModal();
      Alert.alert('Success', `Table ${editingTable ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving table:', error);
      Alert.alert('Error', 'Failed to save table');
    }
  };

  const handleDeleteTable = async (table: RestaurantTable) => {
    Alert.alert(
      'Delete Table',
      `Are you sure you want to delete Table ${table.table_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurantTable(table.id);
              await fetchTables();
              Alert.alert('Success', 'Table deleted successfully');
            } catch (error) {
              console.error('Error deleting table:', error);
              Alert.alert('Error', 'Failed to delete table');
            }
          },
        },
      ]
    );
  };

  const handleEditTable = (table: RestaurantTable) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number.toString(),
      is_active: table.is_active,
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTable(null);
    setFormData({
      table_number: '',
      is_active: true,
    });
  };

  const toggleTableStatus = async (table: RestaurantTable) => {
    try {
      await updateRestaurantTable(table.id, { is_active: !table.is_active });
      await fetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
      Alert.alert('Error', 'Failed to update table status');
    }
  };

  const generateQRCode = (table: RestaurantTable) => {
    Alert.alert(
      'Generate QR Code',
      `Generate QR code for Table ${table.table_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            // In a real app, you would generate a QR code URL
            Alert.alert('QR Code Generated', 'QR code has been generated for this table');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  const activeTables = tables.filter(t => t.is_active);
  const inactiveTables = tables.filter(t => !t.is_active);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TableIcon size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Table Management</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <PlusIcon size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Table</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tables.length}</Text>
          <Text style={styles.statLabel}>Total Tables</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeTables.length}</Text>
          <Text style={styles.statLabel}>Active Tables</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{inactiveTables.length}</Text>
          <Text style={styles.statLabel}>Inactive Tables</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {tables.filter(t => t.qr_code_url).length}
          </Text>
          <Text style={styles.statLabel}>With QR Codes</Text>
        </View>
      </View>

      {/* Tables Grid */}
      <ScrollView style={styles.tablesContainer}>
        {activeTables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tables</Text>
            <View style={styles.tablesGrid}>
              {activeTables.map((table) => (
                <View key={table.id} style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableNumber}>Table {table.table_number}</Text>
                    <View style={styles.tableActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => generateQRCode(table)}
                      >
                        <QrCodeIcon size={16} color="#3b82f6" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditTable(table)}
                      >
                        <EditIcon size={16} color="#64748b" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTable(table)}
                      >
                        <TrashIcon size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.tableStatus}>
                    <View style={[styles.statusDot, styles.activeDot]} />
                    <Text style={styles.statusText}>Available</Text>
                  </View>

                  <View style={styles.tableFooter}>
                    <Text style={styles.tableId}>#{table.id.slice(-8)}</Text>
                    <Switch
                      value={table.is_active}
                      onValueChange={() => toggleTableStatus(table)}
                      trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                      thumbColor={table.is_active ? '#16a34a' : '#9ca3af'}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {inactiveTables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inactive Tables</Text>
            <View style={styles.tablesGrid}>
              {inactiveTables.map((table) => (
                <View key={table.id} style={[styles.tableCard, styles.inactiveCard]}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableNumber, styles.inactiveText]}>
                      Table {table.table_number}
                    </Text>
                    <View style={styles.tableActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditTable(table)}
                      >
                        <EditIcon size={16} color="#64748b" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTable(table)}
                      >
                        <TrashIcon size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.tableStatus}>
                    <View style={[styles.statusDot, styles.inactiveDot]} />
                    <Text style={[styles.statusText, styles.inactiveText]}>Inactive</Text>
                  </View>

                  <View style={styles.tableFooter}>
                    <Text style={[styles.tableId, styles.inactiveText]}>
                      #{table.id.slice(-8)}
                    </Text>
                    <Switch
                      value={table.is_active}
                      onValueChange={() => toggleTableStatus(table)}
                      trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                      thumbColor={table.is_active ? '#16a34a' : '#9ca3af'}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {tables.length === 0 && (
          <View style={styles.emptyContainer}>
            <TableIcon size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No tables configured</Text>
            <Text style={styles.emptySubtext}>
              Add your first table to get started
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Add Table</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTable ? 'Edit Table' : 'Add New Table'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Table Number</Text>
              <TextInput
                style={styles.input}
                value={formData.table_number}
                onChangeText={(text) => setFormData(prev => ({ ...prev, table_number: text }))}
                placeholder="Enter table number"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Active</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
                trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                thumbColor={formData.is_active ? '#16a34a' : '#9ca3af'}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleSaveTable}
              >
                <Text style={styles.modalConfirmText}>
                  {editingTable ? 'Update' : 'Add Table'}
                </Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  // Tables
  tablesContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    width: Platform.OS === 'web' ? 200 : '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inactiveCard: {
    backgroundColor: '#f8fafc',
    opacity: 0.7,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  inactiveText: {
    color: '#94a3b8',
  },
  tableActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
  },
  tableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#10b981',
  },
  inactiveDot: {
    backgroundColor: '#94a3b8',
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
  },
  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableId: {
    fontSize: 12,
    color: '#94a3b8',
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#1e293b',
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
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
}); 