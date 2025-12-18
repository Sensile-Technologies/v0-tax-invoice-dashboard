import 'react-native-gesture-handler'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'
import { Ionicons } from '@expo/vector-icons'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import LoginScreen from './src/screens/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import CreateInvoiceScreen from './src/screens/CreateInvoiceScreen'
import InvoicesScreen from './src/screens/InvoicesScreen'
import SalesScreen from './src/screens/SalesScreen'
import ProductsScreen from './src/screens/ProductsScreen'
import { colors } from './src/utils/theme'
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native'

const Stack = createNativeStackNavigator()
const Drawer = createDrawerNavigator()

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth()
  
  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.username || user?.name || 'User'}</Text>
        <Text style={styles.userBranch}>{user?.branch_name || 'Branch'}</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.drawerFooter}>
        <DrawerItem
          label="Logout"
          icon={({ size }) => (
            <Ionicons name="log-out-outline" size={size} color={colors.danger} />
          )}
          labelStyle={{ color: colors.danger }}
          onPress={logout}
        />
      </View>
    </DrawerContentScrollView>
  )
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: colors.navBackground,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerActiveBackgroundColor: colors.primary + '15',
        drawerLabelStyle: {
          marginLeft: -10,
          fontSize: 15,
        },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.toggleDrawer()}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ focused, size }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={focused ? colors.primary : colors.text} 
            />
          ),
        }}
      />
      <Drawer.Screen 
        name="Sales" 
        component={SalesScreen}
        options={{
          title: 'Sales',
          drawerIcon: ({ focused, size }) => (
            <Ionicons 
              name={focused ? 'cart' : 'cart-outline'} 
              size={size} 
              color={focused ? colors.primary : colors.text} 
            />
          ),
        }}
      />
      <Drawer.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{
          title: 'Products',
          drawerIcon: ({ focused, size }) => (
            <Ionicons 
              name={focused ? 'cube' : 'cube-outline'} 
              size={size} 
              color={focused ? colors.primary : colors.text} 
            />
          ),
        }}
      />
      <Drawer.Screen 
        name="Invoices" 
        component={InvoicesScreen}
        options={{
          title: 'Invoices',
          drawerIcon: ({ focused, size }) => (
            <Ionicons 
              name={focused ? 'receipt' : 'receipt-outline'} 
              size={size} 
              color={focused ? colors.primary : colors.text} 
            />
          ),
        }}
      />
    </Drawer.Navigator>
  )
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainDrawer} />
          <Stack.Screen
            name="CreateInvoice"
            component={CreateInvoiceScreen}
            options={{
              headerShown: true,
              title: 'New Invoice',
              headerStyle: { backgroundColor: colors.navBackground },
              headerTintColor: '#fff',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.navBackground,
    marginBottom: 10,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userBranch: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  drawerFooter: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  menuButton: {
    marginLeft: 16,
    padding: 4,
  },
})
