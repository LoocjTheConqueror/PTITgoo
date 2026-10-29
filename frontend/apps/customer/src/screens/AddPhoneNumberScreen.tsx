import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
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
  AuthBackButton,
  AuthHero,
  Button,
  Card,
  DEFAULT_PHONE_COUNTRY,
  OtpCodeInput,
  PhoneNumberInput,
  ResendOtpButton,
  authenticateWithBackend,
  borderRadius,
  colors,
  confirmPhoneCode,
  getFirebaseUser,
  isValidInternationalPhoneNumber,
  toInternationalPhoneNumber,
  sendPhoneCode,
  signOutFirebase,
  spacing,
  typography,
} from '@datxe/shared';

function getPhoneError(error: unknown): string {
  if (error instanceof AuthApiError) return error.message;
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('invalid-phone-number')) return 'Số điện thoại không hợp lệ.';
  if (code.includes('phone-number-already-in-use') || code.includes('credential-already-in-use')) return 'Số điện thoại này đã gắn với một tài khoản khác.';
  if (code.includes('invalid-verification-code')) return 'Mã OTP không đúng. Vui lòng thử lại.';
  if (code.includes('session-expired')) return 'Mã OTP đã hết hạn. Hãy gửi lại mã mới.';
  if (code.includes('too-many-requests')) return 'Bạn đã yêu cầu OTP quá nhiều lần. Hãy thử lại sau.';
  return error instanceof Error ? error.message : 'Không thể xác minh số điện thoại. Vui lòng thử lại.';
}

