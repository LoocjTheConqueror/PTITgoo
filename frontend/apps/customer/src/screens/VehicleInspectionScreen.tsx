import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { confirmCustomerHandover, getCustomerRide } from '../services/customerApi';
import type { CustomerRideDetail } from '../services/customerApi';

export default function VehicleInspectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string; phase?: string }>();
  const rideId = Number(Array.isArray(params.rideId) ? params.rideId[0] : params.rideId);
  const phase = (Array.isArray(params.phase) ? params.phase[0] : params.phase) === 'dropoff' ? 'DROPOFF' : 'PICKUP';
  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const report = ride?.handoverReports.find((item) => item.phase === phase);

  const refresh = useCallback(async () => {
    try {
      const result = await getCustomerRide(rideId);
      setRide(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được biên bản.');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const confirm = async () => {
    if (!rideId || !report || report.confirmedByCustomer || saving) return;
    setSaving(true);
    try {
      await confirmCustomerHandover(rideId, phase === 'PICKUP' ? 'pickup' : 'dropoff');
      await refresh();
      Alert.alert('Đã xác nhận', 'Xác nhận bàn giao đã được ghi nhận trên chuyến đi.', [{ text: 'Đóng', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Không thể xác nhận', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Biên bản bàn giao" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{phase === 'PICKUP' ? 'Kiểm tra hiện trạng trước khi bắt đầu chuyến.' : 'Kiểm tra hiện trạng khi tài xế hoàn trả xe.'}</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {ride ? <View style={styles.card}>
          <Text style={styles.section}>Chuyến #{ride.id} · {phase === 'PICKUP' ? 'Bàn giao lúc đón' : 'Hoàn trả tại điểm đến'}</Text>
          <Text style={styles.meta}>Trạng thái: {ride.status}</Text>
          {report ? <>
            <View style={styles.metrics}>
              <Metric label="Odometer" value={`${report.odometer.toLocaleString('vi-VN')} km`} />
              {report.fuelLevel !== null ? <Metric label="Nhiên liệu" value={`${report.fuelLevel}%`} /> : null}
            </View>
            {report.notes ? <Text style={styles.body}>{report.notes}</Text> : null}
            <Text style={styles.label}>Ảnh do tài xế gửi ({report.photos.length})</Text>
            {report.photos.length ? <View style={styles.images}>{report.photos.map((photo) => <View key={photo.id} style={styles.imageCard}><Image source={{ uri: photo.fileUrl }} style={styles.image} /><Text style={styles.imageLabel}>{photo.angle}</Text></View>)}</View> : <Text style={styles.meta}>Biên bản không có ảnh.</Text>}
            {report.confirmedByCustomer ? <View style={styles.confirmed}><MaterialIcons name="verified" size={20} color={colors.primary} /><Text style={styles.confirmedText}>Bạn đã xác nhận biên bản này.</Text></View> : null}
          </> : <Text style={styles.error}>Tài xế chưa gửi biên bản {phase === 'PICKUP' ? 'nhận xe' : 'trả xe'} lên backend.</Text>}
        </View> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {report && !report.confirmedByCustomer ? <Pressable disabled={saving} onPress={() => void confirm()} style={[styles.primary, saving && styles.disabled]}>
          {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryText}>Xác nhận tình trạng xe</Text>}
        </Pressable> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.meta}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 14, paddingBottom: 30 },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  card: { padding: 16, gap: 13, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest },
  section: { ...typography.labelLg, color: colors.onSurface }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  body: { ...typography.bodyMd, color: colors.onSurface }, label: { ...typography.labelMd, color: colors.onSurface },
  metrics: { flexDirection: 'row', gap: 10 }, metric: { flex: 1, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerHigh, padding: 12, gap: 4 }, metricValue: { ...typography.labelLg, color: colors.onSurface },
  images: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, imageCard: { width: '47%', gap: 4 }, image: { width: '100%', height: 120, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerHigh }, imageLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  confirmed: { flexDirection: 'row', alignItems: 'center', gap: 8 }, confirmedText: { ...typography.labelMd, color: colors.primary },
  error: { ...typography.bodyMd, color: colors.error },
  primary: { minHeight: 54, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, primaryText: { ...typography.labelLg, color: colors.onPrimary }, disabled: { opacity: 0.6 },
});
