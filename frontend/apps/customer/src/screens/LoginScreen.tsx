import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthHero,
  AuthApiError,
  AuthCancelledError,
  Button,
  Card,
  DEFAULT_PHONE_COUNTRY,
  PhoneNumberInput,
  authenticateWithBackend,
  borderRadius,
  colors,
  isValidInternationalPhoneNumber,
  toInternationalPhoneNumber,
  sendPhoneCode,
  signInWithFacebook,
  signInWithGoogle,
  spacing,
  typography,
} from '@datxe/shared';

const googleLogo = require('../../assets/1._ng_nh_p/google.png');
const facebookLogo = require('../../assets/1._ng_nh_p/facebook.png');

type SignInMethod = 'phone' | 'google' | 'facebook' | null;

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [busy, setBusy] = useState<SignInMethod>(null);
  const [error, setError] = useState('');

  const continueWithPhone = async () => {
    if (!isValidInternationalPhoneNumber(phone, country)) {
      setError(`Vui lòng nhập số điện thoại ${country.name} hợp lệ.`);
      return;
    }
    setBusy('phone');
    setError('');
    try {
      const internationalPhone = toInternationalPhoneNumber(phone, country);
      await sendPhoneCode(internationalPhone);
      router.push({ pathname: '/(auth)/otp-verify', params: { phone: internationalPhone } } as never);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  const continueWithSocial = async (method: Exclude<SignInMethod, 'phone' | null>) => {
    setBusy(method);
    setError('');
    try {
      const user = method === 'google' ? await signInWithGoogle() : await signInWithFacebook();
      if (!user.phoneNumber) {
        router.replace('/(auth)/add-phone-number' as never);
        return;
      }
      try {
        const profile = await authenticateWithBackend('customer', user);
        if (profile.role !== 'CUSTOMER') {
          throw new AuthApiError('Tài khoản này không phải tài khoản khách hàng.', 'ROLE_MISMATCH');
        }
        if (!profile.phoneNumber) {
          router.replace('/(auth)/add-phone-number' as never);
          return;
        }
        router.replace('/(main)/home' as never);
      } catch (cause) {
        if (isAccountNotFound(cause)) {
          router.replace('/(auth)/register' as never);
          return;
        }
        throw cause;
      }
    } catch (cause) {
      if (!(cause instanceof AuthCancelledError)) setError(getErrorMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <AuthHero
            brandLabel="DriveMate"
            icon="directions-car"
            subtitle="Đặt chuyến an tâm, về nhà an toàn."
            title="Đăng nhập"
          />

          <Card style={styles.formCard}>
            <PhoneNumberInput
              country={country}
              disabled={busy !== null}
              label="Số điện thoại"
              onChangeText={(value) => {
                setPhone(value);
                setError('');
              }}
              onSelectCountry={(value) => {
                setCountry(value);
                setPhone((current) => current.slice(0, value.maxLength));
                setError('');
              }}
              value={phone}
            />
            <Text style={styles.helperText}>Chúng tôi sẽ gửi mã xác thực OTP qua SMS.</Text>
            {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
            <Button
              disabled={busy !== null && busy !== 'phone'}
              icon="arrow-forward"
              label="Tiếp tục bằng số điện thoại"
              loading={busy === 'phone'}
              loadingLabel="Đang gửi mã OTP..."
              onPress={continueWithPhone}
              style={styles.phoneButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialButton
              disabled={busy !== null}
              icon={googleLogo}
              label="Tiếp tục với Google"
              loading={busy === 'google'}
              onPress={() => void continueWithSocial('google')}
            />
            <SocialButton
              disabled={busy !== null}
              icon={facebookLogo}
              label="Tiếp tục với Facebook"
              loading={busy === 'facebook'}
              onPress={() => void continueWithSocial('facebook')}
            />
          </Card>

          <Text style={styles.terms}>
            Tiếp tục nghĩa là bạn đồng ý với{' '}
            <Text
              accessibilityRole="link"
              onPress={() => router.push('/terms-of-service' as never)}
              style={styles.termsLink}
            >
              Điều khoản dịch vụ
            </Text>{' '}
            và{' '}
            <Text
              accessibilityRole="link"
              onPress={() => router.push('/privacy-policy' as never)}
              style={styles.termsLink}
            >
              Chính sách bảo mật
            </Text>{' '}
            của DriveMate.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialButton({
  disabled,
  icon,
  label,
  loading,
  onPress,
}: {
  disabled: boolean;
  icon: number;
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.socialButton, disabled && styles.disabledButton]}
    >
      <Image source={icon} style={styles.socialIcon} />
      <Text style={styles.socialLabel}>{loading ? 'Đang kết nối...' : label}</Text>
    </Pressable>
  );
}

function isAccountNotFound(error: unknown): boolean {
  return error instanceof AuthApiError && error.code === 'ACCOUNT_NOT_FOUND';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) return error.message;
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('too-many-requests')) return 'Bạn đã yêu cầu OTP quá nhiều lần. Hãy thử lại sau.';
  if (code.includes('invalid-phone-number')) return 'Số điện thoại không hợp lệ.';
  if (code.includes('account-exists-with-different-credential')) return 'Email này đã được dùng với phương thức đăng nhập khác.';
  return error instanceof Error ? error.message : 'Không thể đăng nhập lúc này. Vui lòng thử lại.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.margin, paddingVertical: spacing.spaceXl },
  formCard: { width: '100%', maxWidth: spacing.formMaxWidth, gap: spacing.spaceMd, padding: spacing.spaceMd },
  helperText: { ...typography.labelSm, color: colors.onSurfaceVariant, marginTop: -spacing.spaceSm },
  errorText: { ...typography.bodyMd, color: colors.error },
  phoneButton: { marginTop: spacing.spaceXs },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, marginVertical: spacing.spaceXs },
  dividerLine: { height: 1, flex: 1, backgroundColor: colors.outlineVariant },
  dividerLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  socialButton: { minHeight: 52, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.xl, backgroundColor: colors.surfaceContainerLowest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceSm, paddingHorizontal: spacing.spaceMd },
  disabledButton: { opacity: 0.6 },
  socialIcon: { width: 20, height: 20, resizeMode: 'contain' },
  socialLabel: { ...typography.labelMd, color: colors.onSurface },
  terms: { ...typography.labelSm, color: colors.onSurfaceVariant, textAlign: 'center', maxWidth: spacing.formMaxWidth, marginTop: spacing.spaceLg, paddingHorizontal: spacing.spaceSm },
  termsLink: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '600' },
});
