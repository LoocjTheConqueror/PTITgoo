import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type EmptyStateCardProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

export function EmptyStateCard({ icon, title, description, actionLabel, onAction }: EmptyStateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <MaterialIcons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
      >
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.spaceSm,
    paddingHorizontal: spacing.spaceLg,
    paddingVertical: spacing.spaceXl,
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  iconBadge: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryFixedTint,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  action: {
    minHeight: spacing.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.spaceXs,
    paddingHorizontal: spacing.spaceLg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  actionText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  actionPressed: {
    opacity: 0.78,
  },
});
