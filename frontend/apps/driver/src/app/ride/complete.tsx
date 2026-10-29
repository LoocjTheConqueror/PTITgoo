import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  borderRadius,
  colors,
  fontSize,
  spacing,
  typography,
} from '@datxe/shared';

const FARE_ROWS = [
  { label: 'Tổng cước khách trả', amount: '250.000₫', color: colors.onSurface },
  { label: 'Phí nền tảng DriveMate (15%)', amount: '-37.500₫', color: colors.error },
  { label: 'Thưởng chuyến đêm  +Đêm', amount: '+15.000₫', color: colors.success },
  { label: 'Bảo hiểm chuyến đi', amount: '0₫', color: colors.success, detail: 'Công ty đài thọ 100%' },
];

export default function CompleteRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchState, setSearchState] = useState<'idle' | 'searching' | 'ready'>('idle');

  const handleNextRide = () => {
    if (searchState === 'ready') {
      router.replace('/(tabs)/home' as never);
      return;
    }
    if (searchState === 'searching') return;
    setSearchState('searching');
    setTimeout(() => setSearchState('ready'), 1500);
  };

  const ctaLabel =
    searchState === 'searching'
      ? 'Đang tìm cuốc xe mới...'
      : searchState === 'ready'
        ? 'Đã sẵn sàng nhận cuốc'
        : 'Hoàn thành & Nhận cuốc tiếp';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons color={colors.onPrimary} name="arrow-back" size={fontSize.icon2xl} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi Tiết Chuyến Xe</Text>
        <View style={styles.headerAvatar}>
          <MaterialIcons color={colors.onPrimary} name="person-outline" size={fontSize.iconMd} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.spaceXl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.summaryCard} variant="surface">
          <View style={styles.successCircle}>
            <MaterialIcons color={colors.success} name="check-circle-outline" size={fontSize.icon3xl} />
          </View>
          <View style={styles.tripCompletePill}>
            <View style={styles.greenDot} />
            <Text style={styles.tripCompleteText}>CHUYẾN ĐI HOÀN TẤT AN TOÀN</Text>
          </View>
          <Text style={styles.earningsLabel}>Thu nhập thực nhận</Text>
          <Text style={styles.earnings}>210.000<Text style={styles.currency}> ₫</Text></Text>
          <View style={styles.paymentBanner}>
            <MaterialIcons color={colors.primary} name="account-balance-wallet" size={fontSize.icon2xl} />
            <Text style={styles.paymentText}>Đã thanh toán qua Ví điện tử</Text>
            <Text style={styles.cashTag}>Không thu tiền mặt</Text>
          </View>
        </Card>

        <Card style={styles.reviewCard} variant="surface">
          <View style={styles.reviewHeading}>
            <View style={styles.reviewTitle}>
              <MaterialIcons color={colors.primary} name="thumb-up" size={fontSize.iconXl} />
              <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
            </View>
            <Text style={styles.stars}>☆☆☆☆☆</Text>
          </View>
          <View style={styles.quoteBox}>
            <MaterialIcons color={colors.secondary} name="format-quote" size={fontSize.iconXl} />
            <View style={styles.quoteTextBox}>
              <Text style={styles.quote}>&quot;Lái xe rất êm, chu đáo và đúng giờ.&quot;</Text>
              <Text style={styles.quoteSource}>Khách hàng xe Mazda CX-5 • 5.0 ★</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.fareCard} variant="surface">
          <View style={styles.fareHeading}>
            <Text style={styles.sectionTitle}>Chi tiết cước phí</Text>
            <Text style={styles.tripId}>Mã: #DX-8892</Text>
          </View>
          {FARE_ROWS.map((row) => (
            <View key={row.label} style={styles.fareRow}>
              <View style={styles.fareLabelWrap}>
                <Text style={styles.fareLabel}>{row.label}</Text>
                {row.detail ? <Text style={styles.fareDetail}>{row.detail}</Text> : null}
              </View>
              <Text style={[styles.fareAmount, { color: row.color }]}>{row.amount}</Text>
            </View>
          ))}
          <View style={styles.walletTotal}>
            <View style={styles.walletTotalCopy}>
              <Text style={styles.walletTotalTitle}>Thực nhận vào ví</Text>
              <Text style={styles.walletTotalCaption}>Cộng trực tiếp vào số dư ví tài xế</Text>
            </View>
            <Text style={styles.walletTotalAmount}>210.000₫</Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard icon="near-me" label="Quãng đường" value="14.8 km" />
          <StatCard icon="schedule" label="Thời gian lái" value="32 phút" />
          <StatCard icon="directions-car" label="Loại xe" value="Tự động (AT)" />
        </View>

        <Button
          icon={searchState === 'ready' ? 'check' : searchState === 'searching' ? undefined : 'radar'}
          iconPosition="leading"
          label={ctaLabel}
          loading={searchState === 'searching'}
          onPress={handleNextRide}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
        />
        <Text style={styles.footerText}>
          Hệ thống sẽ tự động quét khách hàng gần nhất quanh vị trí hiện tại
        </Text>
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Card style={styles.statCard} variant="surface">
      <MaterialIcons color={colors.secondary} name={icon} size={fontSize.iconLg} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.statValue}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    minHeight: spacing.headerHeight,
    paddingHorizontal: spacing.spaceMd,
    paddingBottom: spacing.spaceSm,
    backgroundColor: colors.driverHeader,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
  },
  headerTitle: { ...typography.headlineSm, color: colors.onPrimary, flex: 1 },
  backButton: { width: spacing.iconButtonMd, height: spacing.iconButtonMd, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: spacing.avatarMd, height: spacing.avatarMd, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.gutter, gap: spacing.spaceMd },
  summaryCard: { alignItems: 'center', padding: spacing.spaceLg, gap: spacing.spaceSm },
  successCircle: { width: 76, height: 76, borderRadius: borderRadius.full, backgroundColor: colors.successContainer, alignItems: 'center', justifyContent: 'center' },
  tripCompletePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs, paddingHorizontal: spacing.spaceMd, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.full, backgroundColor: colors.secondaryFixed },
  greenDot: { width: 8, height: 8, borderRadius: borderRadius.full, backgroundColor: colors.success },
  tripCompleteText: { ...typography.labelLg, color: colors.onSurface },
  earningsLabel: { ...typography.bodyLg, color: colors.secondary },
  earnings: { color: colors.successStrong, fontSize: 48, lineHeight: 56, fontWeight: '700', letterSpacing: -1.5 },
  currency: { fontSize: 30, lineHeight: 38 },
  paymentBanner: { width: '100%', minHeight: 68, padding: spacing.spaceSm, paddingHorizontal: spacing.spaceMd, borderRadius: borderRadius.lg, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceSm },
  paymentText: { ...typography.labelLg, color: colors.onSurface, flex: 1, textAlign: 'center' },
  cashTag: { ...typography.labelMd, color: colors.onSuccessContainer, backgroundColor: colors.successContainer, borderRadius: borderRadius.full, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceSm, textAlign: 'center', overflow: 'hidden' },
  reviewCard: { gap: spacing.spaceSm },
  reviewHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceSm },
  reviewTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, flex: 1 },
  sectionTitle: { ...typography.headlineSm, color: colors.onSurface },
  stars: { color: '#F59E0B', fontSize: fontSize.headlineMd, letterSpacing: -2 },
  quoteBox: { borderRadius: borderRadius.lg, backgroundColor: colors.primarySoft, padding: spacing.spaceSm, flexDirection: 'row', gap: spacing.spaceSm },
  quoteTextBox: { flex: 1 },
  quote: { ...typography.bodyLg, color: colors.onSurface, fontStyle: 'italic' },
  quoteSource: { ...typography.bodyMd, color: colors.secondary, marginTop: spacing.spaceXs },
  fareCard: { padding: spacing.spaceMd, gap: spacing.spaceSm },
  fareHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.spaceXs },
  tripId: { ...typography.bodyMd, color: colors.secondary },
  fareRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceMd },
  fareLabelWrap: { flex: 1 },
  fareLabel: { ...typography.bodyMd, color: colors.secondary },
  fareDetail: { ...typography.bodyMd, color: colors.success },
  fareAmount: { ...typography.labelLg },
  walletTotal: { marginHorizontal: -spacing.spaceMd, marginBottom: -spacing.spaceMd, marginTop: spacing.spaceXs, padding: spacing.spaceMd, borderBottomLeftRadius: borderRadius.xl, borderBottomRightRadius: borderRadius.xl, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceSm },
  walletTotalCopy: { flex: 1 },
  walletTotalTitle: { ...typography.labelLg, color: colors.onSurface },
  walletTotalCaption: { ...typography.bodyMd, color: colors.secondary },
  walletTotalAmount: { ...typography.headlineSm, color: colors.successStrong },
  statsRow: { flexDirection: 'row', gap: spacing.spaceSm },
  statCard: { flex: 1, paddingHorizontal: spacing.spaceXs, paddingVertical: spacing.spaceMd, alignItems: 'center', gap: spacing.spaceXs },
  statLabel: { ...typography.bodyMd, color: colors.secondary, textAlign: 'center' },
  statValue: { ...typography.labelLg, color: colors.onSurface, textAlign: 'center' },
  nextButton: { minHeight: 64, marginTop: spacing.spaceXs },
  nextButtonText: { ...typography.headlineSm, color: colors.onPrimary },
  footerText: { ...typography.bodyMd, color: colors.secondary, textAlign: 'center', marginTop: -spacing.spaceSm },
});
