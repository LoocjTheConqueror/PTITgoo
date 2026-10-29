import { useMemo } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@datxe/shared';

import type { NearbyDriverMarker, RideCoordinates } from '../services/customerApi';

type HomeMapProps = {
  coordinate: RideCoordinates | null;
  drivers: NearbyDriverMarker[];
};

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN?.trim();

export function HomeMap({ coordinate, drivers }: HomeMapProps) {
  const imageUrl = useMemo(() => {
    if (!coordinate || !mapboxToken) return null;
    const features = [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [coordinate.lng, coordinate.lat] },
        properties: { 'marker-color': colors.primary, 'marker-size': 'large' },
      },
      ...drivers.map(({ location }) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
        properties: { 'marker-color': '#14A66A', 'marker-size': 'medium' },
      })),
    ];
    const overlay = encodeURIComponent(JSON.stringify({ type: 'FeatureCollection', features }));
    const center = `${coordinate.lng},${coordinate.lat},13.5`;
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${overlay})/${center}/800x560?attribution=true&logo=true&access_token=${encodeURIComponent(mapboxToken)}`;
  }, [coordinate, drivers]);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Tài xế quanh bạn</Text>
          <Text style={styles.subtitle}>Vị trí tài xế được hiển thị gần đúng để bảo vệ riêng tư</Text>
        </View>
        <View style={styles.countBadge}>
          <View style={styles.countDot} />
          <Text style={styles.countText}>{drivers.length}</Text>
        </View>
      </View>

      <View style={styles.mapFrame}>
        {imageUrl ? (
          <ImageBackground
            accessibilityLabel="Bản đồ vị trí hiện tại và các tài xế đang trực tuyến gần đó"
            source={{ uri: imageUrl }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.fallbackText}>
              {coordinate
                ? 'Bản đồ hiện chưa khả dụng. Vui lòng thử lại sau.'
                : 'Cho phép truy cập vị trí để xem bản đồ quanh bạn.'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.passengerDot} />
          <Text style={styles.legendText}>Bạn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.driverDot} />
          <Text style={styles.legendText}>Tài xế đang trực tuyến</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.spaceSm },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  headingCopy: { flex: 1, gap: spacing.py0_5 },
  title: { ...typography.headlineSm, color: colors.onSurface },
  subtitle: { ...typography.labelSm, color: colors.onSurfaceVariant },
  countBadge: {
    minWidth: spacing.iconButtonSm,
    height: spacing.iconButtonSm,
    paddingHorizontal: spacing.spaceSm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceXs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  countDot: { width: 7, height: 7, borderRadius: borderRadius.full, backgroundColor: '#14A66A' },
  countText: { ...typography.labelMd, color: colors.onSurface },
  mapFrame: {
    height: 244,
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.spaceLg },
  fallbackText: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceLg, paddingHorizontal: spacing.spaceXs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.spaceXs },
  passengerDot: { width: 10, height: 10, borderRadius: borderRadius.full, backgroundColor: colors.primary },
  driverDot: { width: 10, height: 10, borderRadius: borderRadius.full, backgroundColor: '#14A66A' },
  legendText: { ...typography.labelSm, color: colors.onSurfaceVariant },
});
