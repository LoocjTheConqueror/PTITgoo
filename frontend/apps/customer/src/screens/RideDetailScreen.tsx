import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { getCustomerRide } from '../services/customerApi';
import type { CustomerRideDetail } from '../services/customerApi';

const chatStatuses = ['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'VEHICLE_HANDOVER', 'IN_PROGRESS', 'ARRIVED_DESTINATION', 'VEHICLE_RETURNED'];

export default function RideDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string; returnTo?: string }>();
  const rideId = Number(Array.isArray(params.rideId) ? params.rideId[0] : params.rideId);
  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [error, setError] = useState('');
  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const goBack = () => router.replace(returnTo === 'notifications' ? '/(main)/notifications' : returnTo === 'home' ? '/(main)/home' : '/(main)/trip-history');
  const refresh = useCallback(async () => {
    try { setRide(await getCustomerRide(rideId)); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không tải được chuyến đi.'); }
  }, [rideId]);
  useEffect(() => { void refresh(); }, [refresh]);

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScreenHeader title="Chi tiết chuyến" onBack={goBack} />
    <ScrollView contentContainerStyle={styles.content}>
      {!ride && !error ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {ride ? <>
        <View style={styles.card}><Text style={styles.heading}>Chuyến #{ride.id}</Text><Text style={styles.body}>Trạng thái: {statusLabel(ride.status)}</Text><Text style={styles.meta}>{ride.type === 'INSTANT' ? 'Chuyến ngay' : `Chuyến đặt lịch${ride.scheduledAt ? ` · ${new Date(ride.scheduledAt).toLocaleString('vi-VN')}` : ''}`} · {new Date(ride.createdAt).toLocaleString('vi-VN')}</Text></View>
        <View style={styles.card}><Text style={styles.section}>Lộ trình</Text><Text style={styles.label}>ĐIỂM ĐÓN</Text><Text style={styles.body}>{ride.pickupAddress || 'Không có địa chỉ'}</Text><View style={styles.divider} /><Text style={styles.label}>ĐIỂM ĐẾN</Text><Text style={styles.body}>{ride.dropoffAddress || 'Không có địa chỉ'}</Text><Text style={styles.meta}>{ride.distanceKm === null ? 'Khoảng cách chưa có' : `${ride.distanceKm} km`}</Text></View>
        <View style={styles.card}><Text style={styles.section}>Thanh toán</Text><Row label="Giá ước tính" value={`${ride.estimatedFare.toLocaleString('vi-VN')} đ`} />{ride.finalFare !== null ? <Row label="Giá cuối cùng" value={`${ride.finalFare.toLocaleString('vi-VN')} đ`} /> : null}{ride.discountAmount ? <Row label="Giảm giá" value={`${ride.discountAmount.toLocaleString('vi-VN')} đ`} /> : null}</View>
        <View style={styles.card}><Text style={styles.section}>Trạng thái chuyến</Text>{ride.statusHistory.map((entry) => <View key={entry.id} style={styles.historyRow}><View style={styles.historyDot} /><View style={styles.historyCopy}><Text style={styles.body}>{statusLabel(entry.toStatus)}</Text><Text style={styles.meta}>{new Date(entry.createdAt).toLocaleString('vi-VN')} · {entry.actorRole || 'SYSTEM'}{entry.note ? ` · ${entry.note}` : ''}</Text></View></View>)}</View>
        {ride.handoverReports.map((report) => <View key={report.id} style={styles.card}><Text style={styles.section}>Biên bản {report.phase === 'PICKUP' ? 'nhận xe' : 'trả xe'}</Text><Text style={styles.meta}>Odometer {report.odometer.toLocaleString('vi-VN')} km{report.fuelLevel === null ? '' : ` · Nhiên liệu ${report.fuelLevel}%`}</Text>{report.notes ? <Text style={styles.body}>{report.notes}</Text> : null}<Text style={styles.meta}>{report.confirmedByCustomer ? 'Đã được bạn xác nhận' : 'Chưa được bạn xác nhận'}</Text><View style={styles.images}>{report.photos.map((photo) => <Image key={photo.id} source={{ uri: photo.fileUrl }} style={styles.image} />)}</View></View>)}
        {!['COMPLETED', 'CANCELLED', 'NO_DRIVER_FOUND', 'EXPIRED'].includes(ride.status) ? <Pressable onPress={() => router.push({ pathname: '/(main)/driver-tracking', params: { rideId: String(ride.id) } })} style={styles.primary}><Text style={styles.primaryText}>Theo dõi chuyến</Text></Pressable> : null}
        {ride.driverId && chatStatuses.includes(ride.status) ? <Pressable onPress={() => router.push({ pathname: '/(main)/chat', params: { rideId: String(ride.id) } } as never)} style={styles.secondary}><MaterialIcons name="chat" size={20} color={colors.primary} /><Text style={styles.secondaryText}>{ride.unreadChatCount > 0 ? `Nhắn tài xế · ${ride.unreadChatCount} tin chưa đọc` : 'Nhắn tin với tài xế'}</Text></Pressable> : null}
      </> : null}
    </ScrollView>
  </SafeAreaView>;
}

function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.meta}>{label}</Text><Text style={styles.body}>{value}</Text></View>; }
function statusLabel(status: CustomerRideDetail['status']): string {
  const labels: Record<CustomerRideDetail['status'], string> = {
    PENDING: 'Đang tiếp nhận', SEARCHING: 'Đang tìm tài xế', DRIVER_ASSIGNED: 'Đã có tài xế',
    DRIVER_ARRIVING: 'Tài xế đang đến', DRIVER_ARRIVED: 'Tài xế đã đến', VEHICLE_HANDOVER: 'Đang bàn giao xe',
    IN_PROGRESS: 'Đang thực hiện', ARRIVED_DESTINATION: 'Đã đến điểm trả', VEHICLE_RETURNED: 'Đang hoàn tất bàn giao',
    COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', NO_DRIVER_FOUND: 'Không tìm được tài xế', EXPIRED: 'Hết hạn',
  };
  return labels[status];
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 12, paddingBottom: 28 }, card: { padding: 16, gap: 9, backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg }, heading: { ...typography.headlineSm, color: colors.onSurface }, section: { ...typography.labelLg, color: colors.onSurface }, label: { ...typography.labelSm, color: colors.primary }, body: { ...typography.bodyMd, color: colors.onSurface }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  divider: { height: 1, backgroundColor: colors.outlineVariant }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, historyRow: { flexDirection: 'row', gap: 10 }, historyDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5, backgroundColor: colors.primary }, historyCopy: { flex: 1, gap: 3 }, images: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, image: { width: 92, height: 92, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerHigh },
  primary: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.full, backgroundColor: colors.primary }, primaryText: { ...typography.labelLg, color: colors.onPrimary }, error: { ...typography.bodyMd, color: colors.error },
  secondary: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: borderRadius.full, backgroundColor: colors.primaryFixedTint }, secondaryText: { ...typography.labelLg, color: colors.primary },
});
