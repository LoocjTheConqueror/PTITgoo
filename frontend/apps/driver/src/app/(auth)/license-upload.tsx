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

type LicenseSide = 'front' | 'back';
type ImageSource = 'camera' | 'library';
type LicenseTier = 'B2' | 'C' | 'D' | 'E';

const HEADER_COLOR = colors.driverHeader;

const LICENSE_TIERS: {
  description: string;
  popular?: boolean;
  value: LicenseTier;
}[] = [
  { value: 'B2', description: 'Số sàn/Tự động', popular: true },
  { value: 'C', description: 'Tải > 3.5T' },
  { value: 'D', description: 'Xe 30 chỗ' },
  { value: 'E', description: 'Xe > 30 chỗ' },
];

const CAPABILITIES = ['Số tự động (AT)', 'Số sàn (MT)', 'Xe điện (EV)'];

export default function LicenseUploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('0790 9400 8129');
  const [tier, setTier] = useState<LicenseTier>('B2');
  const [issueDate, setIssueDate] = useState('14/08/2021');
  const [expiryDate, setExpiryDate] = useState('14/08/2031');
  const [busySide, setBusySide] = useState<LicenseSide | null>(null);
  const [notice, setNotice] = useState('');

  const openImageSource = async (side: LicenseSide, source: ImageSource) => {
    if (busySide) return;
    setBusySide(side);

    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Cần quyền sử dụng camera',
            'Hãy cấp quyền camera để chụp ảnh giấy phép lái xe.',
          );
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              mediaTypes: ['images'],
              quality: 0.9,
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [4, 3],
              mediaTypes: ['images'],
              quality: 0.9,
            });

      if (!result.canceled && result.assets[0]) {
        if (side === 'front') setFrontImage(result.assets[0].uri);
        else setBackImage(result.assets[0].uri);
        setNotice('');
      }
    } catch {
      Alert.alert('Không thể mở ảnh', 'Vui lòng thử chụp hoặc chọn ảnh khác.');
    } finally {
      setBusySide(null);
    }
  };

  const chooseImage = (side: LicenseSide) => {
    if (busySide) return;
    const sideLabel = side === 'front' ? 'mặt trước' : 'mặt sau';

    Alert.alert(`Ảnh ${sideLabel} GPLX`, 'Chọn cách thêm ảnh giấy phép.', [
      {
        text: 'Chụp ảnh',
        onPress: () => void openImageSource(side, 'camera'),
      },
      {
        text: 'Chọn từ thư viện',
        onPress: () => void openImageSource(side, 'library'),
      },
      { text: 'Huỷ', style: 'cancel' },
    ]);
  };

  const updateLicenseNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    setLicenseNumber(digits.replace(/(\d{4})(?=\d)/g, '$1 '));
    setNotice('');
  };

  const submitForReview = () => {
    if (!frontImage || !backImage) {
      setNotice('Vui lòng tải ảnh rõ nét của cả mặt trước và mặt sau GPLX.');
      return;
    }

    if (licenseNumber.replace(/\D/g, '').length !== 12) {
      setNotice('Số giấy phép lái xe cần có đủ 12 chữ số.');
      return;
    }

    setNotice('');
    router.push('/(auth)/verify-id' as never);
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
        <Card style={styles.contextCard} variant="muted">
          <View style={styles.contextContent}>
            <View style={styles.contextIcon}>
              <MaterialIcons
                color={colors.primary}
                name="verified-user"
                size={fontSize.iconXl}
              />
            </View>
            <View style={styles.contextCopy}>
              <Text style={styles.contextTitle}>Xác thực hồ sơ tài xế</Text>
              <Text style={styles.contextDescription}>
                Cung cấp GPLX từ B2 trở lên để xác thực tay lái và loại xe nhận
                lái (Số sàn &amp; Số tự động).
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.form}>
          <View style={styles.uploadSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>
                Hình ảnh giấy phép <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View style={styles.ocrLabel}>
                <MaterialIcons
                  color={colors.primary}
                  name="auto-awesome"
                  size={fontSize.iconSm}
                />
                <Text style={styles.ocrText}>OCR Tự động điền</Text>
              </View>
            </View>

            <View style={styles.uploadRow}>
              <UploadCard
                busy={busySide === 'front'}
                imageUri={frontImage}
                onPress={() => chooseImage('front')}
                side="front"
              />
              <UploadCard
                busy={busySide === 'back'}
                imageUri={backImage}
                onPress={() => chooseImage('back')}
                side="back"
              />
            </View>

            <View style={styles.guidance}>
              <MaterialIcons
                color={colors.success}
                name="info-outline"
                size={fontSize.iconMd}
              />
              <Text style={styles.guidanceText}>
                Yêu cầu ảnh chụp rõ nét, không lóa sáng, không cắt 4 góc.
              </Text>
            </View>
          </View>

          <View style={styles.fieldSection}>
            <Input
              accessibilityLabel="Số giấy phép lái xe, 12 chữ số"
              autoCapitalize="none"
              keyboardType="number-pad"
              label="Số Giấy phép lái xe (12 số)"
              labelAccessory={<Text style={styles.requiredText}>Bắt buộc</Text>}
              maxLength={14}
              onChangeText={updateLicenseNumber}
              placeholder="0101 9801 2345"
              style={styles.licenseInput}
              inputStyle={styles.licenseNumberText}
              value={licenseNumber}
            />
            {licenseNumber.replace(/\D/g, '').length === 12 ? (
              <View pointerEvents="none" style={styles.licenseStatus}>
                <MaterialIcons
                  color={colors.success}
                  name="check-circle"
                  size={fontSize.iconXl}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.fieldSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Hạng giấy phép lái xe</Text>
              <Text style={styles.secondaryLabel}>Nhận khách lái ô tô</Text>
            </View>
            <View accessibilityRole="radiogroup" style={styles.tierRow}>
              {LICENSE_TIERS.map((item) => {
                const selected = tier === item.value;

                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setTier(item.value)}
                    style={[
                      styles.tierOption,
                      selected ? styles.tierOptionSelected : styles.tierOptionIdle,
                    ]}
                  >
                    {item.popular ? (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Phổ biến</Text>
                      </View>
                    ) : null}
                    <Text
                      style={[
                        styles.tierName,
                        selected && styles.tierNameSelected,
                      ]}
                    >
                      {item.value}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.tierDescription,
                        selected && styles.tierDescriptionSelected,
                      ]}
                    >
                      {item.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.dateRow}>
            <DateField
              icon="calendar-today"
              label="Ngày cấp"
              onChangeText={(value) => {
                setIssueDate(value);
                setNotice('');
              }}
              value={issueDate}
            />
            <DateField
              icon="event-repeat"
              label="Ngày hết hạn"
              onChangeText={(value) => {
                setExpiryDate(value);
                setNotice('');
              }}
              value={expiryDate}
            />
          </View>

          <Card style={styles.capabilitiesCard} variant="surface">
            <Text style={styles.capabilitiesTitle}>
              Phương tiện được cấp phép điều khiển
            </Text>
            <View style={styles.capabilitiesList}>
              {CAPABILITIES.map((capability) => (
                <View key={capability} style={styles.capabilityChip}>
                  <MaterialIcons
                    color={colors.onSecondaryFixed}
                    name="check"
                    size={fontSize.iconSm}
                  />
                  <Text style={styles.capabilityText}>{capability}</Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={styles.submitSection}>
            {notice ? (
              <View
                accessibilityRole="alert"
                style={styles.notice}
              >
                <MaterialIcons
                  color={colors.primary}
                  name="info-outline"
                  size={fontSize.iconMd}
                />
                <Text style={styles.noticeText}>{notice}</Text>
              </View>
            ) : null}
            <Button
              icon="send"
              iconPosition="leading"
              iconSize={fontSize.iconXl}
              label="Gửi duyệt GPLX"
              onPress={submitForReview}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
            />
            <View style={styles.privacyNote}>
              <MaterialIcons
                color={colors.success}
                name="lock-outline"
                size={fontSize.iconSm}
              />
              <Text style={styles.privacyText}>
                Hồ sơ được bảo mật và đối soát trực tiếp cùng CSGT/Bộ GTVT
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{ height: insets.bottom, backgroundColor: colors.background }} />
    </View>
  );
}

function UploadCard({
  busy,
  imageUri,
  onPress,
  side,
}: {
  busy: boolean;
  imageUri: string | null;
  onPress: () => void;
  side: LicenseSide;
}) {
  const isFront = side === 'front';
  const title = isFront ? 'Mặt trước GPLX' : 'Mặt sau GPLX';
  const subtitle = isFront ? 'Chụp rõ số & hình' : 'Chụp đủ con dấu';

  return (
    <Card
      accessibilityLabel={`${imageUri ? 'Thay ảnh' : 'Thêm ảnh'} ${title}`}
      onPress={onPress}
      style={styles.uploadCard}
      variant="surface"
    >
      {imageUri ? (
        <>
          <Image
            accessibilityLabel={`Ảnh ${title.toLowerCase()}`}
            resizeMode="cover"
            source={{ uri: imageUri }}
            style={styles.uploadPreview}
          />
          <View pointerEvents="none" style={styles.previewScrim} />
          <View style={styles.previewFooter}>
            <View style={styles.uploadedBadge}>
              <MaterialIcons
                color={colors.success}
                name="check-circle"
                size={fontSize.iconSm}
              />
              <Text style={styles.uploadedText}>Đã tải</Text>
            </View>
            <MaterialIcons
              color={colors.onPrimary}
              name="cached"
              size={fontSize.iconMd}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.uploadIcon}>
            {busy ? (
              <MaterialIcons
                color={colors.primary}
                name="hourglass-top"
                size={fontSize.iconXl}
              />
            ) : (
              <MaterialIcons
                color={colors.primary}
                name="photo-camera"
                size={fontSize.iconXl}
              />
            )}
          </View>
          <Text style={styles.uploadTitle}>{title}</Text>
          <Text style={styles.uploadSubtitle}>{subtitle}</Text>
        </>
      )}
    </Card>
  );
}

function DateField({
  icon,
  label,
  onChangeText,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.dateField}>
      <Input
        accessibilityLabel={label}
        keyboardType="numbers-and-punctuation"
        label={label}
        maxLength={10}
        onChangeText={onChangeText}
        placeholder="DD/MM/YYYY"
        style={styles.dateInput}
        inputStyle={styles.dateInputText}
        value={value}
      />
      <View pointerEvents="none" style={styles.dateIcon}>
        <MaterialIcons color={colors.secondary} name={icon} size={fontSize.iconMd} />
      </View>
    </View>
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
  contextCard: {
    padding: spacing.spaceMd,
    backgroundColor: colors.primaryFixed,
  },
  contextContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
  },
  contextIcon: {
    width: spacing.avatarMd,
    height: spacing.avatarMd,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary10,
  },
  contextCopy: {
    flex: 1,
    minWidth: 0,
  },
  contextTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  contextDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xxs,
  },
  form: {
    gap: spacing.spaceLg,
  },
  uploadSection: {
    gap: spacing.spaceSm,
  },
  sectionHeading: {
    minHeight: spacing.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
    flexShrink: 1,
  },
  requiredMark: {
    color: colors.error,
  },
  ocrLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  ocrText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '600',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  uploadCard: {
    height: 144,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
    padding: spacing.spaceSm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  uploadIcon: {
    width: spacing.uploadIconCircle,
    height: spacing.uploadIconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary10,
    marginBottom: spacing.xxs,
  },
  uploadTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  uploadSubtitle: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  uploadPreview: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: borderRadius.xl,
  },
  previewScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.scrim60,
  },
  previewFooter: {
    position: 'absolute',
    right: spacing.spaceSm,
    bottom: spacing.spaceSm,
    left: spacing.spaceSm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.px1_5,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.scrim60,
  },
  uploadedText: {
    ...typography.labelSm,
    color: colors.onPrimary,
  },
  guidance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    padding: spacing.px2_5,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  guidanceText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  fieldSection: {
    position: 'relative',
    gap: spacing.spaceSm,
  },
  requiredText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  licenseInput: {
    paddingRight: spacing.spaceXl,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  licenseNumberText: {
    ...typography.bodyLg,
    letterSpacing: spacing.letterSpacingWide,
  },
  licenseStatus: {
    position: 'absolute',
    right: spacing.spaceMd,
    bottom: spacing.spaceMd,
  },
  secondaryLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  tierRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    paddingTop: spacing.spaceXs,
  },
  tierOption: {
    minHeight: 72,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.spaceSm,
    borderRadius: borderRadius.xl,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tierOptionSelected: {
    backgroundColor: colors.primaryContainer,
  },
  tierOptionIdle: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  popularBadge: {
    position: 'absolute',
    top: -spacing.py1,
    right: -spacing.xxs,
    paddingHorizontal: spacing.px1_5,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    zIndex: 1,
  },
  popularText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  tierName: {
    ...typography.headlineSm,
    color: colors.onSurface,
    lineHeight: 22,
  },
  tierNameSelected: {
    color: colors.onPrimary,
  },
  tierDescription: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  tierDescriptionSelected: {
    color: colors.onPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  dateField: {
    position: 'relative',
    flex: 1,
  },
  dateInput: {
    paddingRight: spacing.spaceXl,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  dateInputText: {
    ...typography.bodyMd,
  },
  dateIcon: {
    position: 'absolute',
    right: spacing.spaceSm,
    bottom: spacing.spaceMd,
  },
  capabilitiesCard: {
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
  },
  capabilitiesTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  capabilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.gap1_5,
  },
  capabilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.px2_5,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryFixed,
  },
  capabilityText: {
    ...typography.labelSm,
    color: colors.onSecondaryFixed,
  },
  submitSection: {
    gap: spacing.spaceSm,
    paddingTop: spacing.spaceXs,
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
  },
  submitButtonText: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceSm,
    paddingHorizontal: spacing.xxs,
  },
  privacyText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
    textAlign: 'center',
  },
});
