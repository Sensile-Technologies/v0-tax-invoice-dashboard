import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

interface Product {
  id: string
  item_cd: string
  item_nm: string
  item_cls_cd: string
  pkg_unit_cd: string
  qty_unit_cd: string
  unit_price: number
  stock_quantity: number
  status: string
}

export default function ProductsScreen() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const branchId = user?.branch_id || user?.vendor_id

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get<{ products: Product[] }>(
        `/api/mobile/products?branch_id=${branchId}`
      )
      setProducts(response.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [branchId])

  useEffect(() => {
    if (branchId) {
      fetchProducts()
    }
  }, [branchId, fetchProducts])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase()
    return (
      product.item_nm?.toLowerCase().includes(query) ||
      product.item_cd?.toLowerCase().includes(query)
    )
  })

  function formatCurrency(amount: number) {
    return `KES ${(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
  }

  function getStockStatusColor(quantity: number) {
    if (quantity <= 0) return '#dc2626'
    if (quantity < 10) return '#f59e0b'
    return '#16a34a'
  }

  function renderProductItem({ item }: { item: Product }) {
    const stockColor = getStockStatusColor(item.stock_quantity || 0)
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.item_nm}</Text>
            <Text style={styles.productCode}>{item.item_cd}</Text>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: stockColor + '20' }]}>
            <Text style={[styles.stockText, { color: stockColor }]}>
              {item.stock_quantity || 0} in stock
            </Text>
          </View>
        </View>
        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit Price</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.unit_price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{item.item_cls_cd || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, 
              item.status === 'active' ? styles.statusActive : styles.statusInactive
            ]}>
              <Text style={[styles.statusText,
                item.status === 'active' ? styles.statusTextActive : styles.statusTextInactive
              ]}>
                {item.status || 'active'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.count}>{products.length} items</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products match your search' : 'No products found'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  productName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  productCode: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  stockBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  stockText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  productDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: '#16a34a',
  },
  statusTextInactive: {
    color: '#dc2626',
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
})
