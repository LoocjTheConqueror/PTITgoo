import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderRadius, colors, spacing } from '../theme/colors';

export type CardVariant = 'surface' | 'raised' | 'muted';

export type CardProps = {
  children: ReactNode;
  /**
   * 'surface' = nền trắng + shadow nhẹ (mặc định).
   * 'raised' = shadow đậm hơn cho card nổi bật.
   * 'muted' = nền xám, không shadow.
   */
  variant?: CardVariant;
  /** Truyền màu gradient để đổi nền card thành LinearGradient. */
  gradient?: readonly [string, string, ...string[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  variant = 'surface',
  gradient,
  gradientStart,
  gradientEnd,
  onPress,
  accessibilityLabel,
  style,
}: CardProps) {
  const containerStyle = [
    styles.base,
    variant === 'surface' && styles.surface,
    variant === 'raised' && styles.raised,
    variant === 'muted' && styles.muted,
    style,
  ];

  const content = gradient ? (
    <LinearGradient
      colors={gradient}
      end={gradientEnd}
      start={gradientStart}
      style={containerStyle}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    padding: spacing.spaceMd,
  },
  surface: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  raised: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  muted: {
    backgroundColor: colors.surfaceContainerLow,
  },
});
