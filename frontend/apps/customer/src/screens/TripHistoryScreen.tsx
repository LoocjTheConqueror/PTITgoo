import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '../components/EmptyStateCard';
import { HEADER_ACTION_GROUP_WIDTH, HeaderActionGroup, HeaderIconButton, HeaderLabeledIconButton, ScreenHeader } from '../components/ScreenHeader';
import { getCustomerRides } from '../services/customerApi';
import { getUnreadNotificationCount } from '../services/customerApi';
import type { CustomerRideSummary } from '../services/customerApi';
import { CustomerTabBar } from '../components/CustomerTabBar';

type Filter = 'all' | 'completed' | 'cancelled';
const labelForStatus: Record<string, string> = {
  PENDING: 'Đang tiếp nhận', SEARCHING: 'Đang tìm tài xế', DRIVER_ASSIGNED: 'Đã có tài xế', DRIVER_ARRIVING: 'Tài xế đang đến',
  DRIVER_ARRIVED: 'Tài xế đã đến', VEHICLE_HANDOVER: 'Bàn giao xe', IN_PROGRESS: 'Đang thực hiện', ARRIVED_DESTINATION: 'Đã đến nơi',
  VEHICLE_RETURNED: 'Đã trả xe', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', NO_DRIVER_FOUND: 'Không tìm được tài xế', EXPIRED: 'Hết hạn',
};
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;

export default function TripHistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [rides, setRides] = useState<CustomerRideSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async (nextPage = 0, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const status = filter === 'completed' ? 'COMPLETED' : filter === 'cancelled' ? 'CANCELLED,NO_DRIVER_FOUND,EXPIRED' : undefined;
      const result = await getCustomerRides(nextPage, 20, status);
      setRides((current) => append ? [...current, ...result.content] : result.content);
      setPage(result.page);
      setTotal(result.totalElements);
      setHasNext(result.hasNext);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được lịch sử chuyến.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useFocusEffect(useCallback(() => {
    let active = true;
    getUnreadNotificationCount().then((count) => { if (active) setUnreadCount(count); }).catch(() => {});
    return () => { active = false; };
  }, []));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Lịch sử"
        largeTitle
        sideSlotWidth={HEADER_ACTION_GROUP_WIDTH}
        rightContent={<HeaderActionGroup>
          <HeaderIconButton icon="refresh" accessibilityLabel="Tải lại lịch sử" onPress={() => void load()} compact />
          <HeaderLabeledIconButton icon="shield" label="An toàn" accessibilityLabel="An toàn chuyến đi" onPress={() => router.push({ pathname: '/(main)/support', params: { topic: 'safety' } })} />
        </HeaderActionGroup>}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.summary}><Text style={styles.summaryCount}>{total}</Text><Text style={styles.summaryText}>chuyến trong tài khoản</Text></View>
        <View style={styles.filters}>{([['all', 'Tất cả'], ['completed', 'Hoàn thành'], ['cancelled', 'Đã hủy']] as const).map(([key, label]) => <Pressable key={key} onPress={() => setFilter(key)} style={[styles.filter, filter === key && styles.filterActive]}><Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text></Pressable>)}</View>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && rides.length === 0 ? (
          <EmptyStateCard
            icon="history"
            title={filter === 'all' ? 'Chưa có chuyến đi nào' : 'Chưa có chuyến phù hợp'}
            description={filter === 'all' ? 'Các chuyến đi của bạn sẽ xuất hiện ở đây.' : 'Thử xem tất cả chuyến đi để tìm chuyến bạn cần.'}
            actionLabel={filter === 'all' ? 'Đặt chuyến đầu tiên' : 'Xem tất cả chuyến'}
            onAction={() => filter === 'all' ? router.push('/(main)/route-selection') : setFilter('all')}
          />
        ) : null}
        {rides.map((ride) => <Pressable key={ride.id} onPress={() => router.push({ pathname: '/(main)/ride-detail', params: { rideId: String(ride.id), returnTo: 'history' } })} style={styles.ride}>
          <View style={styles.rideHeader}><View style={styles.rideTitleRow}><MaterialIcons name="directions-car" size={22} color={colors.primary} /><Text style={styles.rideTitle}>Chuyến #{ride.id}</Text></View><Text style={[styles.status, ride.status === 'CANCELLED' && styles.statusCancelled]}>{labelForStatus[ride.status] ?? ride.status}</Text></View>
          <Text style={styles.meta}>{new Date(ride.createdAt).toLocaleString('vi-VN')} · {ride.type === 'INSTANT' ? 'Đặt ngay' : `Đón lúc ${ride.scheduledAt ? new Date(ride.scheduledAt).toLocaleString('vi-VN') : 'theo lịch'}`}</Text>
          <Text style={styles.address}><Text style={styles.pin}>Đón: </Text>{ride.pickupAddress || 'Chưa có địa chỉ'}</Text>
          <Text style={styles.address}><Text style={styles.pin}>Đến: </Text>{ride.dropoffAddress || 'Chưa có địa chỉ'}</Text>
          <View style={styles.rideFooter}><Text style={styles.fare}>{money(ride.finalFare ?? ride.estimatedFare)}</Text><MaterialIcons name="chevron-right" size={23} color={colors.onSurfaceVariant} /></View>
        </Pressable>)}
        {hasNext ? <Pressable disabled={loadingMore} onPress={() => void load(page + 1, true)} style={styles.more}>{loadingMore ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.moreText}>Tải thêm chuyến</Text>}</Pressable> : null}
      </ScrollView>
      <CustomerTabBar active="history" unreadCount={unreadCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  content: { padding: spacing.margin, gap: 12, paddingBottom: 30 },
  summary: { alignItems: 'center', padding: 14, borderRadius: borderRadius.lg, backgroundColor: colors.primaryFixedTint },
  summaryCount: { ...typography.headlineMd, color: colors.primary }, summaryText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  filters: { flexDirection: 'row', gap: 8 }, filter: { flex: 1, alignItems: 'center', padding: 10, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.full }, filterActive: { backgroundColor: colors.primary, borderColor: colors.primary }, filterText: { ...typography.labelMd, color: colors.onSurfaceVariant }, filterTextActive: { color: colors.onPrimary },
  ride: { padding: 14, gap: 8, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, rideTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, rideTitle: { ...typography.labelLg, color: colors.onSurface },
  status: { ...typography.labelSm, color: colors.primary }, statusCancelled: { color: colors.error }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant }, address: { ...typography.bodyMd, color: colors.onSurface }, pin: { color: colors.primary },
  rideFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 6 }, fare: { ...typography.labelLg, color: colors.onSurface },
  more: { minHeight: 48, justifyContent: 'center', alignItems: 'center' }, moreText: { ...typography.labelLg, color: colors.primary }, error: { ...typography.bodyMd, color: colors.error },
});
