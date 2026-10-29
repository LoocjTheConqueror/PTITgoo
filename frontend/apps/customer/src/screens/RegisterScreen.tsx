import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthBackButton,
  AuthHero,
  AuthApiError,
  Button,
  Card,
  Input,
  AUTH_FULL_NAME_MAX_LENGTH,
  authenticateWithBackend,
  borderRadius,
  colors,
  fontSize,
  getAuthFullNameValidationError,
  getFirebaseUser,
  registerWithBackend,
  spacing,
  typography,
} from '@datxe/shared';
import { getCustomerProfile, updateCustomerProfile } from '../services/customerApi';

const genderOptions = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
] as const;

function formatIsoDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [user] = useState(() => getFirebaseUser());
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const [fullName, setFullName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.replace('/(auth)/login' as never);
    else if (!user.phoneNumber) router.replace('/(auth)/add-phone-number' as never);
  }, [router, user]);

  const submit = async () => {
    const nameError = getAuthFullNameValidationError(fullName);
    if (nameError) {
      setError(nameError);
      return;
    }
    if (!user?.phoneNumber) {
      router.replace('/(auth)/add-phone-number' as never);
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email không hợp lệ.');
      return;
    }
    if (dateOfBirth && !isPastIsoDate(dateOfBirth)) {
      setError('Ngày sinh cần đúng định dạng YYYY-MM-DD và nằm trong quá khứ.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      try {
        await registerWithBackend('customer', fullName, user ?? undefined);
      } catch (cause) {
        if (cause instanceof AuthApiError && cause.code === 'ACCOUNT_ALREADY_EXISTS') {
          await authenticateWithBackend('customer', user ?? undefined);
        } else {
          throw cause;
        }
      }
      const currentProfile = await getCustomerProfile();
      await updateCustomerProfile({
        full_name: fullName.trim(),
        email: email.trim() || user.email || currentProfile.email,
        date_of_birth: dateOfBirth || currentProfile.date_of_birth,
        gender: gender || currentProfile.gender,
        default_payment_method: currentProfile.default_payment_method,
      });
      router.replace('/(main)/home' as never);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <AuthBackButton onPress={() => router.back()} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
        <AuthHero
          icon="person-add-alt-1"
          subtitle="Hoàn tất thông tin để bắt đầu sử dụng DriveMate."
          title="Tạo tài khoản khách hàng"
        />

        <Card style={styles.card}>
          <Input
            autoCapitalize="words"
            autoComplete="name"
            icon="person"
            label="Họ và tên"
            maxLength={AUTH_FULL_NAME_MAX_LENGTH}
            onChangeText={(value) => {
              setFullName(value);
              setError('');
            }}
            placeholder="Nguyễn Văn An"
            value={fullName}
          />
          <Input
            autoCapitalize="none"
            autoComplete="email"
            icon="mail"
            keyboardType="email-address"
            label="Email (không bắt buộc)"
            maxLength={255}
            onChangeText={(value) => {
              setEmail(value);
              setError('');
            }}
            placeholder="ten@email.com"
            value={email}
          />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Ngày sinh (không bắt buộc)</Text>
            <TextInput
              accessibilityLabel="Ngày sinh theo định dạng năm-tháng-ngày"
              value={dateOfBirth}
              onChangeText={(value) => {
                setDateOfBirth(formatIsoDateInput(value));
                setError('');
              }}
              placeholder="YYYY-MM-DD"
              maxLength={10}
              keyboardType="number-pad"
              autoComplete="birthdate-full"
              style={styles.textInput}
            />
            <Text style={styles.fieldHint}>Ví dụ: 1995-08-24</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Giới tính (không bắt buộc)</Text>
            <View style={styles.genderOptions}>
              {genderOptions.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: gender === option.value }}
                  onPress={() => setGender(gender === option.value ? '' : option.value)}
                  style={[styles.genderOption, gender === option.value && styles.genderOptionSelected]}
                >
                  <Text style={[styles.genderOptionText, gender === option.value && styles.genderOptionTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons color={colors.primary} name="verified-user" size={fontSize.iconMd} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>Phương thức đăng nhập</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user.phoneNumber ?? (phoneParam ? String(phoneParam) : user.email) ?? 'Tài khoản đã xác thực'}
              </Text>
            </View>
          </View>
          {phoneParam && !user.phoneNumber ? (
            <Text style={styles.helperText}>Số {phoneParam} đã được xác minh.</Text>
          ) : null}
          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
          <Button
            icon="arrow-forward"
            label="Tạo tài khoản"
            loading={loading}
            loadingLabel="Đang tạo tài khoản..."
            onPress={submit}
            style={styles.submitButton}
          />
          <Text style={styles.legalNotice}>
            Khi tạo tài khoản, bạn đồng ý với{' '}
            <Text
              accessibilityRole="link"
              onPress={() => router.push('/terms-of-service' as never)}
              style={styles.legalLink}
            >
              Điều khoản dịch vụ
            </Text>{' '}
            và{' '}
            <Text
              accessibilityRole="link"
              onPress={() => router.push('/privacy-policy' as never)}
              style={styles.legalLink}
            >
              Chính sách bảo mật
            </Text>
            .
          </Text>
        </Card>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function isPastIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: spacing.margin, paddingTop: spacing.spaceXs },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: spacing.formMaxWidth + spacing.margin * 2, alignSelf: 'center', paddingHorizontal: spacing.margin, paddingVertical: spacing.spaceLg },
  card: { width: '100%', padding: spacing.spaceMd, gap: spacing.spaceMd, borderRadius: borderRadius.xxl },
  fieldGroup: { gap: spacing.spaceXs },
  fieldLabel: { ...typography.labelMd, color: colors.onSurfaceVariant },
  textInput: { minHeight: 52, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg, paddingHorizontal: spacing.spaceMd, ...typography.bodyMd, color: colors.onSurface, backgroundColor: colors.surfaceContainerLowest },
  fieldHint: { ...typography.labelSm, color: colors.onSurfaceVariant },
  genderOptions: { flexDirection: 'row', gap: spacing.spaceSm, flexWrap: 'wrap' },
  genderOption: { paddingVertical: spacing.spaceSm, paddingHorizontal: spacing.spaceMd, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerLowest },
  genderOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryFixedTint },
  genderOptionText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  genderOptionTextSelected: { color: colors.primary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, padding: spacing.spaceSm, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLow },
  infoCopy: { flex: 1 },
  infoLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  infoValue: { ...typography.labelMd, color: colors.onSurface, marginTop: spacing.py1 },
  helperText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  errorText: { ...typography.bodyMd, color: colors.error },
  submitButton: { marginTop: spacing.spaceXs },
  legalNotice: { ...typography.labelSm, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  legalLink: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '600' },
});
