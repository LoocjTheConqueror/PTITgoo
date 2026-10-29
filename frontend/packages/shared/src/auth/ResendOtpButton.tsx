import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../theme/colors';

type Props = {
  onResend: () => Promise<boolean>;
  disabled?: boolean;
  delaySeconds?: number;
};

export function ResendOtpButton({ onResend, disabled = false, delaySeconds = 30 }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(delaySeconds);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handlePress = async () => {
    if (disabled || sending || secondsLeft > 0) return;
    setSending(true);
    try {
      if (await onResend()) setSecondsLeft(delaySeconds);
    } finally {
      setSending(false);
    }
  };

  const isDisabled = disabled || sending || secondsLeft > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => void handlePress()}
      style={styles.button}
    >
      <Text style={[styles.label, isDisabled && styles.labelDisabled]}>
        {sending ? 'Đang gửi mã...' : secondsLeft > 0 ? `Gửi lại mã sau ${secondsLeft}s` : 'Gửi lại mã OTP'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.spaceXs,
  },
  label: { ...typography.labelMd, color: colors.primary },
  labelDisabled: { color: colors.outline },
});
