import 'react-native-gesture-handler'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import UpdateChecker from './src/components/UpdateChecker'
import LoginScreen from './src/screens/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import CreateInvoiceScreen from './src/screens/CreateInvoiceScreen'
import InvoicesScreen from './src/screens/InvoicesScreen'
import SalesScreen from './src/screens/SalesScreen'
import ProductsScreen from './src/screens/ProductsScreen'
import { colors } from './src/utils/theme'
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function LogoTitle() {
  return (
    <View style={styles.headerLogo}>
      <Image
        source={require('./assets/icon.png')}
        style={styles.headerLogoImage}
        resizeMode="contain"
      />
      <Text style={styles.headerLogoText}>Flow360</Text>
    </View>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.navBackground,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerTitle: () => <LogoTitle />,
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8e8e93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home'
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Sales') {
            iconName = focused ? 'cart' : 'cart-outline'
          } else if (route.name === 'Products') {
            iconName = focused ? 'cube' : 'cube-outline'
          } else if (route.name === 'Invoices') {
            iconName = focused ? 'receipt' : 'receipt-outline'
          }
          
          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Sales" 
        component={SalesScreen}
        options={{ title: 'Sales' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />
      <Tab.Screen 
        name="Invoices" 
        component={InvoicesScreen}
        options={{ title: 'Invoices' }}
      />
    </Tab.Navigator>
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
          <Stack.Screen name="Main" component={MainTabs} />
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
    <UpdateChecker>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </UpdateChecker>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoImage: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
})
