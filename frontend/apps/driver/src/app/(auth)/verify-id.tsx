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
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Input,
  borderRadius,
  colors,
  fontSize,
  spacing,
  typography,
} from '@datxe/shared';

type PhotoTarget = 'idFront' | 'idBack' | 'selfie';
type PhotoSource = 'camera' | 'library';

type PhotoAsset = {
  uri: string;
  sizeLabel: string;
};

const HEADER_COLOR = colors.driverHeader;

const INITIAL_PHOTOS: Record<PhotoTarget, PhotoAsset> = {
  idFront: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxKqUDcs6epZzfK23C1kljO_7TbjOc7mW44rIlO8H12kT_ud4IbFqisg1ycup8X2oYfbFN5JEfntdQ7onisUAv5ndBBL7pmHoFGa3uAOmplDEUqwCIDFLtIYqUwKurHVO1zq5_d1uScQDrNNAMUT73_rW9ufYQRH01lum2Gulck85YSIx76-nAWEYxdKAowESzTTaCQa4lhZqLlPyreArGyQSxMQ2x8FvgFvw9gXLl0fyQ2DvwI4QdUA',
    sizeLabel: '2.4 MB',
  },
  idBack: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwedxoY0n2SR0wOfRt0et-M3XfdIODCJ4xbQ9GoeWCHuVsi3UppG3lGSAUONBAsAMsJEJVG_OeB6SCkIJtByrqU6FvINdu6IUlA2iUjbFZkJiVmZD23HcZXqE-e9nkaz6lP-ncIxwvYLJSZ-MGT1AjU-5qjLk9na6DOGA3KW3LkoulvY0m4J7nQx0DE_SRy1Lf8SiNfcMAYl3-krfxjEJBM5Ccv_qmo0weXj4DMfRSTEh6LqDjcHdM9w',
    sizeLabel: '1.9 MB',
  },
  selfie: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO8BnpBHmSHpRkkLeO7YKl26ZWjTXmFwu9kmJPU_quUMzSx9-Pl0atxfLlzmid0c_m3INrB62jeUfL2xdjIn8ehDWn5XV59ZTqLesLZnAHh5tIw4VyUuKz-nNj37M2NtdumtNWdkH78Y35T6t-H8dFqSbMKH2107vL1vgaYWw_S8aFonrQtFpMA9o9otMI_3LPomlL0fbmtvOBOtrf_gUZIm_XqjFbgmW2doh0AQPMIh0X9Oi3LHousQ',
    sizeLabel: '',
  },
};

const TARGET_DETAILS: Record<PhotoTarget, { aspect: [number, number]; label: string }> = {
  idFront: { aspect: [4, 3], label: 'mặt trước CCCD' },
  idBack: { aspect: [4, 3], label: 'mặt sau CCCD' },
  selfie: { aspect: [1, 1], label: 'chân dung sinh trắc học' },
};

