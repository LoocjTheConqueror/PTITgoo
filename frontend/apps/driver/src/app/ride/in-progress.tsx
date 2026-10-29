import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
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
  borderRadius,
  colors,
  fontSize,
  spacing,
  typography,
} from '@datxe/shared';

type MapTool = 'layers' | 'location' | 'traffic';

const HEADER_COLOR = colors.driverHeader;
const CUSTOMER_PHONE = '0901234567';
const CUSTOMER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Fvxjt9-i6cC3tPw1P6CB7lyHPWwEAJEyE0Og_qOKArcEZoErwMaME5mR9y9bKHUbb2SE0kfvXKsNq7l_ZesREUFX0E8ciSTHEAIZEp0ahElTCwcadSQho90Kni1LbhDAfF_7oCp0u3yPdZpubedNj2SkNoTpzdhgU4qxHcQjNKxjj8xYv1eq6BEHccWIdeC0zPdkg0oE9feqmyPtkMeR0yg0wZsmvsF4BgtxZf_AvfB_mHW1J6yieQ';
const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCAm3tmKY-WFmWrxhftGBGQu80Hkk2Qm9yXrwPK_uMrcRcodHkrcpTU7FBDfLtpeSt32x6wZDF_mGoJTA2k2nMQ5vvwgGKQSIjQ67fy8h27J1JN38kJMD7IahViEmXGDE2bjnnX9gkO09RpCVHjbctj7SOkF5mX_ZcY3QOOnGjZ6QEXeYaUt4OX6_CB4Qs7huhY5f-bhjtTrtiF-NVPaJ1E4oImVAxKNHgn3shQhYL_iUJbvjlnduW3WA';

const TRIP_STEPS: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}[] = [
  { icon: 'location-on', label: 'Đến điểm đón' },
  { icon: 'vpn-key', label: 'Bắt đầu chuyến' },
  { icon: 'verified', label: 'Đến nơi an toàn' },
];

const STEP_COPY = [
  {
    label: 'Tôi đã đến điểm đón',
    icon: 'check-circle' as const,
    helper: 'Chạm để xác nhận đã tiếp cận xe khách',
  },
  {
    label: 'Bắt đầu chuyến đi',
    icon: 'play-arrow' as const,
    helper: 'Đã nhận bàn giao chìa khóa & kiểm tra xe',
  },
  {
    label: 'Đến nơi an toàn (Hoàn thành)',
    icon: 'verified-user' as const,
    helper: 'Chạm để xuất hóa đơn & nhận thanh toán',
  },
];

