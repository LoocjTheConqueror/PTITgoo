import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { getCustomerRide, rateCustomerRide } from '../services/customerApi';
import type { CustomerRideDetail } from '../services/customerApi';

export default function TripCompletedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string }>();
  const rideId = Number(Array.isArray(params.rideId) ? params.rideId[0] : params.rideId);
  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { setRide(await getCustomerRide(rideId)); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không tải được hóa đơn chuyến.'); }
  }, [rideId]);
  useEffect(() => { if (rideId) void refresh(); else setError('Không có mã chuyến để tải hóa đơn và gửi đánh giá.'); }, [refresh, rideId]);

  const finish = async (skipRating = false) => {
    if (saving) return;
    if (!rideId) {
      if (skipRating) router.replace('/(main)/home');
      return;
    }
    setSaving(true);
    try {
      if (!skipRating) await rateCustomerRide(rideId, { stars, comment: comment.trim() || null, tags: null, tip: 0 });
      router.replace('/(main)/home');
    } catch (err) {
      Alert.alert('Chưa gửi được đánh giá', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScreenHeader title="Hoàn thành chuyến" backIcon="home" backAccessibilityLabel="Về trang chủ" onBack={() => router.replace('/(main)/home')} />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.success}><MaterialIcons name="check-circle" size={54} color={colors.primary} /><Text style={styles.heading}>Chuyến đi đã hoàn thành</Text><Text style={styles.meta}>Thông tin hóa đơn và trạng thái được tải từ backend.</Text></View>
      {ride ? <View style={styles.card}><Text style={styles.section}>Chuyến #{ride.id}</Text><Text style={styles.meta}>{new Date(ride.completedAt ?? ride.updatedAt).toLocaleString('vi-VN')}</Text><Text style={styles.body}>Điểm đón: {ride.pickupAddress || '—'}</Text><Text style={styles.body}>Điểm đến: {ride.dropoffAddress || '—'}</Text><View style={styles.divider} /><View style={styles.priceRow}><Text style={styles.section}>Tổng thanh toán</Text><Text style={styles.price}>{new Intl.NumberFormat('vi-VN').format(ride.finalFare ?? ride.estimatedFare)} đ</Text></View></View> : error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={colors.primary} />}
      <View style={styles.card}><Text style={styles.section}>Đánh giá chuyến đi</Text><View style={styles.stars}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} accessibilityLabel={`${value} sao`} onPress={() => setStars(value)}><MaterialIcons name={value <= stars ? 'star' : 'star-border'} size={34} color={colors.tertiary} /></Pressable>)}</View><TextInput multiline value={comment} onChangeText={setComment} placeholder="Nhận xét (không bắt buộc)" style={styles.input} maxLength={2000} /><Text style={styles.counter}>{comment.length}/2000</Text></View>
      {ride && ride.status !== 'COMPLETED' ? <Text style={styles.error}>Chỉ có thể đánh giá chuyến đã hoàn thành.</Text> : null}
      <Pressable disabled={saving || !ride || ride.status !== 'COMPLETED' || !ride.driverId} onPress={() => void finish()} style={[styles.primary, (saving || !ride || ride.status !== 'COMPLETED' || !ride.driverId) && styles.disabled]}>{saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryText}>Gửi đánh giá</Text>}</Pressable>
      <Pressable disabled={saving} onPress={() => void finish(true)} style={styles.skip}><Text style={styles.skipText}>Bỏ qua và về trang chủ</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 14, paddingBottom: 28 }, success: { alignItems: 'center', gap: 8, padding: 16 }, heading: { ...typography.headlineSm, color: colors.onSurface }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' },
  card: { padding: 16, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest, gap: 10 }, section: { ...typography.labelLg, color: colors.onSurface }, body: { ...typography.bodyMd, color: colors.onSurface }, divider: { height: 1, backgroundColor: colors.outlineVariant }, priceRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, price: { ...typography.labelLg, color: colors.primary },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8 }, input: { minHeight: 90, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg, padding: 12, textAlignVertical: 'top', ...typography.bodyMd, color: colors.onSurface }, counter: { ...typography.labelSm, color: colors.onSurfaceVariant, textAlign: 'right' },
  primary: { minHeight: 52, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, primaryText: { ...typography.labelLg, color: colors.onPrimary }, skip: { alignItems: 'center', padding: 12 }, skipText: { ...typography.labelLg, color: colors.primary }, disabled: { opacity: 0.55 }, error: { ...typography.bodyMd, color: colors.error },
});