export default function VerifyIdScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('NGUYỄN VĂN AN');
  const [citizenId, setCitizenId] = useState('079092019482');
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [busyTarget, setBusyTarget] = useState<PhotoTarget | null>(null);
  const [selfieMatched, setSelfieMatched] = useState(true);
  const [notice, setNotice] = useState('');

  const updatePhoto = (target: PhotoTarget, asset: ImagePicker.ImagePickerAsset) => {
    const fileSize = asset.fileSize;
    const sizeLabel =
      fileSize === undefined
        ? 'Ảnh mới'
        : `${Math.max(fileSize / (1024 * 1024), 0.1).toFixed(1)} MB`;

    setPhotos((current) => ({
      ...current,
      [target]: { uri: asset.uri, sizeLabel },
    }));
    if (target === 'selfie') setSelfieMatched(false);
    setNotice('');
  };

  const openPhotoSource = async (target: PhotoTarget, source: PhotoSource) => {
    if (busyTarget) return;
    setBusyTarget(target);

    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Cần quyền sử dụng camera',
            'Hãy cấp quyền camera để chụp giấy tờ và ảnh chân dung xác minh.',
          );
          return;
        }
      }

      const { aspect } = TARGET_DETAILS[target];
      const options: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        aspect,
        mediaTypes: ['images'],
        quality: 0.9,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        updatePhoto(target, result.assets[0]);
      }
    } catch {
      Alert.alert('Không thể mở ảnh', 'Vui lòng thử chụp hoặc chọn ảnh khác.');
    } finally {
      setBusyTarget(null);
    }
  };

  const choosePhoto = (target: PhotoTarget) => {
    if (busyTarget) return;
    const label = TARGET_DETAILS[target].label;

    Alert.alert(`Cập nhật ${label}`, 'Chọn cách thêm ảnh xác minh.', [
      {
        text: 'Chụp ảnh',
        onPress: () => void openPhotoSource(target, 'camera'),
      },
      {
        text: 'Chọn từ thư viện',
        onPress: () => void openPhotoSource(target, 'library'),
      },
      { text: 'Huỷ', style: 'cancel' },
    ]);
  };

  const submitVerification = () => {
    if (!fullName.trim()) {
      setNotice('Vui lòng nhập họ và tên đúng như trên thẻ CCCD.');
      return;
    }
    if (citizenId.length !== 12) {
      setNotice('Số căn cước công dân cần có đủ 12 chữ số.');
      return;
    }
    if (!selfieMatched) {
      setNotice('Ảnh chân dung mới cần được đối sánh trước khi gửi xác minh.');
      return;
    }

    setNotice('');
    router.push('/(auth)/approval-status' as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons
              color={colors.onPrimary}
              name="arrow-back"
              size={fontSize.icon2xl}
            />
          </Pressable>
          <Text numberOfLines={1} style={styles.headerTitle}>
            Cài Đặt Tài Xế
          </Text>
          <View style={styles.profileIcon}>
            <MaterialIcons
              color={colors.onPrimary}
              name="person-outline"
              size={fontSize.iconMd}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.progressCard} variant="surface">
          <View style={styles.progressHeading}>
            <View style={styles.progressLabelGroup}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Bước 2/3: Định danh cá nhân</Text>
            </View>
            <Text style={styles.processingBadge}>Đang xử lý</Text>
          </View>
          <View
            accessibilityLabel="Tiến trình hồ sơ: bước 2 trên 3"
            accessibilityRole="progressbar"
            style={styles.progressTrack}
          >
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressDescription}>
            Hồ sơ tài xế chuyên nghiệp • Cần hình ảnh rõ nét, không lóa sáng
          </Text>
        </Card>

        <Card style={styles.identityCard} variant="surface">
          <View style={styles.cardHeading}>
            <MaterialIcons
              color={colors.primary}
              name="badge"
              size={fontSize.iconXl}
            />
            <Text style={styles.cardTitle}>Thông tin trên thẻ</Text>
          </View>

          <Input
            accessibilityLabel="Họ và tên đầy đủ trên CCCD"
            autoCapitalize="characters"
            label="Họ và tên đầy đủ *"
            labelAccessory={<Text style={styles.inputHint}>IN HOA CÓ DẤU</Text>}
            onChangeText={(value) => {
              setFullName(value.toLocaleUpperCase('vi-VN'));
              setNotice('');
            }}
            placeholder="NGUYỄN VĂN AN"
            style={styles.identityInput}
            value={fullName}
          />

          <View style={styles.citizenIdField}>
            <Input
              accessibilityLabel="Số căn cước công dân, 12 chữ số"
              keyboardType="number-pad"
              label="Số Căn cước công dân (12 số) *"
              labelAccessory={
                citizenId.length === 12 ? (
                  <View style={styles.validLabel}>
                    <MaterialIcons
                      color={colors.success}
                      name="check-circle"
                      size={fontSize.iconSm}
                    />
                    <Text style={styles.validText}>Hợp lệ</Text>
                  </View>
                ) : null
              }
              maxLength={12}
              onChangeText={(value) => {
                setCitizenId(value.replace(/\D/g, '').slice(0, 12));
                setNotice('');
              }}
              placeholder="001095012345"
              style={styles.identityInput}
              inputStyle={styles.citizenIdText}
              value={citizenId}
            />
            {citizenId.length === 12 ? (
              <View pointerEvents="none" style={styles.idValidIcon}>
                <MaterialIcons
                  color={colors.success}
                  name="verified"
                  size={fontSize.iconXl}
                />
              </View>
            ) : null}
          </View>
        </Card>

        <View style={styles.documentSection}>
          <View style={styles.documentHeading}>
            <View style={styles.documentTitleGroup}>
              <MaterialIcons
                color={colors.primary}
                name="document-scanner"
                size={fontSize.iconXl}
              />
              <Text style={styles.cardTitle}>Ảnh thẻ CCCD gắn chip</Text>
            </View>
            <Text style={styles.requiredText}>Bắt buộc</Text>
          </View>
          <View style={styles.documentRow}>
            <DocumentCard
              image={photos.idFront}
              label="Mặt trước"
              loading={busyTarget === 'idFront'}
              onPress={() => choosePhoto('idFront')}
              title="Mặt trước CCCD"
            />
            <DocumentCard
              image={photos.idBack}
              label="Mặt sau"
              loading={busyTarget === 'idBack'}
              onPress={() => choosePhoto('idBack')}
              title="Mặt sau CCCD"
            />
          </View>
        </View>

        <Card style={styles.selfieCard} variant="surface">
          <View style={styles.selfieHeader}>
            <View style={styles.selfieTitleGroup}>
              <MaterialIcons
                color={colors.primary}
                name="face"
                size={fontSize.iconXl}
              />
              <Text style={styles.cardTitle}>Chân dung sinh trắc học</Text>
            </View>
            <Text
              style={[
                styles.matchBadge,
                !selfieMatched && styles.pendingMatchBadge,
              ]}
            >
              {selfieMatched ? 'Khớp 98.6%' : 'Chờ xác minh'}
            </Text>
          </View>

          <View style={styles.selfieContent}>
            <View style={styles.selfiePortrait}>
              <Image
                accessibilityLabel="Ảnh chân dung tài xế"
                resizeMode="cover"
                source={{ uri: photos.selfie.uri }}
                style={styles.selfieImage}
              />
              <View pointerEvents="none" style={styles.selfieGuide} />
            </View>
            <View style={styles.selfieCopy}>
              <Text style={styles.selfieTitle}>
                Ảnh chân dung trực diện (Selfie)
              </Text>
              <Text style={styles.selfieDescription}>
                Khuôn mặt căn giữa khung tròn, không đeo kính râm, không đội mũ,
                ánh sáng đủ.
              </Text>
              <View style={styles.selfieActions}>
                <Pressable
                  accessibilityLabel="Chụp lại ảnh chân dung"
                  accessibilityRole="button"
                  disabled={busyTarget === 'selfie'}
                  onPress={() => choosePhoto('selfie')}
                  style={styles.retakeButton}
                >
                  <MaterialIcons
                    color={colors.onSurface}
                    name="photo-camera-front"
                    size={fontSize.iconSm}
                  />
                  <Text style={styles.retakeText}>Chụp lại</Text>
                </Pressable>
                <View style={styles.validLabel}>
                  <MaterialIcons
                    color={selfieMatched ? colors.success : colors.outline}
                    name={selfieMatched ? 'check' : 'schedule'}
                    size={fontSize.iconSm}
                  />
                  <Text
                    style={[
                      styles.validText,
                      !selfieMatched && styles.pendingText,
                    ]}
                  >
                    {selfieMatched ? 'Hợp lệ' : 'Chờ đối soát'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.securityCard} variant="muted">
          <View style={styles.securityIcon}>
            <MaterialIcons
              color={colors.primary}
              name="verified-user"
              size={fontSize.iconMd}
            />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Cam kết bảo mật tuyệt đối</Text>
            <Text style={styles.securityDescription}>
              DriveMate cam kết mã hóa và bảo mật dữ liệu cá nhân theo tiêu
              chuẩn <Text style={styles.isoLabel}>ISO 27001</Text>. Dữ liệu chỉ
              dùng cho mục đích xác minh tư cách pháp lý tài xế.
            </Text>
          </View>
        </Card>

        <View style={styles.submitSection}>
          {notice ? (
            <View accessibilityRole="alert" style={styles.notice}>
              <MaterialIcons
                color={colors.primary}
                name="info-outline"
                size={fontSize.iconMd}
              />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}
          <Button
            icon="lock"
            iconPosition="leading"
            iconSize={fontSize.iconXl}
            label="Gửi hồ sơ duyệt"
            onPress={submitVerification}
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
          />
          <View style={styles.reviewTime}>
            <MaterialIcons
              color={colors.success}
              name="schedule"
              size={fontSize.iconSm}
            />
            <Text style={styles.reviewTimeText}>
              Thời gian xét duyệt tự động: 5 - 15 phút
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={{ height: insets.bottom, backgroundColor: colors.background }} />
    </View>
  );
}

