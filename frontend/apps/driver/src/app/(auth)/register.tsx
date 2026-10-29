import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthApiError,
  AUTH_FULL_NAME_MAX_LENGTH,
  Button,
  Card,
  Input,
  authenticateWithBackend,
  borderRadius,
  colors,
  confirmPhoneCode,
  fontSize,
  getAuthFullNameValidationError,
  getFirebaseUser,
  isValidVietnamPhoneNumber,
  normalizeVietnamPhoneNumber,
  registerWithBackend,
  sendPhoneCode,
  spacing,
  typography,
} from '@datxe/shared';

const DRIVER_GREEN = '#007f36';

export default function DriverRegisterScreen() {
  const router = useRouter();
  const user = getFirebaseUser();
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const [fullName, setFullName] = useState(user?.displayName ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? (typeof phoneParam === 'string' ? phoneParam : ''));
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState(user?.phoneNumber ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.replace('/(auth)/login' as never);
  }, [router, user]);

  const sendCode = async () => {
    if (!isValidVietnamPhoneNumber(phone)) {
      setError('Vui lòng nhập số điện thoại Việt Nam hợp lệ.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await sendPhoneCode(phone, { linkToCurrentAccount: true });
      if (result.autoVerified) {
        const linkedUser = getFirebaseUser();
        setVerifiedPhone(linkedUser?.phoneNumber ?? normalizeVietnamPhoneNumber(phone));
        setCodeSent(false);
      } else {
        setCodeSent(true);
      }
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError('');
    try {
      const linkedUser = await confirmPhoneCode(code);
      setVerifiedPhone(linkedUser.phoneNumber ?? normalizeVietnamPhoneNumber(phone));
      setCodeSent(false);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const nameError = getAuthFullNameValidationError(fullName);
    if (nameError) {
      setError(nameError);
      return;
    }
    const currentUser = getFirebaseUser();
    if (!currentUser?.phoneNumber) {
      setError('Tài xế cần xác minh số điện thoại trước khi tạo tài khoản.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      try {
        await registerWithBackend('driver', fullName, currentUser);
      } catch (cause) {
        if (cause instanceof AuthApiError && cause.code === 'ACCOUNT_ALREADY_EXISTS') {
          await authenticateWithBackend('driver', currentUser);
        } else {
          throw cause;
        }
      }
      router.replace('/(auth)/license-upload' as never);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons color={colors.onSurface} name="arrow-back" size={fontSize.iconXl} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.iconCircle}>
          <MaterialIcons color={DRIVER_GREEN} name="local-taxi" size={fontSize.icon3xl} />
        </View>
        <Text style={styles.title}>Đăng ký đối tác tài xế</Text>
        <Text style={styles.subtitle}>Xác minh thông tin để bắt đầu hồ sơ tài xế.</Text>

        <Card style={styles.card}>
          <Input
            autoCapitalize="words"
            autoComplete="name"
            icon="person"
            label="Họ và tên theo giấy tờ"
            maxLength={AUTH_FULL_NAME_MAX_LENGTH}
            onChangeText={(value) => {
              setFullName(value);
              setError('');
            }}
            placeholder="Nguyễn Văn An"
            value={fullName}
          />

          {verifiedPhone ? (
            <View style={styles.verifiedRow}>
              <MaterialIcons color={DRIVER_GREEN} name="verified" size={fontSize.iconMd} />
              <Text style={styles.verifiedText}>Số điện thoại đã xác minh: {verifiedPhone}</Text>
            </View>
          ) : (
            <>
              <Input
                autoComplete="tel"
                editable={!codeSent}
                icon="call"
                keyboardType="phone-pad"
                label="Số điện thoại"
                onChangeText={(value) => {
                  setPhone(value);
                  setError('');
                }}
                placeholder="0912 345 678"
                value={phone}
              />
              {codeSent ? (
                <Input
                  autoComplete="sms-otp"
                  keyboardType="number-pad"
                  label="Mã OTP"
                  maxLength={6}
                  onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Nhập mã 6 chữ số"
                  value={code}
                />
              ) : null}
              <Button
                label={codeSent ? 'Xác minh số điện thoại' : 'Gửi mã OTP'}
                loading={loading}
                loadingLabel="Đang xác minh..."
                onPress={codeSent ? verifyCode : sendCode}
                style={styles.secondaryButton}
                textStyle={styles.secondaryButtonText}
                variant="tertiary"
              />
            </>
          )}

          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
          <Button
            disabled={!verifiedPhone}
            icon="arrow-forward"
            label="Tạo tài khoản và tiếp tục"
            loading={loading && Boolean(verifiedPhone)}
            loadingLabel="Đang tạo tài khoản..."
            onPress={submit}
            style={styles.submitButton}
          />
          <Text style={styles.note}>Sau khi tạo tài khoản, bạn sẽ hoàn tất hồ sơ và tải giấy tờ lái xe lên.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) return error.message;
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('invalid-verification-code')) return 'Mã OTP không đúng. Vui lòng thử lại.';
  if (code.includes('too-many-requests')) return 'Bạn đã yêu cầu OTP quá nhiều lần. Hãy thử lại sau.';
  if (code.includes('credential-already-in-use')) return 'Số điện thoại này đã được liên kết với tài khoản khác.';
  return error instanceof Error ? error.message : 'Không thể tạo tài khoản. Vui lòng thử lại.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { alignSelf: 'flex-start', padding: spacing.spaceMd },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.margin, paddingBottom: spacing.spaceXl },
  iconCircle: { width: 72, height: 72, borderRadius: borderRadius.full, backgroundColor: '#e5f3eb', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.spaceLg },
  title: { ...typography.headlineXlMobile, color: colors.onSurface, textAlign: 'center' },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.spaceXs, marginBottom: spacing.spaceLg },
  card: { padding: spacing.spaceMd, gap: spacing.spaceMd },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, padding: spacing.spaceSm, borderRadius: borderRadius.lg, backgroundColor: '#e5f3eb' },
  verifiedText: { ...typography.labelMd, color: DRIVER_GREEN, flex: 1 },
  secondaryButton: { marginTop: -spacing.spaceXs },
  secondaryButtonText: { color: colors.onPrimary },
  errorText: { ...typography.bodyMd, color: colors.error },
  submitButton: { marginTop: spacing.spaceXs, backgroundColor: DRIVER_GREEN },
  note: { ...typography.labelSm, color: colors.onSurfaceVariant, textAlign: 'center' },
});
