import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const tabs = [
  { id: 'home', label: 'Trang chủ', icon: 'home' as const, route: '/(main)/home' as const },
  { id: 'history', label: 'Lịch sử', icon: 'receipt-long' as const, route: '/(main)/trip-history' as const },
  { id: 'notifications', label: 'Thông báo', icon: 'notifications' as const, route: '/(main)/notifications' as const },
  { id: 'profile', label: 'Hồ sơ', icon: 'person' as const, route: '/(main)/profile' as const },
];

export type CustomerTab = (typeof tabs)[number]['id'];

export function CustomerTabBar({ active, unreadCount = 0 }: { active: CustomerTab; unreadCount?: number }) {
  const router = useRouter();

  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => { if (!selected) router.replace(tab.route); }}
            style={styles.item}
          >
            <View>
              <MaterialIcons name={tab.icon} size={24} color={selected ? colors.primary : colors.onSurfaceVariant} />
              {tab.id === 'notifications' && unreadCount > 0 ? <View style={styles.dot} /> : null}
            </View>
            <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    alignSelf: 'stretch',
    height: spacing.tabBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.spaceXs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    elevation: 8,
  },
  item: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: spacing.gap1 },
  label: { ...typography.labelSm, color: colors.onSurfaceVariant },
  labelActive: { color: colors.primary, fontWeight: '600' },
  dot: { position: 'absolute', top: 0, right: 0, width: spacing.badgeSm, height: spacing.badgeSm, borderRadius: borderRadius.full, backgroundColor: colors.error, borderWidth: 2, borderColor: colors.surface },
});