function DocumentCard({
  image,
  label,
  loading,
  onPress,
  title,
}: {
  image: PhotoAsset;
  label: string;
  loading: boolean;
  onPress: () => void;
  title: string;
}) {
  return (
    <Card
      accessibilityLabel={`Chọn hoặc thay ảnh ${title}`}
      onPress={onPress}
      style={styles.documentCard}
      variant="surface"
    >
      <View style={styles.documentImageFrame}>
        <Image
          accessibilityLabel={title}
          resizeMode="cover"
          source={{ uri: image.uri }}
          style={styles.documentImage}
        />
        <View pointerEvents="none" style={styles.documentImageScrim} />
        <View style={styles.documentSideBadge}>
          <Text style={styles.documentSideText}>{label}</Text>
        </View>
        <View style={styles.documentCameraButton}>
          <MaterialIcons
            color={colors.onPrimary}
            name={loading ? 'hourglass-top' : 'photo-camera'}
            size={fontSize.icon2xl}
          />
        </View>
      </View>
      <View style={styles.documentCardTitleRow}>
        <Text numberOfLines={1} style={styles.documentCardTitle}>
          {title}
        </Text>
        <View style={styles.refreshIcon}>
          <MaterialIcons
            color={colors.onSecondaryFixed}
            name="refresh"
            size={fontSize.iconMd}
          />
        </View>
      </View>
      <Text style={styles.fileSizeText}>Đã tải lên • {image.sizeLabel}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: HEADER_COLOR,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    height: spacing.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
  },
  backButton: {
    width: spacing.iconButtonMd,
    height: spacing.iconButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.spaceSm,
  },
  headerTitle: {
    ...typography.headlineSm,
    flex: 1,
    color: colors.onPrimary,
    letterSpacing: -0.4,
  },
  profileIcon: {
    width: spacing.avatarMd,
    height: spacing.avatarMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    marginLeft: spacing.spaceSm,
  },
  scrollContent: {
    gap: spacing.spaceMd,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.spaceMd,
    paddingBottom: spacing.spaceXl,
  },
  progressCard: {
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
  },
  progressHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  progressLabelGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  stepNumber: {
    width: spacing.contextBadge,
    height: spacing.contextBadge,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  stepNumberText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  stepLabel: {
    ...typography.labelMd,
    color: colors.primary,
    letterSpacing: spacing.letterSpacingWide,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  processingBadge: {
    ...typography.labelSm,
    color: colors.success,
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
  },
  progressTrack: {
    height: spacing.gap1_5,
    overflow: 'hidden',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
  },
  progressFill: {
    width: '66.6667%',
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  progressDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  identityCard: {
    gap: spacing.spaceMd,
    padding: spacing.spaceMd,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  cardTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flexShrink: 1,
  },
  identityInput: {
    backgroundColor: colors.surfaceContainerLow,
  },
  inputHint: {
    ...typography.labelSm,
    color: colors.outline,
    textTransform: 'uppercase',
  },
  citizenIdField: {
    position: 'relative',
  },
  citizenIdText: {
    ...typography.bodyLg,
    letterSpacing: spacing.letterSpacingWide,
    paddingRight: spacing.spaceXl,
  },
  validLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  validText: {
    ...typography.labelSm,
    color: colors.success,
  },
  idValidIcon: {
    position: 'absolute',
    right: spacing.spaceMd,
    bottom: spacing.spaceMd,
  },
  documentSection: {
    gap: spacing.spaceSm,
  },
  documentHeading: {
    minHeight: spacing.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  documentTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  requiredText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  documentRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  documentCard: {
    flex: 1,
    gap: spacing.spaceSm,
    padding: spacing.spaceSm,
  },
  documentImageFrame: {
    height: 112,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  documentImageScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.inverseSurface40,
  },
  documentSideBadge: {
    position: 'absolute',
    top: spacing.spaceSm,
    left: spacing.spaceSm,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  documentSideText: {
    ...typography.labelSm,
    color: colors.onPrimary,
  },
  documentCameraButton: {
    width: spacing.iconButtonLg,
    height: spacing.iconButtonLg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  documentCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xxs,
  },
  documentCardTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    flex: 1,
  },
  refreshIcon: {
    width: spacing.cardActionButton,
    height: spacing.cardActionButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryFixed,
  },
  fileSizeText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  selfieCard: {
    gap: spacing.spaceMd,
    padding: spacing.spaceMd,
  },
  selfieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  selfieTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  matchBadge: {
    ...typography.labelSm,
    color: colors.success,
    fontWeight: '600',
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
  },
  pendingMatchBadge: {
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surfaceContainerHigh,
  },
  selfieContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
  },
  selfiePortrait: {
    width: 112,
    height: 112,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  selfieGuide: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    borderRadius: borderRadius.full,
    margin: spacing.spaceXs,
  },
  selfieCopy: {
    flex: 1,
    minWidth: 0,
  },
  selfieTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  selfieDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.gap1,
  },
  selfieActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.spaceSm,
    marginTop: spacing.spaceSm,
  },
  retakeButton: {
    height: spacing.buttonMdHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.spaceMd,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerHigh,
  },
  retakeText: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  pendingText: {
    color: colors.onSurfaceVariant,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
  },
  securityIcon: {
    width: spacing.avatarMd,
    height: spacing.avatarMd,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryFixed,
  },
  securityCopy: {
    flex: 1,
  },
  securityTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  securityDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xxs,
  },
  isoLabel: {
    ...typography.bodyMdMedium,
    color: colors.onSurface,
  },
  submitSection: {
    gap: spacing.spaceSm,
    marginTop: spacing.spaceSm,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
    padding: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary10,
  },
  noticeText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  submitButton: {
    height: spacing.ctaHeight,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
  reviewTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.spaceSm,
  },
  reviewTimeText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
