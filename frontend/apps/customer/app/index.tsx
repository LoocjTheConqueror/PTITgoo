import { getAuth, onAuthStateChanged, type User } from '@react-native-firebase/auth';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthApiError, authenticateWithBackend, colors } from '@datxe/shared';

export default function Index() {
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user: User | null) => {
      if (!user) {
        setDestination('/(auth)/login');
        return;
      }
      if (!user.phoneNumber) {
        setDestination('/(auth)/add-phone-number');
        return;
      }

      void authenticateWithBackend('customer', user)
        .then((profile) => {
          if (profile.role !== 'CUSTOMER') {
            setDestination('/(auth)/login');
          } else {
            setDestination(profile.phoneNumber ? '/(main)/home' : '/(auth)/add-phone-number');
          }
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

const styles = StyleSheet.create({ loading: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' } });
