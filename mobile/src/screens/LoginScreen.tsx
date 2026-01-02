import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, fontSize, borderRadius } from '../utils/theme'

export default function LoginScreen() {
  const [attendantCode, setAttendantCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithCode } = useAuth()

  async function handleLogin() {
    if (!attendantCode.trim()) {
      Alert.alert('Error', 'Please enter your attendant code')
      return
    }

    if (!/^\d{4}$/.test(attendantCode.trim())) {
      Alert.alert('Error', 'Attendant code must be 4 digits')
      return
    }

    setLoading(true)
    try {
      await loginWithCode(attendantCode.trim())
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Flow360</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Attendant Code</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            value={attendantCode}
            onChangeText={(text) => setAttendantCode(text.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            editable={!loading}
            placeholderTextColor={colors.textLight}
            textAlign="center"
          />

          <Text style={styles.helpText}>
            Get your code from your supervisor
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appTitle: {
    fontSize: fontSize.xl || 24,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    color: colors.text,
    letterSpacing: 12,
  },
  helpText: {
    fontSize: fontSize.xs || 12,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
})
