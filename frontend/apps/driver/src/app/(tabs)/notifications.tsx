import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  borderRadius,
  colors,
  fontSize,
  spacing,
  typography,
} from '@datxe/shared';

type NotificationFilter = 'all' | 'income' | 'trip' | 'system';
type NotificationItem = {
  id: string;
  category: Exclude<NotificationFilter, 'all'>;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  date: string;
  unread?: boolean;
};

const FILTERS: { id: NotificationFilter; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'all', label: 'Tất cả', icon: 'all-inbox' },
  { id: 'income', label: 'Thu nhập & Thưởng', icon: 'account-balance-wallet' },
  { id: 'trip', label: 'Chuyến xe', icon: 'local-taxi' },
  { id: 'system', label: 'Hệ thống', icon: 'view-quilt' },
];

const ITEMS: NotificationItem[] = [
  { id: 'wallet', category: 'income', icon: 'payments', title: 'Cộng tiền vào ví thành công', date: '23:42', unread: true },
  { id: 'bonus', category: 'income', icon: 'military-tech', title: 'Chương trình thưởng cuối tuần', date: 'Hôm nay', unread: true },
  { id: 'safety', category: 'trip', icon: 'security', title: 'Nhắc nhở an toàn trước chuyến', date: 'Hôm qua' },
  { id: 'approval', category: 'system', icon: 'verified', title: 'Hồ sơ đã được phê duyệt', date: '2 ngày trước' },
];

const PROMO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBud9_BpSRlLd1kVJa4522ckQbHkcoJ1RS2S_rs';
const SAFETY_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAyHzhFCVnBLH_KliidaWdycYcTSCPd07pKu73X',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfuNwF6YvW73McX47shN6B52jiDNtyLYnZ9jFf',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBeAtzwAYFiatMSoJmWVGwTsMlmf5I-RItAuviC',
];

const TABS = [
  { label: 'Trang chủ', icon: 'home', route: '/(tabs)/home' },
  { label: 'Lịch sử', icon: 'history', route: '/(tabs)/history' },
  { label: 'Thông báo', icon: 'notifications-none', route: '/(tabs)/notifications' },
  { label: 'Hồ sơ', icon: 'account-circle', route: '/(tabs)/profile' },
] as const;