export default function AddPhoneNumberScreen() {
  const router = useRouter();
  const [user] = useState(() => getFirebaseUser());
  const isGoogleAccount = Boolean(user?.providerData.some((item) => item.providerId === 'google.com'));
  const isFacebookAccount = Boolean(user?.providerData.some((item) => item.providerId === 'facebook.com'));
  const accountProvider = isGoogleAccount ? 'Google' : isFacebookAccount ? 'Facebook' : 'DriveMate';
  const [country, setCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user) router.replace('/(auth)/login' as never);
  }, [router, user]);

  const onChangePhone = (value: string) => {
    setInvalid(false);
    setError('');
    setNotice('');
    setPhone(value);
  };

  const finishPhoneLink = async () => {
    const profile = await authenticateWithBackend('customer');
    if (profile.role !== 'CUSTOMER') {
      throw new AuthApiError('Tài khoản này không phải tài khoản khách hàng.', 'ROLE_MISMATCH');
    }
    router.replace('/(main)/home' as never);
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!user) {
      router.replace('/(auth)/login' as never);
      return;
    }
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      if (otpStep) {
        if (!/^\d{6}$/.test(otp)) {
          setError('Nhập mã OTP gồm 6 chữ số.');
          return;
        }
        Keyboard.dismiss();
        await confirmPhoneCode(otp);
        await finishPhoneLink();
        return;
      }
      if (!isValidInternationalPhoneNumber(phone, country)) {
        setInvalid(true);
        setError(`Nhập số điện thoại ${country.name} hợp lệ.`);
        return;
      }
      Keyboard.dismiss();
      const result = await sendPhoneCode(toInternationalPhoneNumber(phone, country), { linkToCurrentAccount: true });
      if (result.autoVerified) {
        await finishPhoneLink();
        return;
      }
      setOtp('');
      setOtpStep(true);
    } catch (cause) {
      if (cause instanceof AuthApiError && cause.code === 'ACCOUNT_NOT_FOUND') {
        router.replace('/(auth)/register' as never);
        return;
      }
      setError(getPhoneError(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const result = await sendPhoneCode(toInternationalPhoneNumber(phone, country), { linkToCurrentAccount: true });
      if (result.autoVerified) {
        await finishPhoneLink();
        return true;
      }
      setOtp('');
      setNotice('Mã mới đã được gửi.');
      return true;
    } catch (cause) {
      setError(getPhoneError(cause));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const switchAccount = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await signOutFirebase();
      router.replace('/(auth)/login' as never);
    } catch (cause) {
      setError(getPhoneError(cause));
      setSubmitting(false);
    }
  };

  const changePhone = () => {
    if (submitting) return;
    setOtpStep(false);
    setOtp('');
    setInvalid(false);
    setError('');
    setNotice('');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <AuthBackButton
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login' as never)}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <AuthHero
            detail={otpStep ? toInternationalPhoneNumber(phone, country) : undefined}
            icon={otpStep ? 'sms' : 'phone-android'}
            subtitle={otpStep
              ? 'Nhập mã xác thực 6 chữ số vừa được gửi qua SMS.'
              : 'Liên kết số điện thoại đã xác thực với tài khoản khách hàng của bạn.'}
            title={otpStep ? 'Xác thực số điện thoại' : 'Thêm số điện thoại'}
          />

          <View style={styles.connectedPill}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Tài khoản {accountProvider} đã kết nối</Text>
          </View>

          <Card style={styles.formCard}>
            {!otpStep ? (
              <>
                <PhoneNumberInput
                  country={country}
                  disabled={submitting}
                  invalid={invalid}
                  label="Số điện thoại nhận OTP"
                  onChangeText={onChangePhone}
                  onSelectCountry={(value) => {
                    setCountry(value);
                    setPhone((current) => current.slice(0, value.maxLength));
                    setInvalid(false);
                    setError('');
                    setNotice('');
                  }}
                  value={phone}
                />
                <Text style={styles.helperText}>Chúng tôi sẽ gửi mã xác thực qua SMS.</Text>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Mã OTP gồm 6 chữ số</Text>
                <OtpCodeInput
                  autoFocus
                  disabled={submitting}
                  onChange={(value) => {
                    setOtp(value);
                    setError('');
                    setNotice('');
                  }}
                  value={otp}
                />
                <Text style={styles.helperText}>Bạn có thể dán mã OTP hoặc chọn mã được gợi ý từ SMS.</Text>
              </>
            )}

            {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
            {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

            <Button
              disabled={submitting}
              icon="arrow-forward"
              label={otpStep ? 'Xác nhận và liên kết số' : 'Gửi mã OTP'}
              loading={submitting}
              loadingLabel={otpStep ? 'Đang xác thực...' : 'Đang gửi mã...'}
              onPress={() => void onSubmit()}
              style={styles.submitButton}
            />

            {otpStep ? (
              <>
                <ResendOtpButton disabled={submitting} onResend={resendCode} />
                <Pressable accessibilityRole="button" disabled={submitting} onPress={changePhone} style={styles.secondaryAction}>
                  <Text style={styles.secondaryActionText}>Đổi số điện thoại</Text>
                </Pressable>
              </>
            ) : null}
          </Card>

          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => void switchAccount()}
            style={styles.switchAccount}
          >
            <Text style={styles.switchAccountText}>Đăng nhập bằng tài khoản khác</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: spacing.margin, paddingTop: spacing.spaceXs },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: spacing.formMaxWidth + spacing.margin * 2,
    alignSelf: 'center',
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.spaceLg,
  },
  connectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
    paddingHorizontal: spacing.spaceMd,
    paddingVertical: spacing.spaceXs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryContainer,
    marginTop: -spacing.spaceSm,
    marginBottom: spacing.spaceMd,
  },
  connectedDot: { width: spacing.statusDot, height: spacing.statusDot, borderRadius: borderRadius.full, backgroundColor: colors.success },
  connectedText: { ...typography.labelSm, color: colors.onSecondaryFixed },
  formCard: {
    width: '100%',
    alignItems: 'stretch',
    gap: spacing.spaceMd,
    padding: spacing.spaceMd,
    borderRadius: borderRadius.xxl,
  },
  fieldLabel: { ...typography.labelLg, color: colors.onSurface },
  helperText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  errorText: { ...typography.bodyMd, color: colors.error, textAlign: 'center' },
  noticeText: { ...typography.labelSm, color: colors.successStrong, textAlign: 'center' },
  submitButton: { width: '100%' },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.spaceMd },
  secondaryActionText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  switchAccount: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.spaceMd, marginTop: spacing.spaceSm },
  switchAccountText: { ...typography.labelMd, color: colors.primary },
});
