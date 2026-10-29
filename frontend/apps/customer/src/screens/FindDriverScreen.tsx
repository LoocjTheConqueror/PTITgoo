import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { cancelCustomerRide, getCustomerRide, getActiveCustomerRide } from '../services/customerApi';
import type { CustomerRideDetail } from '../services/customerApi';

const statusText: Record<string, string> = {
  PENDING: 'Yêu cầu đang được tiếp nhận',
  SEARCHING: 'Đang tìm tài xế phù hợp',
  DRIVER_ASSIGNED: 'Đã có tài xế nhận chuyến',
  DRIVER_ARRIVING: 'Tài xế đang đến điểm đón',
  DRIVER_ARRIVED: 'Tài xế đã đến điểm đón',
  VEHICLE_HANDOVER: 'Đang chờ xác nhận bàn giao xe',
  IN_PROGRESS: 'Chuyến đi đang diễn ra',
  ARRIVED_DESTINATION: 'Xe đã đến điểm trả',
  VEHICLE_RETURNED: 'Đang chờ xác nhận hoàn trả xe',
  COMPLETED: 'Chuyến đi đã hoàn thành',
  NO_DRIVER_FOUND: 'Chưa tìm được tài xế',
  EXPIRED: 'Yêu cầu chuyến đi đã hết hạn',
  CANCELLED: 'Chuyến đi đã bị hủy',
};

export default function FindDriverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string }>();
  const rideId = Number(Array.isArray(params.rideId) ? params.rideId[0] : params.rideId);
  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const moved = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const next = rideId ? await getCustomerRide(rideId) : await getActiveCustomerRide();
      if (!next) {
        setError('Không tìm thấy chuyến đang hoạt động trong tài khoản.');
        return;
      }
      setRide(next);
      setError('');
      if (moved.current) return;
      if (['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'VEHICLE_HANDOVER', 'IN_PROGRESS', 'ARRIVED_DESTINATION', 'VEHICLE_RETURNED'].includes(next.status)) {
        moved.current = true;
        router.replace({ pathname: '/(main)/driver-tracking', params: { rideId: String(next.id) } });
      } else if (next.status === 'COMPLETED') {
        moved.current = true;
        router.replace({ pathname: '/(main)/trip-completed', params: { rideId: String(next.id) } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được trạng thái chuyến.');
    }
  }, [rideId, router]);

  useEffect(() => {
    if (ride && [
      'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'VEHICLE_HANDOVER',
      'IN_PROGRESS', 'ARRIVED_DESTINATION', 'VEHICLE_RETURNED', 'COMPLETED',
      'NO_DRIVER_FOUND', 'EXPIRED', 'CANCELLED',
    ].includes(ride.status)) return;
    void refresh();
    const pollInterval = ride?.type === 'SCHEDULED' && ride.status === 'PENDING' ? 30_000 : 4_000;
    const timer = setInterval(() => void refresh(), pollInterval);
    return () => clearInterval(timer);
  }, [refresh, ride?.status, ride?.type]);

  const cancel = () => Alert.alert('Hủy chuyến', 'Bạn muốn hủy yêu cầu tìm tài xế?', [
    { text: 'Tiếp tục tìm', style: 'cancel' },
    { text: 'Hủy chuyến', style: 'destructive', onPress: () => void (async () => {
      if (!ride || cancelling) return;
      setCancelling(true);
      try {
        await cancelCustomerRide(ride.id, 'Khách hàng hủy yêu cầu');
        router.replace('/(main)/home');
      } catch (err) {
        Alert.alert('Không thể hủy chuyến', err instanceof Error ? err.message : 'Vui lòng thử lại.');
      } finally {
        setCancelling(false);
      }
    })() },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Tìm tài xế" backAccessibilityLabel="Về trang chủ" onBack={() => router.replace('/(main)/home')} />
      <View style={styles.content}>
        <View style={styles.icon}><MaterialIcons name="search" size={40} color={colors.primary} /></View>
        <Text style={styles.status}>{ride ? ride.type === 'SCHEDULED' && ride.status === 'PENDING' ? 'Đã đặt lịch, đang chờ đến giờ tìm tài xế' : statusText[ride.status] ?? ride.status : 'Đang tải trạng thái chuyến'}</Text>
        {ride ? <Text style={styles.meta}>Mã chuyến #{ride.id} · {ride.type === 'INSTANT' ? 'Chuyến ngay' : `Đón lúc ${ride.scheduledAt ? new Date(ride.scheduledAt).toLocaleString('vi-VN') : 'theo lịch đã đặt'}`}</Text> : <ActivityIndicator color={colors.primary} />}
        {ride ? <View style={styles.route}>
          <Text style={styles.label}>ĐIỂM ĐÓN</Text><Text style={styles.address}>{ride.pickupAddress || 'Backend chưa có địa chỉ điểm đón'}</Text>
          <View style={styles.divider} /><Text style={styles.label}>ĐIỂM ĐẾN</Text><Text style={styles.address}>{ride.dropoffAddress || 'Backend chưa có địa chỉ điểm đến'}</Text>
        </View> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={() => void refresh()} style={styles.secondary}><Text style={styles.secondaryText}>Cập nhật trạng thái</Text></Pressable>
        <Pressable disabled={!ride || cancelling || !['PENDING', 'SEARCHING'].includes(ride.status)} onPress={cancel} style={[styles.cancel, (!ride || cancelling || !['PENDING', 'SEARCHING'].includes(ride.status)) && styles.disabled]}>
          {cancelling ? <ActivityIndicator color={colors.error} /> : <Text style={styles.cancelText}>Hủy yêu cầu</Text>}
        </Pressable>
        {ride && ['NO_DRIVER_FOUND', 'EXPIRED', 'CANCELLED'].includes(ride.status) ? <Pressable onPress={() => router.replace('/(main)/home')} style={styles.secondary}><Text style={styles.secondaryText}>Về trang chủ</Text></Pressable> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.margin, gap: 16 },
  icon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primaryFixedTint, alignItems: 'center', justifyContent: 'center' },
  status: { ...typography.headlineSm, color: colors.onSurface, textAlign: 'center' },
  meta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  route: { width: '100%', borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest, padding: 16, gap: 8 },
  label: { ...typography.labelSm, color: colors.primary }, address: { ...typography.bodyMd, color: colors.onSurface }, divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: 4 },
  error: { ...typography.bodyMd, color: colors.error, textAlign: 'center' },
  secondary: { padding: 12 }, secondaryText: { ...typography.labelLg, color: colors.primary },
  cancel: { minHeight: 50, width: '100%', borderWidth: 1, borderColor: colors.error, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' }, cancelText: { ...typography.labelLg, color: colors.error }, disabled: { opacity: 0.45 },
});
