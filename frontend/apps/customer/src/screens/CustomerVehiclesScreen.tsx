import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderIconButton, ScreenHeader } from '../components/ScreenHeader';
import { CustomerVehicle, deleteCustomerVehicle, getCustomerVehicles } from '../services/customerApi';

export default function CustomerVehiclesScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setVehicles(await getCustomerVehicles()); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không tải được xe.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const remove = (vehicle: CustomerVehicle) => Alert.alert('Xóa phương tiện', `Bạn muốn xóa ${vehicle.plate_number || `xe #${vehicle.id}`} khỏi tài khoản?`, [
    { text: 'Giữ lại', style: 'cancel' },
    { text: 'Xóa xe', style: 'destructive', onPress: () => { void (async () => {
      setDeletingId(vehicle.id);
      try { await deleteCustomerVehicle(vehicle.id); setVehicles((items) => items.filter((item) => item.id !== vehicle.id)); }
      catch (err) { Alert.alert('Không thể xóa xe', err instanceof Error ? err.message : 'Vui lòng thử lại.'); }
      finally { setDeletingId(null); }
    })(); } },
  ]);

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScreenHeader title="Xe của tôi" onBack={() => router.back()} rightContent={<HeaderIconButton icon="add" accessibilityLabel="Thêm xe" onPress={() => router.push('/(main)/add-vehicle')} tone="primary" />} />
    <ScrollView contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && vehicles.length === 0 ? <View style={styles.empty}><MaterialIcons name="directions-car" size={38} color={colors.primary} /><Text style={styles.heading}>Chưa có phương tiện</Text><Text style={styles.meta}>Thêm xe để chọn khi tạo chuyến đi.</Text></View> : null}
      {vehicles.map((vehicle) => <View key={vehicle.id} style={styles.vehicle}>
        {vehicle.images[0]?.secure_url ? <Image source={{ uri: vehicle.images[0].secure_url }} style={styles.image} /> : <View style={styles.imagePlaceholder}><MaterialIcons name="directions-car" size={28} color={colors.primary} /></View>}
        <Pressable onPress={() => router.push({ pathname: '/(main)/add-vehicle', params: { vehicleId: String(vehicle.id) } })} style={styles.details}><Text style={styles.name}>{[vehicle.brand, vehicle.model].filter(Boolean).join(' ') || vehicle.vehicle_type || 'Phương tiện'}</Text><Text style={styles.plate}>{vehicle.plate_number || 'Chưa có biển số'}</Text><Text style={styles.meta}>{vehicle.vehicle_type || '—'} · {vehicle.transmission_type || '—'}{vehicle.color ? ` · ${vehicle.color}` : ''}{vehicle.engine_cc ? ` · ${vehicle.engine_cc} cc` : ''}</Text></Pressable>
        <Pressable accessibilityLabel={`Xóa ${vehicle.plate_number || 'xe'}`} disabled={deletingId === vehicle.id} onPress={() => remove(vehicle)} style={styles.delete}>{deletingId === vehicle.id ? <ActivityIndicator color={colors.error} /> : <MaterialIcons name="delete-outline" size={23} color={colors.error} />}</Pressable>
      </View>)}
      <Pressable onPress={() => router.push('/(main)/add-vehicle')} style={styles.add}><MaterialIcons name="add" size={20} color={colors.onPrimary} /><Text style={styles.addText}>Thêm xe mới</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 12, paddingBottom: 30 }, vehicle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest }, image: { width: 60, height: 60, borderRadius: borderRadius.lg }, imagePlaceholder: { width: 60, height: 60, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryFixedTint }, details: { flex: 1, gap: 3 }, name: { ...typography.labelLg, color: colors.onSurface }, plate: { ...typography.labelMd, color: colors.primary }, meta: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  delete: { width: 38, height: 42, alignItems: 'center', justifyContent: 'center' }, add: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: borderRadius.full, backgroundColor: colors.primary }, addText: { ...typography.labelLg, color: colors.onPrimary },
  empty: { alignItems: 'center', gap: 8, padding: 24 }, heading: { ...typography.headlineSm, color: colors.onSurface }, error: { ...typography.bodyMd, color: colors.error },
});
