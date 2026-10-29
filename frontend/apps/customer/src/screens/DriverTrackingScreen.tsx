import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { cancelCustomerRide, getCustomerRide, getCustomerVehicles } from '../services/customerApi';
import type { CustomerRideDetail, CustomerVehicle } from '../services/customerApi';

const rideStatusLabel: Record<string, string> = {
  PENDING: 'Đang tiếp nhận yêu cầu', SEARCHING: 'Đang tìm tài xế', DRIVER_ASSIGNED: 'Tài xế đã nhận chuyến',
  DRIVER_ARRIVING: 'Tài xế đang đến điểm đón', DRIVER_ARRIVED: 'Tài xế đã đến điểm đón',
  VEHICLE_HANDOVER: 'Đang bàn giao xe', IN_PROGRESS: 'Chuyến đi đang diễn ra',
  ARRIVED_DESTINATION: 'Đã đến điểm trả', VEHICLE_RETURNED: 'Đang hoàn tất bàn giao xe',
  COMPLETED: 'Chuyến đi hoàn thành', CANCELLED: 'Chuyến đi đã hủy', NO_DRIVER_FOUND: 'Không tìm thấy tài xế', EXPIRED: 'Yêu cầu đã hết hạn',
};
const cancellableStatuses = ['PENDING', 'SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'VEHICLE_HANDOVER'];
const chatStatuses = ['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'VEHICLE_HANDOVER', 'IN_PROGRESS', 'ARRIVED_DESTINATION', 'VEHICLE_RETURNED'];

export default function DriverTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string }>();
  const rideId = Number(Array.isArray(params.rideId) ? params.rideId[0] : params.rideId);
  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [vehicle, setVehicle] = useState<CustomerVehicle | null>(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const refresh = useCallback(async () => {
    if (!rideId) { setError('Thiếu mã chuyến.'); return; }
    try {
      const next = await getCustomerRide(rideId);
      setRide(next);
      setError('');
      if (next.status === 'COMPLETED') {
        router.replace({ pathname: '/(main)/trip-completed', params: { rideId: String(next.id) } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thông tin chuyến.');
    }
  }, [rideId, router]);

  useEffect(() => {
    if (ride && ['COMPLETED', 'CANCELLED', 'NO_DRIVER_FOUND', 'EXPIRED'].includes(ride.status)) return;
    void refresh();
    const timer = setInterval(() => void refresh(), 6000);
    return () => clearInterval(timer);
  }, [refresh, ride?.status, rideId]);

  const assignedVehicleId = ride?.vehicleId;
  useEffect(() => {
    if (!assignedVehicleId) return;
    getCustomerVehicles().then((items) => setVehicle(items.find((item) => item.id === assignedVehicleId) ?? null)).catch(() => {});
  }, [assignedVehicleId]);

  const pendingPickup = ride?.handoverReports.find((report) => report.phase === 'PICKUP' && !report.confirmedByCustomer);
  const pendingDropoff = ride?.handoverReports.find((report) => report.phase === 'DROPOFF' && !report.confirmedByCustomer);
  const cancel = () => Alert.alert('Hủy chuyến', 'Bạn có muốn hủy chuyến này?', [
    { text: 'Đóng', style: 'cancel' },
    { text: 'Hủy chuyến', style: 'destructive', onPress: () => { void (async () => {
      if (!ride || cancelling) return;
      setCancelling(true);
      try { await cancelCustomerRide(ride.id, 'Khách hàng hủy chuyến'); router.replace('/(main)/home'); }
      catch (err) { Alert.alert('Không thể hủy chuyến', err instanceof Error ? err.message : 'Vui lòng thử lại.'); }
      finally { setCancelling(false); }
    })(); } },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Theo dõi chuyến" backAccessibilityLabel="Mở chi tiết chuyến" onBack={() => ride && router.replace({ pathname: '/(main)/ride-detail', params: { rideId: String(ride.id), returnTo: 'home' } })} />
      <ScrollView contentContainerStyle={styles.content}>
        {!ride ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.meta}>Đang tải chuyến…</Text></View> : <>
          <View style={styles.statusCard}><MaterialIcons name="directions-car" size={30} color={colors.primary} /><Text style={styles.status}>{rideStatusLabel[ride.status] ?? ride.status}</Text><Text style={styles.meta}>Mã chuyến #{ride.id} · Cập nhật {new Date(ride.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>{ride.type === 'SCHEDULED' && ride.scheduledAt ? <Text style={styles.meta}>Giờ hẹn: {new Date(ride.scheduledAt).toLocaleString('vi-VN')}</Text> : null}</View>
          <View style={styles.card}>
            <Text style={styles.section}>Thông tin tài xế</Text>
            <Text style={styles.body}>{ride.driverId ? `Tài xế #${ride.driverId} đã được phân công.` : 'Backend chưa phân công tài xế cho chuyến này.'}</Text>
            <Text style={styles.note}>API hiện tại chỉ trả về mã tài xế, chưa có tên, số điện thoại hoặc vị trí trực tiếp.</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.section}>Xe của bạn</Text>
            <Text style={styles.body}>{vehicle ? [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicle_type || 'Xe' : `Phương tiện #${ride.vehicleId}`}</Text>
            <Text style={styles.meta}>{vehicle?.plate_number || 'Chưa có biển số'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.section}>Lộ trình</Text>
            <Text style={styles.label}>ĐIỂM ĐÓN</Text><Text style={styles.body}>{ride.pickupAddress || 'Không có địa chỉ'}</Text>
            <View style={styles.divider} /><Text style={styles.label}>ĐIỂM ĐẾN</Text><Text style={styles.body}>{ride.dropoffAddress || 'Không có địa chỉ'}</Text>
            <Text style={styles.meta}>Giá dự kiến: {new Intl.NumberFormat('vi-VN').format(ride.estimatedFare)} đ</Text>
          </View>
          {ride.driverId && chatStatuses.includes(ride.status) ? <Action
            label={ride.unreadChatCount > 0 ? `Nhắn tin với tài xế · ${ride.unreadChatCount} tin chưa đọc` : 'Nhắn tin với tài xế'}
            onPress={() => router.push({ pathname: '/(main)/chat', params: { rideId: String(ride.id) } } as never)}
          /> : null}
          {pendingPickup ? <Action label="Xem và xác nhận bàn giao lúc đón" onPress={() => router.push({ pathname: '/(main)/vehicle-inspection', params: { rideId: String(ride.id), phase: 'pickup' } })} /> : null}
          {pendingDropoff ? <Action label="Xem và xác nhận hoàn trả xe" onPress={() => router.push({ pathname: '/(main)/vehicle-inspection', params: { rideId: String(ride.id), phase: 'dropoff' } })} /> : null}
          {['CANCELLED', 'NO_DRIVER_FOUND', 'EXPIRED'].includes(ride.status) ? <Action label="Về trang chủ" onPress={() => router.replace('/(main)/home')} /> : null}
          <Pressable onPress={() => void refresh()} style={styles.secondary}><Text style={styles.secondaryText}>Làm mới trạng thái</Text></Pressable>
          {cancellableStatuses.includes(ride.status) ? <Pressable disabled={cancelling} onPress={cancel} style={styles.cancel}>{cancelling ? <ActivityIndicator color={colors.error} /> : <Text style={styles.cancelText}>Hủy chuyến</Text>}</Pressable> : null}
        </>}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.primary}><Text style={styles.primaryText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 13, paddingBottom: 34 },
  loading: { alignItems: 'center', gap: 12, padding: 28 },
  statusCard: { alignItems: 'center', gap: 9, backgroundColor: colors.primaryFixedTint, borderRadius: borderRadius.lg, padding: 20 },
  status: { ...typography.headlineSm, color: colors.onSurface, textAlign: 'center' }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, padding: 16, gap: 8 },
  section: { ...typography.labelLg, color: colors.onSurface }, body: { ...typography.bodyMd, color: colors.onSurface }, note: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  label: { ...typography.labelSm, color: colors.primary }, divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: 3 },
  primary: { minHeight: 50, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, primaryText: { ...typography.labelLg, color: colors.onPrimary },
  secondary: { alignItems: 'center', padding: 12 }, secondaryText: { ...typography.labelLg, color: colors.primary },
  cancel: { minHeight: 50, borderWidth: 1, borderColor: colors.error, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' }, cancelText: { ...typography.labelLg, color: colors.error },
  error: { ...typography.bodyMd, color: colors.error, textAlign: 'center' },
});
