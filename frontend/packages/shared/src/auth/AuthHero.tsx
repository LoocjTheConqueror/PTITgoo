import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, fontSize, spacing, typography } from '../theme/colors';

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  brandLabel?: string;
  detail?: string;
};

export function AuthHero({ icon, title, subtitle, brandLabel, detail }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons color={colors.primary} name={icon} size={fontSize.icon3xl} />
      </View>
      {brandLabel ? <Text style={styles.brandLabel}>{brandLabel}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.spaceLg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.spaceMd,
  },
  brandLabel: {
    ...typography.labelLg,
    color: colors.primary,
    marginBottom: spacing.spaceXs,
  },
  title: {
    ...typography.headlineXlMobile,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: spacing.subtitleMaxWidth,
    marginTop: spacing.spaceXs,
  },
  detail: {
    ...typography.labelLg,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.spaceSm,
  },
});
