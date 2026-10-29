import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  borderRadius,
  colors,
  fontSize,
  spacing,
  typography,
} from '@datxe/shared';

type HistoryFilter = 'all' | 'today' | 'week' | 'completed';
type TripRecord = {
  id: string;
  vehicle: string;
  vehicleType: string;
  date: string;
  earning: string;
  pickup: string;
  dropoff: string;
  note: string;
  rating?: string;
  distance?: string;
  today?: boolean;
  week?: boolean;
  photos?: string[];
};

const INSPECTION_PHOTOS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDD7lk3DiK_OkrQUawD-0AhWtzEH2CEBZ5u0LvF',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5JqxTNWxKhzymzl-azC7vZfcNs_wR7v2qyOQj',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuATIsRo3MDpCnztRudg1st9jrQ4rFpIJj0IzpTa',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6VqIpkXfwiF5EywottFV_5jnl1Oy9UYrlJJxs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ2e2FvvvhbFHcxk1hHPaqbms6y0PCOFLlUCJn',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDhDKT0bKvElpcDOlEFEksxD_XybFQcDKEQBuUA',
];

const TRIPS: TripRecord[] = [
  {
    id: 'DX-8892',
    vehicle: 'Mazda CX-5',
    vehicleType: 'AT',
    date: 'Hôm nay, 23:15',
    earning: '+210.000₫',
    pickup: 'Quán bia Thu Hằng (54 Liễu Giai)',
    dropoff: 'Vinhomes Times City, Minh Khai',
    note: 'Biên bản nhận xe 6 góc đã lưu',
    today: true,
    week: true,
    photos: INSPECTION_PHOTOS,
  },
  {
    id: 'DX-8891',
    vehicle: 'Toyota Camry',
    vehicleType: 'Sedan',
    date: 'Hôm qua, 21:30',
    earning: '+240.000₫',
    pickup: 'Khu ẩm thực Sen Tây Hồ, Lạc Long Quân',
    dropoff: 'Vinhomes Royal City, Nguyễn Trãi',
    note: 'Khách hàng đánh giá: 5.0 ★',
    rating: '5.0 ★',
    week: true,
  },
  {
    id: 'DX-8874',
    vehicle: 'Hyundai SantaFe',
    vehicleType: '7 chỗ',
    date: '16/10, 22:00',
    earning: '+180.000₫',
    pickup: 'Quận Cầu Giấy (Trần Thái Tông)',
    dropoff: 'KĐT Ecopark Hưng Yên, Rừng Cọ',
    note: 'Cự ly: 21.4 km',
    distance: '21.4 km',
  },
];

const FILTERS: { id: HistoryFilter; label: string; icon?: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'all', label: 'Tất cả', icon: 'tune' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: 'Tuần này' },
  { id: 'completed', label: 'Đã hoàn thành', icon: 'check-circle-outline' },
];

const TABS = [
  { label: 'Trang chủ', icon: 'home', route: '/(tabs)/home' },
  { label: 'Lịch sử', icon: 'history', route: '/(tabs)/history' },
  { label: 'Thông báo', icon: 'notifications-none', route: '/(tabs)/notifications' },
  { label: 'Hồ sơ', icon: 'account-circle', route: '/(tabs)/profile' },
] as const;