export default function DriverNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [readIds, setReadIds] = useState<string[]>([]);
  const filteredItems = ITEMS.filter((item) => filter === 'all' || item.category === filter);
  const unreadCount = ITEMS.filter((item) => item.unread && !readIds.includes(item.id)).length;

  const markAllRead = () => {
    setReadIds(ITEMS.map((item) => item.id));
  };

  const markOneRead = (id: string) => {
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>Thông Báo</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/profile' as never)} style={styles.headerIcon}>
            <MaterialIcons color={colors.onPrimary} name="support-agent" size={fontSize.icon2xl} />
          </Pressable>
          <View style={styles.headerAvatar}>
            <MaterialIcons color={colors.onPrimary} name="person-outline" size={fontSize.iconMd} />
          </View>
        </View>
      </View>

      <View style={styles.unreadBar}>
        <View style={styles.unreadCountWrap}>
          <Text style={styles.unreadCount}>{unreadCount}</Text>
          <Text style={styles.unreadLabel}>Tin chưa đọc</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={unreadCount === 0}
          onPress={markAllRead}
          style={styles.markReadButton}
        >
          <MaterialIcons color={unreadCount ? colors.primary : colors.success} name="done-all" size={fontSize.iconMd} />
          <Text style={[styles.markReadText, unreadCount === 0 && styles.markReadDone]}>
            {unreadCount === 0 ? 'Hoàn tất' : 'Đánh dấu đã đọc'}
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator={false}>
        {FILTERS.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => setFilter(item.id)}
            style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
          >
            <MaterialIcons
              color={filter === item.id ? colors.onPrimary : colors.onSurfaceVariant}
              name={item.icon}
              size={fontSize.iconSm}
            />
            <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.feed, { paddingBottom: spacing.spaceXl + insets.bottom + spacing.tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.map((item) => {
          const isUnread = Boolean(item.unread && !readIds.includes(item.id));
          return (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => markOneRead(item.id)}
              style={styles.notificationCard}
            >
              <View style={[styles.iconCircle, item.category === 'income' && styles.moneyIcon, item.category === 'trip' && styles.safetyIcon, item.category === 'system' && styles.systemIcon]}>
                <MaterialIcons
                  color={item.category === 'income' ? colors.onSuccessContainer : item.category === 'trip' ? '#93000A' : colors.onPrimaryFixed}
                  name={item.icon}
                  size={fontSize.iconXl}
                />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeading}>
                  <Text numberOfLines={1} style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationDate}>{item.date}</Text>
                </View>
                {item.id === 'wallet' ? (
                  <WalletContent />
                ) : item.id === 'bonus' ? (
                  <BonusContent />
                ) : item.id === 'safety' ? (
                  <SafetyContent />
                ) : (
                  <ApprovalContent />
                )}
              </View>
              {isUnread ? <View style={styles.unreadBadge} /> : null}
            </Pressable>
          );
        })}

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons color={colors.outline} name="notifications-none" size={fontSize.icon3xl} />
            <Text style={styles.emptyText}>Chưa có thông báo trong mục này</Text>
          </View>
        ) : null}
        <View style={styles.endNote}>
          <View style={styles.endIcon}>
            <MaterialIcons color={colors.secondary} name="check" size={fontSize.iconMd} />
          </View>
          <Text style={styles.endText}>Bạn đã xem toàn bộ thông báo gần đây</Text>
        </View>
      </ScrollView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.spaceXs) }]}>
        {TABS.map((tab) => {
          const active = tab.label === 'Thông báo';
          return (
            <Pressable accessibilityRole="button" key={tab.label} onPress={() => router.push(tab.route as never)} style={styles.tabItem}>
              <MaterialIcons color={active ? colors.primary : colors.onSurfaceVariant} name={tab.icon} size={fontSize.icon2xl} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function WalletContent() {
  return (
    <>
      <View style={styles.walletLine}>
        <Text style={styles.walletAmount}>+210.000₫</Text>
        <Text style={styles.bodyText}> từ chuyến đi </Text>
        <Text style={styles.linkText}>#DX-8892</Text>
      </View>
      <Text style={styles.bodyText}>lúc 23:40</Text>
      <View style={styles.balanceBar}>
        <MaterialIcons color={colors.primary} name="account-balance" size={fontSize.iconMd} />
        <Text style={styles.balanceText}>Số dư khả dụng: <Text style={styles.balanceStrong}>1.840.000₫</Text></Text>
        <MaterialIcons color={colors.secondary} name="chevron-right" size={fontSize.iconLg} />
      </View>
    </>
  );
}

function BonusContent() {
  return (
    <>
      <Text style={styles.bodyText}>
        Hoàn thành <Text style={styles.boldText}>5 chuyến sau 22:00</Text> tặng ngay{' '}
        <Text style={styles.walletAmount}>150.000₫</Text> trực tiếp vào ví tài xế.
      </Text>
      <View style={styles.promoImageWrap}>
        <Image resizeMode="cover" source={{ uri: PROMO_IMAGE }} style={styles.promoImage} />
        <View style={styles.promoOverlay}>
          <View style={styles.promoTitle}>
            <MaterialIcons color={colors.successContainer} name="bolt" size={fontSize.iconLg} />
            <Text style={styles.promoText}>CHIẾN DỊCH ĐÊM PHỐ VÀNG</Text>
          </View>
          <Text style={styles.progressPill}>Tiến độ: 2/5</Text>
        </View>
      </View>
    </>
  );
}

function SafetyContent() {
  return (
    <>
      <Text style={styles.bodyText}>
        Luôn chụp đủ <Text style={styles.boldText}>6 góc xe</Text> và đồng hồ công-tơ-mét trước khi lăn bánh để bảo vệ 100% quyền lợi bảo hiểm bồi hoàn.
      </Text>
      <View style={styles.safetyImages}>
        {SAFETY_IMAGES.map((uri, index) => (
          <View key={uri} style={styles.safetyImageWrap}>
            <Image resizeMode="cover" source={{ uri }} style={styles.safetyImage} />
            <Text style={styles.safetyImageLabel}>{['Đầu xe', 'Sườn xe', 'Odo xe'][index]}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

function ApprovalContent() {
  return (
    <>
      <Text style={styles.bodyText}>
        GPLX <Text style={styles.boldText}>Hạng B2</Text> của bạn đã được chứng thực dữ liệu CSGT thành công. Bạn hiện đủ điều kiện nhận các cuốc xe đường dài & xe cao cấp.
      </Text>
      <View style={styles.badgeRow}>
        <Text style={styles.approvalTag}>✓ Hiệu lực đến 12/2028</Text>
        <Text style={styles.vipTag}>Gói VIP Hạng A</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { minHeight: spacing.headerHeight, paddingHorizontal: spacing.gutter, paddingBottom: spacing.spaceSm, backgroundColor: colors.driverHeader, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  liveDot: { width: 12, height: 12, borderRadius: borderRadius.full, backgroundColor: colors.successContainer },
  headerTitle: { ...typography.headlineSm, color: colors.onPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  headerIcon: { width: spacing.iconButtonMd, height: spacing.iconButtonMd, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: spacing.avatarLg, height: spacing.avatarLg, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  unreadBar: { minHeight: 52, paddingHorizontal: spacing.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unreadCountWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  unreadCount: { ...typography.labelLg, color: colors.onPrimary, backgroundColor: colors.primary, minWidth: 28, height: 28, borderRadius: borderRadius.full, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden' },
  unreadLabel: { ...typography.bodyLg, color: colors.onSurface },
  markReadButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs, padding: spacing.spaceXs },
  markReadText: { ...typography.labelLg, color: colors.primary },
  markReadDone: { color: colors.success },
  filters: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.spaceMd, gap: spacing.spaceSm },
  filterChip: { minHeight: 40, paddingHorizontal: spacing.spaceMd, borderRadius: borderRadius.full, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceXs },
  filterChipActive: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.16, shadowRadius: 4, elevation: 2 },
  filterText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  filterTextActive: { color: colors.onPrimary },
  feed: { paddingHorizontal: spacing.gutter, gap: spacing.spaceSm },
  notificationCard: { position: 'relative', padding: spacing.spaceMd, borderRadius: borderRadius.xl, backgroundColor: colors.surfaceContainerLowest, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.spaceSm, shadowColor: colors.onSurface, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  iconCircle: { width: 56, height: 56, borderRadius: borderRadius.full, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  moneyIcon: { backgroundColor: colors.successContainer },
  safetyIcon: { backgroundColor: colors.errorContainer },
  systemIcon: { backgroundColor: colors.secondaryFixed },
  notificationContent: { flex: 1, gap: spacing.spaceXs, paddingRight: spacing.spaceXs },
  notificationHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  notificationTitle: { ...typography.headlineSm, color: colors.onSurface, flex: 1 },
  notificationDate: { ...typography.bodyMd, color: colors.secondary },
  unreadBadge: { position: 'absolute', top: spacing.spaceMd, left: 65, width: 14, height: 14, borderRadius: borderRadius.full, backgroundColor: '#2563EB', borderWidth: 2, borderColor: colors.surfaceContainerLowest },
  walletLine: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  walletAmount: { ...typography.headlineSm, color: colors.successStrong },
  bodyText: { ...typography.bodyLg, color: colors.onSurfaceVariant },
  linkText: { ...typography.bodyLg, color: colors.primary },
  balanceBar: { minHeight: 46, backgroundColor: colors.primarySoft, borderRadius: borderRadius.lg, marginTop: spacing.spaceSm, paddingHorizontal: spacing.spaceSm, flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  balanceText: { ...typography.bodyMd, color: colors.onSurfaceVariant, flex: 1 },
  balanceStrong: { ...typography.labelLg, color: colors.onSurface },
  boldText: { ...typography.bodyLgMedium, color: colors.onSurface },
  promoImageWrap: { height: 140, marginTop: spacing.spaceSm, borderRadius: borderRadius.lg, overflow: 'hidden', backgroundColor: colors.surfaceContainer },
  promoImage: { width: '100%', height: '100%' },
  promoOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.spaceSm, backgroundColor: '#0B1C30AA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceXs },
  promoTitle: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.spaceXs },
  promoText: { ...typography.labelMd, color: colors.onPrimary, flexShrink: 1 },
  progressPill: { ...typography.labelMd, color: colors.onPrimary, backgroundColor: colors.primary, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.full },
  safetyImages: { flexDirection: 'row', gap: spacing.spaceSm, marginTop: spacing.spaceSm },
  safetyImageWrap: { flex: 1, height: 82, borderRadius: borderRadius.lg, overflow: 'hidden', backgroundColor: colors.surfaceContainer },
  safetyImage: { width: '100%', height: '100%' },
  safetyImageLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.spaceXs, paddingVertical: 2, color: colors.onPrimary, ...typography.labelSm, backgroundColor: '#0B1C30AA' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.spaceSm, marginTop: spacing.spaceSm },
  approvalTag: { ...typography.labelMd, color: colors.onSuccessContainer, backgroundColor: colors.successContainer, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.full, overflow: 'hidden' },
  vipTag: { ...typography.labelMd, color: colors.onSurface, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.full, overflow: 'hidden' },
  emptyState: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: spacing.spaceSm },
  emptyText: { ...typography.bodyMd, color: colors.secondary },
  endNote: { alignItems: 'center', justifyContent: 'center', gap: spacing.spaceSm, paddingVertical: spacing.spaceMd },
  endIcon: { width: 44, height: 44, borderRadius: borderRadius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  endText: { ...typography.bodyMd, color: colors.secondary },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: spacing.tabBarHeight, paddingTop: spacing.spaceSm, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surfaceContainerHigh, flexDirection: 'row', justifyContent: 'space-around' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tabLabelActive: { ...typography.labelMd, color: colors.primary },
});
