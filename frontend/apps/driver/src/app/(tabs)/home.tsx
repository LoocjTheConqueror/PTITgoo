import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
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

type HomeTab = 'home' | 'history' | 'notifications' | 'profile';

const HEADER_COLOR = '#0F172A';
const DRIVER_PORTRAIT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCqWmKloyJfDMSN6AB36I1f7urjgQaXWu6ZNrDy0RtkL8WLCh1o33yutaPEjiQt6cpc5lzcwBYaaJWH2Iso1Dsps3Fwqn0HCtHhGc8jzJE2TmgQQj_2IPtQgVd7AYOlCKd7fFr8iBdW3zcVoJ2NDzbvuzUAwu5pzWikujkJ6DDpQ-vIqmjP3UH2cp_CJMV1xSYYcEjfzmcS24eM5WZA-lS1QMcdd7CYAT2Jo8PijeGZQrpcsqKfMVzN9A';

const HOME_TABS: {
  id: HomeTab;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  route: string;
}[] = [
  { id: 'home', icon: 'home-filled', label: 'Trang chủ', route: '/(tabs)/home' },
  { id: 'history', icon: 'history', label: 'Lịch sử', route: '/(tabs)/history' },
  { id: 'notifications', icon: 'notifications-none', label: 'Thông báo', route: '/(tabs)/notifications' },
  { id: 'profile', icon: 'account-circle', label: 'Hồ sơ', route: '/(tabs)/profile' },
];

