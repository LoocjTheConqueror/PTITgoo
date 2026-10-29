import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { borderRadius, colors, fontSize, spacing } from '../theme/colors';

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export function AuthBackButton({ onPress, accessibilityLabel = 'Quay lại' }: Props) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
    >
      <MaterialIcons color={colors.onSurface} name="arrow-back" size={fontSize.iconXl} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: spacing.iconButtonMd,
    height: spacing.iconButtonMd,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