export default function DriverHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripRecord>(TRIPS[0]);

  const visibleTrips = TRIPS.filter((trip) => {
    if (filter === 'today') return trip.today;
    if (filter === 'week') return trip.week;
    return true;
  });

  const openInspection = (trip: TripRecord) => {
    setSelectedTrip(trip);
    setInspectionOpen(true);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>Lịch Sử</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/profile' as never)} style={styles.headerIcon}>
            <MaterialIcons color={colors.onPrimary} name="support-agent" size={fontSize.icon2xl} />
          </Pressable>
          <View style={styles.headerAvatar}>
            <MaterialIcons color={colors.onPrimary} name="person-outline" size={fontSize.iconMd} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal contentContainerStyle={styles.filterRow} showsHorizontalScrollIndicator={false}>
          {FILTERS.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
            >
              {item.icon ? (
                <MaterialIcons
                  color={filter === item.id ? colors.onPrimary : colors.onSurfaceVariant}
                  name={item.icon}
                  size={fontSize.iconSm}
                />
              ) : null}
              <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Card style={styles.performanceCard} variant="surface">
          <View style={styles.performanceTop}>
            <View style={styles.performanceTitle}>
              <View style={styles.performanceIcon}>
                <MaterialIcons color={colors.primary} name="analytics" size={fontSize.iconLg} />
              </View>
              <Text style={styles.performanceLabel}>TỔNG KẾT HIỆU SUẤT</Text>
            </View>
            <Text style={styles.goalTag}>● Đạt chỉ tiêu</Text>
          </View>
          <View style={styles.performanceBottom}>
            <View>
              <Text style={styles.totalEarnings}>3.850.000₫</Text>
              <Text style={styles.metaText}>Tổng thu nhập ròng</Text>
            </View>
            <View style={styles.tripCount}>
              <Text style={styles.tripCountValue}>18 <Text style={styles.tripCountLabel}>cuốc</Text></Text>
              <Text style={styles.safetyRate}>↗ 100% tỷ lệ an toàn</Text>
            </View>
          </View>
        </Card>

        <View style={styles.listHeading}>
          <Text style={styles.sectionHeading}>DANH SÁCH CHUYẾN ĐI</Text>
          <Text style={styles.metaText}>Cập nhật 2 phút trước</Text>
        </View>

        {visibleTrips.map((trip) => (
          <TripCard
            key={trip.id}
            onOpenInspection={() => openInspection(trip)}
            onOpenDetails={() =>
              Alert.alert(
                'Chi tiết cuốc #' + trip.id,
                trip.vehicle + '\n' + trip.date + '\n\nĐiểm đón: ' + trip.pickup + '\nĐiểm trả: ' + trip.dropoff + '\n\nThu nhập: ' + trip.earning,
              )
            }
            trip={trip}
          />
        ))}
      </ScrollView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.spaceXs) }]}>
        {TABS.map((tab) => {
          const active = tab.label === 'Lịch sử';
          return (
            <Pressable
              accessibilityRole="button"
              key={tab.label}
              onPress={() => router.push(tab.route as never)}
              style={styles.tabItem}
            >
              <MaterialIcons color={active ? colors.primary : colors.onSurfaceVariant} name={tab.icon} size={fontSize.icon2xl} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Modal animationType="slide" onRequestClose={() => setInspectionOpen(false)} transparent visible={inspectionOpen}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.spaceMd }]}>
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalTitle}>Biên bản xe 6 góc</Text>
                <Text style={styles.modalSubtitle}>{selectedTrip.vehicle} • 30G-849.22</Text>
              </View>
              <Pressable accessibilityLabel="Đóng biên bản" onPress={() => setInspectionOpen(false)} style={styles.closeButton}>
                <MaterialIcons color={colors.onSurface} name="close" size={fontSize.iconLg} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalGrid} showsVerticalScrollIndicator={false}>
              {selectedTrip.photos?.map((uri, index) => (
                <View key={uri} style={styles.modalPhotoCard}>
                  <Image resizeMode="cover" source={{ uri }} style={styles.modalPhoto} />
                  <Text numberOfLines={1} style={styles.modalPhotoLabel}>{(index + 1) + '. ' + INSPECTION_LABELS[index]}</Text>
                </View>
              ))}
              <View style={styles.signedNotice}>
                <MaterialIcons color={colors.success} name="verified-user" size={fontSize.iconLg} />
                <View>
                  <Text style={styles.signedTitle}>Đã ký xác nhận 2 bên</Text>
                  <Text style={styles.metaText}>Không ghi nhận vết xước mới trước và sau cuốc</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const INSPECTION_LABELS = [
  'Đầu xe chính diện',
  'Đuôi xe & biển số',
  'Thân xe bên lái',
  'Thân xe bên phụ',
  'Nội thất & Taplo',
  'Khoang hành lý',
];

