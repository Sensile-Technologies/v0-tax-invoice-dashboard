import React, { useEffect, useState } from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import * as Updates from 'expo-updates'
import { colors } from '../utils/theme'
import { Ionicons } from '@expo/vector-icons'

export default function UpdateChecker({ children }: { children: React.ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')

  useEffect(() => {
    checkForUpdates()
  }, [])

  async function checkForUpdates() {
    if (__DEV__) {
      return
    }

    try {
      const update = await Updates.checkForUpdateAsync()
      
      if (update.isAvailable) {
        setUpdateAvailable(true)
      }
    } catch (error) {
      console.log('Error checking for updates:', error)
    }
  }

  async function handleUpdate() {
    setIsDownloading(true)
    setDownloadProgress('Downloading update...')

    try {
      await Updates.fetchUpdateAsync()
      setDownloadProgress('Update downloaded. Restarting...')
      
      setTimeout(async () => {
        await Updates.reloadAsync()
      }, 1000)
    } catch (error) {
      console.log('Error downloading update:', error)
      setIsDownloading(false)
      setDownloadProgress('')
    }
  }

  function handleLater() {
    setUpdateAvailable(false)
  }

  return (
    <>
      {children}
      
      <Modal
        visible={updateAvailable}
        transparent
        animationType="fade"
        onRequestClose={handleLater}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-download" size={48} color={colors.primary} />
            </View>
            
            <Text style={styles.title}>Update Available</Text>
            <Text style={styles.message}>
              A new version of Flow360 is available with improvements and bug fixes.
            </Text>

            {isDownloading ? (
              <View style={styles.downloadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.downloadText}>{downloadProgress}</Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={handleLater}
                >
                  <Text style={styles.laterButtonText}>Later</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdate}
                >
                  <Text style={styles.updateButtonText}>Update Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  laterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  downloadText: {
    fontSize: 14,
    color: colors.primary,
  },
})
