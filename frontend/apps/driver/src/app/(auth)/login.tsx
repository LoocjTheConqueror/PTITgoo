import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
  AuthApiError,
  AuthCancelledError,
  Button,
  Card,
  Input,
  authenticateWithBackend,
  borderRadius,
  colors,
  fontSize,
  isValidVietnamPhoneNumber,
  normalizeVietnamPhoneNumber,
  sendPhoneCode,
  signInWithFacebook,
  signInWithGoogle,
  spacing,
  typography,
} from '@datxe/shared';

const DRIVER_GREEN = '#007f36';

type SignInMethod = 'phone' | 'google' | 'facebook' | null;

export default function DriverLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState<SignInMethod>(null);
  const [error, setError] = useState('');

  const continueWithPhone = async () => {
    if (!isValidVietnamPhoneNumber(phone)) {
      setError('Vui lòng nhập số điện thoại Việt Nam hợp lệ.');
      return;
    }
    setBusy('phone');
    setError('');
    try {
      const normalizedPhone = normalizeVietnamPhoneNumber(phone);
      await sendPhoneCode(normalizedPhone);
      router.push({ pathname: '/(auth)/otp-verify', params: { phone: normalizedPhone } } as never);
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
      try {
        const profile = await authenticateWithBackend('driver', user);
        if (profile.role !== 'DRIVER') {
          throw new AuthApiError('Tài khoản này không phải tài khoản tài xế.', 'ROLE_MISMATCH');
        }
        router.replace('/(tabs)/home' as never);
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandIcon}>
            <MaterialIcons color={colors.onPrimary} name="local-taxi" size={fontSize.icon3xl} />
          </View>
          <Text style={styles.brandName}>DriveMate Tài Xế</Text>
          <Text style={styles.title}>Chào mừng đối tác</Text>
          <Text style={styles.subtitle}>Đăng nhập để nhận chuyến và bắt đầu hành trình.</Text>

          <Card style={styles.formCard}>
            <Input
              accessibilityLabel="Số điện thoại"
              autoComplete="tel"
              editable={busy === null}
              icon="call"
              keyboardType="phone-pad"
              label="Số điện thoại"
              maxLength={16}
              onChangeText={(value) => {
                setPhone(value);
                setError('');
              }}
              placeholder="0912 345 678"
              value={phone}
            />
            <Text style={styles.helperText}>Xác thực bằng mã OTP gửi qua SMS.</Text>
            {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
            <Button
              disabled={busy !== null && busy !== 'phone'}
              icon="arrow-forward"
              label="Tiếp tục bằng số điện thoại"
              loading={busy === 'phone'}
              loadingLabel="Đang gửi mã OTP..."
              onPress={continueWithPhone}
              style={styles.phoneButton}
              textStyle={styles.phoneButtonText}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>
            <SocialButton
              disabled={busy !== null}
              label="Tiếp tục với Google"
              loading={busy === 'google'}
              mark="G"
              onPress={() => void continueWithSocial('google')}
            />
            <SocialButton
              disabled={busy !== null}
              label="Tiếp tục với Facebook"
              loading={busy === 'facebook'}
              mark="f"
              onPress={() => void continueWithSocial('facebook')}
            />
          </Card>

          <View style={styles.footer}>
            <MaterialIcons color={colors.outline} name="verified-user" size={fontSize.iconSm} />
            <Text style={styles.footerText}>Bảo mật tài khoản bằng Firebase Authentication.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialButton({
  disabled,
  label,
  loading,
  mark,
  onPress,
}: {
  disabled: boolean;
  label: string;
  loading: boolean;
  mark: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.socialButton, disabled && styles.disabledButton]}>
      <Text style={[styles.socialMark, mark === 'f' && styles.facebookMark]}>{mark}</Text>
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.margin, paddingVertical: spacing.spaceXl },
  brandIcon: { width: 64, height: 64, alignSelf: 'center', borderRadius: borderRadius.xl, backgroundColor: DRIVER_GREEN, alignItems: 'center', justifyContent: 'center' },
  brandName: { ...typography.labelLg, color: DRIVER_GREEN, textAlign: 'center', marginTop: spacing.spaceSm },
  title: { ...typography.headlineXlMobile, color: colors.onSurface, textAlign: 'center', marginTop: spacing.spaceXl },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.spaceXs, marginBottom: spacing.spaceLg },
  formCard: { gap: spacing.spaceMd, padding: spacing.spaceMd },
  helperText: { ...typography.labelSm, color: colors.onSurfaceVariant, marginTop: -spacing.spaceSm },
  errorText: { ...typography.bodyMd, color: colors.error },
  phoneButton: { marginTop: spacing.spaceXs, backgroundColor: DRIVER_GREEN },
  phoneButtonText: { color: colors.onPrimary },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, marginVertical: spacing.spaceXs },
  dividerLine: { height: 1, flex: 1, backgroundColor: colors.outlineVariant },
  dividerLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  socialButton: { minHeight: 52, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.xl, backgroundColor: colors.surfaceContainerLowest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceSm, paddingHorizontal: spacing.spaceMd },
  disabledButton: { opacity: 0.6 },
  socialMark: { width: 22, textAlign: 'center', fontSize: 20, lineHeight: 24, color: '#4285F4', fontWeight: '700' },
  facebookMark: { color: '#1877F2' },
  socialLabel: { ...typography.labelMd, color: colors.onSurface },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceXs, marginTop: spacing.spaceLg },
  footerText: { ...typography.labelSm, color: colors.onSurfaceVariant },
});
