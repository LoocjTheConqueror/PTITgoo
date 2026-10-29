import Mapbox, { Camera, CircleLayer, MapView, ShapeSource } from '@rnmapbox/maps';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@datxe/shared';

import type { NearbyDriverMarker, RideCoordinates } from '../services/customerApi';

type HomeMapProps = {
  coordinate: RideCoordinates | null;
  drivers: NearbyDriverMarker[];
};

type MapMarkerProperties = { markerType: 'passenger' | 'driver' };
type MapMarkerFeature = {
  type: 'Feature';
  id: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: MapMarkerProperties;
};

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN?.trim();

export function HomeMap({ coordinate, drivers }: HomeMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const shape = useMemo(() => {
    const features: MapMarkerFeature[] = [];
    if (coordinate) {
      features.push({
        type: 'Feature',
        id: 'passenger-location',
        geometry: { type: 'Point', coordinates: [coordinate.lng, coordinate.lat] },
        properties: { markerType: 'passenger' },
      });
    }
    drivers.forEach((driver, index) => {
      features.push({
        type: 'Feature',
        id: `nearby-driver-${index}`,
        geometry: {
          type: 'Point',
          coordinates: [driver.location.lng, driver.location.lat],
        },
        properties: { markerType: 'driver' },
      });
    });
    return { type: 'FeatureCollection' as const, features };
  }, [coordinate, drivers]);

  useEffect(() => {
    let mounted = true;
    Mapbox.setTelemetryEnabled(false);
    if (!mapboxToken) {
      setMapReady(true);
      return () => { mounted = false; };
    }

    try {
      void Promise.resolve(Mapbox.setAccessToken(mapboxToken)).then(
        () => { if (mounted) setMapReady(true); },
        () => { if (mounted) { setMapError(true); setMapReady(true); } },
      );
    } catch {
      setMapError(true);
      setMapReady(true);
    }
    return () => { mounted = false; };
  }, []);

  const fallbackMessage = !coordinate
    ? 'Cho phép truy cập vị trí để xem bản đồ quanh bạn.'
    : !mapboxToken || mapError
      ? 'Bản đồ hiện chưa khả dụng. Vui lòng thử lại sau.'
      : 'Đang tải bản đồ…';

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
        {coordinate && mapboxToken && mapReady && !mapError ? (
          <MapView
            style={StyleSheet.absoluteFill}
            styleURL="mapbox://styles/mapbox/streets-v11"
            compassEnabled
            attributionEnabled
            logoEnabled
          >
            <Camera
              centerCoordinate={[coordinate.lng, coordinate.lat]}
              zoomLevel={13.5}
              animationMode="easeTo"
              animationDuration={500}
            />
            <ShapeSource id="home-nearby-map-markers" shape={shape}>
              <CircleLayer
                id="home-nearby-drivers"
                filter={['==', ['get', 'markerType'], 'driver']}
                style={{
                  circleColor: '#14A66A',
                  circleRadius: 7,
                  circleStrokeColor: '#FFFFFF',
                  circleStrokeWidth: 2,
                }}
              />
              <CircleLayer
                id="home-passenger-location"
                filter={['==', ['get', 'markerType'], 'passenger']}
                style={{
                  circleColor: colors.primary,
                  circleRadius: 9,
                  circleStrokeColor: '#FFFFFF',
                  circleStrokeWidth: 3,
                }}
              />
            </ShapeSource>
          </MapView>
        ) : (
          <View style={styles.mapFallback}>
            {!mapReady && coordinate && mapboxToken
              ? <ActivityIndicator color={colors.primary} />
              : null}
            <Text style={styles.fallbackText}>{fallbackMessage}</Text>
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
  section: {
    gap: spacing.spaceSm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  headingCopy: {
    flex: 1,
    gap: spacing.py0_5,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
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
  countDot: {
    width: 7,
    height: 7,
    borderRadius: borderRadius.full,
    backgroundColor: '#14A66A',
  },
  countText: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  mapFrame: {
    height: 244,
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.spaceLg,
    gap: spacing.spaceSm,
  },
  fallbackText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceLg,
    paddingHorizontal: spacing.spaceXs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  passengerDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  driverDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: '#14A66A',
  },
  legendText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
