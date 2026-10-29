import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthBackButton } from './AuthBackButton';
import { AuthHero } from './AuthHero';
import { OtpCodeInput } from './OtpCodeInput';
import { ResendOtpButton } from './ResendOtpButton';
import { borderRadius, colors, spacing, typography } from '../theme/colors';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  AuthApiError,
  authenticateWithBackend,
  confirmPhoneCode,
  normalizeVietnamPhoneNumber,
  sendPhoneCode,
  type AuthRole,
} from './authService';

type Props = {
  role: AuthRole;
  phone: string;
  onLogin: () => void;
  onRegister: (phone: string) => void;
  onHome: () => void;
};

export function OtpVerificationScreen({ role, phone, onLogin, onRegister, onHome }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const verifiedUser = useRef<Awaited<ReturnType<typeof confirmPhoneCode>> | null>(null);

  useEffect(() => {
    verifiedUser.current = null;
  }, [phone]);

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await sendPhoneCode(phone);
      verifiedUser.current = null;
      setCode('');
      return true;
    } catch (cause) {
      setError(getErrorMessage(cause));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.replace(/\D/g, '').length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // A backend timeout must not consume the already verified OTP session.
      const user = verifiedUser.current ?? await confirmPhoneCode(code);
      verifiedUser.current = user;
      try {
        const profile = await authenticateWithBackend(role, user);
        if (profile.role !== role.toUpperCase()) {
          throw new AuthApiError('Tài khoản này không thuộc ứng dụng đang sử dụng.', 'ROLE_MISMATCH');
        }
        onHome();
      } catch (cause) {
        if (isAccountNotFound(cause)) {
          onRegister(normalizeVietnamPhoneNumber(phone));
          return;
        }
        throw cause;
      }
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  if (!phone) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <AuthBackButton onPress={onLogin} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <AuthHero
            detail={normalizeVietnamPhoneNumber(phone)}
            icon="sms"
            subtitle="Nhập mã xác thực 6 chữ số vừa được gửi qua SMS."
            title="Xác thực số điện thoại"
          />

          <Card style={styles.codeCard}>
            <Text style={styles.fieldLabel}>Mã OTP</Text>
            <OtpCodeInput
              autoFocus
              onChange={(value) => {
                setCode(value);
                setError('');
              }}
              value={code}
            />
            <Text style={styles.helperText}>Mã xác thực có hiệu lực trong thời gian ngắn.</Text>
          </Card>

          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}

          <Button
            disabled={loading}
            label="Xác nhận OTP"
            loading={loading}
            loadingLabel="Đang xác thực..."
            onPress={() => void handleVerify()}
            style={styles.submitButton}
          />

          <ResendOtpButton disabled={loading} onResend={handleResend} />

          <Pressable accessibilityRole="button" disabled={loading} onPress={onLogin} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Đổi số điện thoại</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function isAccountNotFound(error: unknown): boolean {
  return error instanceof AuthApiError && error.code === 'ACCOUNT_NOT_FOUND';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) return error.message;
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('invalid-verification-code')) return 'Mã OTP không đúng. Vui lòng thử lại.';
  if (code.includes('session-expired')) return 'Mã OTP đã hết hạn. Hãy gửi lại mã mới.';
  if (code.includes('too-many-requests')) return 'Bạn đã yêu cầu OTP quá nhiều lần. Hãy thử lại sau.';
  return error instanceof Error ? error.message : 'Không thể xác thực lúc này. Vui lòng thử lại.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: spacing.margin, paddingTop: spacing.spaceXs },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.spaceLg,
    gap: spacing.spaceMd,
  },
  codeCard: {
    width: '100%',
    maxWidth: spacing.formMaxWidth,
    alignItems: 'center',
    gap: spacing.spaceMd,
    padding: spacing.spaceMd,
    borderRadius: borderRadius.xxl,
  },
  fieldLabel: { ...typography.labelLg, color: colors.onSurface, alignSelf: 'flex-start' },
  helperText: { ...typography.labelSm, color: colors.onSurfaceVariant, textAlign: 'center' },
  errorText: { ...typography.bodyMd, color: colors.error, textAlign: 'center' },
  submitButton: { width: '100%', maxWidth: spacing.formMaxWidth },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.spaceMd },
  secondaryActionText: { ...typography.labelMd, color: colors.onSurfaceVariant },
});
