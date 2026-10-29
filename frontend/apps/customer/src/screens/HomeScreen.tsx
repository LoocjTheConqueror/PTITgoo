import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Card,
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
  typography,
} from '@datxe/shared';

import {
  getActiveCustomerRide,
  getCustomerProfile,
  getCustomerRides,
  getCustomerVouchers,
  getNearbyCustomerDrivers,
  getUnreadNotificationCount,
  type CustomerProfile,
  type CustomerRideDetail,
  type CustomerRideSummary,
  type CustomerVoucher,
  type NearbyDriverMarker,
  type RideCoordinates,
} from '../services/customerApi';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { HomeMap } from '../components/HomeMap';
import { getCustomerDisplayName } from '../utils/customerName';
import { HEADER_SAFETY_ACTION_WIDTH, HeaderLabeledIconButton, ScreenHeader } from '../components/ScreenHeader';

const promoImage = require('../../assets/5._trang_ch/promo.jpg');

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [activeRide, setActiveRide] = useState<CustomerRideDetail | null>(null);
  const [recentDestinations, setRecentDestinations] = useState<string[]>([]);
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [currentLocation, setCurrentLocation] = useState('Đang xác định vị trí…');
  const [currentCoordinates, setCurrentCoordinates] = useState<RideCoordinates | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriverMarker[]>([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const locationPermissionRequested = useRef(false);

  const refreshLocation = useCallback(async (requestPermission = false) => {
    setLocationLoading(true);
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && permission.canAskAgain && (requestPermission || !locationPermissionRequested.current)) {
        locationPermissionRequested.current = true;
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        setCurrentCoordinates(null);
        if (requestPermission && !permission.canAskAgain) await Linking.openSettings();
        setCurrentLocation(permission.canAskAgain
          ? 'Cho phép vị trí để xem khu vực hiện tại'
          : 'Bật quyền vị trí trong cài đặt');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCurrentCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
      const places = await Location.reverseGeocodeAsync(position.coords).catch(() => []);
      const place = places[0];
      const placeParts = [place?.district, place?.city ?? place?.subregion, place?.region]
        .filter((part): part is string => Boolean(part?.trim()));
      const uniquePlaceParts = [...new Set(placeParts)];
      setCurrentLocation(
        uniquePlaceParts.slice(0, 2).join(', ')
          || place?.name
          || `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
      );
    } catch {
      setCurrentCoordinates(null);
      setCurrentLocation('Chưa xác định được vị trí');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const greetingTimer = setInterval(() => setCurrentHour(new Date().getHours()), 30_000);
      setCurrentHour(new Date().getHours());
      setLoading(true);
      setLoadError('');
      void refreshLocation();

      void Promise.allSettled([
        getCustomerProfile(),
        getActiveCustomerRide(),
        getCustomerVouchers(),
        getUnreadNotificationCount(),
      ]).then(([profileResult, rideResult, voucherResult, unreadResult]) => {
        if (!mounted) return;
        const failures: unknown[] = [];
        if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
        else failures.push(profileResult.reason);
        if (rideResult.status === 'fulfilled') setActiveRide(rideResult.value);
        else failures.push(rideResult.reason);
        if (voucherResult.status === 'fulfilled') setVouchers(voucherResult.value);
        else failures.push(voucherResult.reason);
        if (unreadResult.status === 'fulfilled') setUnreadCount(unreadResult.value);
        else failures.push(unreadResult.reason);
        if (failures.length > 0) setLoadError(getApiErrorMessage(failures[0]));
        setLoading(false);
      });
      setRecentDestinations([]);
      void getCustomerRides(0, 12)
        .then((result) => {
          if (mounted) setRecentDestinations(getRecentDestinations(result.content));
        })
        .catch(() => {});

      return () => {
        mounted = false;
        clearInterval(greetingTimer);
      };
    }, [refreshLocation]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!currentCoordinates) {
        setNearbyDrivers([]);
        return undefined;
      }
      let mounted = true;

      const refreshNearbyDrivers = async () => {
        try {
          const drivers = await getNearbyCustomerDrivers(currentCoordinates);
          if (mounted) setNearbyDrivers(drivers);
        } catch {
          if (mounted) setNearbyDrivers([]);
        }
      };

      void refreshNearbyDrivers();
      const timer = setInterval(() => void refreshNearbyDrivers(), 30_000);
      return () => {
        mounted = false;
        clearInterval(timer);
      };
    }, [currentCoordinates]),
  );

  const customerName = getCustomerDisplayName(profile?.full_name) || 'bạn';
  const greetingName = customerName === 'bạn'
    ? customerName
    : customerName.split(/\s+/).pop() || customerName;
  const activeVoucher = vouchers[0];
  const openBooking = (destination?: string) => {
    if (activeRide) {
      router.push({ pathname: '/(main)/driver-tracking', params: { rideId: String(activeRide.id) } });
      return;
    }
    router.push(destination
      ? { pathname: '/(main)/route-selection', params: { destination } }
      : '/(main)/route-selection');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Trang chủ"
        largeTitle
        sideSlotWidth={HEADER_SAFETY_ACTION_WIDTH}
        rightContent={<HeaderLabeledIconButton
          icon="shield"
          accessibilityLabel="An toàn chuyến đi"
          label="An toàn"
          onPress={() => router.push({ pathname: '/(main)/support', params: { topic: 'safety' } })}
        />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.greetingCard}>
          <View style={styles.greetingCopy}>
            <Text style={styles.greetingTitle}>
              {getGreeting(currentHour)}, {greetingName}
            </Text>
            <Text style={styles.greetingMeta}>
              Sẵn sàng cho chuyến đi an toàn hôm nay.
            </Text>
          </View>
          <View style={styles.greetingLocation}>
            <View style={styles.locationBadge}>
              <MaterialIcons name="location-on" size={fontSize.iconLg} color={colors.primary} />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationLabel}>ĐANG Ở</Text>
              <Text numberOfLines={1} style={styles.currentLocation}>
                {locationLoading ? 'Đang xác định vị trí…' : currentLocation}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cập nhật vị trí hiện tại"
              disabled={locationLoading}
              onPress={() => void refreshLocation(true)}
              style={styles.locationRefresh}
            >
              {locationLoading
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <MaterialIcons name="my-location" size={fontSize.iconMd} color={colors.primary} />}
            </Pressable>
          </View>
        </Card>

        {loading && !profile ? <ActivityIndicator color={colors.primary} /> : null}
        {loadError ? <Text accessibilityRole="alert" style={styles.loadError}>{loadError}</Text> : null}

        <Pressable
          accessibilityLabel={activeRide ? 'Theo dõi chuyến đang hoạt động' : 'Nhập điểm đến để bắt đầu đặt xe'}
          onPress={openBooking}
          style={styles.searchBar}
        >
          <MaterialIcons
            name="search"
            size={fontSize.icon2xl}
            color={colors.primary}
          />
          <Text style={styles.searchPlaceholder}>{activeRide ? 'Theo dõi chuyến đang hoạt động' : 'Chọn điểm đến'}</Text>
        </Pressable>

        <HomeMap coordinate={currentCoordinates} drivers={nearbyDrivers} />

        {!activeRide && recentDestinations.length > 0 ? (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Điểm đến gần đây</Text>
              <Text style={styles.recentHint}>Chạm để đặt lại</Text>
            </View>
            {recentDestinations.map((destination) => (
              <Pressable
                key={destination}
                accessibilityRole="button"
                accessibilityLabel={`Đặt chuyến đến ${destination}`}
                onPress={() => openBooking(destination)}
                style={styles.recentDestination}
              >
                <View style={styles.recentDestinationIcon}>
                  <MaterialIcons name="place" size={fontSize.iconMd} color={colors.primary} />
                </View>
                <Text numberOfLines={1} style={styles.recentDestinationText}>{destination}</Text>
                <MaterialIcons name="chevron-right" size={fontSize.iconLg} color={colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </View>
        ) : null}

        {activeRide ? (
          <Card
            accessibilityLabel={`Mở chi tiết chuyến ${activeRide.id}`}
            onPress={() => router.push({ pathname: '/(main)/driver-tracking', params: { rideId: String(activeRide.id) } })}
            style={styles.tripCard}
            variant="surface"
          >
            <View style={styles.tripAccent} />
            <View style={styles.tripStatusRow}>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{getRideStatusLabel(activeRide.status)}</Text>
              </View>
              <Text style={styles.tripCode}>Chuyến #{activeRide.id}</Text>
            </View>

            <View style={styles.pickupBox}>
              <MaterialIcons name="trip-origin" size={fontSize.iconLg} color={colors.primary} />
              <View style={styles.pickupCopy}>
                <Text style={styles.pickupLabel}>Điểm đón</Text>
                <Text style={styles.pickupValue} numberOfLines={2}>
                  {activeRide.pickupAddress || 'Chưa có địa chỉ điểm đón'}
                </Text>
              </View>
            </View>

            <View style={styles.pickupBox}>
              <MaterialIcons name="location-on" size={fontSize.iconLg} color={colors.secondary} />
              <View style={styles.pickupCopy}>
                <Text style={styles.pickupLabel}>Điểm đến</Text>
                <Text style={styles.pickupValue} numberOfLines={2}>
                  {activeRide.dropoffAddress || 'Chưa có địa chỉ điểm đến'}
                </Text>
              </View>
            </View>

            <View style={styles.rideFareRow}>
              <Text style={styles.pickupLabel}>
                {activeRide.finalFare === null ? 'Giá dự kiến' : 'Giá cuối cùng'}
              </Text>
              <Text style={styles.rideFareValue}>
                {formatCurrency(activeRide.finalFare ?? activeRide.estimatedFare)}
              </Text>
            </View>
          </Card>
        ) : null}

        {activeVoucher ? (
          <Card
            accessibilityLabel={`Mở ưu đãi ${activeVoucher.code}`}
            gradient={[
              colors.surfaceContainerLowest,
              colors.surfaceContainerLowest,
              colors.secondaryFixed50,
            ]}
            gradientEnd={{ x: 1, y: 0.5 }}
            gradientStart={{ x: 0, y: 0.5 }}
            onPress={() => router.push('/(main)/vouchers')}
            style={styles.promoCard}
            variant="raised"
          >
            <View style={styles.promoCopy}>
              <View style={styles.promoBadge}>
                <MaterialIcons
                  name="local-offer"
                  size={fontSize.iconSm}
                  color={colors.onTertiaryFixed}
                />
                <Text style={styles.promoBadgeText}>Mã {activeVoucher.code}</Text>
              </View>
              <Text style={styles.promoTitle}>{describeVoucher(activeVoucher)}</Text>
              <Text style={styles.promoMeta}>
                Đơn tối thiểu {formatCurrency(activeVoucher.minimumOrderAmount)} · HSD {formatDate(activeVoucher.validTo)}
              </Text>
            </View>
            <Image source={promoImage} style={styles.promoImage} />
          </Card>
        ) : null}
      </ScrollView>

      <CustomerTabBar active="home" unreadCount={unreadCount} />
    </SafeAreaView>
  );
}

function getGreeting(hour: number): string {
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function getRecentDestinations(rides: CustomerRideSummary[]): string[] {
  const addresses = new Map<string, string>();
  for (const ride of rides) {
    if (['CANCELLED', 'NO_DRIVER_FOUND', 'EXPIRED'].includes(ride.status)) continue;
    const address = ride.dropoffAddress?.trim();
    if (address) addresses.set(address.toLocaleLowerCase('vi-VN'), address);
  }
  return [...addresses.values()].slice(0, 3);
}

function getRideStatusLabel(status: CustomerRideDetail['status']): string {
  const labels: Record<CustomerRideDetail['status'], string> = {
    PENDING: 'Đang chờ xử lý',
    SEARCHING: 'Đang tìm tài xế',
    DRIVER_ASSIGNED: 'Đã có tài xế',
    DRIVER_ARRIVING: 'Tài xế đang tới điểm đón',
    DRIVER_ARRIVED: 'Tài xế đã đến điểm đón',
    VEHICLE_HANDOVER: 'Đang bàn giao xe',
    IN_PROGRESS: 'Chuyến đi đang diễn ra',
    ARRIVED_DESTINATION: 'Đã đến điểm trả xe',
    VEHICLE_RETURNED: 'Đang hoàn tất bàn giao',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_DRIVER_FOUND: 'Chưa tìm được tài xế',
    EXPIRED: 'Yêu cầu đã hết hạn',
  };
  return labels[status];
}

function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN').format(date);
}

function describeVoucher(voucher: CustomerVoucher): string {
  if (voucher.discountType === 'PERCENT') {
    const cap = voucher.maxDiscount === null
      ? ''
      : `, tối đa ${formatCurrency(voucher.maxDiscount)}`;
    return `Giảm ${voucher.value}%${cap} cho chuyến đi`;
  }
  if (voucher.discountType === 'FIXED') {
    return `Giảm ${formatCurrency(voucher.value)} cho chuyến đi`;
  }
  return 'Ưu đãi dành cho chuyến đi của bạn';
}

function getApiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Không tải được dữ liệu từ máy chủ.';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.spaceLg,
    paddingBottom: spacing.spaceXl,
    gap: spacing.spaceLg,
  },
  greetingCard: {
    gap: spacing.spaceSm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  greetingCopy: {
    gap: spacing.spaceXs,
  },
  loadError: {
    ...typography.bodyMd,
    color: colors.error,
  },
  greetingTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  greetingMeta: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  greetingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    paddingTop: spacing.spaceSm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  locationBadge: {
    width: spacing.iconButtonSm,
    height: spacing.iconButtonSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryFixedTint,
  },
  locationCopy: {
    flex: 1,
    minWidth: 0,
  },
  locationLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    letterSpacing: spacing.letterSpacingWide,
  },
  currentLocation: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  locationRefresh: {
    width: spacing.iconButtonSm,
    height: spacing.iconButtonSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  notifWrap: {
    position: 'relative',
  },
  notifButton: {
    width: spacing.iconButtonLg,
    height: spacing.iconButtonLg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: spacing.spaceSm,
    right: spacing.spaceSm,
    width: spacing.badgeMd,
    height: spacing.badgeMd,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing.searchBarHeight,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.spaceMd,
    gap: spacing.spaceSm,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPlaceholder: {
    ...typography.bodyLgMedium,
    color: colors.secondary,
    flex: 1,
  },
  recentSection: {
    gap: spacing.spaceXs,
  },
  recentHint: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  recentDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    minHeight: 56,
    paddingHorizontal: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  recentDestinationIcon: {
    width: spacing.iconButtonSm,
    height: spacing.iconButtonSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryFixedTint,
  },
  recentDestinationText: {
    ...typography.bodyMdMedium,
    flex: 1,
    color: colors.onSurface,
  },
  tripCard: {
    gap: spacing.spaceMd,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tripAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: spacing.accentBar,
    backgroundColor: colors.primaryContainer,
  },
  tripStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.px3,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryFixed,
    flexShrink: 1,
  },
  statusDot: {
    width: spacing.badgeSm,
    height: spacing.badgeSm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  statusText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  tripCode: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceMd,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    flex: 1,
    minWidth: 0,
  },
  driverAvatarWrap: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
  },
  driverAvatar: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
    borderRadius: borderRadius.full,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -spacing.spaceXs,
    right: -spacing.spaceXs,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.full,
    padding: spacing.py0_5,
  },
  driverCopy: {
    flex: 1,
    minWidth: 0,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
  },
  driverName: {
    ...typography.bodyLgMedium,
    color: colors.onSurface,
    flexShrink: 1,
  },
  ratingPill: {
    backgroundColor: colors.tertiaryFixed40,
    paddingHorizontal: spacing.gap1_5,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.default,
  },
  ratingText: {
    ...typography.labelSm,
    color: colors.tertiaryContainer,
  },
  driverMeta: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  callButton: {
    width: spacing.iconButtonSm,
    height: spacing.iconButtonSm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.px2_5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  pickupCopy: {
    flex: 1,
    minWidth: 0,
  },
  pickupLabel: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  pickupValue: {
    ...typography.bodyMdMedium,
    color: colors.onSurface,
  },
  rideFareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.spaceXs,
  },
  rideFareValue: {
    ...typography.labelLg,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  tripAction: {
    width: '100%',
    height: spacing.buttonHeight,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceSm,
  },
  tripActionText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceMd,
    // Nền trong suốt giống bản gốc (LinearGradient tự đảm nhiệm nền).
    backgroundColor: colors.transparent,
  },
  promoCopy: {
    flex: 1,
    gap: spacing.gap1_5,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.px2,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.tertiaryFixed,
  },
  promoBadgeText: {
    ...typography.labelSm,
    color: colors.onTertiaryFixed,
  },
  promoTitle: {
    ...typography.bodyLgMedium,
    color: colors.onSurface,
  },
  promoMeta: {
    ...typography.bodyMd,
    color: colors.secondary,
  },
  promoButton: {
    alignSelf: 'flex-start',
    height: spacing.promoButtonHeight,
    paddingHorizontal: spacing.spaceMd,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.py1,
  },
  promoButtonText: {
    ...typography.labelSm,
    color: colors.onPrimary,
  },
  promoImage: {
    width: spacing.promoImage,
    height: spacing.promoImage,
  },
  reassurance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceSm,
    paddingVertical: spacing.spaceXs,
    opacity: spacing.footerOpacity,
  },
  reassuranceText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  tabBar: {
    height: spacing.tabBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.spaceXs,
    backgroundColor: colors.surface85,
    shadowColor: colors.navShadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    minWidth: spacing.iconButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
  },
  tabLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  tabLabelActive: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  tabDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: spacing.badgeSm,
    height: spacing.badgeSm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
