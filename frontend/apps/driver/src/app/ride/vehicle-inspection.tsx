import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  borderRadius,
  colors,
  fontSize,
  spacing,
  typography,
} from '@datxe/shared';

type InspectionSlot = {
  title: string;
  image?: string;
};

const INITIAL_SLOTS: InspectionSlot[] = [
  {
    title: '1. Đầu xe (Góc trước)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCTWIYOlCl2kNWZU1vXaiZCY6_w_FxvzCkXEpDLHcuPifR2y-5Bux4ZyY2QvTzANe4VQzMe2LXuD6XWUS2b0-MQKOD5Zj5O7fu8AelAvPllnQRtLt0Fv8W31J6F3wLqbRHFLX_xkrwc4mCBoflnfLZp9H9UWNhHIbgQtyB3N7O5yjPIP8ffJEDH2DTwoMMZajPZl4-M4f2HQvXQh2CQeBqwftgofY4N8J-OesSWE4aRzdfE8pgsOB8hGA',
  },
  {
    title: '2. Đuôi xe & Biển số',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDl1G5iIy1e5fKElBq2GShnLmO6Lwu9JORj3z_9q_B28Y1AnSnNryYS7Ah5fkM3IVuTFa5pBO5Rwt6dz0r2ep1VUuQfkQPlTJaMTNVTnzQpZ18g2oS7sZepc2zk4XiOuj9IpL3XwpSiamyaUVpEH9ltp0fQMbHANQh1L_sjvGp__ADeZR2C0tXIBmyevISrU_veNZQLdLdeyQUGNdVxY21KowNv2yrAzKs-tlF-NHPaf_skLFrPThmAyQ',
  },
  {
    title: '3. Sườn trái xe',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7860CQ4Xaf1GZywFInBrAykAk-l1FfzXtvSGuHnG8aA-igrHHtqRrD9_9TSG1yhdbOL8mgxOdAna-YKe2Svull8Y26vFPGmYZwDtZcIcSuqPjwhdaTEYXPGT_HOjetbURDq_fAoblATD067fWjYwukklBXEqAqwbEXbsSuEQobo5dkNvV0a_1oRZnbnpZqy8MU0Nlx-6Hmde67lOmUsjlYr7clWTJ5zXGHsDExCDwTA28WySSXPT_og',
  },
  {
    title: '4. Sườn phải xe',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7bI22dHcawqHlvm0ET9pV8YLuu5hRNa7tzPDLgxqFUuz4laIBLHRWrIfkq2fUJlR8WSu8u2UUpOLwGhv3wPsudlbt65dquezGUTnVz4-Mo9OMUGHhPx5-1kWE2mC1yHcsFaxGUFMeO_XJf0r_0tsvleP3PZh6cgkb2Xgb0mDX9OuBtREke18faDwgFaXE5OhG9RaZx1VdBdjA1X5iXEC0zb94nyMBEZTXT2Ll5aHFE-t-89Ov83Hy4g',
  },
  { title: '5. Nội thất & Cần số' },
  { title: '6. ODO & Vạch xăng' },
];

const NOTE_PRESETS = [
  'Có vết trầy xước nhẹ',
  'Có tư trang giá trị',
  'Xe sạch sẽ nguyên vẹn',
];

