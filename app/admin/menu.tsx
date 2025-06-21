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
  getRestaurantMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories
} from '@/lib/admin-database';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  ChefHatIcon, 
  DollarSignIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react-native';

const isWeb = Platform.OS === 'web';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
  is_popular: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  prep_time_minutes: number;
  category?: { name: string; };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function MenuManagement() {
  const { restaurantId } = useAdminAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    is_popular: false,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    prep_time_minutes: 15,
  });

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    if (!restaurantId) return;

    try {
      const [itemsData, categoriesData] = await Promise.all([
        getRestaurantMenuItems(restaurantId),
        getCategories()
      ]);
      
      setMenuItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!restaurantId || !formData.name || !formData.price || !formData.category_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        prep_time_minutes: Number(formData.prep_time_minutes),
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
      } else {
        await createMenuItem(restaurantId, itemData);
      }

      await fetchData();
      handleCloseModal();
      Alert.alert('Success', `Menu item ${editingItem ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving menu item:', error);
      Alert.alert('Error', 'Failed to save menu item');
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenuItem(itemId);
              await fetchData();
              Alert.alert('Success', 'Menu item deleted successfully');
            } catch (error) {
              console.error('Error deleting menu item:', error);
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category_id: item.category_id,
      is_available: item.is_available,
      is_popular: item.is_popular,
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_gluten_free: item.is_gluten_free,
      prep_time_minutes: item.prep_time_minutes,
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
      is_popular: false,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      prep_time_minutes: 15,
    });
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { is_available: !item.is_available });
      await fetchData();
    } catch (error) {
      console.error('Error updating item availability:', error);
      Alert.alert('Error', 'Failed to update item availability');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ChefHatIcon size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Menu Management</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <PlusIcon size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <SearchIcon size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilters}
        >
          <TouchableOpacity
            style={[
              styles.categoryFilter,
              selectedCategory === 'all' && styles.categoryFilterActive
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === 'all' && styles.categoryFilterTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryFilter,
                selectedCategory === category.id && styles.categoryFilterActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryFilterText,
                selectedCategory === category.id && styles.categoryFilterTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.menuItemCard}>
            <View style={styles.menuItemHeader}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemCategory}>
                  {item.category?.name}
                </Text>
              </View>
              
              <View style={styles.menuItemActions}>
                <Switch
                  value={item.is_available}
                  onValueChange={() => toggleItemAvailability(item)}
                  trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                  thumbColor={item.is_available ? '#16a34a' : '#9ca3af'}
                />
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditItem(item)}
                >
                  <EditIcon size={16} color="#3b82f6" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteItem(item.id, item.name)}
                >
                  <TrashIcon size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.menuItemDescription}>
              {item.description}
            </Text>

            <View style={styles.menuItemDetails}>
              <View style={styles.priceContainer}>
                <DollarSignIcon size={16} color="#059669" />
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              </View>
              
              <View style={styles.prepTimeContainer}>
                <ClockIcon size={16} color="#64748b" />
                <Text style={styles.prepTime}>{item.prep_time_minutes} min</Text>
              </View>
            </View>

            <View style={styles.menuItemTags}>
              {item.is_popular && (
                <View style={[styles.tag, styles.popularTag]}>
                  <Text style={styles.tagText}>Popular</Text>
                </View>
              )}
              {item.is_vegetarian && (
                <View style={[styles.tag, styles.vegetarianTag]}>
                  <Text style={styles.tagText}>Vegetarian</Text>
                </View>
              )}
              {item.is_vegan && (
                <View style={[styles.tag, styles.veganTag]}>
                  <Text style={styles.tagText}>Vegan</Text>
                </View>
              )}
              {item.is_gluten_free && (
                <View style={[styles.tag, styles.glutenFreeTag]}>
                  <Text style={styles.tagText}>Gluten Free</Text>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No menu items found</Text>
            <Text style={styles.emptySubtext}>
              Start by adding your first menu item
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter item name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textarea}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter item description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Prep Time (min)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.prep_time_minutes.toString()}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    prep_time_minutes: parseInt(text) || 15 
                  }))}
                  placeholder="15"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categorySelectorItem,
                        formData.category_id === category.id && styles.categorySelectorItemActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category_id: category.id }))}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text style={[
                        styles.categorySelectorText,
                        formData.category_id === category.id && styles.categorySelectorTextActive
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Toggles */}
            <View style={styles.togglesContainer}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Available</Text>
                <Switch
                  value={formData.is_available}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_available: value }))}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Popular Item</Text>
                <Switch
                  value={formData.is_popular}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_popular: value }))}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Vegetarian</Text>
                <Switch
                  value={formData.is_vegetarian}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_vegetarian: value }))}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Vegan</Text>
                <Switch
                  value={formData.is_vegan}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_vegan: value }))}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Gluten Free</Text>
                <Switch
                  value={formData.is_gluten_free}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_gluten_free: value }))}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveItem}
            >
              <Text style={styles.saveButtonText}>
                {editingItem ? 'Update Item' : 'Add Item'}
              </Text>
            </TouchableOpacity>
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

  // Search and Filters
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  categoryFilters: {
    flexDirection: 'row',
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    gap: 4,
  },
  categoryFilterActive: {
    backgroundColor: '#3b82f6',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: '#ffffff',
  },
  categoryIcon: {
    fontSize: 14,
  },

  // List
  listContainer: {
    padding: 16,
  },
  menuItemCard: {
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
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuItemCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  menuItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  menuItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  prepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prepTime: {
    fontSize: 14,
    color: '#64748b',
  },
  menuItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularTag: {
    backgroundColor: '#fef3c7',
  },
  vegetarianTag: {
    backgroundColor: '#dcfce7',
  },
  veganTag: {
    backgroundColor: '#dbeafe',
  },
  glutenFreeTag: {
    backgroundColor: '#fce7f3',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cancelText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  textarea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categorySelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 4,
  },
  categorySelectorItemActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categorySelectorText: {
    fontSize: 14,
    color: '#64748b',
  },
  categorySelectorTextActive: {
    color: '#ffffff',
  },
  togglesContainer: {
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 