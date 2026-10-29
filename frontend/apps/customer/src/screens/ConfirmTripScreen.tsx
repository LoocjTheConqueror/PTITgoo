import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { createCustomerRide, geocodeCustomerAddress, getCustomerVouchers, getRideEstimate } from '../services/customerApi';
import type { CustomerVoucher, PaymentMethod, RideEstimate, RideEstimateRequest } from '../services/customerApi';

const paymentMethods: Array<{ id: PaymentMethod; label: string }> = [
  { id: 'CASH', label: 'Tiền mặt' },
];
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
const paramText = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';

export default function ConfirmTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleId?: string; pickupAddress?: string; pickupLat?: string; pickupLng?: string; dropoffAddress?: string; dropoffLat?: string; dropoffLng?: string; voucherCode?: string }>();
  const vehicleId = Number(paramText(params.vehicleId));
  const pickupAddress = paramText(params.pickupAddress);
  const dropoffAddress = paramText(params.dropoffAddress);
  const initialVoucherCode = paramText(params.voucherCode);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [rideType, setRideType] = useState<'INSTANT' | 'SCHEDULED'>('INSTANT');
  const [scheduledLocal, setScheduledLocal] = useState('');
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState(initialVoucherCode);
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [estimate, setEstimate] = useState<RideEstimate | null>(null);
  const [estimating, setEstimating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const idempotencyKey = useRef(`customer-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const voucherCodeRef = useRef(initialVoucherCode);

  useEffect(() => { voucherCodeRef.current = voucherCode; }, [voucherCode]);

  const buildEstimateRequest = useCallback(async (code?: string): Promise<RideEstimateRequest> => {
    const pickupLatText = paramText(params.pickupLat);
    const pickupLngText = paramText(params.pickupLng);
    const dropoffLatText = paramText(params.dropoffLat);
    const dropoffLngText = paramText(params.dropoffLng);
    let pickupLat = Number(pickupLatText);
    let pickupLng = Number(pickupLngText);
    let dropoffLat = Number(dropoffLatText);
    let dropoffLng = Number(dropoffLngText);
    const hasCoordinates = [pickupLatText, pickupLngText, dropoffLatText, dropoffLngText].every((value) => value.trim() !== '')
      && [pickupLat, pickupLng, dropoffLat, dropoffLng].every(Number.isFinite);
    if (!hasCoordinates) {
      const [pickup, dropoff] = await Promise.all([
        geocodeCustomerAddress(pickupAddress),
        geocodeCustomerAddress(dropoffAddress),
      ]);
      if (!pickup || !dropoff) throw new Error('Không xác định được tọa độ địa chỉ. Quay lại và nhập địa chỉ cụ thể hơn.');
      ({ lat: pickupLat, lng: pickupLng } = pickup);
      ({ lat: dropoffLat, lng: dropoffLng } = dropoff);
    }
    const scheduledAt = rideType === 'SCHEDULED' ? parseLocalDateTime(scheduledLocal) : null;
    if (rideType === 'SCHEDULED' && !scheduledAt) {
      throw new Error('Nhập thời gian đặt lịch theo định dạng YYYY-MM-DD HH:mm và chọn giờ trong tương lai.');
    }
    return {
      vehicleId,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      scheduledAt,
      voucher_code: code?.trim() || null,
    };
  }, [dropoffAddress, params.dropoffLat, params.dropoffLng, params.pickupLat, params.pickupLng, pickupAddress, rideType, scheduledLocal, vehicleId]);

  const refreshEstimate = useCallback(async (code = '') => {
    setEstimating(true);
    setError('');
    try {
      const request = await buildEstimateRequest(code);
      setEstimate(await getRideEstimate(request));
    } catch (err) {
      setEstimate(null);
      setError(err instanceof Error ? err.message : 'Không thể tính giá chuyến.');
    } finally {
      setEstimating(false);
    }
  }, [buildEstimateRequest]);

  useEffect(() => {
    if (!vehicleId || !pickupAddress || !dropoffAddress) {
      setError('Thiếu thông tin chuyến. Quay lại để chọn xe và nhập địa chỉ.');
      setEstimating(false);
      return;
    }
    void refreshEstimate(voucherCodeRef.current);
  }, [dropoffAddress, initialVoucherCode, pickupAddress, refreshEstimate, vehicleId]);

  useEffect(() => {
    let active = true;
    getCustomerVouchers().then((items) => { if (active) setVouchers(items); }).catch(() => { if (active) setVouchers([]); });
    return () => { active = false; };
  }, []);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const request = await buildEstimateRequest(voucherCode);
      const latestEstimate = await getRideEstimate(request);
      setEstimate(latestEstimate);
      const ride = await createCustomerRide({
        ...request,
        type: rideType,
        scheduledAt: rideType === 'SCHEDULED' ? request.scheduledAt : null,
        paymentMethod,
        note: note.trim() || null,
      }, idempotencyKey.current);
      router.replace({ pathname: '/(main)/find-driver', params: { rideId: String(ride.id) } });
    } catch (err) {
      Alert.alert('Không thể đặt chuyến', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectVoucher = (code: string) => {
    setVoucherCode(code);
    void refreshEstimate(code);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Xác nhận chuyến" onBack={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thời gian chuyến đi</Text>
          <View style={styles.typeOptions}>
            <Pressable onPress={() => setRideType('INSTANT')} style={[styles.typeOption, rideType === 'INSTANT' && styles.typeOptionActive]}>
              <MaterialIcons name={rideType === 'INSTANT' ? 'radio-button-checked' : 'radio-button-unchecked'} size={20} color={rideType === 'INSTANT' ? colors.primary : colors.outline} />
              <Text style={[styles.typeOptionText, rideType === 'INSTANT' && styles.typeOptionTextActive]}>Đặt ngay</Text>
            </Pressable>
            <Pressable onPress={() => {
              setRideType('SCHEDULED');
              if (!scheduledLocal) setScheduledLocal(formatLocalDateTime(new Date(Date.now() + 60 * 60 * 1000)));
            }} style={[styles.typeOption, rideType === 'SCHEDULED' && styles.typeOptionActive]}>
              <MaterialIcons name={rideType === 'SCHEDULED' ? 'radio-button-checked' : 'radio-button-unchecked'} size={20} color={rideType === 'SCHEDULED' ? colors.primary : colors.outline} />
              <Text style={[styles.typeOptionText, rideType === 'SCHEDULED' && styles.typeOptionTextActive]}>Đặt lịch</Text>
            </Pressable>
          </View>
          {rideType === 'SCHEDULED' ? <>
            <TextInput
              accessibilityLabel="Thời gian đón đã đặt"
              value={scheduledLocal}
              onChangeText={setScheduledLocal}
              placeholder="YYYY-MM-DD HH:mm"
              autoCapitalize="none"
              style={styles.voucherInput}
            />
            <Text style={styles.helper}>Giờ địa phương. Ví dụ: 2026-10-25 18:30. Backend sẽ bắt đầu tìm tài xế trước giờ hẹn theo lịch hệ thống.</Text>
          </> : null}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Lộ trình</Text>
          <Text style={styles.label}>Điểm đón</Text><Text style={styles.address}>{pickupAddress || 'Chưa có điểm đón'}</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>Điểm đến</Text><Text style={styles.address}>{dropoffAddress || 'Chưa có điểm đến'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          {paymentMethods.map((method) => (
            <Pressable key={method.id} onPress={() => setPaymentMethod(method.id)} style={styles.option}>
              <MaterialIcons name={paymentMethod === method.id ? 'radio-button-checked' : 'radio-button-unchecked'} size={21} color={paymentMethod === method.id ? colors.primary : colors.outline} />
              <Text style={styles.optionText}>{method.label}</Text>
            </Pressable>
          ))}
          <Text style={styles.helper}>Backend hiện chỉ hỗ trợ thanh toán tiền mặt cho chuyến đi.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mã ưu đãi</Text>
          <View style={styles.voucherRow}>
            <TextInput value={voucherCode} onChangeText={setVoucherCode} autoCapitalize="characters" placeholder="Nhập mã ưu đãi" style={styles.voucherInput} />
            <Pressable onPress={() => void refreshEstimate(voucherCode)} style={styles.apply}><Text style={styles.applyText}>Áp dụng</Text></Pressable>
          </View>
          {vouchers.map((voucher) => <Pressable key={voucher.id} onPress={() => selectVoucher(voucher.code)} style={styles.voucher}><Text style={styles.voucherCode}>{voucher.code}</Text><Text style={styles.voucherMeta}>{voucher.discountType === 'PERCENT' ? `${voucher.value}%` : money(voucher.value)} · Tối thiểu {money(voucher.minimumOrderAmount)}</Text></Pressable>)}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ghi chú cho tài xế</Text>
          <TextInput value={note} onChangeText={setNote} maxLength={500} placeholder="Hướng dẫn điểm đón hoặc lưu ý khác (không bắt buộc)" style={styles.voucherInput} />
          <Text style={styles.helper}>{note.length}/500 ký tự</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chi tiết giá từ backend</Text>
          {estimating ? <ActivityIndicator color={colors.primary} /> : null}
          {estimate ? <>
            <PriceRow label="Quãng đường" value={`${estimate.distanceKm.toFixed(1)} km · khoảng ${estimate.estimatedDurationMinutes} phút`} />
            <PriceRow label="Cước cơ bản" value={money(estimate.baseFare)} />
            <PriceRow label="Theo quãng đường" value={money(estimate.distanceFare)} />
            {estimate.waitingFare > 0 ? <PriceRow label="Phí chờ" value={money(estimate.waitingFare)} /> : null}
            {estimate.nightSurcharge > 0 ? <PriceRow label="Phụ phí ban đêm" value={money(estimate.nightSurcharge)} /> : null}
            {estimate.returnFee > 0 ? <PriceRow label="Phí đưa xe về" value={money(estimate.returnFee)} /> : null}
            {estimate.discountAmount > 0 ? <PriceRow label="Giảm giá" value={`− ${money(estimate.discountAmount)}`} /> : null}
            <View style={styles.divider} /><PriceRow label="Tổng thanh toán" value={money(estimate.payableFare)} strong />
          </> : <Text style={styles.error}>{error || 'Đang chờ dữ liệu giá.'}</Text>}
        </View>
      </ScrollView>
      <Pressable disabled={!estimate || estimating || submitting} onPress={() => void handleConfirm()} style={[styles.primary, (!estimate || estimating || submitting) && styles.disabled]}>
        {submitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryText}>{estimate ? `Đặt chuyến · ${money(estimate.payableFare)}` : 'Chưa thể đặt chuyến'}</Text>}
      </Pressable>
    </SafeAreaView>
  );
}

function PriceRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <View style={styles.priceRow}><Text style={[styles.priceLabel, strong && styles.strong]}>{label}</Text><Text style={[styles.priceValue, strong && styles.strong]}>{value}</Text></View>;
}

function formatLocalDateTime(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function parseLocalDateTime(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute || date.getTime() <= Date.now()) {
    return null;
  }
  return date.toISOString();
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  content: { padding: spacing.margin, gap: 14, paddingBottom: 28 },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, padding: 16, gap: 9, elevation: 1 },
  sectionTitle: { ...typography.labelLg, color: colors.onSurface, marginBottom: 4 },
  typeOptions: { flexDirection: 'row', gap: 8 },
  typeOption: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg },
  typeOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryFixedTint },
  typeOptionText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  typeOptionTextActive: { color: colors.primary },
  helper: { ...typography.labelSm, color: colors.onSurfaceVariant },
  label: { ...typography.labelSm, color: colors.primary },
  address: { ...typography.bodyMd, color: colors.onSurface },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: 5 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  optionText: { ...typography.bodyMd, color: colors.onSurface },
  voucherRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voucherInput: { ...typography.bodyMd, flex: 1, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg, padding: 11, color: colors.onSurface },
  apply: { backgroundColor: colors.primary, padding: 12, borderRadius: borderRadius.lg }, applyText: { ...typography.labelMd, color: colors.onPrimary },
  voucher: { borderRadius: borderRadius.lg, backgroundColor: colors.primaryFixedTint, padding: 10 }, voucherCode: { ...typography.labelMd, color: colors.primary }, voucherMeta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, priceLabel: { ...typography.bodyMd, color: colors.onSurfaceVariant }, priceValue: { ...typography.bodyMd, color: colors.onSurface, textAlign: 'right' }, strong: { ...typography.labelLg, color: colors.onSurface },
  error: { ...typography.bodyMd, color: colors.error },
  primary: { marginHorizontal: spacing.margin, marginBottom: spacing.spaceMd, minHeight: 54, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, primaryText: { ...typography.labelLg, color: colors.onPrimary }, disabled: { opacity: 0.55 },
});
