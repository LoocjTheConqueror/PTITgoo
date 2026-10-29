import { MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  borderRadius,
  colors,
  fontSize,
  spacing,
  typography,
} from '../theme/colors';

type IconName = keyof typeof MaterialIcons.glyphMap;

export type ButtonVariant = 'primary' | 'tertiary';

export type ButtonIconPosition = 'leading' | 'trailing';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** Màu nền nút. Mặc định 'primary' (colors.primaryContainer). */
  variant?: ButtonVariant;
  /** Icon MaterialIcons hiển thị cạnh nhãn. */
  icon?: IconName;
  /** Vị trí icon so với nhãn. Mặc định 'trailing'. */
  iconPosition?: ButtonIconPosition;
  /** Kích thước icon (px). Mặc định fontSize.iconLg. */
  iconSize?: number;
  /** Màu icon và spinner. Mặc định colors.onPrimary. */
  contentColor?: string;
  loading?: boolean;
  /** Nhãn thay thế khi đang loading. */
  loadingLabel?: string;
  /** Thay spinner bằng icon MaterialIcons này (hiển thị phía trước) khi loading. */
  loadingIcon?: IconName;
  disabled?: boolean;
  /** Làm mờ nút khi bị disabled. Mặc định true. */
  dimWhenDisabled?: boolean;
  numberOfLines?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'trailing',
  iconSize = fontSize.iconLg,
  contentColor = colors.onPrimary,
  loading = false,
  loadingLabel,
  loadingIcon,
  disabled = false,
  dimWhenDisabled = true,
  numberOfLines,
  accessibilityLabel,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const showSpinner = loading && !loadingIcon;
  const leadingIcon = loading
    ? loadingIcon
    : iconPosition === 'leading'
      ? icon
      : undefined;
  const trailingIcon = loading
    ? undefined
    : iconPosition === 'trailing'
      ? icon
      : undefined;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.container,
        variant === 'tertiary' && styles.containerTertiary,
        disabled && dimWhenDisabled && styles.containerDisabled,
        style,
      ]}
    >
      {showSpinner ? (
        <ActivityIndicator color={contentColor} size="small" />
      ) : null}
      {leadingIcon ? (
        <MaterialIcons color={contentColor} name={leadingIcon} size={iconSize} />
      ) : null}
      <Text numberOfLines={numberOfLines} style={[styles.label, textStyle]}>
        {loading && loadingLabel ? loadingLabel : label}
      </Text>
      {trailingIcon ? (
        <MaterialIcons color={contentColor} name={trailingIcon} size={iconSize} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: spacing.ctaHeight,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceXs,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  containerTertiary: {
    backgroundColor: colors.tertiaryContainer,
  },
  containerDisabled: {
    opacity: spacing.disabledOpacity,
  },
  label: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
});