export default function VehicleInspectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [notes, setNotes] = useState('');
  const [capturingIndex, setCapturingIndex] = useState<number | null>(null);
  const capturedCount = slots.filter((slot) => slot.image).length;

  const capturePhoto = async (slotIndex: number) => {
    if (capturingIndex !== null) return;
    setCapturingIndex(slotIndex);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Cần quyền sử dụng camera',
          'Cho phép truy cập camera để chụp ảnh biên bản bàn giao xe.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        mediaTypes: ['images'],
        quality: 0.9,
      });
      const photo = result.canceled ? undefined : result.assets[0]?.uri;
      if (photo) {
        setSlots((current) =>
          current.map((slot, index) =>
            index === slotIndex ? { ...slot, image: photo } : slot,
          ),
        );
      }
    } catch {
      Alert.alert('Không thể mở camera', 'Vui lòng thử chụp lại ảnh.');
    } finally {
      setCapturingIndex(null);
    }
  };

  const appendNote = (preset: string) => {
    setNotes((current) =>
      current.trim() ? current.trimEnd() + ', ' + preset.toLowerCase() : preset,
    );
  };

  const submitHandover = () => {
    if (capturedCount < slots.length) {
      Alert.alert(
        'Chưa chụp đủ ảnh',
        'Bạn chưa chụp đủ 6 góc xe. Xác nhận bỏ qua các góc còn lại để tiếp tục?',
        [
          { text: 'Tiếp tục chụp', style: 'cancel' },
          {
            text: 'Xác nhận bàn giao',
            onPress: () =>
              Alert.alert('Đã xác nhận', 'Biên bản xe đã được lưu thành công.', [
                { text: 'Đóng', onPress: () => router.back() },
              ]),
          },
        ],
      );
      return;
    }

    Alert.alert('Đã xác nhận', 'Biên bản xe đã được lưu thành công.', [
      { text: 'Đóng', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons color={colors.onPrimary} name="arrow-back" size={fontSize.icon2xl} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>Chi Tiết Chuyến Xe</Text>
        <View style={styles.headerAvatar}>
          <MaterialIcons color={colors.onPrimary} name="person-outline" size={fontSize.iconMd} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.spaceXl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.noticeCard} variant="muted">
          <View style={styles.noticeTop}>
            <View style={styles.noticeTitle}>
              <MaterialIcons color={colors.primary} name="verified-user" size={fontSize.iconLg} />
              <Text style={styles.noticeHeading}>BIÊN BẢN BÀN GIAO</Text>
            </View>
            <Text style={styles.counter}>{'Đã chụp ' + capturedCount + '/6'}</Text>
          </View>
          <Text style={styles.noticeCopy}>
            Chụp ảnh trước khi nhận chìa khóa và đối chiếu khi trả xe cho khách.
          </Text>
          <View style={styles.cameraNotice}>
            <MaterialIcons color={colors.success} name="lock-outline" size={fontSize.iconSm} />
            <Text style={styles.cameraNoticeText}>Chỉ chụp trực tiếp qua camera chống gian lận</Text>
          </View>
        </Card>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: (capturedCount / slots.length) * 100 + '%' }]} />
        </View>

        <View style={styles.photoGrid}>
          {slots.map((slot, index) => {
            const isCaptured = Boolean(slot.image);
            const isCapturing = capturingIndex === index;
            return (
              <Card key={slot.title} style={styles.photoCard} variant="surface">
                <Pressable
                  accessibilityLabel={(isCaptured ? 'Chụp lại ' : 'Chụp ') + slot.title}
                  accessibilityRole="button"
                  disabled={isCapturing}
                  onPress={() => void capturePhoto(index)}
                  style={styles.photoAction}
                >
                  {isCaptured ? (
                    <Image resizeMode="cover" source={{ uri: slot.image }} style={styles.photo} />
                  ) : (
                    <View style={styles.pendingPhoto}>
                      <View style={styles.cameraCircle}>
                        <MaterialIcons color={colors.primary} name="photo-camera" size={fontSize.icon26} />
                      </View>
                      <Text style={styles.captureLabel}>{isCapturing ? 'Đang mở camera…' : 'Chụp ngay'}</Text>
                    </View>
                  )}
                  {isCaptured ? (
                    <>
                      <View style={styles.checkedBadge}>
                        <MaterialIcons color={colors.onPrimary} name="check" size={fontSize.iconSm} />
                      </View>
                      <View style={styles.cameraBadge}>
                        <MaterialIcons color={colors.onPrimary} name="photo-camera" size={fontSize.iconMd} />
                      </View>
                    </>
                  ) : null}
                </Pressable>
                <View style={styles.photoCaption}>
                  <Text numberOfLines={1} style={styles.photoTitle}>{slot.title}</Text>
                  <View style={styles.photoStatus}>
                    <View style={[styles.statusDot, isCaptured && styles.statusDotCaptured]} />
                    <Text style={[styles.statusText, isCaptured && styles.statusTextCaptured]}>
                      {isCaptured ? 'Đã lưu hình ảnh' : 'Chưa chụp'}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <Card style={styles.notesCard} variant="surface">
          <View style={styles.notesHeading}>
            <MaterialIcons color={colors.secondary} name="edit-note" size={fontSize.iconLg} />
            <Text style={styles.sectionTitle}>Ghi chú vết xước hoặc đồ đạc trên xe</Text>
            <Text style={styles.optional}>Tùy chọn</Text>
          </View>
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Ví dụ: Vết trầy nhẹ cản sau bên phụ, có 01 laptop ở ghế sau..."
            placeholderTextColor={colors.outline}
            style={styles.notesInput}
            textAlignVertical="top"
            value={notes}
          />
          <View style={styles.presetRow}>
            {NOTE_PRESETS.map((preset) => (
              <Pressable
                accessibilityRole="button"
                key={preset}
                onPress={() => appendNote(preset)}
                style={styles.presetChip}
              >
                <Text style={styles.presetText}>{'+ ' + preset.replace(/^Có |^Xe sạch sẽ /, '')}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Button
          icon="assignment-turned-in"
          iconPosition="leading"
          label="Xác nhận bàn giao xe"
          onPress={submitHandover}
          style={styles.submitButton}
          textStyle={styles.submitLabel}
        />
        <View style={styles.footerNote}>
          <MaterialIcons color={colors.outline} name="info-outline" size={fontSize.iconSm} />
          <Text style={styles.footerText}>Biên bản sẽ được đồng bộ và lưu trữ minh bạch</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    minHeight: spacing.headerHeight,
    backgroundColor: colors.driverHeader,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.spaceMd,
    paddingBottom: spacing.spaceSm,
    gap: spacing.spaceSm,
  },
  backButton: { width: spacing.iconButtonMd, height: spacing.iconButtonMd, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineSm, color: colors.onPrimary, flex: 1 },
  headerAvatar: { width: spacing.avatarMd, height: spacing.avatarMd, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.spaceMd, gap: spacing.spaceMd },
  noticeCard: { padding: spacing.spaceMd, backgroundColor: colors.primarySoft, gap: spacing.spaceXs },
  noticeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceSm },
  noticeTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs, flex: 1 },
  noticeHeading: { ...typography.labelLg, color: colors.onSurface, letterSpacing: 0.7 },
  counter: { ...typography.labelSm, color: colors.onPrimaryFixed, backgroundColor: colors.secondaryFixed, borderRadius: borderRadius.full, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.py0_5 },
  noticeCopy: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.spaceXs },
  cameraNotice: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs, marginTop: spacing.spaceXs },
  cameraNoticeText: { ...typography.bodyMd, color: colors.success, flex: 1 },
  progressTrack: { height: 6, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerHigh, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.spaceMd },
  photoCard: { width: '48.5%', padding: 0, overflow: 'hidden' },
  photoAction: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  pendingPhoto: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceXs },
  cameraCircle: { width: 52, height: 52, borderRadius: borderRadius.full, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  captureLabel: { ...typography.labelMd, color: colors.primary },
  checkedBadge: { position: 'absolute', top: spacing.spaceSm, right: spacing.spaceSm, width: 28, height: 28, borderRadius: borderRadius.full, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  cameraBadge: { position: 'absolute', right: spacing.spaceSm, bottom: spacing.spaceSm, width: 36, height: 36, borderRadius: borderRadius.full, backgroundColor: '#0B1C30CC', alignItems: 'center', justifyContent: 'center' },
  photoCaption: { padding: spacing.spaceSm, gap: spacing.spaceXs },
  photoTitle: { ...typography.labelMd, color: colors.onSurface },
  photoStatus: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs },
  statusDot: { width: 7, height: 7, borderRadius: borderRadius.full, backgroundColor: colors.outline },
  statusDotCaptured: { backgroundColor: colors.success },
  statusText: { ...typography.bodyMd, color: colors.outline },
  statusTextCaptured: { color: colors.success },
  notesCard: { padding: spacing.spaceMd, gap: spacing.spaceSm },
  notesHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs },
  sectionTitle: { ...typography.labelLg, color: colors.onSurface, flex: 1 },
  optional: { ...typography.bodyMd, color: colors.outline },
  notesInput: { minHeight: 72, borderRadius: borderRadius.lg, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.spaceMd, paddingVertical: spacing.spaceSm, color: colors.onSurface, ...typography.bodyMd },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.spaceXs },
  presetChip: { borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainer, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.py1 },
  presetText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  submitButton: { height: 64, marginTop: spacing.spaceXs },
  submitLabel: { ...typography.headlineSm, color: colors.onPrimary },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceXs, marginTop: -spacing.spaceSm },
  footerText: { ...typography.bodyMd, color: colors.outline, textAlign: 'center' },
});