export default function InProgressRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState(0);
  const [tripCompleted, setTripCompleted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mapNotice, setMapNotice] = useState('');
  const [trafficLayerEnabled, setTrafficLayerEnabled] = useState(false);
  const [handoverPhoto, setHandoverPhoto] = useState<string | null>(null);
  const [capturingPhoto, setCapturingPhoto] = useState(false);

  const openCustomerCall = async () => {
    try {
      await Linking.openURL(`tel:${CUSTOMER_PHONE}`);
    } catch {
      Alert.alert('Không thể gọi khách', `Vui lòng gọi ${CUSTOMER_PHONE}.`);
    }
  };

  const openSupport = () => {
    Alert.alert('Hỗ trợ chuyến đi', 'Bạn muốn gọi tổng đài đối tác 1900 6868?', [
      { text: 'Để sau', style: 'cancel' },
      {
        text: 'Gọi tổng đài',
        onPress: () => {
          void Linking.openURL('tel:19006868').catch(() =>
            Alert.alert('Không thể gọi tổng đài', 'Vui lòng gọi 1900 6868.'),
          );
        },
      },
    ]);
  };

  const captureHandoverPhoto = async () => {
    if (capturingPhoto) return;
    setCapturingPhoto(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Cần quyền sử dụng camera',
          'Cho phép truy cập camera để chụp biên bản tình trạng xe.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setHandoverPhoto(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Không thể mở camera', 'Vui lòng thử chụp lại biên bản.');
    } finally {
      setCapturingPhoto(false);
    }
  };

  const advanceTrip = () => {
    if (tripCompleted) return;

    if (activeStep < TRIP_STEPS.length - 1) {
      setActiveStep((step) => step + 1);
      return;
    }

    setTripCompleted(true);
    router.push('/ride/complete' as never);
  };

  const onMapToolPress = (tool: MapTool) => {
    if (tool === 'layers') {
      setMapNotice('Bản đồ đường phố');
      return;
    }

    if (tool === 'location') {
      setMapNotice('Đã căn giữa vị trí tài xế');
      return;
    }

    setTrafficLayerEnabled((enabled) => !enabled);
    setMapNotice(trafficLayerEnabled ? 'Đã tắt lớp giao thông' : 'Giao thông: thông thoáng');
  };

  const currentStepCopy = STEP_COPY[activeStep];

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
            Chuyến Xe Hiện Tại
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, spacing.spaceMd) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tripHud}>
          <View style={styles.tripHudDetails}>
            <View style={styles.tripIdBadge}>
              <View style={styles.tripIdDot} />
              <Text style={styles.tripIdText}>#DX-8892</Text>
            </View>
            <View style={styles.tripDistance}>
              <MaterialIcons
                color={colors.primaryFixed}
                name="near-me"
                size={fontSize.iconMd}
              />
              <Text style={styles.tripDistanceText}>6.2 km • 18 phút</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Gọi hỗ trợ chuyến đi"
            accessibilityRole="button"
            onPress={openSupport}
            style={styles.sosButton}
          >
            <MaterialIcons
              color={colors.onError}
              name="emergency"
              size={fontSize.iconMd}
            />
            <Text style={styles.sosText}>SOS</Text>
          </Pressable>
        </View>

        <View style={styles.directionBar}>
          <View style={styles.turnIconBox}>
            <MaterialIcons
              color={colors.onPrimary}
              name="turn-right"
              size={fontSize.icon2xl}
            />
          </View>
          <View style={styles.directionCopy}>
            <View style={styles.directionTitleRow}>
              <Text style={styles.directionDistance}>Trong 150m</Text>
              <View style={styles.laneBadge}>
                <Text style={styles.laneText}>Làn 2</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.directionSubtitle}>
              Rẽ phải vào Phố Vọng hướng Đại La
            </Text>
          </View>
          <Pressable
            accessibilityLabel={voiceEnabled ? 'Tắt hướng dẫn bằng giọng nói' : 'Bật hướng dẫn bằng giọng nói'}
            accessibilityRole="button"
            accessibilityState={{ selected: voiceEnabled }}
            onPress={() => setVoiceEnabled((enabled) => !enabled)}
            style={styles.voiceButton}
          >
            <MaterialIcons
              color={colors.primary}
              name={voiceEnabled ? 'volume-up' : 'volume-off'}
              size={fontSize.iconXl}
            />
          </Pressable>
        </View>

        <View style={styles.mapViewport}>
          <Image
            accessible={false}
            resizeMode="cover"
            source={{ uri: MAP_IMAGE }}
            style={styles.mapImage}
          />
          <View pointerEvents="none" style={styles.mapTint} />

          {trafficLayerEnabled ? (
            <View style={styles.trafficBadge}>
              <View style={styles.trafficDot} />
              <Text style={styles.trafficBadgeText}>Giao thông thông thoáng</Text>
            </View>
          ) : null}

          <View style={styles.mapTools}>
            <MapToolButton
              accessibilityLabel="Lớp bản đồ"
              icon="layers"
              onPress={() => onMapToolPress('layers')}
            />
            <MapToolButton
              accessibilityLabel="Định vị tài xế"
              icon="my-location"
              onPress={() => onMapToolPress('location')}
            />
            <MapToolButton
              accessibilityLabel={trafficLayerEnabled ? 'Tắt lớp giao thông' : 'Bật lớp giao thông'}
              icon="traffic"
              onPress={() => onMapToolPress('traffic')}
              active={trafficLayerEnabled}
            />
          </View>

          <View pointerEvents="none" style={styles.driverMarker}>
            <View style={styles.markerHalo}>
              <View style={styles.markerCore}>
                <MaterialIcons
                  color={colors.onPrimary}
                  name="navigation"
                  size={fontSize.iconMd}
                />
              </View>
            </View>
            <View style={styles.speedBadge}>
              <Text style={styles.speedText}>38 km/h</Text>
            </View>
          </View>

          {mapNotice ? (
            <View style={styles.mapNotice}>
              <Text numberOfLines={1} style={styles.mapNoticeText}>
                {mapNotice}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomSheet}>
          <Card style={styles.vehicleCard} variant="surface">
            <View style={styles.vehicleIconBox}>
              <MaterialIcons
                color={colors.onSurface}
                name="directions-car"
                size={fontSize.icon2xl}
              />
            </View>
            <View style={styles.vehicleCopy}>
              <View style={styles.vehicleNameRow}>
                <Text numberOfLines={1} style={styles.vehicleName}>
                  Toyota Camry
                </Text>
                <View style={styles.transmissionBadge}>
                  <Text style={styles.transmissionText}>AT • Tự động</Text>
                </View>
              </View>
              <Text style={styles.licensePlate}>Biển số: 30G-928.14</Text>
            </View>
            <Pressable
              accessibilityLabel={capturingPhoto ? 'Đang chụp biên bản' : 'Chụp biên bản xe'}
              accessibilityRole="button"
              disabled={capturingPhoto}
              onPress={() => void captureHandoverPhoto()}
              style={styles.reportButton}
            >
              {handoverPhoto ? (
                <Image
                  accessibilityLabel="Ảnh biên bản xe đã chụp"
                  resizeMode="cover"
                  source={{ uri: handoverPhoto }}
                  style={styles.reportThumbnail}
                />
              ) : (
                <MaterialIcons
                  color={colors.primary}
                  name={capturingPhoto ? 'hourglass-top' : 'photo-camera'}
                  size={fontSize.iconMd}
                />
              )}
              <Text style={styles.reportButtonText}>
                {handoverPhoto ? 'Đã chụp' : 'Biên bản'}
              </Text>
            </Pressable>
          </Card>

          <Card style={styles.customerCard} variant="surface">
            <View style={styles.customerHeader}>
              <Image
                accessibilityLabel="Ảnh đại diện khách hàng Anh Tuấn Anh"
                resizeMode="cover"
                source={{ uri: CUSTOMER_AVATAR }}
                style={styles.customerAvatar}
              />
              <View style={styles.customerStatusDot} />
              <View style={styles.customerIdentity}>
                <View style={styles.customerNameRow}>
                  <Text numberOfLines={1} style={styles.customerName}>
                    Anh Tuấn Anh
                  </Text>
                  <View style={styles.customerRating}>
                    <MaterialIcons
                      color={colors.success}
                      name="star"
                      size={fontSize.iconSm}
                    />
                    <Text style={styles.customerRatingText}>4.9</Text>
                  </View>
                </View>
                <Text numberOfLines={2} style={styles.customerSubtitle}>
                  Khách hàng đặt lái hộ về nhà
                </Text>
              </View>
              <View style={styles.customerActions}>
                <Pressable
                  accessibilityLabel={`Gọi khách ${CUSTOMER_PHONE}`}
                  accessibilityRole="link"
                  onPress={() => void openCustomerCall()}
                  style={styles.callCustomerButton}
                >
                  <MaterialIcons
                    color={colors.primary}
                    name="call"
                    size={fontSize.iconMd}
                  />
                  <Text style={styles.callCustomerText}>Gọi khách</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Nhắn tin cho khách"
                  accessibilityRole="button"
                  onPress={() =>
                    Alert.alert(
                      'Tin nhắn khách hàng',
                      'Cuộc trò chuyện với khách sẽ hiển thị tại đây.',
                    )
                  }
                  style={styles.chatButton}
                >
                  <MaterialIcons
                    color={colors.primary}
                    name="chat"
                    size={fontSize.iconXl}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.checkpointsCard}>
              <View style={styles.checkpointRail}>
                <View style={[styles.checkpointDot, styles.pickupDot]} />
                <View style={styles.checkpointLine} />
                <View style={[styles.checkpointDot, styles.destinationDot]} />
              </View>
              <View style={styles.checkpointsCopy}>
                <View style={styles.checkpointItem}>
                  <Text style={styles.pickupLabel}>ĐIỂM ĐÓN</Text>
                  <Text numberOfLines={1} style={styles.checkpointAddress}>
                    Nhà hàng Bia Vân Hồ, 2B Hoa Lư, Lê Đại Hành
                  </Text>
                </View>
                <View style={styles.checkpointItem}>
                  <Text style={styles.destinationLabel}>ĐIỂM TRẢ</Text>
                  <Text numberOfLines={1} style={styles.destinationAddress}>
                    Khu đô thị Times City, Hai Bà Trưng
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          <Card style={styles.stageCard} variant="surface">
            <StageProgress activeStep={activeStep} completed={tripCompleted} />
            <Button
              accessibilityLabel={tripCompleted ? 'Chuyến đi đã hoàn thành' : currentStepCopy.label}
              disabled={tripCompleted}
              icon={tripCompleted ? 'task-alt' : currentStepCopy.icon}
              iconPosition="leading"
              iconSize={fontSize.iconXl}
              label={tripCompleted ? 'Chuyến đi đã hoàn thành' : currentStepCopy.label}
              onPress={advanceTrip}
              style={[
                styles.stageActionButton,
                activeStep === TRIP_STEPS.length - 1 && styles.stageFinalButton,
                tripCompleted && styles.stageCompletedButton,
              ]}
              textStyle={styles.stageActionText}
            />
            <Pressable
              accessibilityLabel="Mở kiểm tra xe 6 góc"
              accessibilityRole="button"
              onPress={() => router.push('/ride/vehicle-inspection' as never)}
              style={styles.inspectionLink}
            >
              <MaterialIcons color={colors.primary} name="photo-camera" size={fontSize.iconMd} />
              <Text style={styles.inspectionLinkText}>Kiểm tra xe 6 góc</Text>
              <MaterialIcons color={colors.primary} name="chevron-right" size={fontSize.iconLg} />
            </Pressable>
            <View style={styles.stageHelper}>
              <MaterialIcons
                color={colors.onSurfaceVariant}
                name={tripCompleted ? 'check-circle-outline' : 'touch-app'}
                size={fontSize.iconMd}
              />
              <Text style={styles.stageHelperText}>
                {tripCompleted ? 'Cảm ơn bạn đã hoàn thành chuyến đi an toàn.' : currentStepCopy.helper}
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function MapToolButton({
  accessibilityLabel,
  active = false,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  active?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.mapToolButton, active && styles.mapToolButtonActive]}
    >
      <MaterialIcons
        color={active ? colors.primary : colors.onSurface}
        name={icon}
        size={fontSize.iconXl}
      />
    </Pressable>
  );
}

