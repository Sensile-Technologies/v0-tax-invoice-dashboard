import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { Product, InvoiceLineItem } from '../types'
import { useAuth } from '../context/AuthContext'

export default function CreateInvoiceScreen({ navigation }: any) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [productModalVisible, setProductModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [user?.branch_id])

  async function fetchProducts() {
    try {
      if (!user?.branch_id) {
        setProducts([
          { id: '1', name: 'Diesel (AGO)', price: 180, unit: 'Litre' },
          { id: '2', name: 'Super Petrol (PMS)', price: 195, unit: 'Litre' },
          { id: '3', name: 'Kerosene (DPK)', price: 165, unit: 'Litre' },
        ])
        setLoading(false)
        return
      }
      
      const data = await api.get<{ products: any[] }>(`/api/mobile/products?branch_id=${user.branch_id}`)
      const branchProducts = (data?.products || []).map((p: any) => ({
        id: p.id,
        name: p.item_nm || p.name,
        price: parseFloat(p.unit_price) || parseFloat(p.dflt_prc) || 0,
        unit: p.qty_unit_cd || 'Unit',
        category: p.item_cls_cd,
      }))
      
      if (branchProducts.length > 0) {
        setProducts(branchProducts)
      } else {
        setProducts([
          { id: '1', name: 'Diesel (AGO)', price: 180, unit: 'Litre' },
          { id: '2', name: 'Super Petrol (PMS)', price: 195, unit: 'Litre' },
          { id: '3', name: 'Kerosene (DPK)', price: 165, unit: 'Litre' },
        ])
      }
    } catch (error) {
      console.log('Error fetching products:', error)
      setProducts([
        { id: '1', name: 'Diesel (AGO)', price: 180, unit: 'Litre' },
        { id: '2', name: 'Super Petrol (PMS)', price: 195, unit: 'Litre' },
        { id: '3', name: 'Kerosene (DPK)', price: 165, unit: 'Litre' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function addProduct(product: Product) {
    const existing = lineItems.find((item) => item.product_id === product.id)
    if (existing) {
      setLineItems(
        lineItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
            : item
        )
      )
    } else {
      setLineItems([
        ...lineItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          total: product.price,
        },
      ])
    }
    setProductModalVisible(false)
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setLineItems(lineItems.filter((item) => item.product_id !== productId))
    } else {
      setLineItems(
        lineItems.map((item) =>
          item.product_id === productId
            ? { ...item, quantity, total: quantity * item.unit_price }
            : item
        )
      )
    }
  }

  function removeItem(productId: string) {
    setLineItems(lineItems.filter((item) => item.product_id !== productId))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.16
  const total = subtotal + tax

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  async function handleSubmit() {
    if (lineItems.length === 0) {
      Alert.alert('Error', 'Please add at least one product')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/mobile/invoices', {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: lineItems,
        subtotal,
        tax,
        total,
        branch_id: user?.branch_id,
        user_id: user?.id,
      })
      Alert.alert('Success', 'Invoice created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setProductModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {lineItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No products added yet</Text>
              <Text style={styles.emptyHint}>Tap "Add" to add products</Text>
            </View>
          ) : (
            lineItems.map((item) => (
              <View key={item.product_id} style={styles.lineItem}>
                <View style={styles.lineItemInfo}>
                  <Text style={styles.productName}>{item.product_name}</Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.unit_price)} each
                  </Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.product_id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.product_id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.lineTotal}>{formatCurrency(item.total)}</Text>
                <TouchableOpacity
                  onPress={() => removeItem(item.product_id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT (16%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || lineItems.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Invoice</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={productModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Product</Text>
            <TouchableOpacity onPress={() => setProductModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productItem}
                onPress={() => addProduct(item)}
              >
                <View>
                  <Text style={styles.productItemName}>{item.name}</Text>
                  <Text style={styles.productItemUnit}>{item.unit}</Text>
                </View>
                <Text style={styles.productItemPrice}>
                  {formatCurrency(item.price)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineItemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  productPrice: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  lineTotal: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    minWidth: 80,
    textAlign: 'right',
  },
  removeButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totals: {
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  totalValue: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  grandTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  grandTotalLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  searchInput: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    fontSize: fontSize.md,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  productItemName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  productItemUnit: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  productItemPrice: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
})
