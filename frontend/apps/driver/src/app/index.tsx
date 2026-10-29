import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthApiError, authenticateWithBackend, colors } from '@datxe/shared';

export default function Index() {
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (!user) {
        setDestination('/(auth)/login');
        return;
      }

      void authenticateWithBackend('driver', user)
        .then((profile) => {
          setDestination(profile.role === 'DRIVER' ? '/(tabs)/home' : '/(auth)/login');
        })
        .catch((error: unknown) => {
          if (error instanceof AuthApiError && error.code === 'ACCOUNT_NOT_FOUND') {
            setDestination('/(auth)/register');
          } else {
            setDestination('/(auth)/login');
          }
        });
    });
    return unsubscribe;
  }, []);

  if (destination) return <Redirect href={destination as never} />;
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' } });
