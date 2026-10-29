import { MaterialIcons } from '@expo/vector-icons';
export type AddVehicleScreenTransmission = 'at' | 'mt';

export type ConfirmTripScreenPaymentMethod = {
  id: string;
  label: string;
  name: string;
  note: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export type ConfirmTripScreenVoucher = {
  id: string;
  code: string;
  note: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  selected?: boolean;
  disabled?: boolean;
  unavailable?: boolean;
};

export type FindDriverScreenDriverPing = {
  id: string;
  distance: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  position: 'topRight' | 'bottomLeft';
};

export type NotificationScreenFilterKey = 'all' | 'trip' | 'promo' | 'vehicle';

export type NotificationScreenBodyPart = { text: string; kind?: 'strong' | 'code' };

export type NotificationScreenNotificationItem = {
  id: string;
  unread: boolean;
  tone: 'primary' | 'tertiary';
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  time: string;
  body: NotificationScreenBodyPart[];
  footer?: {
    contactLabel?: string;
    hint?: string;
    expiry?: string;
    copyLabel?: string;
    linkLabel?: string;
  };
};

export type OtpVerifyScreenSubmitState = 'idle' | 'loading' | 'success';

export type ProfileScreenMenuTone = 'primary' | 'tertiary' | 'secondary' | 'high' | 'error';

export type ProfileScreenMenuItem = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone: ProfileScreenMenuTone;
  title: string;
  subtitle: string;
  badge?: { label: string; highlighted?: boolean };
  route?: string;
};

export type RouteSelectionScreenVehicle = {
  id: string;
  name: string;
  plate: string;
  transmission: string;
  type: string;
};

export type TripHistoryScreenFilterKey = 'all' | 'completed' | 'cancelled';

export type TripHistoryScreenInspectionImage = { id: string; uri: string; badge?: string };

export type TripHistoryScreenTrip = {
  id: string;
  status: Exclude<TripHistoryScreenFilterKey, 'all'>;
  vehicle: string;
  plate: string;
  timeIcon: keyof typeof MaterialIcons.glyphMap;
  timeText: string;
  price: string;
  highlight: boolean;
  statusDot: boolean;
  from: string;
  to: string;
  toLabel: string;
  driver: {
    name: string;
    meta?: string;
    muted?: boolean;
    avatar: { uri: string };
  };
  actionIcon: keyof typeof MaterialIcons.glyphMap;
  actionLabel: string;
  actionVariant: 'high' | 'default';
  inspection: {
    title: string;
    showVerified?: boolean;
    timings: string;
    note?: string;
    images: TripHistoryScreenInspectionImage[];
    receipt?: { code: string; note: string };
  };
};

export type VehicleInspectionScreenCaptureSlot = {
  id: string;
  title: string;
  subtitle: string;
  footer: string;
  badge?: string;
  image?: { uri: string };
  captured: boolean;
};

export type VehicleInspectionScreenViewMode = 'capture' | 'compare';

export type RegisterScreenSubmitState = 'idle' | 'loading' | 'success';
