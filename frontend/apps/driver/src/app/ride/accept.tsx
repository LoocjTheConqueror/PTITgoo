import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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

type DispatchState = 'pending' | 'accepted' | 'declined' | 'expired';

const HEADER_COLOR = colors.driverHeader;
const INITIAL_COUNTDOWN = 15;
const TIMER_DOT_COUNT = 24;
const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDY_rinJnDHTHO0Zj94csBnsYADT9PfueifL_rEhBQWoUqFnVT7THTopYWOQgcLYhVUHWu3n1lt8eN9krEyujbvyUpaNSr8rf3_Mf4F4sqjDF9pz5GBDepWQ9BjiAemkaw4knPoeZkfc0tnUE7XFc23ZBB2ekQaRkD-Hu-gwk8oju6yIqsK1T4GBdsH9QujBZJXYD2TM3f2qKqllrkBXMkcA-k1tyjMh14GeyGW20iqZxXiTgpvOS7bHA';

export default function AcceptRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_COUNTDOWN);
  const [dispatchState, setDispatchState] = useState<DispatchState>('pending');

  useEffect(() => {
    if (dispatchState !== 'pending' || secondsLeft === 0) return;

    const timeout = setTimeout(() => {
      if (secondsLeft === 1) {
        setSecondsLeft(0);
        setDispatchState('expired');
      } else {
        setSecondsLeft((seconds) => seconds - 1);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [dispatchState, secondsLeft]);

  const acceptRide = () => {
    if (dispatchState !== 'pending' || secondsLeft === 0) return;
    setDispatchState('accepted');
    router.replace('/ride/in-progress' as never);
  };

  const declineRide = () => {
    if (dispatchState === 'accepted' || dispatchState === 'declined') return;
    setDispatchState('declined');
  };

  const acceptLabel =
    dispatchState === 'accepted'
      ? 'Đang điều hướng điểm đón...'
      : dispatchState === 'expired'
        ? 'Đã hết thời gian'
        : dispatchState === 'declined'
          ? 'Cuốc đã đóng'
          : `NHẬN CUỐC NGAY (${secondsLeft}s)`;

  const statusMessage =
    dispatchState === 'accepted'
      ? 'Đã nhận cuốc. Đang chuẩn bị thông tin điểm đón.'
      : dispatchState === 'declined'
        ? 'Bạn đã bỏ qua yêu cầu chuyến xe này.'
        : dispatchState === 'expired'
          ? 'Yêu cầu chuyến xe đã hết thời gian phản hồi.'
          : '';

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
        <View style={styles.mapSection}>
          <Image
            accessible={false}
            resizeMode="cover"
            source={{ uri: MAP_IMAGE }}
            style={styles.mapImage}
          />
          <View pointerEvents="none" style={styles.mapWash} />
          <View pointerEvents="none" style={styles.mapLowerWash} />

          <View style={styles.mapBadges}>
            <View style={styles.radarBadge}>
              <View style={styles.radarDot} />
              <Text numberOfLines={1} style={styles.radarBadgeText}>
                Đang quét định vị chính xác
              </Text>
            </View>
            <View style={styles.vipBadge}>
              <MaterialIcons
                color={colors.tertiaryFixed}
                name="verified"
                size={fontSize.iconSm}
              />
              <Text style={styles.vipBadgeText}>Khách VIP</Text>
            </View>
          </View>

          <Card style={styles.vehicleCard} variant="surface">
            <View style={styles.vehicleIconBox}>
              <MaterialIcons
                color={colors.primary}
                name="directions-car"
                size={fontSize.icon2xl}
              />
            </View>
            <View style={styles.vehicleCopy}>
              <Text numberOfLines={1} style={styles.vehicleName}>
                Mazda CX-5 (AT)
              </Text>
              <Text numberOfLines={1} style={styles.vehicleDescription}>
                Trợ lực điện • Phanh tay điện tử
              </Text>
            </View>
            <View style={styles.transmissionBadge}>
              <Text style={styles.transmissionText}>Số tự động</Text>
            </View>
          </Card>
        </View>

        <View style={styles.dispatchContent}>
          <Card style={styles.dispatchCard} variant="raised">
            <View style={styles.accentBar}>
              <View style={[styles.accentSegment, { backgroundColor: colors.primary }]} />
              <View style={[styles.accentSegment, { backgroundColor: colors.success }]} />
              <View
                style={[styles.accentSegment, { backgroundColor: colors.primaryContainer }]}
              />
            </View>

            <View style={styles.dispatchSummary}>
              <View style={styles.earningCopy}>
                <Text style={styles.earningLabel}>THU NHẬP THỰC NHẬN</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.amount}>210.000</Text>
                  <Text style={styles.currency}>₫</Text>
                </View>
                <View style={styles.insuranceNote}>
                  <MaterialIcons
                    color={colors.success}
                    name="receipt-long"
                    size={fontSize.iconSm}
                  />
                  <Text numberOfLines={1} style={styles.insuranceText}>
                    Đã cộng bảo hiểm chuyến
                  </Text>
                </View>
              </View>
              <CountdownTimer
                seconds={secondsLeft}
                totalSeconds={INITIAL_COUNTDOWN}
              />
            </View>

            <View style={styles.routeCard}>
              <RouteStop
                icon="radio-button-checked"
                iconColor={colors.success}
                badge="ĐÓN KHÁCH"
                badgeColor={colors.success}
                distance="1.2 km • ~4 phút"
                title="Quán bia Thu Hằng"
                address="45 Quán Thánh, P. Quán Thánh, Ba Đình"
                withConnector
              />
              <RouteStop
                icon="location-on"
                iconColor={colors.error}
                badge="TRẢ VỀ"
                badgeColor={colors.error}
                distance="8.5 km • Lộ trình an toàn"
                title="Tòa Park 8, Vinhomes Times City"
                address="458 Minh Khai, P. Vĩnh Tuy, Hai Bà Trưng"
              />
            </View>

            <View style={styles.tripInfoRow}>
              <TripInfo
                icon="local-drink"
                label="Trạng thái khách"
                value="Có dùng cồn nhẹ"
              />
              <TripInfo
                icon="payments"
                label="Thanh toán"
                value="Ví Doanh Nghiệp"
              />
            </View>

            {statusMessage ? (
              <View
                accessibilityLiveRegion="polite"
                style={[
                  styles.statusMessage,
                  dispatchState === 'accepted' && styles.statusAccepted,
                  dispatchState === 'declined' && styles.statusDeclined,
                  dispatchState === 'expired' && styles.statusExpired,
                ]}
              >
                <Text style={styles.statusMessageText}>{statusMessage}</Text>
              </View>
            ) : null}

            <View style={styles.actionButtons}>
              <Button
                accessibilityLabel={acceptLabel}
                disabled={dispatchState === 'expired' || dispatchState === 'declined'}
                icon={dispatchState === 'expired' ? 'hourglass-disabled' : 'task-alt'}
                iconPosition="leading"
                iconSize={fontSize.icon2xl}
                label={acceptLabel}
                loading={dispatchState === 'accepted'}
                loadingLabel="Đang điều hướng điểm đón..."
                onPress={acceptRide}
                style={styles.acceptButton}
                textStyle={styles.acceptButtonText}
              />
              <Button
                accessibilityLabel="Từ chối chuyến xe"
                contentColor={colors.error}
                disabled={dispatchState === 'accepted' || dispatchState === 'declined'}
                icon={dispatchState === 'declined' ? 'block' : 'close'}
                iconPosition="leading"
                iconSize={fontSize.iconXl}
                label={dispatchState === 'declined' ? 'Đã từ chối' : 'Từ chối (Bỏ qua)'}
                onPress={declineRide}
                style={styles.declineButton}
                textStyle={styles.declineButtonText}
              />
            </View>
          </Card>

          <View style={styles.safetyFooter}>
            <MaterialIcons
              color={colors.outline}
              name="verified-user"
              size={fontSize.iconMd}
            />
            <Text style={styles.safetyFooterText}>
              Dịch vụ lái xe hộ an toàn ban đêm • Tuân thủ Luật ATGT
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function CountdownTimer({
  seconds,
  totalSeconds,
}: {
  seconds: number;
  totalSeconds: number;
}) {
  const activeDots = Math.ceil((seconds / totalSeconds) * TIMER_DOT_COUNT);

  return (
    <View
      accessibilityLabel={`Còn ${seconds} giây để nhận chuyến`}
      accessibilityRole="timer"
      style={styles.timer}
    >
      {Array.from({ length: TIMER_DOT_COUNT }, (_, index) => {
        const angle = (index / TIMER_DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
        const offset = 38 + 31 * Math.cos(angle);
        const top = 38 + 31 * Math.sin(angle);

        return (
          <View
            key={index}
            style={[
              styles.timerDot,
              {
                left: offset,
                top,
                backgroundColor: index < activeDots ? colors.primary : colors.surfaceContainer,
              },
            ]}
          />
        );
      })}
      <View style={styles.timerCenter}>
        <Text style={styles.timerNumber}>{seconds}</Text>
        <Text style={styles.timerUnit}>GIÂY</Text>
      </View>
    </View>
  );
}

function RouteStop({
  address,
  badge,
  badgeColor,
  distance,
  icon,
  iconColor,
  title,
  withConnector = false,
}: {
  address: string;
  badge: string;
  badgeColor: string;
  distance: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  withConnector?: boolean;
}) {
  return (
    <View style={styles.routeStop}>
      <View style={styles.routeRail}>
        <View style={[styles.routeMarker, { backgroundColor: badgeColor }]}>
          <MaterialIcons color={colors.onPrimary} name={icon} size={fontSize.iconXs} />
        </View>
        {withConnector ? <View style={styles.routeConnector} /> : null}
      </View>
      <View style={styles.routeCopy}>
        <View style={styles.routeMetaRow}>
          <View style={[styles.routeBadge, { backgroundColor: `${badgeColor}20` }]}>
            <Text style={[styles.routeBadgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
          <Text numberOfLines={1} style={styles.routeDistance}>
            {distance}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.routeTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.routeAddress}>
          {address}
        </Text>
      </View>
    </View>
  );
}

function TripInfo({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.tripInfo}>
      <MaterialIcons color={colors.secondary} name={icon} size={fontSize.iconXl} />
      <View style={styles.tripInfoCopy}>
        <Text numberOfLines={1} style={styles.tripInfoLabel}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.tripInfoValue}>
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
    zIndex: 2,
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
    paddingBottom: spacing.spaceMd,
  },
  mapSection: {
    height: 320,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.primaryFixed,
  },
  mapImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  mapWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(248, 249, 255, 0.42)',
  },
  mapLowerWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '44%',
    backgroundColor: 'rgba(248, 249, 255, 0.64)',
  },
  mapBadges: {
    position: 'absolute',
    top: spacing.spaceMd,
    left: spacing.gutter,
    right: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  radarBadge: {
    maxWidth: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py1_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest95,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  radarDot: {
    width: spacing.badgeMd,
    height: spacing.badgeMd,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  radarBadgeText: {
    ...typography.labelSm,
    flexShrink: 1,
    color: colors.onSurface,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
    paddingHorizontal: spacing.px2_5,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.inverseSurface80,
  },
  vipBadgeText: {
    ...typography.labelSm,
    color: colors.inverseOnSurface,
  },
  vehicleCard: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    bottom: spacing.spaceXl,
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    padding: spacing.spaceSm + spacing.gap1,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLowest90,
  },
  vehicleIconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryFixed,
  },
  vehicleCopy: {
    flex: 1,
    minWidth: 0,
  },
  vehicleName: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  vehicleDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.bodyMd,
  },
  transmissionBadge: {
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.gap1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
  },
  transmissionText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  dispatchContent: {
    zIndex: 1,
    marginTop: -spacing.spaceMd,
    paddingHorizontal: spacing.gutter,
    gap: spacing.spaceMd,
  },
  dispatchCard: {
    position: 'relative',
    padding: spacing.spaceMd,
    paddingTop: spacing.spaceMd + spacing.gap1,
    overflow: 'hidden',
    gap: spacing.spaceMd,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLowest,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    flexDirection: 'row',
  },
  accentSegment: {
    flex: 1,
  },
  dispatchSummary: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  earningCopy: {
    flex: 1,
    minWidth: 0,
  },
  earningLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.gap1,
    marginTop: spacing.gap1,
  },
  amount: {
    ...typography.headlineXl,
    color: colors.primary,
    letterSpacing: -0.8,
  },
  currency: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  insuranceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1,
    marginTop: spacing.gap1,
  },
  insuranceText: {
    ...typography.bodyMd,
    flexShrink: 1,
    color: colors.success,
    fontSize: fontSize.labelSm,
    lineHeight: 16,
  },
  timer: {
    width: 80,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  timerDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: borderRadius.full,
  },
  timerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerNumber: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontWeight: '700',
    lineHeight: 21,
  },
  timerUnit: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelSm,
  },
  routeCard: {
    padding: spacing.p3_5,
    gap: spacing.spaceSm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLow,
  },
  routeStop: {
    minHeight: 74,
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  routeRail: {
    width: spacing.spaceMd,
    alignItems: 'center',
  },
  routeMarker: {
    width: spacing.p3_5,
    height: spacing.p3_5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    elevation: 1,
  },
  routeConnector: {
    width: 2,
    height: 38,
    marginTop: spacing.gap1,
    backgroundColor: colors.outlineVariant,
  },
  routeCopy: {
    flex: 1,
    minWidth: 0,
  },
  routeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  routeBadge: {
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
  },
  routeBadgeText: {
    ...typography.labelSm,
    fontSize: fontSize.labelSm,
  },
  routeDistance: {
    ...typography.labelSm,
    flexShrink: 1,
    color: colors.onSurfaceVariant,
  },
  routeTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginTop: spacing.gap1,
  },
  routeAddress: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelLg,
  },
  tripInfoRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  tripInfo: {
    minHeight: 68,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    padding: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  tripInfoCopy: {
    flex: 1,
    minWidth: 0,
  },
  tripInfoLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  tripInfoValue: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  statusMessage: {
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.gap1,
    borderRadius: borderRadius.lg,
  },
  statusAccepted: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  statusDeclined: {
    backgroundColor: colors.errorContainer,
  },
  statusExpired: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  statusMessageText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  actionButtons: {
    gap: spacing.spaceSm,
  },
  acceptButton: {
    height: spacing.ctaHeight + spacing.gap1,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryContainer,
    shadowOpacity: 0.16,
    elevation: 4,
  },
  acceptButtonText: {
    ...typography.labelLg,
    color: colors.onPrimary,
    textTransform: 'uppercase',
  },
  declineButton: {
    height: spacing.buttonHeight,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  declineButtonText: {
    ...typography.labelMd,
    color: colors.error,
  },
  safetyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.spaceXs,
  },
  safetyFooterText: {
    ...typography.bodyMd,
    flexShrink: 1,
    color: colors.onSurfaceVariant,
    fontSize: fontSize.labelLg,
    textAlign: 'center',
  },
});
