import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { getActiveCustomerRide } from '../services/customerApi';
import type { CustomerRideDetail } from '../services/customerApi';

const chatStatuses = ['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'VEHICLE_HANDOVER', 'IN_PROGRESS', 'ARRIVED_DESTINATION', 'VEHICLE_RETURNED'];

export default function CustomerSupportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ topic?: string }>();
  const isSafety = (Array.isArray(params.topic) ? params.topic[0] : params.topic) === 'safety';
  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getActiveCustomerRide().then((value) => { if (active) setRide(value); }).catch(() => { if (active) setRide(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScreenHeader title={isSafety ? 'An toàn chuyến đi' : 'Trợ giúp'} onBack={() => router.back()} />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.notice}><MaterialIcons name={isSafety ? 'shield' : 'support-agent'} size={32} color={colors.primary} /><Text style={styles.heading}>{isSafety ? 'Công cụ an toàn' : 'Trung tâm trợ giúp'}</Text><Text style={styles.body}>{isSafety ? 'Bạn có thể mở theo dõi để xem trạng thái và biên bản chuyến hiện tại.' : 'Bạn có thể tra cứu chuyến, trạng thái và lịch sử trực tiếp từ dữ liệu tài khoản.'}</Text></View>
      {loading ? <ActivityIndicator color={colors.primary} /> : ride ? <>
        <Pressable onPress={() => router.push({ pathname: '/(main)/driver-tracking', params: { rideId: String(ride.id) } })} style={styles.ride}><Text style={styles.label}>CHUYẾN ĐANG HOẠT ĐỘNG</Text><Text style={styles.body}>#{ride.id} · {ride.status}</Text><Text style={styles.meta}>{ride.pickupAddress || 'Điểm đón'} → {ride.dropoffAddress || 'Điểm đến'}</Text></Pressable>
        {ride.driverId && chatStatuses.includes(ride.status) ? <Pressable onPress={() => router.push({ pathname: '/(main)/chat', params: { rideId: String(ride.id) } } as never)} style={styles.chat}><MaterialIcons name="chat" size={20} color={colors.primary} /><Text style={styles.chatText}>Nhắn tin với tài xế</Text></Pressable> : null}
      </> : <Text style={styles.meta}>Hiện không có chuyến đang hoạt động.</Text>}
      <View style={styles.card}><Text style={styles.section}>Lưu ý về liên hệ hỗ trợ</Text><Text style={styles.body}>Backend hiện chưa cung cấp hotline hoặc API gửi SOS cho khách hàng. Màn hình này không gửi cảnh báo khẩn cấp và không hiển thị số điện thoại giả.</Text></View>
      <View style={styles.card}><Text style={styles.section}>Quản lý chuyến</Text><Text style={styles.body}>Mở Lịch sử để xem chi tiết, trạng thái, giá và biên bản bàn giao của chuyến.</Text><Pressable onPress={() => router.push('/(main)/trip-history')} style={styles.link}><Text style={styles.linkText}>Mở lịch sử chuyến đi</Text><MaterialIcons name="chevron-right" size={22} color={colors.primary} /></Pressable></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 13, paddingBottom: 28 }, notice: { alignItems: 'center', gap: 9, padding: 20, borderRadius: borderRadius.lg, backgroundColor: colors.primaryFixedTint }, heading: { ...typography.headlineSm, color: colors.onSurface }, body: { ...typography.bodyMd, color: colors.onSurface, textAlign: 'left' }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  card: { padding: 16, gap: 9, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest }, section: { ...typography.labelLg, color: colors.onSurface }, ride: { padding: 15, gap: 7, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surfaceContainerLowest }, label: { ...typography.labelSm, color: colors.primary }, link: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }, linkText: { ...typography.labelLg, color: colors.primary },
  chat: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: borderRadius.full, backgroundColor: colors.primaryFixedTint }, chatText: { ...typography.labelLg, color: colors.primary },
});