export default function DriverHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(true);
  const [heatMapEnabled, setHeatMapEnabled] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Ngã Tư Sở, Đống Đa');
  const [priorityRegion, setPriorityRegion] = useState(
    'Hoàn Kiếm • Ba Đình • Cầu Giấy (10km)',
  );

  const callSupport = async () => {
    try {
      await Linking.openURL('tel:19006868');
    } catch {
      Alert.alert('Không thể thực hiện cuộc gọi', 'Vui lòng gọi tổng đài 1900 6868.');
    }
  };

  const locateDriver = async () => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Chưa có quyền vị trí',
          'Cho phép DriveMate sử dụng vị trí khi dùng ứng dụng để cập nhật vị trí của bạn.',
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocationLabel(
        `${current.coords.latitude.toFixed(4)}, ${current.coords.longitude.toFixed(4)}`,
      );
    } catch {
      Alert.alert(
        'Chưa thể định vị',
        'Hãy bật dịch vụ vị trí trên thiết bị rồi thử lại.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  const choosePriorityRegion = () => {
    Alert.alert('Khu vực hoạt động ưu tiên', 'Chọn khu vực bạn muốn nhận cuốc:', [
      {
        text: 'Hoàn Kiếm • Ba Đình • Cầu Giấy (10km)',
        onPress: () => setPriorityRegion('Hoàn Kiếm • Ba Đình • Cầu Giấy (10km)'),
      },
      {
        text: 'Cầu Giấy • Thanh Xuân • Nam Từ Liêm (10km)',
        onPress: () => setPriorityRegion('Cầu Giấy • Thanh Xuân • Nam Từ Liêm (10km)'),
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const navigateToTab = (tab: HomeTab) => {
    const route = HOME_TABS.find((item) => item.id === tab)?.route;
    if (route && tab !== 'home') router.push(route as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.headerLiveDot} />
            <Text style={styles.headerTitle}>Trang Chủ</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Gọi tổng đài hỗ trợ 1900 6868"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => void callSupport()}
              style={styles.headerIconButton}
            >
              <MaterialIcons
                color={colors.onPrimary}
                name="support-agent"
                size={fontSize.icon2xl}
              />
            </Pressable>
            <Pressable
              accessibilityLabel="Mở hồ sơ tài xế"
              accessibilityRole="button"
              onPress={() => navigateToTab('profile')}
              style={styles.headerProfileIcon}
            >
              <MaterialIcons
                color={colors.onPrimary}
                name="person-outline"
                size={fontSize.iconMd}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.driverCard} variant="surface">
          <View style={styles.driverIdentity}>
            <View style={styles.portraitWrap}>
              <Image
                accessibilityLabel="Ảnh đại diện tài xế Nguyễn Văn Tuấn"
                resizeMode="cover"
                source={{ uri: DRIVER_PORTRAIT }}
                style={styles.driverPortrait}
              />
              <View style={styles.portraitStatusDot} />
            </View>
            <View style={styles.driverCopy}>
              <View style={styles.driverNameRow}>
                <Text numberOfLines={1} style={styles.driverName}>
                  Nguyễn Văn Tuấn
                </Text>
                <View style={styles.ratingBadge}>
                  <MaterialIcons
                    color={colors.starYellow}
                    name="star"
                    size={fontSize.iconSm}
                  />
                  <Text style={styles.ratingText}>4.98</Text>
                </View>
              </View>
              <View style={styles.driverMetaRow}>
                <MaterialIcons
                  color={colors.primary}
                  name="directions-car"
                  size={fontSize.iconSm}
                />
                <Text numberOfLines={1} style={styles.driverMeta}>
                  Tài xế Hạng Kim Cương
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Thông báo mới"
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => navigateToTab('notifications')}
            style={styles.notificationButton}
          >
            <MaterialIcons
              color={colors.onSurfaceVariant}
              name="notifications-none"
              size={fontSize.iconXl}
            />
            <View style={styles.notificationDot} />
          </Pressable>
        </Card>

        <Card style={styles.availabilityCard} variant="surface">
          <View style={styles.availabilityTopRow}>
            <View
              style={[
                styles.radarIcon,
                isOnline ? styles.radarIconOnline : styles.radarIconOffline,
              ]}
            >
              <MaterialIcons
                color={isOnline ? colors.success : colors.secondary}
                name={isOnline ? 'radar' : 'pause-circle-outline'}
                size={fontSize.icon2xl}
              />
            </View>
            <View style={styles.availabilityCopy}>
              <View style={styles.statusHeading}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? colors.success : colors.secondary },
                  ]}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.statusTitle,
                    { color: isOnline ? colors.success : colors.secondary },
                  ]}
                >
                  {isOnline ? 'Đang Sẵn Sàng Nhận Cuốc' : 'Đang Tạm Nghỉ (Offline)'}
                </Text>
              </View>
              <Text numberOfLines={2} style={styles.statusSubtitle}>
                {isOnline
                  ? 'Hệ thống đang ghép cặp khách hàng gần bạn'
                  : 'Bật công tắc để bắt đầu nhận cuốc mới'}
              </Text>
            </View>
            <SwitchControl
              accessibilityLabel="Trạng thái sẵn sàng nhận cuốc"
              value={isOnline}
              onValueChange={setIsOnline}
              onlineColor={colors.success}
            />
          </View>
          <View style={styles.queueInfoRow}>
            <View style={styles.queueRange}>
              <MaterialIcons
                color={colors.success}
                name="near-me"
                size={fontSize.iconSm}
              />
              <Text style={styles.queueText}>
                Phạm vi quét: <Text style={styles.queueStrong}>3.5 km</Text>
              </Text>
            </View>
            <View style={styles.demandIndicator}>
              <View style={styles.demandDot} />
              <Text style={styles.demandText}>Nhu cầu tăng cao (+25%)</Text>
            </View>
          </View>
        </Card>

        <Button
          icon="bolt"
          iconPosition="leading"
          label="Mô phỏng cuốc xe mới"
          onPress={() => router.push('/ride/accept' as never)}
          style={styles.demoRideButton}
          textStyle={styles.demoRideButtonText}
        />

        <Card accessibilityLabel="Bản đồ nhu cầu tại Hà Nội" style={styles.mapCard} variant="muted">
          <View style={styles.mapCanvas}>
            <View style={styles.mapTint} />
            <View style={styles.mapRoadHorizontal} />
            <View style={styles.mapRoadDiagonal} />
            <View style={styles.mapRoadVertical} />
            <View style={styles.mapPark} />

            {heatMapEnabled ? (
              <>
                <View style={[styles.demandPill, styles.hoanKiemPill]}>
                  <View style={[styles.demandPillDot, styles.hotDot]} />
                  <Text numberOfLines={1} style={styles.demandPillText}>
                    Hoàn Kiếm: Nóng x1.4
                  </Text>
                </View>
                <View style={[styles.demandPill, styles.cauGiayPill]}>
                  <View style={[styles.demandPillDot, styles.warmDot]} />
                  <Text numberOfLines={1} style={styles.demandPillText}>
                    Cầu Giấy: 18 cuốc chờ
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.mapModePill}>
                <Text style={styles.mapModeText}>Đã tắt lớp nhu cầu</Text>
              </View>
            )}

            <View pointerEvents="none" style={styles.driverPin}>
              <View style={styles.pinHalo} />
              <View style={styles.pinCore}>
                <MaterialIcons
                  color={colors.onPrimary}
                  name="local-taxi"
                  size={fontSize.iconMd}
                />
              </View>
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>Vị trí của bạn</Text>
              </View>
            </View>

            <View style={styles.mapControls}>
              <MapControl
                accessibilityLabel="Định vị hiện tại"
                icon={isLocating ? 'gps-not-fixed' : 'my-location'}
                onPress={() => void locateDriver()}
                tint={colors.primary}
              />
              <MapControl
                accessibilityLabel={heatMapEnabled ? 'Tắt lớp nhu cầu' : 'Bật lớp nhu cầu'}
                icon="local-fire-department"
                onPress={() => setHeatMapEnabled((enabled) => !enabled)}
                tint={heatMapEnabled ? colors.error : colors.onSurfaceVariant}
              />
            </View>

            <View style={styles.locationBar}>
              <MaterialIcons
                color={colors.primary}
                name="navigation"
                size={fontSize.iconMd}
              />
              <Text numberOfLines={1} style={styles.locationText}>
                Đang ở: <Text style={styles.locationStrong}>{locationLabel}</Text>
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.earningsCard} variant="surface">
          <View style={styles.earningsHeading}>
            <View style={styles.sectionTitleGroup}>
              <MaterialIcons
                color={colors.primary}
                name="payments"
                size={fontSize.iconXl}
              />
              <Text style={styles.sectionTitle}>Thu nhập hôm nay</Text>
            </View>
            <Pressable
              accessibilityLabel="Xem chi tiết ví"
              accessibilityRole="button"
              onPress={() =>
                Alert.alert('Ví tài xế', 'Chi tiết ví sẽ hiển thị khi tính năng ví được kết nối.')
              }
              style={styles.walletButton}
            >
              <Text style={styles.walletButtonText}>Chi tiết ví</Text>
              <MaterialIcons
                color={colors.primary}
                name="chevron-right"
                size={fontSize.iconMd}
              />
            </Pressable>
          </View>

          <View style={styles.totalEarningsPanel}>
            <View style={styles.totalEarningsCopy}>
              <Text style={styles.earningsCaption}>Tổng thu nhập ròng</Text>
              <View style={styles.totalAmountRow}>
                <Text style={styles.totalAmount}>1.450.000</Text>
                <Text style={styles.currency}>₫</Text>
              </View>
            </View>
            <View style={styles.comparisonCopy}>
              <View style={styles.growthBadge}>
                <MaterialIcons
                  color={colors.success}
                  name="trending-up"
                  size={fontSize.iconSm}
                />
                <Text style={styles.growthText}>+18%</Text>
              </View>
              <Text style={styles.comparisonCaption}>so với hôm qua</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <MetricTile icon="route" label="Số chuyến" value="6 chuyến" />
            <MetricTile icon="schedule" label="Thời gian online" value="4h 15m" />
          </View>
        </Card>

        <Card style={styles.settingCard} variant="surface">
          <View style={styles.settingIconBox}>
            <MaterialIcons
              color={colors.primary}
              name="bolt"
              size={fontSize.iconXl}
            />
          </View>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>Bật nhận cuốc tự động</Text>
            <Text numberOfLines={2} style={styles.settingSubtitle}>
              Tự động chốt khi cuốc phù hợp tiêu chí
            </Text>
          </View>
          <SwitchControl
            accessibilityLabel="Nhận cuốc tự động"
            value={autoAccept}
            onValueChange={setAutoAccept}
            onlineColor={colors.primary}
            compact
          />
        </Card>

        <Pressable
          accessibilityLabel="Chọn khu vực hoạt động ưu tiên"
          accessibilityRole="button"
          onPress={choosePriorityRegion}
        >
          <Card style={styles.settingCard} variant="surface">
            <View style={styles.zoneIconBox}>
              <MaterialIcons
                color={colors.success}
                name="pin-drop"
                size={fontSize.iconXl}
              />
            </View>
            <View style={styles.settingCopy}>
              <View style={styles.zoneTitleRow}>
                <Text numberOfLines={1} style={styles.settingTitle}>
                  Khu vực hoạt động ưu tiên
                </Text>
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Đang chọn</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={styles.settingSubtitle}>
                {priorityRegion}
              </Text>
            </View>
            <MaterialIcons
              color={colors.onSurfaceVariant}
              name="tune"
              size={fontSize.iconXl}
            />
          </Card>
        </Pressable>

        <Card style={styles.safetyCard} variant="muted">
          <View style={styles.safetyMessage}>
            <MaterialIcons
              color={colors.primary}
              name="shield"
              size={fontSize.iconXl}
            />
            <Text numberOfLines={2} style={styles.safetyText}>
              Gói bảo hiểm trách nhiệm dân sự cá nhân đang{' '}
              <Text style={styles.safetyStrong}>kích hoạt</Text>
            </Text>
          </View>
          <Button
            label="SOS 24/7"
            onPress={() => void callSupport()}
            style={styles.sosButton}
            textStyle={styles.sosButtonText}
          />
        </Card>
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        {HOME_TABS.map((tab) => {
          const selected = tab.id === 'home';
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => navigateToTab(tab.id)}
              style={styles.navItem}
            >
              <MaterialIcons
                color={selected ? colors.primary : colors.onSurfaceVariant}
                name={tab.icon}
                size={fontSize.icon2xl}
              />
              <Text style={[styles.navLabel, selected && styles.navLabelSelected]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SwitchControl({
  accessibilityLabel,
  compact = false,
  onValueChange,
  onlineColor,
  value,
}: {
  accessibilityLabel: string;
  compact?: boolean;
  onValueChange: (value: boolean) => void;
  onlineColor: string;
  value: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[
        styles.switchTrack,
        compact && styles.switchTrackCompact,
        { backgroundColor: value ? onlineColor : colors.secondaryFixedDim },
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          compact && styles.switchThumbCompact,
          value ? styles.switchThumbRight : styles.switchThumbLeft,
        ]}
      />
    </Pressable>
  );
}

function MapControl({
  accessibilityLabel,
  icon,
  onPress,
  tint,
}: {
  accessibilityLabel: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  tint: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.mapControl}
    >
      <MaterialIcons color={tint} name={icon} size={fontSize.iconXl} />
    </Pressable>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricTile}>
      <View style={styles.metricIcon}>
        <MaterialIcons color={colors.primary} name={icon} size={fontSize.iconXl} />
      </View>
      <View style={styles.metricCopy}>
        <Text numberOfLines={1} style={styles.metricLabel}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.metricValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
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
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  headerLiveDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.onPrimary,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  headerIconButton: {
    width: spacing.iconButtonMd,
    height: spacing.iconButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfileIcon: {
    width: spacing.avatarMd,
    height: spacing.avatarMd,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.spaceMd,
    paddingBottom: spacing.spaceLg,
    gap: spacing.spaceSm,
  },
  driverCard: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.spaceMd,
  },
  driverIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: spacing.spaceMd,
  },
  portraitWrap: {
    position: 'relative',
  },
  driverPortrait: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  portraitStatusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: colors.success,
  },
  driverCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.gap1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
  },
  driverName: {
    ...typography.labelLg,
    color: colors.onSurface,
    flexShrink: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.px1_5,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
  },
  ratingText: {
    ...typography.labelSm,
    color: colors.tertiaryContainer,
  },
  driverMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
  },
  driverMeta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelSm,
    lineHeight: 16,
    flexShrink: 1,
  },
  notificationButton: {
    position: 'relative',
    width: spacing.notifIconCircle,
    height: spacing.notifIconCircle,
    marginLeft: spacing.spaceSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
  },
  availabilityCard: {
    padding: spacing.spaceMd,
  },
  demoRideButton: {
    minHeight: 52,
  },
  demoRideButtonText: {
    ...typography.labelLg,
  },
  availabilityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
  },
  radarIcon: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarIconOnline: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  radarIconOffline: {
    backgroundColor: colors.secondaryFixed,
  },
  availabilityCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.gap1,
  },
  statusHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: borderRadius.full,
  },
  statusTitle: {
    ...typography.labelLg,
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  statusSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelSm,
    lineHeight: 16,
  },
  queueInfoRow: {
    marginTop: spacing.spaceSm,
    paddingTop: spacing.spaceXs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceXs,
  },
  queueRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
  },
  queueText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelSm,
  },
  queueStrong: {
    ...typography.labelSm,
    color: colors.onSurface,
  },
  demandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
  },
  demandDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  demandText: {
    ...typography.labelSm,
    color: colors.primary,
    fontSize: fontSize.labelSm,
  },
  mapCard: {
    height: spacing.mapHeight,
    padding: 0,
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryFixed,
  },
  mapCanvas: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.primaryFixed,
  },
  mapTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 28, 48, 0.08)',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    top: '38%',
    left: -18,
    width: '115%',
    height: 16,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ rotate: '-9deg' }],
  },
  mapRoadDiagonal: {
    position: 'absolute',
    top: -54,
    left: '31%',
    width: 15,
    height: '135%',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    transform: [{ rotate: '18deg' }],
  },
  mapRoadVertical: {
    position: 'absolute',
    top: -30,
    right: '24%',
    width: 9,
    height: '125%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '-13deg' }],
  },
  mapPark: {
    position: 'absolute',
    right: -28,
    bottom: 54,
    width: 116,
    height: 92,
    borderRadius: borderRadius.xxxl,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    transform: [{ rotate: '-23deg' }],
  },
  demandPill: {
    position: 'absolute',
    top: spacing.spaceSm,
    maxWidth: '58%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest95,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  hoanKiemPill: {
    left: spacing.spaceSm,
  },
  cauGiayPill: {
    right: spacing.spaceSm,
  },
  demandPillDot: {
    width: spacing.badgeSm,
    height: spacing.badgeSm,
    borderRadius: borderRadius.full,
  },
  hotDot: {
    backgroundColor: colors.error,
  },
  warmDot: {
    backgroundColor: colors.success,
  },
  demandPillText: {
    ...typography.labelSm,
    color: colors.onSurface,
    flexShrink: 1,
  },
  mapModePill: {
    position: 'absolute',
    top: spacing.spaceSm,
    left: spacing.spaceSm,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest95,
  },
  mapModeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  driverPin: {
    position: 'absolute',
    top: '39%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pinHalo: {
    position: 'absolute',
    top: -6,
    width: 54,
    height: 54,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary15,
  },
  pinCore: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLabel: {
    marginTop: spacing.gap1,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.lg,
    backgroundColor: HEADER_COLOR,
  },
  pinLabelText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontSize: fontSize.labelSm,
  },
  mapControls: {
    position: 'absolute',
    right: spacing.spaceSm,
    bottom: spacing.spaceSm,
    gap: spacing.spaceSm,
  },
  mapControl: {
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
  locationBar: {
    position: 'absolute',
    bottom: spacing.spaceSm,
    left: spacing.spaceSm,
    right: spacing.iconButtonSm + spacing.spaceMd,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.gap1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLowest90,
  },
  locationText: {
    ...typography.labelSm,
    flex: 1,
    color: colors.onSurface,
  },
  locationStrong: {
    ...typography.labelSm,
    color: colors.onSurface,
  },
  earningsCard: {
    padding: spacing.spaceMd,
  },
  earningsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceXs,
    marginBottom: spacing.spaceSm,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  walletButtonText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  totalEarningsPanel: {
    minHeight: 88,
    padding: spacing.spaceMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLow,
    marginBottom: spacing.spaceSm,
  },
  totalEarningsCopy: {
    flex: 1,
    minWidth: 0,
  },
  earningsCaption: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.gap1,
    marginTop: spacing.xxs,
  },
  totalAmount: {
    ...typography.headlineXlMobile,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  currency: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  comparisonCopy: {
    alignItems: 'flex-end',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  growthText: {
    ...typography.labelSm,
    color: colors.success,
  },
  comparisonCaption: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelSm,
    marginTop: spacing.gap1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  metricTile: {
    minHeight: 68,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    padding: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  metricIcon: {
    width: spacing.shortcutIcon,
    height: spacing.shortcutIcon,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryContainer,
  },
  metricCopy: {
    flex: 1,
    minWidth: 0,
  },
  metricLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelSm,
    lineHeight: 15,
  },
  metricValue: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: fontSize.labelLg,
    lineHeight: 20,
    marginTop: spacing.xxs,
  },
  settingCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
    padding: spacing.spaceMd,
  },
  settingIconBox: {
    width: spacing.shortcutIcon,
    height: spacing.shortcutIcon,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerHigh,
  },
  zoneIconBox: {
    width: spacing.shortcutIcon,
    height: spacing.shortcutIcon,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  settingCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.gap1,
  },
  settingTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
    flexShrink: 1,
  },
  settingSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelSm,
    lineHeight: 16,
  },
  zoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
  },
  selectedBadge: {
    paddingHorizontal: spacing.gap1,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.tertiaryFixed,
  },
  selectedBadgeText: {
    ...typography.labelSm,
    color: colors.onTertiaryFixed,
    fontSize: fontSize.labelSm,
  },
  switchTrack: {
    width: 56,
    height: 32,
    padding: spacing.gap1,
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  switchTrackCompact: {
    width: 44,
    height: 24,
    padding: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbCompact: {
    width: 20,
    height: 20,
  },
  switchThumbLeft: {
    alignSelf: 'flex-start',
  },
  switchThumbRight: {
    alignSelf: 'flex-end',
  },
  safetyCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
    backgroundColor: colors.surfaceContainerHigh60,
  },
  safetyMessage: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  safetyText: {
    ...typography.bodyMd,
    flex: 1,
    color: colors.onSurface,
    fontSize: fontSize.labelSm,
    lineHeight: 16,
  },
  safetyStrong: {
    ...typography.labelSm,
    color: colors.onSurface,
  },
  sosButton: {
    width: 88,
    height: spacing.promoButtonHeight,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    shadowOpacity: 0.08,
    elevation: 1,
  },
  sosButtonText: {
    ...typography.labelSm,
    color: colors.onSurface,
  },
  bottomNav: {
    minHeight: spacing.tabBarHeight,
    paddingHorizontal: spacing.spaceXs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface80,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    minWidth: 56,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  navLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  navLabelSelected: {
    ...typography.labelMd,
    color: colors.primary,
  },
});