function TripCard({
  trip,
  onOpenInspection,
  onOpenDetails,
}: {
  trip: TripRecord;
  onOpenInspection: () => void;
  onOpenDetails: () => void;
}) {
  return (
    <Card style={styles.tripCard} variant="surface">
      <View style={styles.tripTop}>
        <View style={styles.carIcon}>
          <MaterialIcons color={colors.onSurface} name="directions-car" size={fontSize.iconLg} />
        </View>
        <View style={styles.tripIdentity}>
          <View style={styles.vehicleLine}>
            <Text style={styles.vehicleName}>{trip.vehicle}</Text>
            <Text style={styles.vehicleType}>{trip.vehicleType}</Text>
          </View>
          <Text style={styles.metaText}>{trip.date}</Text>
        </View>
        <View style={styles.tripEarningBlock}>
          <Text style={styles.tripEarning}>{trip.earning}</Text>
          <Text style={styles.completedTag}>✓ Đã hoàn thành</Text>
        </View>
      </View>

      <View style={styles.routeBox}>
        <View style={styles.routeMarkerColumn}>
          <View style={styles.pickupDot} />
          <View style={styles.routeLine} />
          <MaterialIcons color={colors.error} name="location-on" size={fontSize.iconSm} />
        </View>
        <View style={styles.routeCopy}>
          <Text style={styles.routeCaption}>Điểm đón</Text>
          <Text style={styles.routeAddress}>{trip.pickup}</Text>
          <Text style={[styles.routeCaption, styles.dropCaption]}>Điểm trả</Text>
          <Text style={styles.routeAddress}>{trip.dropoff}</Text>
        </View>
      </View>

      {trip.photos ? (
        <>
          <Pressable accessibilityRole="button" onPress={onOpenInspection} style={styles.inspectionSummary}>
            <View style={styles.thumbnailStack}>
              {trip.photos.slice(0, 3).map((uri, index) => (
                <Image key={uri} source={{ uri }} style={[styles.thumbnail, { marginLeft: index === 0 ? 0 : -10 }]} />
              ))}
            </View>
            <Text style={styles.inspectionText}>{trip.note}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onOpenInspection} style={styles.inspectionButton}>
            <MaterialIcons color={colors.primary} name="view-quilt" size={fontSize.iconLg} />
            <Text style={styles.inspectionButtonText}>Xem chi tiết biên bản 6 góc</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.tripFooter}>
          <View style={styles.tripNote}>
            <MaterialIcons
              color={trip.rating ? colors.success : colors.secondary}
              name={trip.rating ? 'verified-user' : 'route'}
              size={fontSize.iconSm}
            />
            <Text style={styles.tripNoteText}>{trip.note}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onOpenDetails} style={styles.detailsButton}>
            <Text style={styles.detailsText}>Chi tiết cuốc</Text>
            <MaterialIcons color={colors.primary} name="chevron-right" size={fontSize.iconLg} />
          </Pressable>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { minHeight: spacing.headerHeight, paddingHorizontal: spacing.gutter, paddingBottom: spacing.spaceSm, backgroundColor: colors.driverHeader, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  liveDot: { width: 12, height: 12, borderRadius: borderRadius.full, backgroundColor: colors.successContainer },
  headerTitle: { ...typography.headlineSm, color: colors.onPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  headerIcon: { width: spacing.iconButtonMd, height: spacing.iconButtonMd, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: spacing.avatarLg, height: spacing.avatarLg, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: spacing.gutter, paddingTop: spacing.spaceMd, gap: spacing.spaceMd },
  filterRow: { gap: spacing.spaceSm, paddingBottom: spacing.spaceXs },
  filterChip: { minHeight: 36, paddingHorizontal: spacing.spaceMd, borderRadius: borderRadius.full, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceXs },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  filterTextActive: { color: colors.onPrimary },
  performanceCard: { padding: spacing.spaceMd, gap: spacing.spaceMd, backgroundColor: '#FFFFFF' },
  performanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.spaceSm },
  performanceTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  performanceIcon: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  performanceLabel: { ...typography.labelMd, color: colors.onSurfaceVariant, letterSpacing: 0.4 },
  goalTag: { ...typography.labelSm, color: colors.onSuccessContainer, backgroundColor: colors.successContainer, overflow: 'hidden', paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.full },
  performanceBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalEarnings: { ...typography.headlineXl, color: colors.onSurface },
  metaText: { ...typography.bodyMd, color: colors.secondary },
  tripCount: { alignItems: 'flex-end' },
  tripCountValue: { ...typography.headlineMd, color: colors.primary },
  tripCountLabel: { ...typography.bodyMd, color: colors.onSurface },
  safetyRate: { ...typography.bodyMd, color: colors.successStrong },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.spaceXs },
  sectionHeading: { ...typography.labelLg, color: colors.onSurfaceVariant, letterSpacing: 0.6 },
  tripCard: { padding: spacing.spaceMd, gap: spacing.spaceMd },
  tripTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  carIcon: { width: 48, height: 48, borderRadius: borderRadius.full, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  tripIdentity: { flex: 1, gap: spacing.spaceXs },
  vehicleLine: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.spaceXs },
  vehicleName: { ...typography.headlineSm, color: colors.onSurface },
  vehicleType: { ...typography.labelSm, color: colors.onSurfaceVariant, backgroundColor: colors.secondaryFixed, paddingHorizontal: spacing.spaceXs, paddingVertical: 2, borderRadius: borderRadius.default },
  tripEarningBlock: { alignItems: 'flex-end', gap: spacing.spaceXs },
  tripEarning: { ...typography.labelLg, color: colors.primary },
  completedTag: { ...typography.labelSm, color: colors.onSuccessContainer, backgroundColor: colors.successContainer, paddingHorizontal: spacing.spaceSm, paddingVertical: spacing.spaceXs, borderRadius: borderRadius.full, overflow: 'hidden' },
  routeBox: { backgroundColor: colors.primarySoft, borderRadius: borderRadius.lg, padding: spacing.spaceSm, flexDirection: 'row', gap: spacing.spaceSm },
  routeMarkerColumn: { alignItems: 'center', paddingTop: spacing.spaceXs },
  pickupDot: { width: 12, height: 12, borderRadius: borderRadius.full, backgroundColor: colors.successStrong },
  routeLine: { width: 2, height: 26, backgroundColor: colors.outlineVariant },
  routeCopy: { flex: 1 },
  routeCaption: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  routeAddress: { ...typography.bodyLg, color: colors.onSurface },
  dropCaption: { marginTop: spacing.spaceXs },
  inspectionSummary: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm },
  thumbnailStack: { flexDirection: 'row', alignItems: 'center' },
  thumbnail: { width: 38, height: 38, borderRadius: borderRadius.full, borderWidth: 2, borderColor: colors.surfaceContainerLowest },
  inspectionText: { ...typography.bodyMd, color: colors.secondary, flex: 1 },
  inspectionButton: { minHeight: 52, borderRadius: borderRadius.lg, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceSm },
  inspectionButtonText: { ...typography.labelLg, color: colors.primary },
  tripFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.spaceSm },
  tripNote: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs },
  tripNoteText: { ...typography.bodyMd, color: colors.onSurfaceVariant, flexShrink: 1 },
  detailsButton: { flexDirection: 'row', alignItems: 'center' },
  detailsText: { ...typography.labelMd, color: colors.primary },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: spacing.tabBarHeight, paddingTop: spacing.spaceSm, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surfaceContainerHigh, flexDirection: 'row', justifyContent: 'space-around' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tabLabelActive: { ...typography.labelMd, color: colors.primary },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000080' },
  modalSheet: { maxHeight: '88%', backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xxl, borderTopRightRadius: borderRadius.xxl, padding: spacing.spaceMd, gap: spacing.spaceMd },
  modalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { ...typography.headlineSm, color: colors.onSurface },
  modalSubtitle: { ...typography.bodyMd, color: colors.secondary },
  closeButton: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.spaceSm },
  modalPhotoCard: { width: '48.5%', gap: spacing.spaceXs },
  modalPhoto: { width: '100%', aspectRatio: 4 / 3, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainer },
  modalPhotoLabel: { ...typography.labelMd, color: colors.onSurface },
  signedNotice: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, padding: spacing.spaceMd, borderRadius: borderRadius.lg, backgroundColor: colors.successContainer },
  signedTitle: { ...typography.labelLg, color: colors.success },
});
