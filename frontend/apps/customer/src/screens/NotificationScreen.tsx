import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '../components/EmptyStateCard';
import { HEADER_ACTION_GROUP_WIDTH, HeaderActionGroup, HeaderIconButton, HeaderLabeledIconButton, ScreenHeader } from '../components/ScreenHeader';
import { getCustomerNotifications, getUnreadNotificationCount, markAllCustomerNotificationsRead, markCustomerNotificationRead } from '../services/customerApi';
import type { CustomerNotification } from '../services/customerApi';
import { CustomerTabBar } from '../components/CustomerTabBar';

type NotificationFilter = 'all' | 'trip' | 'promo' | 'vehicle';
const category = (type: string): NotificationFilter => {
  const key = type.toLowerCase();
  if (key.includes('voucher') || key.includes('promo') || key.includes('promotion')) return 'promo';
  if (key.includes('vehicle') || key.includes('handover')) return 'vehicle';
  return 'trip';
};
const readable = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const titleFor = (type: string) => type.replaceAll('_', ' ').toLocaleLowerCase('vi-VN').replace(/^./, (char) => char.toLocaleUpperCase('vi-VN')) || 'Thông báo';
const bodyFor = (rawPayload: unknown) => {
  const payload = rawPayload && typeof rawPayload === 'object' ? rawPayload as Record<string, unknown> : {};
  for (const key of ['message', 'body', 'description', 'content', 'note']) {
    const value = readable(payload[key]);
    if (value) return value;
  }
  const parts = Object.entries(payload).filter(([, value]) => typeof value === 'string' || typeof value === 'number').slice(0, 4).map(([key, value]) => `${key}: ${String(value)}`);
  return parts.join(' · ') || 'Thông báo được ghi nhận từ hệ thống.';
};

export default function NotificationScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, unread] = await Promise.all([getCustomerNotifications(), getUnreadNotificationCount()]);
      setItems(list);
      setUnreadCount(unread);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thông báo.');
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const markRead = async (item: CustomerNotification) => {
    if (item.readAt) return;
    try {
      await markCustomerNotificationRead(item.id);
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, readAt: new Date().toISOString() } : value));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      Alert.alert('Không thể đánh dấu đã đọc', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    }
  };

  const markAll = async () => {
    try {
      await markAllCustomerNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      Alert.alert('Không thể cập nhật thông báo', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    }
  };

  const openNotification = async (item: CustomerNotification) => {
    await markRead(item);
    const payload = item.payload && typeof item.payload === 'object' ? item.payload as Record<string, unknown> : {};
    const rawRideId = payload.rideId ?? payload.ride_id;
    const rideId = typeof rawRideId === 'number' ? rawRideId : typeof rawRideId === 'string' ? Number(rawRideId) : NaN;
    if (Number.isSafeInteger(rideId) && rideId > 0) {
      router.push({ pathname: '/(main)/ride-detail', params: { rideId: String(rideId), returnTo: 'notifications' } });
    }
  };

  const visible = items.filter((item) => filter === 'all' || category(item.type) === filter);

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScreenHeader
      title="Thông báo"
      largeTitle
      sideSlotWidth={HEADER_ACTION_GROUP_WIDTH}
      rightContent={<HeaderActionGroup>
        <HeaderIconButton icon="refresh" accessibilityLabel="Tải lại thông báo" onPress={() => void refresh()} compact />
        <HeaderLabeledIconButton icon="shield" label="An toàn" accessibilityLabel="An toàn chuyến đi" onPress={() => router.push({ pathname: '/(main)/support', params: { topic: 'safety' } })} />
      </HeaderActionGroup>}
    />
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.summary}><View><Text style={styles.heading}>Hộp thư thông báo</Text><Text style={styles.meta}>{unreadCount} thông báo chưa đọc</Text></View><Pressable disabled={unreadCount === 0} onPress={() => void markAll()}><Text style={[styles.markAll, unreadCount === 0 && styles.dim]}>Đọc tất cả</Text></Pressable></View>
      <View style={styles.filters}>{([['all', 'Tất cả'], ['trip', 'Chuyến đi'], ['promo', 'Ưu đãi'], ['vehicle', 'Xe']] as const).map(([key, label]) => <Pressable key={key} onPress={() => setFilter(key)} style={[styles.filter, filter === key && styles.filterActive]}><Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text></Pressable>)}</View>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && !visible.length ? (
        <EmptyStateCard
          icon="notifications-none"
          title={items.length === 0 ? 'Chưa có thông báo' : 'Không có thông báo trong mục này'}
          description={items.length === 0
            ? 'Thông báo về chuyến đi và ưu đãi sẽ xuất hiện tại đây.'
            : 'Thử xem tất cả thông báo để tìm nội dung khác.'}
          actionLabel={items.length === 0 ? 'Đặt chuyến đầu tiên' : 'Xem tất cả thông báo'}
          onAction={() => items.length === 0 ? router.push('/(main)/route-selection') : setFilter('all')}
        />
      ) : null}
      {visible.map((item) => {
        const unread = !item.readAt;
        return <Pressable key={item.id} onPress={() => void openNotification(item)} style={[styles.item, unread && styles.itemUnread]}>
          <View style={[styles.icon, unread && styles.iconUnread]}><MaterialIcons name={category(item.type) === 'vehicle' ? 'directions-car' : category(item.type) === 'promo' ? 'local-offer' : 'notifications'} size={22} color={unread ? colors.primary : colors.onSurfaceVariant} /></View>
          <View style={styles.copy}><View style={styles.itemHeader}><Text style={[styles.itemTitle, unread && styles.itemTitleUnread]}>{titleFor(item.type)}</Text>{unread ? <View style={styles.dot} /> : null}</View><Text style={styles.body}>{bodyFor(item.payload)}</Text><Text style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text></View>
        </Pressable>;
      })}
    </ScrollView>
    <CustomerTabBar active="notifications" unreadCount={unreadCount} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface }, scroll: { flex: 1 },
  content: { padding: spacing.margin, gap: 12, paddingBottom: 30 }, summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest }, heading: { ...typography.labelLg, color: colors.onSurface }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant }, markAll: { ...typography.labelMd, color: colors.primary }, dim: { color: colors.onSurfaceVariant },
  filters: { flexDirection: 'row', gap: 7 }, filter: { flex: 1, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.full }, filterActive: { backgroundColor: colors.primary, borderColor: colors.primary }, filterText: { ...typography.labelSm, color: colors.onSurfaceVariant }, filterTextActive: { color: colors.onPrimary },
  item: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest }, itemUnread: { borderWidth: 1, borderColor: colors.primaryFixed }, icon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: colors.surfaceContainerHigh }, iconUnread: { backgroundColor: colors.primaryFixedTint }, copy: { flex: 1, gap: 5 }, itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, itemTitle: { ...typography.labelMd, color: colors.onSurface }, itemTitleUnread: { color: colors.primary }, body: { ...typography.bodyMd, color: colors.onSurfaceVariant }, time: { ...typography.labelSm, color: colors.onSurfaceVariant }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  error: { ...typography.bodyMd, color: colors.error },
});
