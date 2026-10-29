import { OtpVerificationScreen } from '@datxe/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function CustomerOtpVerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  useEffect(() => {
    if (!phone) router.replace('/(auth)/login' as never);
  }, [phone, router]);
  if (!phone) return null;

  return (
    <OtpVerificationScreen
      phone={phone}
      onHome={() => router.replace('/(main)/home' as never)}
      onLogin={() => router.replace('/(auth)/login' as never)}
      onRegister={(verifiedPhone) => router.replace({ pathname: '/(auth)/register', params: { phone: verifiedPhone } } as never)}
      role="customer"
    />
  );
}
