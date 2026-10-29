import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { borderRadius, colors, spacing, typography } from '../theme/colors';

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function OtpCodeInput({
  value,
  onChange,
  autoFocus = false,
  disabled = false,
  accessibilityLabel = 'Mã xác thực 6 chữ số',
}: Props) {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, 5);

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.codeBoxes}>
        {Array.from({ length: 6 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.codeBox,
              Boolean(value[index]) && styles.codeBoxFilled,
              focused && index === activeIndex && styles.codeBoxActive,
              disabled && styles.codeBoxDisabled,
            ]}
          >
            <Text style={styles.codeDigit}>{value[index] ?? ''}</Text>
          </View>
        ))}
      </View>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        caretHidden
        editable={!disabled}
        keyboardType="number-pad"
        maxLength={6}
        onBlur={() => setFocused(false)}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
        onFocus={() => setFocused(true)}
        selectionColor="transparent"
        style={styles.input}
        textContentType={'oneTimeCode' as TextInputProps['textContentType']}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: spacing.otpMaxWidth,
    alignSelf: 'center',
  },
  codeBoxes: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.spaceXs,
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
  },
  codeBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary10,
  },
  codeBoxActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  codeBoxDisabled: { opacity: 0.55 },
  codeDigit: { ...typography.headlineMd, color: colors.onSurface },
  input: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: colors.onSurface,
  },
});
