import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
  signOutFirebase,
  typography,
} from '@datxe/shared';

const DRIVER_PORTRAIT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC_JFvcgdQRnuuUfFZFp185ICuisjd2hwf9LThHhDdGnK-KtK_yjTm36H8xstQOXTg-uvGgavzZhEnHxNkLcvl23Y1FWB3kI6lHlPbzC7sf0-qOjnPGSkdl4GE24Au2bAy5UPYXJXE_XkOMfamNPbo8at1e65brMzTopvXZ6v784k2gOhNjfqO5s6zNB7Bq-5dMaDPsM-MGXF5eZeLxeIgEZgvhcychBCUZ9diTRcouNO0V0mQCAofqwQ';

const TABS = [
  { label: 'Trang chủ', icon: 'home', route: '/(tabs)/home' },
  { label: 'Lịch sử', icon: 'history', route: '/(tabs)/history' },
  { label: 'Thông báo', icon: 'notifications-none', route: '/(tabs)/notifications' },
  { label: 'Hồ sơ', icon: 'account-circle', route: '/(tabs)/profile' },
] as const;

export default function DriverProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [autoAccept, setAutoAccept] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const withdraw = () => {
    if (withdrawing) return;
    setWithdrawing(true);
    setTimeout(() => setWithdrawing(false), 1200);
  };

  const callHotline = async () => {
    try {
      await Linking.openURL('tel:19008888');
    } catch {
      Alert.alert('Không thể gọi tổng đài', 'Vui lòng gọi hotline SOS: 1900 8888.');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Đăng xuất tài xế', 'Bạn có chắc muốn đăng xuất ca lái của tài xế Nguyễn Văn Tuấn?', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Đăng xuất',
        onPress: () => {
          void signOutFirebase().then(() => router.replace('/(auth)/login' as never));
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>Hồ Sơ</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" onPress={() => void callHotline()} style={styles.headerIcon}>
            <MaterialIcons color={colors.onPrimary} name="support-agent" size={fontSize.icon2xl} />
          </Pressable>
          <View style={styles.headerAvatar}>
            <MaterialIcons color={colors.onPrimary} name="person-outline" size={fontSize.iconMd} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.portraitWrap}>
              <Image accessibilityLabel="Ảnh đại diện tài xế Nguyễn Văn Tuấn" resizeMode="cover" source={{ uri: DRIVER_PORTRAIT }} style={styles.portrait} />
              <View style={styles.verifiedBadge}>
                <MaterialIcons color={colors.onSuccessContainer} name="verified" size={fontSize.iconSm} />
              </View>
            </View>
            <View style={styles.identityInfo}>
              <Text style={styles.driverName}>Nguyễn Văn Tuấn</Text>
              <View style={styles.tierBadge}>
                <MaterialIcons color={colors.primary} name="diamond" size={fontSize.iconSm} />
                <Text style={styles.tierText}>TÀI XẾ HẠNG KIM CƯƠNG</Text>
              </View>
              <View style={styles.proofRow}>
                <Text style={styles.proofBadge}><Text style={styles.star}>★</Text> 4.98 <Text style={styles.proofSub}>(1.420 chuyến)</Text></Text>
              </View>
              <View style={styles.proofRow}>
                <Text style={styles.proofBadge}><Text style={styles.greenDotText}>●</Text> Bằng B2 • Đã kích hoạt</Text>
              </View>
            </View>
          </View>
          <View style={styles.safetyBanner}>
            <View style={styles.safetyIcon}>
              <MaterialIcons color={colors.successStrong} name="verified-user" size={fontSize.iconMd} />
            </View>
            <View style={styles.safetyCopy}>
              <Text style={styles.safetyTitle}>Tiêu chuẩn an toàn 5 sao</Text>
              <Text style={styles.safetySub}>Đạt chứng chỉ lái xe an toàn đêm</Text>
            </View>
            <MaterialIcons color={colors.outline} name="verified-user" size={fontSize.iconLg} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hiệu suất 30 ngày qua</Text>
          <Pressable onPress={() => Alert.alert('Hiệu suất tài xế', 'Bạn đang nằm trong nhóm 1% tài xế có đánh giá cao nhất.')} accessibilityRole="button">
            <Text style={styles.detailLink}>Chi tiết điểm</Text>
          </Pressable>
        </View>
        <View style={styles.metricsRow}>
          <MetricCard icon="call-received" label="Nhận cuốc" value="98%" status="↑ Tuyệt vời" tint={colors.primary} progress={0.98} />
          <MetricCard icon="task-alt" label="Hoàn thành" value="100%" status="✓ Tối ưu" tint={colors.success} progress={1} />
          <MetricCard icon="star" label="Đánh giá" value="4.98/5" status="♜ Top 1%" tint="#F59E0B" progress={0.996} />
        </View>

        <View style={styles.walletBanner}>
          <View style={styles.walletCopy}>
            <View style={styles.walletLabelRow}>
              <MaterialIcons color={colors.primaryFixed} name="account-balance-wallet" size={fontSize.iconMd} />
              <Text style={styles.walletLabel}>Số dư ví khả dụng</Text>
            </View>
            <Text style={styles.walletAmount}>4.250.000₫</Text>
            <Text style={styles.walletSub}>Sẵn sàng rút về tài khoản liên kết</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={withdraw} style={styles.withdrawButton}>
            <Text style={styles.withdrawText}>{withdrawing ? 'Đang xử lý' : 'Rút tiền'}</Text>
            <MaterialIcons color={colors.primary} name={withdrawing ? 'refresh' : 'arrow-forward'} size={fontSize.iconSm} />
          </Pressable>
        </View>

        <Text style={styles.settingsHeading}>Cài đặt & Pháp lý tài xế</Text>
        <View style={styles.settingsCard}>
          <SettingRow icon="badge" title="Giấy phép lái xe & Hồ sơ pháp lý" detail="✓ Đã duyệt CSGT" detailTone="success" onPress={() => router.push('/(auth)/license-upload' as never)} />
          <SettingRow icon="payments" title="Ví tài xế & Ngân hàng nhận tiền" detail="Vietcombank •••• 8829 (Miễn phí rút 24/7)" />
          <SettingRow icon="security" title="Bảo hiểm trách nhiệm lái xe hộ" detail="Bảo hiểm PTI gói 500 triệu • Hiệu lực" />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, styles.autoIcon]}>
              <MaterialIcons color={colors.primary} name="near-me" size={fontSize.iconLg} />
            </View>
            <View style={styles.settingCopy}>
              <Text numberOfLines={1} style={styles.settingTitle}>Tự động nhận cuốc & Bán kính</Text>
              <Text numberOfLines={1} style={styles.settingDetail}>{autoAccept ? 'Đang bật' : 'Đang tắt'} • Bán kính nhận tối đa 5.0 km</Text>
            </View>
            <Pressable
              accessibilityLabel={autoAccept ? 'Tắt tự động nhận cuốc' : 'Bật tự động nhận cuốc'}
              accessibilityRole="switch"
              accessibilityState={{ checked: autoAccept }}
              onPress={() => setAutoAccept((enabled) => !enabled)}
              style={[styles.toggleTrack, autoAccept && styles.toggleTrackActive]}
            >
              <View style={[styles.toggleThumb, autoAccept && styles.toggleThumbActive]} />
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={() => void callHotline()} style={styles.settingRow}>
            <View style={[styles.settingIcon, styles.emergencyIcon]}>
              <MaterialIcons color={colors.error} name="fmd-bad" size={fontSize.iconLg} />
            </View>
            <View style={styles.settingCopy}>
              <Text numberOfLines={1} style={[styles.settingTitle, styles.emergencyText]}>Trung tâm hỗ trợ khẩn cấp 24/7</Text>
              <Text style={styles.settingDetail}>Hotline SOS trực ban: 1900 8888</Text>
            </View>
            <MaterialIcons color={colors.error} name="phone-in-talk" size={fontSize.iconLg} />
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={confirmLogout} style={styles.logoutButton}>
          <MaterialIcons color={colors.error} name="logout" size={fontSize.iconLg} />
          <Text style={styles.logoutText}>Đăng xuất tài xế</Text>
        </Pressable>
        <Text style={styles.versionText}>Phiên bản ứng dụng v3.8.4 (Bản chuẩn tài xế đêm)</Text>
      </ScrollView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.spaceXs) }]}>
        {TABS.map((tab) => {
          const active = tab.label === 'Hồ sơ';
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

function MetricCard({
  icon,
  label,
  value,
  status,
  tint,
  progress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  status: string;
  tint: string;
  progress: number;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <Text numberOfLines={1} style={styles.metricLabel}>{label}</Text>
        <MaterialIcons color={tint} name={icon} size={fontSize.iconMd} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { backgroundColor: tint, width: progress * 100 + '%' }]} />
      </View>
      <Text numberOfLines={1} style={[styles.metricStatus, { color: tint }]}>{status}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  detail,
  detailTone,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  detail: string;
  detailTone?: 'success';
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <MaterialIcons color={colors.primary} name={icon} size={fontSize.iconLg} />
      </View>
      <View style={styles.settingCopy}>
        <Text numberOfLines={1} style={styles.settingTitle}>{title}</Text>
        <Text numberOfLines={1} style={[styles.settingDetail, detailTone === 'success' && styles.settingSuccess]}>{detail}</Text>
      </View>
      <MaterialIcons color={colors.outline} name="chevron-right" size={fontSize.iconLg} />
    </Pressable>
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
  scrollContent: { padding: spacing.gutter, gap: spacing.spaceMd },
  identityCard: { padding: spacing.spaceMd, borderRadius: borderRadius.xl, backgroundColor: colors.surfaceContainerLowest, shadowColor: colors.onSurface, shadowOpacity: 0.08, shadowRadius: 5, elevation: 2, gap: spacing.spaceMd },
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.spaceMd },
  portraitWrap: { position: 'relative' },
  portrait: { width: 76, height: 76, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainer },
  verifiedBadge: { position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: borderRadius.full, backgroundColor: colors.successContainer, borderWidth: 2, borderColor: colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  identityInfo: { flex: 1, gap: spacing.spaceXs },
  driverName: { ...typography.headlineMd, color: colors.onSurface },
  tierBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs, backgroundColor: colors.primaryFixed, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.full },
  tierText: { ...typography.labelSm, color: colors.onPrimaryFixed },
  proofRow: { flexDirection: 'row' },
  proofBadge: { ...typography.labelMd, color: colors.onSurface, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.default, overflow: 'hidden' },
  proofSub: { ...typography.bodyMd, color: colors.secondary },
  star: { color: '#F59E0B' },
  greenDotText: { color: colors.success },
  safetyBanner: { minHeight: 64, padding: spacing.spaceSm, borderRadius: borderRadius.lg, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  safetyIcon: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.successContainer, alignItems: 'center', justifyContent: 'center' },
  safetyCopy: { flex: 1 },
  safetyTitle: { ...typography.labelMd, color: colors.onSurface },
  safetySub: { ...typography.bodyMd, color: colors.secondary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.labelLg, color: colors.onSurface },
  detailLink: { ...typography.bodyMd, color: colors.primary },
  metricsRow: { flexDirection: 'row', gap: spacing.spaceSm },
  metricCard: { flex: 1, minHeight: 142, padding: spacing.spaceSm, borderRadius: borderRadius.xl, backgroundColor: colors.surfaceContainerLowest, justifyContent: 'space-between', gap: spacing.spaceSm },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceXs },
  metricLabel: { ...typography.labelSm, color: colors.onSurfaceVariant, flex: 1 },
  metricValue: { ...typography.headlineMd, color: colors.onSurface },
  metricTrack: { height: 7, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainer, overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: borderRadius.full },
  metricStatus: { ...typography.labelSm },
  walletBanner: { minHeight: 140, padding: spacing.spaceMd, borderRadius: borderRadius.xl, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceSm, overflow: 'hidden' },
  walletCopy: { flex: 1 },
  walletLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs },
  walletLabel: { ...typography.labelMd, color: colors.onPrimary },
  walletAmount: { ...typography.headlineXlMobile, color: colors.onPrimary, marginTop: spacing.spaceXs },
  walletSub: { ...typography.bodyMd, color: colors.onPrimaryContainer, marginTop: spacing.spaceXs },
  withdrawButton: { minHeight: 44, paddingHorizontal: spacing.spaceMd, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest, flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs },
  withdrawText: { ...typography.labelMd, color: colors.primary },
  settingsHeading: { ...typography.labelLg, color: colors.onSurface, marginBottom: -spacing.spaceSm },
  settingsCard: { paddingHorizontal: spacing.spaceMd, borderRadius: borderRadius.xl, backgroundColor: colors.surfaceContainerLowest },
  settingRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surfaceContainerHigh },
  settingIcon: { width: 44, height: 44, borderRadius: borderRadius.full, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  autoIcon: { backgroundColor: colors.primarySoft },
  emergencyIcon: { backgroundColor: colors.errorContainer },
  settingCopy: { flex: 1, gap: spacing.spaceXs },
  settingTitle: { ...typography.bodyLg, color: colors.onSurface },
  settingDetail: { ...typography.bodyMd, color: colors.secondary },
  settingSuccess: { color: colors.success },
  emergencyText: { color: colors.error },
  toggleTrack: { width: 48, height: 28, padding: 3, borderRadius: borderRadius.full, backgroundColor: colors.outlineVariant, justifyContent: 'center' },
  toggleTrackActive: { backgroundColor: colors.primary, alignItems: 'flex-end' },
  toggleThumb: { width: 22, height: 22, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerLowest },
  toggleThumbActive: { backgroundColor: colors.onPrimary },
  logoutButton: { minHeight: 56, borderRadius: borderRadius.xl, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceSm },
  logoutText: { ...typography.labelLg, color: colors.error },
  versionText: { ...typography.bodyMd, color: colors.outline, textAlign: 'center' },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: spacing.tabBarHeight, paddingTop: spacing.spaceSm, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surfaceContainerHigh, flexDirection: 'row', justifyContent: 'space-around' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tabLabelActive: { ...typography.labelMd, color: colors.primary },
});
