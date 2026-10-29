import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { getCustomerVouchers } from '../services/customerApi';
import type { CustomerVoucher } from '../services/customerApi';

const money = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
const date = (value: string) => new Date(value).toLocaleDateString('vi-VN');

export default function CustomerVouchersScreen() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setVouchers(await getCustomerVouchers()); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không tải được ưu đãi.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScreenHeader title="Ưu đãi của tôi" onBack={() => router.back()} />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.intro}>Mã ưu đãi áp dụng được hiển thị khi hệ thống tính giá chuyến.</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && vouchers.length === 0 ? <View style={styles.empty}><MaterialIcons name="confirmation-number" size={38} color={colors.primary} /><Text style={styles.heading}>Chưa có ưu đãi</Text><Text style={styles.meta}>Ưu đãi khả dụng sẽ xuất hiện tại đây.</Text></View> : null}
      {vouchers.map((voucher) => <View key={voucher.id} style={styles.voucher}>
        <View style={styles.voucherIcon}><MaterialIcons name="local-offer" size={24} color={colors.primary} /></View>
        <View style={styles.details}><Text style={styles.code}>{voucher.code}</Text><Text style={styles.discount}>{voucher.discountType === 'PERCENT' ? `Giảm ${voucher.value}%${voucher.maxDiscount ? ` tối đa ${money(voucher.maxDiscount)}` : ''}` : `Giảm ${money(voucher.value)}`}</Text><Text style={styles.meta}>Đơn tối thiểu {money(voucher.minimumOrderAmount)}</Text><Text style={styles.meta}>Hiệu lực: {date(voucher.validFrom)} – {date(voucher.validTo)}</Text>{voucher.usageLimit !== null ? <Text style={styles.meta}>Đã dùng {voucher.usageCount}/{voucher.usageLimit} lượt</Text> : null}<Pressable onPress={() => router.push({ pathname: '/(main)/route-selection', params: { voucherCode: voucher.code } })} style={styles.use}><Text style={styles.useText}>Dùng ưu đãi này</Text></Pressable></View>
      </View>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 12, paddingBottom: 28 }, intro: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  voucher: { flexDirection: 'row', gap: 12, padding: 15, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant }, voucherIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryFixedTint }, details: { flex: 1, gap: 4 }, code: { ...typography.labelLg, color: colors.primary }, discount: { ...typography.labelMd, color: colors.onSurface }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  use: { alignSelf: 'flex-start', paddingVertical: 6 }, useText: { ...typography.labelMd, color: colors.primary },
  empty: { alignItems: 'center', gap: 8, padding: 24 }, heading: { ...typography.headlineSm, color: colors.onSurface }, error: { ...typography.bodyMd, color: colors.error },
});