function StageProgress({
  activeStep,
  completed,
}: {
  activeStep: number;
  completed: boolean;
}) {
  return (
    <View accessibilityRole="progressbar" style={styles.stageProgress}>
      {TRIP_STEPS.map((step, index) => {
        const done = completed || index < activeStep;
        const active = !completed && index === activeStep;
        const stepColor = done
          ? colors.success
          : active
            ? colors.primary
            : colors.onSurfaceVariant;

        return (
          <View key={step.label} style={styles.stageStepWrap}>
            {index > 0 ? (
              <View
                style={[
                  styles.stageConnector,
                  (done || active) && styles.stageConnectorActive,
                ]}
              />
            ) : null}
            <View style={styles.stageStep}>
              <View
                style={[
                  styles.stageIconCircle,
                  done && styles.stageIconDone,
                  active && styles.stageIconActive,
                  !done && !active && styles.stageIconInactive,
                ]}
              >
                <MaterialIcons
                  color={done || active ? colors.onPrimary : colors.onSurfaceVariant}
                  name={done ? 'check' : step.icon}
                  size={fontSize.iconMd}
                />
              </View>
              <Text
                numberOfLines={2}
                style={[styles.stageLabel, { color: stepColor }, active && styles.stageLabelActive]}
              >
                {step.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    zIndex: 3,
    backgroundColor: HEADER_COLOR,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    height: spacing.headerHeight,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  backButton: {
    width: spacing.iconButtonMd,
    height: spacing.iconButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headlineSm,
    flex: 1,
    color: colors.onPrimary,
    letterSpacing: -0.3,
  },
  profileIcon: {
    width: spacing.avatarMd,
    height: spacing.avatarMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tripHud: {
    minHeight: 52,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.spaceSm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
    backgroundColor: colors.inverseSurface,
  },
  tripHudDetails: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  tripIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.px2_5,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHighest60,
  },
  tripIdDot: {
    width: spacing.badgeSm,
    height: spacing.badgeSm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.tertiaryFixedDim,
  },
  tripIdText: {
    ...typography.labelMd,
    color: colors.inverseOnSurface,
    letterSpacing: 0.4,
  },
  tripDistance: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
  },
  tripDistanceText: {
    ...typography.labelLg,
    flexShrink: 1,
    color: colors.inverseOnSurface,
    letterSpacing: -0.3,
  },
  sosButton: {
    minWidth: 68,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.spaceSm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
  },
  sosText: {
    ...typography.labelMd,
    color: colors.onError,
  },
  directionBar: {
    minHeight: 84,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.spaceSm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  turnIconBox: {
    width: spacing.shortcutIcon + spacing.spaceSm,
    height: spacing.shortcutIcon + spacing.spaceSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  directionCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  directionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
  },
  directionDistance: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  laneBadge: {
    paddingHorizontal: spacing.gap1,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceVariant,
  },
  laneText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  directionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  voiceButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
  },
  mapViewport: {
    height: spacing.mapHeight,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  mapImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  mapTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(248, 249, 255, 0.12)',
  },
  trafficBadge: {
    position: 'absolute',
    top: spacing.spaceSm,
    left: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.gap1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest95,
  },
  trafficDot: {
    width: spacing.badgeSm,
    height: spacing.badgeSm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  trafficBadgeText: {
    ...typography.labelSm,
    color: colors.onSurface,
  },
  mapTools: {
    position: 'absolute',
    top: spacing.gutter,
    right: spacing.gutter,
    gap: spacing.spaceSm,
  },
  mapToolButton: {
    width: spacing.iconButtonSm,
    height: spacing.iconButtonSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mapToolButtonActive: {
    backgroundColor: colors.primaryFixed,
  },
  driverMarker: {
    position: 'absolute',
    top: '43%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  markerHalo: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary15,
  },
  markerCore: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    elevation: 4,
  },
  speedBadge: {
    marginTop: spacing.spaceSm,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.inverseSurface80,
  },
  speedText: {
    ...typography.labelMd,
    color: colors.inverseOnSurface,
  },
  mapNotice: {
    position: 'absolute',
    bottom: spacing.spaceSm,
    left: spacing.gutter,
    maxWidth: '70%',
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.gap1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest90,
  },
  mapNoticeText: {
    ...typography.labelSm,
    color: colors.onSurface,
  },
  bottomSheet: {
    marginTop: -spacing.spaceSm,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.spaceMd,
    gap: spacing.spaceSm,
    zIndex: 1,
  },
  vehicleCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    padding: spacing.spaceSm,
  },
  vehicleIconBox: {
    width: spacing.shortcutIcon,
    height: spacing.shortcutIcon,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerHigh,
  },
  vehicleCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
  },
  vehicleName: {
    ...typography.headlineSm,
    flexShrink: 1,
    color: colors.onSurface,
  },
  transmissionBadge: {
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondaryContainer,
  },
  transmissionText: {
    ...typography.labelSm,
    color: colors.onSecondaryFixed,
  },
  licensePlate: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelLg,
  },
  reportButton: {
    minWidth: 64,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  reportButtonText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  reportThumbnail: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
  },
  customerCard: {
    padding: spacing.spaceMd,
    gap: spacing.spaceSm,
  },
  customerHeader: {
    minHeight: spacing.avatarLg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  customerAvatar: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  customerStatusDot: {
    position: 'absolute',
    left: spacing.avatarLg - 13,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: colors.success,
  },
  customerIdentity: {
    flex: 1,
    minWidth: 0,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
  },
  customerName: {
    ...typography.headlineSm,
    flexShrink: 1,
    color: colors.onSurface,
  },
  customerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  customerRatingText: {
    ...typography.labelSm,
    color: colors.success,
  },
  customerSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  customerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  callCustomerButton: {
    minHeight: spacing.iconButtonSm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  callCustomerText: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  chatButton: {
    width: spacing.iconButtonSm,
    height: spacing.iconButtonSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  checkpointsCard: {
    minHeight: 106,
    flexDirection: 'row',
    gap: spacing.spaceSm,
    padding: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  checkpointRail: {
    width: spacing.spaceSm,
    alignItems: 'center',
    paddingTop: spacing.gap1,
  },
  checkpointDot: {
    width: spacing.badgeMd,
    height: spacing.badgeMd,
    borderRadius: borderRadius.full,
  },
  pickupDot: {
    backgroundColor: colors.success,
  },
  destinationDot: {
    backgroundColor: colors.error,
  },
  checkpointLine: {
    width: 2,
    height: 32,
    marginVertical: spacing.xxs,
    backgroundColor: colors.outlineVariant,
  },
  checkpointsCopy: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  checkpointItem: {
    minWidth: 0,
    gap: spacing.xxs,
  },
  pickupLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  destinationLabel: {
    ...typography.labelSm,
    color: colors.error,
    letterSpacing: 0.5,
  },
  checkpointAddress: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  destinationAddress: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: '600',
  },
  stageCard: {
    padding: spacing.spaceMd,
    gap: spacing.spaceMd,
  },
  stageProgress: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxs,
  },
  stageStepWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stageStep: {
    width: 88,
    alignItems: 'center',
    gap: spacing.gap1,
  },
  stageIconCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  stageIconActive: {
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.primaryFixed,
  },
  stageIconDone: {
    backgroundColor: colors.success,
  },
  stageIconInactive: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  stageLabel: {
    ...typography.labelSm,
    textAlign: 'center',
    fontSize: fontSize.labelSm,
    lineHeight: 14,
  },
  stageLabelActive: {
    ...typography.labelMd,
  },
  stageConnector: {
    flex: 1,
    height: 2,
    marginTop: spacing.spaceMd,
    backgroundColor: colors.outlineVariant,
  },
  stageConnectorActive: {
    backgroundColor: colors.success,
  },
  stageActionButton: {
    height: spacing.ctaHeight + spacing.spaceXs,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryContainer,
    shadowOpacity: 0.14,
  },
  stageFinalButton: {
    backgroundColor: colors.tertiaryContainer,
  },
  stageCompletedButton: {
    backgroundColor: colors.success,
  },
  stageActionText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
  },
  inspectionLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceXs,
  },
  inspectionLinkText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  stageHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
  },
  stageHelperText: {
    ...typography.bodyMd,
    flexShrink: 1,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
