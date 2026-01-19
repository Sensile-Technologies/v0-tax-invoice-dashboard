import React, { useRef, useState } from 'react';
import { StyleSheet, View, StatusBar, BackHandler, Platform, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const DASHBOARD_URL = 'https://flow360.replit.app';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }
  }, [canGoBack]);

  const handleLoadEnd = () => {
    setLoading(false);
    SplashScreen.hideAsync();
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent.description || 'Failed to load dashboard');
    setLoading(false);
    SplashScreen.hideAsync();
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={() => { setError(null); setLoading(true); }}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading Flow360...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: DASHBOARD_URL }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#dbeafe',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryText: {
    fontSize: 16,
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
});
