import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { getActiveCustomerRide, getCustomerVehicles, geocodeCustomerAddress } from '../services/customerApi';
import type { CustomerRideDetail, CustomerVehicle } from '../services/customerApi';

export default function RouteSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ destination?: string; voucherCode?: string }>();
  const destinationParam = Array.isArray(params.destination) ? params.destination[0] : params.destination;
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [activeRide, setActiveRide] = useState<CustomerRideDetail | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingRide, setCheckingRide] = useState(true);
  const [rideCheckError, setRideCheckError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [vehicleError, setVehicleError] = useState('');

  useEffect(() => {
    if (destinationParam) setDropoffAddress(destinationParam);
  }, [destinationParam]);

  useFocusEffect(useCallback(() => {
    let alive = true;
    setLoading(true);
    setCheckingRide(true);
    setRideCheckError('');
    Promise.allSettled([getCustomerVehicles(), getActiveCustomerRide()])
      .then(([vehiclesResult, rideResult]) => {
        if (!alive) return;
        if (vehiclesResult.status === 'fulfilled') {
          setVehicles(vehiclesResult.value);
          setVehicleId((current) => vehiclesResult.value.some((vehicle) => vehicle.id === current) ? current : vehiclesResult.value[0]?.id ?? null);
          setVehicleError('');
        } else {
          setVehicleError(vehiclesResult.reason instanceof Error ? vehiclesResult.reason.message : 'Không tải được xe.');
        }
        if (rideResult.status === 'fulfilled') {
          setActiveRide(rideResult.value);
        } else {
          setRideCheckError(rideResult.reason instanceof Error ? rideResult.reason.message : 'Không thể kiểm tra chuyến đang hoạt động.');
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
          setCheckingRide(false);
        }
      });
    return () => { alive = false; };
  }, []));

  const continueToEstimate = async () => {
    if (checkingRide || rideCheckError) {
      Alert.alert('Chưa thể đặt chuyến', 'Hãy tải lại trạng thái chuyến đang hoạt động rồi thử lại.');
      return;
    }
    if (activeRide) {
      router.push({ pathname: '/(main)/driver-tracking', params: { rideId: String(activeRide.id) } });
      return;
    }
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      Alert.alert('Thiếu địa chỉ', 'Nhập điểm đón và điểm đến để tiếp tục.');
      return;
    }
    if (pickupAddress.trim().length > 255 || dropoffAddress.trim().length > 255) {
      Alert.alert('Địa chỉ quá dài', 'Mỗi địa chỉ không được vượt quá 255 ký tự.');
      return;
    }
    if (!vehicleId) {
      Alert.alert('Chưa có xe', 'Bạn cần thêm xe trước khi đặt chuyến.');
      return;
    }
    setResolving(true);
    try {
      const [pickup, dropoff] = await Promise.all([
        geocodeCustomerAddress(pickupAddress.trim()),
        geocodeCustomerAddress(dropoffAddress.trim()),
      ]);
      if (!pickup || !dropoff) {
        Alert.alert('Không tìm thấy địa chỉ', 'Hãy nhập địa chỉ cụ thể hơn rồi thử lại.');
        return;
      }
      router.push({
        pathname: '/(main)/confirm-trip',
        params: {
          vehicleId: String(vehicleId),
          pickupAddress: pickupAddress.trim(),
          pickupLat: String(pickup.lat),
          pickupLng: String(pickup.lng),
          dropoffAddress: dropoffAddress.trim(),
          dropoffLat: String(dropoff.lat),
          dropoffLng: String(dropoff.lng),
          voucherCode: Array.isArray(params.voucherCode) ? params.voucherCode[0] : params.voucherCode,
        },
      });
    } catch (error) {
      Alert.alert('Không thể xác định địa chỉ', error instanceof Error ? error.message : 'Kiểm tra kết nối và thử lại.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Điểm đi và xe" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Nhập địa chỉ chính xác để hệ thống tính quãng đường và giá chuyến.</Text>
        {checkingRide ? <ActivityIndicator color={colors.primary} /> : null}
        {rideCheckError ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>Không kiểm tra được chuyến đang hoạt động: {rideCheckError}</Text>
            <Pressable onPress={() => router.replace('/(main)/home')}><Text style={styles.link}>Về trang chủ và thử lại</Text></Pressable>
          </View>
        ) : null}
        {activeRide ? (
          <View style={styles.activeRideBox}>
            <Text style={styles.activeRideTitle}>Bạn đang có chuyến #{activeRide.id} hoạt động</Text>
            <Text style={styles.subtitle}>Theo dõi chuyến hiện tại trước khi đặt chuyến mới.</Text>
            <Pressable onPress={() => router.push({ pathname: '/(main)/driver-tracking', params: { rideId: String(activeRide.id) } })} style={styles.activeRideButton}>
              <Text style={styles.activeRideButtonText}>Theo dõi chuyến</Text>
            </Pressable>
          </View>
        ) : null}
        {params.voucherCode ? <Text style={styles.voucherTag}>Mã ưu đãi đã chọn: {Array.isArray(params.voucherCode) ? params.voucherCode[0] : params.voucherCode}</Text> : null}
        <View style={styles.addressCard}>
          <Text style={styles.label}>ĐIỂM ĐÓN</Text>
          <TextInput accessibilityLabel="Địa chỉ điểm đón" value={pickupAddress} onChangeText={setPickupAddress} placeholder="Số nhà, đường, phường, quận" maxLength={255} style={styles.input} />
          <View style={styles.divider} />
          <Text style={styles.label}>ĐIỂM ĐẾN</Text>
          <TextInput accessibilityLabel="Địa chỉ điểm đến" value={dropoffAddress} onChangeText={setDropoffAddress} placeholder="Số nhà, đường, phường, quận" maxLength={255} style={styles.input} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chọn xe của bạn</Text>
          <Pressable onPress={() => router.push('/(main)/add-vehicle')}><Text style={styles.link}>+ Thêm xe</Text></Pressable>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {vehicleError ? <View style={styles.errorBox}><Text style={styles.error}>{vehicleError}</Text><Pressable onPress={() => {
          setLoading(true);
          setVehicleError('');
          getCustomerVehicles().then((result) => {
            setVehicles(result);
            setVehicleId((current) => result.some((vehicle) => vehicle.id === current) ? current : result[0]?.id ?? null);
          }).catch((error: unknown) => setVehicleError(error instanceof Error ? error.message : 'Không tải được xe.')).finally(() => setLoading(false));
        }}><Text style={styles.link}>Thử lại</Text></Pressable></View> : null}
        {!loading && vehicles.length === 0 ? <Text style={styles.empty}>Tài khoản chưa có xe. Thêm xe để tiếp tục.</Text> : null}
        {vehicles.map((vehicle) => {
          const selected = vehicle.id === vehicleId;
          return (
            <Pressable key={vehicle.id} onPress={() => setVehicleId(vehicle.id)} style={[styles.vehicle, selected && styles.vehicleSelected]}>
              <MaterialIcons name={selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={selected ? colors.primary : colors.outline} />
              <View style={styles.vehicleText}>
                <Text style={styles.vehicleName}>{[vehicle.brand, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicle_type || 'Xe'}</Text>
                <Text style={styles.vehicleMeta}>{vehicle.plate_number || 'Chưa có biển số'} · {vehicle.transmission_type || 'Chưa rõ hộp số'} · {vehicle.vehicle_type || 'Chưa rõ loại xe'}</Text>
              </View>
            </Pressable>
          );
        })}
        <Pressable disabled={resolving || loading || checkingRide || Boolean(rideCheckError) || Boolean(activeRide)} onPress={continueToEstimate} style={[styles.primaryButton, (resolving || loading || checkingRide || Boolean(rideCheckError) || Boolean(activeRide)) && styles.disabled]}>
          {resolving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryText}>Xác định lộ trình và giá</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: spacing.spaceMd, paddingBottom: 36 },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  voucherTag: { ...typography.labelMd, color: colors.primary },
  addressCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, padding: spacing.spaceMd, elevation: 1 },
  label: { ...typography.labelSm, color: colors.primary, marginTop: 4 },
  input: { ...typography.bodyLg, color: colors.onSurface, paddingVertical: 12 },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { ...typography.labelLg, color: colors.onSurface },
  link: { ...typography.labelLg, color: colors.primary },
  empty: { ...typography.bodyMd, color: colors.onSurfaceVariant, paddingVertical: 12 },
  errorBox: { gap: 6 },
  error: { ...typography.bodyMd, color: colors.error },
  activeRideBox: { gap: 10, borderRadius: borderRadius.lg, padding: 16, backgroundColor: colors.primaryFixedTint },
  activeRideTitle: { ...typography.labelLg, color: colors.onSurface },
  activeRideButton: { alignSelf: 'flex-start', borderRadius: borderRadius.full, backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 18 },
  activeRideButtonText: { ...typography.labelLg, color: colors.onPrimary },
  vehicle: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: borderRadius.lg, padding: 14, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest },
  vehicleSelected: { borderColor: colors.primary, backgroundColor: colors.primaryFixedTint },
  vehicleText: { flex: 1, gap: 4 },
  vehicleName: { ...typography.labelLg, color: colors.onSurface },
  vehicleMeta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  primaryButton: { minHeight: 54, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  primaryText: { ...typography.labelLg, color: colors.onPrimary },
  disabled: { opacity: 0.6 },
});
