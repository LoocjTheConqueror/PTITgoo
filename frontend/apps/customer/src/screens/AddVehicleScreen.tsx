import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { createCustomerVehicle, deleteCustomerVehicleImage, getCustomerVehicles, updateCustomerVehicle, uploadCustomerVehicleImage } from '../services/customerApi';

export default function AddVehicleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicleId = Number(Array.isArray(params.vehicleId) ? params.vehicleId[0] : params.vehicleId) || null;
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState<'MANUAL' | 'AUTO'>('AUTO');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE'>('CAR');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [existingImages, setExistingImages] = useState<Array<{ id: number; secure_url: string }>>([]);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(Boolean(vehicleId));

  useEffect(() => {
    if (!vehicleId) return;
    let alive = true;
    getCustomerVehicles().then((vehicles) => {
      const current = vehicles.find((item) => item.id === vehicleId);
      if (!alive) return;
      if (!current) { Alert.alert('Không tìm thấy xe', 'Xe này không còn trong tài khoản.'); return; }
      setPlate(current.plate_number ?? '');
      setBrand(current.brand ?? '');
      setModel(current.model ?? '');
      setColor(current.color ?? '');
      setEngine(current.engine_cc === null ? '' : String(current.engine_cc));
      setTransmission(current.transmission_type === 'MANUAL' ? 'MANUAL' : 'AUTO');
      setVehicleType(current.vehicle_type === 'MOTORCYCLE' ? 'MOTORCYCLE' : 'CAR');
      setExistingImages(current.images);
    }).catch((error: unknown) => {
      if (alive) Alert.alert('Không tải được xe', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }).finally(() => alive && setLoadingVehicle(false));
    return () => { alive = false; };
  }, [vehicleId]);

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
    if (!result.canceled) setPhoto(result.assets[0] ?? null);
  };

  const removeImage = (imageId: number) => Alert.alert('Xóa ảnh xe', 'Bạn muốn xóa ảnh này khỏi phương tiện?', [
    { text: 'Giữ lại', style: 'cancel' },
    { text: 'Xóa ảnh', style: 'destructive', onPress: () => { void (async () => {
      if (!vehicleId || deletingImageId) return;
      setDeletingImageId(imageId);
      try {
        await deleteCustomerVehicleImage(vehicleId, imageId);
        setExistingImages((items) => items.filter((item) => item.id !== imageId));
      } catch (error) {
        Alert.alert('Không thể xóa ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.');
      } finally {
        setDeletingImageId(null);
      }
    })(); } },
  ]);

  const save = async () => {
    if (!plate.trim()) {
      Alert.alert('Thiếu biển số', 'Nhập biển số xe để lưu.');
      return;
    }
    if (plate.trim().length > 20 || brand.trim().length > 100 || model.trim().length > 100 || color.trim().length > 50) {
      Alert.alert('Thông tin vượt giới hạn', 'Biển số tối đa 20 ký tự, hãng/dòng xe tối đa 100 ký tự và màu xe tối đa 50 ký tự.');
      return;
    }
    const engineCc = engine.trim() ? Number(engine) : null;
    if (engineCc !== null && (!/^\d+$/.test(engine.trim()) || !Number.isSafeInteger(engineCc) || engineCc <= 0 || engineCc > 2_147_483_647)) {
      Alert.alert('Dung tích không hợp lệ', 'Nhập số nguyên cc lớn hơn 0.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        plate_number: plate.trim().toUpperCase(),
        transmission_type: transmission,
        vehicle_type: vehicleType,
        engine_cc: engineCc,
        brand: brand.trim() || null,
        model: model.trim() || null,
        color: color.trim() || null,
      };
      const vehicle = vehicleId
        ? await updateCustomerVehicle(vehicleId, payload)
        : await createCustomerVehicle(payload);
      if (photo) {
        try {
          await uploadCustomerVehicleImage(vehicle.id, { uri: photo.uri, fileName: photo.fileName, mimeType: photo.mimeType });
        } catch (photoError) {
          Alert.alert('Xe đã lưu, ảnh chưa tải lên', photoError instanceof Error ? photoError.message : 'Bạn có thể thử tải ảnh lại sau.');
          router.back();
          return;
        }
      }
      Alert.alert(vehicleId ? 'Đã cập nhật xe' : 'Đã lưu xe', 'Thông tin xe đã được lưu vào tài khoản.', [{ text: 'Đóng', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Không thể lưu xe', error instanceof Error ? error.message : 'Vui lòng kiểm tra thông tin và thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={vehicleId ? 'Sửa xe' : 'Thêm xe'} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>{vehicleId ? 'Cập nhật thông tin phương tiện trong hồ sơ của bạn.' : 'Thông tin được lưu trực tiếp vào hồ sơ phương tiện của bạn.'}</Text>
        <Field label="Biển số xe *" value={plate} onChangeText={setPlate} placeholder="Ví dụ: 30A-123.45" autoCapitalize="characters" maxLength={20} />
        <Field label="Hãng xe" value={brand} onChangeText={setBrand} placeholder="Ví dụ: Mazda" maxLength={100} />
        <Field label="Dòng xe" value={model} onChangeText={setModel} placeholder="Ví dụ: CX-5" maxLength={100} />
        <Field label="Màu xe" value={color} onChangeText={setColor} placeholder="Ví dụ: Trắng" maxLength={50} />
      <Field label="Dung tích động cơ (cc)" value={engine} onChangeText={setEngine} placeholder="Không bắt buộc" keyboardType="numeric" maxLength={10} />
        <View style={styles.group}>
          <Text style={styles.label}>Ảnh xe (không bắt buộc)</Text>
          <Pressable onPress={() => void choosePhoto()} style={styles.photoPicker}>
            {photo ? <Image source={{ uri: photo.uri }} style={styles.photoPreview} /> : <MaterialIcons name="add-a-photo" size={25} color={colors.primary} />}
            <Text style={styles.photoText}>{photo?.fileName || 'Chọn ảnh từ thư viện để tải lên khi lưu'}</Text>
          </Pressable>
          {existingImages.map((image) => <View key={image.id} style={styles.existingImageRow}>
            <Image source={{ uri: image.secure_url }} style={styles.photoPreview} />
            <Text style={styles.photoText}>Ảnh đã lưu</Text>
            <Pressable accessibilityLabel="Xóa ảnh xe" disabled={deletingImageId !== null} onPress={() => removeImage(image.id)} style={styles.deleteImage}>
              {deletingImageId === image.id ? <ActivityIndicator color={colors.error} /> : <MaterialIcons name="delete-outline" size={22} color={colors.error} />}
            </Pressable>
          </View>)}
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>Loại xe</Text>
          <View style={styles.choices}>
            <Choice label="Ô tô" active={vehicleType === 'CAR'} onPress={() => setVehicleType('CAR')} />
            <Choice label="Xe máy" active={vehicleType === 'MOTORCYCLE'} onPress={() => setVehicleType('MOTORCYCLE')} />
          </View>
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>Hộp số</Text>
          <View style={styles.choices}>
            <Choice label="Số tự động" active={transmission === 'AUTO'} onPress={() => setTransmission('AUTO')} />
            <Choice label="Số sàn" active={transmission === 'MANUAL'} onPress={() => setTransmission('MANUAL')} />
          </View>
        </View>
        <Pressable disabled={saving || loadingVehicle} onPress={() => void save()} style={[styles.primary, (saving || loadingVehicle) && styles.disabled]}>
          {saving || loadingVehicle ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryText}>{vehicleId ? 'Cập nhật phương tiện' : 'Lưu phương tiện'}</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; keyboardType?: 'default' | 'numeric'; maxLength?: number }) {
  return <View style={styles.group}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor={colors.outline} /></View>;
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}><MaterialIcons name={active ? 'radio-button-checked' : 'radio-button-unchecked'} size={19} color={active ? colors.primary : colors.outline} /><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.margin, gap: 16, paddingBottom: 34 },
  intro: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  group: { gap: 7 }, label: { ...typography.labelMd, color: colors.onSurface },
  input: { ...typography.bodyMd, color: colors.onSurface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest, paddingHorizontal: 13, paddingVertical: 12 },
  choices: { flexDirection: 'row', gap: 10 },
  photoPicker: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderWidth: 1, borderColor: colors.outlineVariant, borderStyle: 'dashed', borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest },
  existingImageRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest },
  deleteImage: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  photoPreview: { width: 52, height: 52, borderRadius: borderRadius.lg }, photoText: { ...typography.bodyMd, color: colors.onSurfaceVariant, flex: 1 },
  choice: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest, paddingHorizontal: 6 },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.primaryFixedTint },
  choiceText: { ...typography.labelMd, color: colors.onSurfaceVariant }, choiceTextActive: { color: colors.primary },
  primary: { minHeight: 54, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  primaryText: { ...typography.labelLg, color: colors.onPrimary }, disabled: { opacity: 0.6 },
});
