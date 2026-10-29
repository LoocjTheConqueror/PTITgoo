import { Platform } from 'react-native';

import { AuthApiError, getFirebaseUser } from '@datxe/shared';

export type CustomerProfile = {
  id: number;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  default_payment_method: PaymentMethod | null;
  avatar_url: string | null;
};

export type PaymentMethod = 'CASH' | 'WALLET' | 'VNPAY' | 'MOMO';

export type CustomerProfileUpdate = {
  full_name: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  default_payment_method: PaymentMethod | null;
};

export type RideStatus =
  | 'PENDING'
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'VEHICLE_HANDOVER'
  | 'IN_PROGRESS'
  | 'ARRIVED_DESTINATION'
  | 'VEHICLE_RETURNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_DRIVER_FOUND'
  | 'EXPIRED';

export type RideActorRole = 'CUSTOMER' | 'DRIVER' | 'SYSTEM';
export type RideStatusResponse = {
  rideId: number;
  previousStatus: RideStatus;
  currentStatus: RideStatus;
  changedAt: string;
};

export type CustomerRideDetail = {
  id: number;
  customerId: number;
  driverId: number | null;
  vehicleId: number;
  type: 'INSTANT' | 'SCHEDULED';
  scheduledAt: string | null;
  pickupAddress: string | null;
  pickup: { lat: number | null; lng: number | null };
  dropoffAddress: string | null;
  dropoff: { lat: number | null; lng: number | null };
  distanceKm: number | null;
  estimatedFare: number;
  finalFare: number | null;
  status: RideStatus;
  cancelReason: string | null;
  cancelledBy: number | null;
  statusHistory: Array<{
    id: number;
    fromStatus: RideStatus | null;
    toStatus: RideStatus;
    actorId: number | null;
    note: string | null;
    createdAt: string;
    actorRole: RideActorRole | null;
  }>;
  handoverReports: Array<{
    id: number;
    phase: 'PICKUP' | 'DROPOFF';
    odometer: number;
    fuelLevel: number | null;
    notes: string | null;
    confirmedByCustomer: boolean;
    photos: Array<{
      id: number;
      angle: 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'DASHBOARD';
      fileUrl: string;
      createdAt: string;
    }>;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledByRole: RideActorRole | null;
  discountAmount: number | null;
  unreadChatCount: number;
};

export type CustomerRidePage = {
  content: CustomerRideSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type CustomerRideSummary = {
  id: number;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  type: 'INSTANT' | 'SCHEDULED';
  status: RideStatus;
  estimatedFare: number;
  finalFare: number | null;
  scheduledAt: string | null;
  createdAt: string;
};

export type RideCoordinates = { lat: number; lng: number };
export type NearbyDriverMarker = { location: RideCoordinates };
export type RideEstimateRequest = {
  vehicleId: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  scheduledAt?: string | null;
  voucher_code?: string | null;
};
export type RideEstimate = {
  pricingRuleId: number;
  distanceKm: number;
  estimatedDurationMinutes: number;
  baseFare: number;
  distanceFare: number;
  waitingFare: number;
  nightSurcharge: number;
  returnFee: number;
  estimatedFare: number;
  discountAmount: number;
  payableFare: number;
};
export type CreateCustomerRideRequest = RideEstimateRequest & {
  type: 'INSTANT' | 'SCHEDULED';
  paymentMethod: PaymentMethod;
  note?: string | null;
};
export type CreateCustomerRideResponse = {
  id: number;
  status: RideStatus;
  estimatedFare: number;
  discountAmount: number;
  payableFare: number;
  createdAt: string;
};
export type CustomerNotification = {
  id: number;
  messageId: string;
  type: string;
  payload: unknown;
  createdAt: string;
  readAt: string | null;
};

export type CustomerVehicleCreate = {
  plate_number: string;
  transmission_type: 'MANUAL' | 'AUTO';
  vehicle_type: 'CAR' | 'MOTORCYCLE';
  engine_cc: number | null;
  brand: string | null;
  model: string | null;
  color: string | null;
};

export type CustomerVehicle = {
  id: number;
  plate_number: string | null;
  transmission_type: string | null;
  vehicle_type: string | null;
  engine_cc: number | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  images: Array<{ id: number; secure_url: string }>;
};

export type CustomerVoucher = {
  id: number;
  code: string;
  discountType: string;
  value: number;
  maxDiscount: number | null;
  minimumOrderAmount: number;
  usageCount: number;
  usageLimit: number | null;
  validFrom: string;
  validTo: string;
};

export type CustomerChatMessage = {
  id: number;
  clientMessageId: string | null;
  senderRole: 'CUSTOMER' | 'DRIVER';
  messageType: 'TEXT' | 'IMAGE';
  content: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  readAt: string | null;
};

export type CustomerChatPage = {
  rideId: number;
  messages: CustomerChatMessage[];
  hasMore: boolean;
};

export type CustomerChatSendRequest = {
  clientMessageId: string;
  messageType?: 'TEXT' | 'IMAGE';
  content?: string | null;
  attachmentUrl?: string | null;
  attachmentPublicId?: string | null;
};

export type CustomerChatPageOptions = {
  beforeId?: number;
  afterId?: number;
  size?: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T | null;
  error?: { code?: string; message?: string } | null;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  allowNull?: boolean;
  headers?: Record<string, string>;
};

function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured.endsWith('/api') ? configured : `${configured}/api`;
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const user = getFirebaseUser();
  if (!user) {
    throw new AuthApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'NO_AUTH_USER');
  }

  const send = async (token: string): Promise<Response> => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'X-Role': 'CUSTOMER',
    };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';

    try {
      return await fetch(`${getApiBaseUrl()}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new AuthApiError(
        'Không kết nối được máy chủ. Kiểm tra backend và EXPO_PUBLIC_API_URL.',
        'NETWORK_ERROR',
      );
    }
  };

  let response = await send(await user.getIdToken());
  if (response.status === 401) {
    response = await send(await user.getIdToken(true));
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new AuthApiError('Máy chủ trả về dữ liệu không hợp lệ.', 'INVALID_SERVER_RESPONSE');
  }

  if (!response.ok || !envelope.success) {
    throw new AuthApiError(
      envelope.error?.message ?? 'Không thể tải dữ liệu tài khoản.',
      envelope.error?.code ?? `HTTP_${response.status}`,
    );
  }
  if (envelope.data === undefined || envelope.data === null) {
    if (options.allowNull) return null;
    throw new AuthApiError('Máy chủ chưa trả về dữ liệu tài khoản.', 'INVALID_SERVER_RESPONSE');
  }
  return envelope.data;
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return (await request<CustomerProfile>('/customer/profile')) as CustomerProfile;
}

export async function deleteCustomerAccount(): Promise<void> {
  await request('/auth/account', { method: 'DELETE' });
}

export async function updateCustomerProfile(
  profile: CustomerProfileUpdate,
): Promise<CustomerProfile> {
  return (await request<CustomerProfile>('/customer/profile', {
    method: 'PUT',
    body: profile,
  })) as CustomerProfile;
}

export async function getActiveCustomerRide(): Promise<CustomerRideDetail | null> {
  return (await request<CustomerRideDetail>('/customer/rides/active', { allowNull: true })) ?? null;
}

export async function getCustomerRideCount(): Promise<number> {
  const page = (await request<CustomerRidePage>('/customer/rides?page=0&size=1')) as CustomerRidePage;
  return page.totalElements;
}

export async function getCustomerVehicles(): Promise<CustomerVehicle[]> {
  return (await request<CustomerVehicle[]>('/customer/vehicles')) as CustomerVehicle[];
}

export async function createCustomerVehicle(vehicle: CustomerVehicleCreate): Promise<CustomerVehicle> {
  return (await request<CustomerVehicle>('/customer/vehicles', {
    method: 'POST',
    body: vehicle,
  })) as CustomerVehicle;
}

export async function updateCustomerVehicle(id: number, vehicle: CustomerVehicleCreate): Promise<CustomerVehicle> {
  return (await request<CustomerVehicle>(`/customer/vehicles/${id}`, {
    method: 'PUT',
    body: vehicle,
  })) as CustomerVehicle;
}

export type CustomerImageFile = { uri: string; fileName?: string | null; mimeType?: string | null };

async function uploadCustomerImage(
  file: CustomerImageFile,
  purpose = 'DEFAULT',
  rideId?: number,
): Promise<{ secureUrl: string; publicId: string }> {
  const query = new URLSearchParams({ purpose });
  if (rideId !== undefined) query.set('rideId', String(rideId));
  const signature = (await request<{
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
    allowedFormats: string[] | null;
  }>(`/uploads/signature?${query.toString()}`))!;
  const form = new FormData();
  const fileName = file.fileName || `customer-image-${Date.now()}.jpg`;
  if (Platform.OS === 'web') {
    const localImage = await fetch(file.uri);
    form.append('file', await localImage.blob(), fileName);
  } else {
    form.append('file', {
      uri: file.uri,
      name: fileName,
      type: file.mimeType || 'image/jpeg',
    } as unknown as Blob);
  }
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);
  if (signature.allowedFormats?.length) form.append('allowed_formats', signature.allowedFormats.join(','));

  let result: Response;
  try {
    result = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
  } catch {
    throw new AuthApiError('Không kết nối được máy chủ tải ảnh.', 'UPLOAD_NETWORK_ERROR');
  }
  const uploaded = await result.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!result.ok || !uploaded.secure_url || !uploaded.public_id) {
    throw new AuthApiError(uploaded.error?.message ?? 'Cloudinary không nhận được ảnh.', 'UPLOAD_FAILED');
  }
  return { secureUrl: uploaded.secure_url, publicId: uploaded.public_id };
}

export async function uploadCustomerVehicleImage(vehicleId: number, file: CustomerImageFile): Promise<void> {
  const uploaded = await uploadCustomerImage(file);
  await request(`/customer/vehicles/${vehicleId}/images`, {
    method: 'POST',
    body: { secure_url: uploaded.secureUrl, public_id: uploaded.publicId },
  });
}

export async function uploadCustomerProfileAvatar(file: CustomerImageFile): Promise<CustomerProfile> {
  const uploaded = await uploadCustomerImage(file);
  return (await request<CustomerProfile>('/customer/profile/avatar', {
    method: 'POST',
    body: { secure_url: uploaded.secureUrl, public_id: uploaded.publicId },
  })) as CustomerProfile;
}

export async function uploadCustomerChatImage(
  rideId: number,
  file: CustomerImageFile,
): Promise<{ secureUrl: string; publicId: string }> {
  return uploadCustomerImage(file, 'CHAT', rideId);
}

export async function deleteCustomerVehicle(id: number): Promise<void> {
  await request(`/customer/vehicles/${id}`, { method: 'DELETE', allowNull: true });
}

export async function deleteCustomerVehicleImage(vehicleId: number, imageId: number): Promise<void> {
  await request(`/customer/vehicles/${vehicleId}/images/${imageId}`, { method: 'DELETE', allowNull: true });
}

export async function getRideEstimate(input: RideEstimateRequest): Promise<RideEstimate> {
  return (await request<RideEstimate>('/customer/rides/estimate', {
    method: 'POST',
    body: input,
  })) as RideEstimate;
}

export async function createCustomerRide(
  input: CreateCustomerRideRequest,
  idempotencyKey: string,
): Promise<CreateCustomerRideResponse> {
  return (await request<CreateCustomerRideResponse>('/customer/rides', {
    method: 'POST',
    body: input,
    headers: { 'Idempotency-Key': idempotencyKey },
  })) as CreateCustomerRideResponse;
}

export async function getCustomerRide(id: number): Promise<CustomerRideDetail> {
  return (await request<CustomerRideDetail>(`/customer/rides/${id}`)) as CustomerRideDetail;
}

export async function getCustomerRides(page = 0, size = 20, status?: string): Promise<CustomerRidePage> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) query.set('status', status);
  return (await request<CustomerRidePage>(`/customer/rides?${query.toString()}`)) as CustomerRidePage;
}

export async function cancelCustomerRide(id: number, reason: string): Promise<RideStatusResponse> {
  return (await request<RideStatusResponse>(`/customer/rides/${id}/cancel`, {
    method: 'POST',
    body: { reason },
  })) as RideStatusResponse;
}

export async function confirmCustomerHandover(id: number, phase: 'pickup' | 'dropoff'): Promise<void> {
  await request(`/customer/rides/${id}/handover/${phase}/confirm`, {
    method: 'POST',
    body: { confirmed: true },
    allowNull: true,
  });
}

export async function rateCustomerRide(
  id: number,
  rating: { stars: number; comment?: string | null; tags?: string[] | null; tip?: number },
): Promise<void> {
  await request(`/customer/rides/${id}/rating`, {
    method: 'POST',
    body: rating,
    allowNull: true,
  });
}

export async function geocodeCustomerAddress(address: string): Promise<RideCoordinates | null> {
  const result = await request<string | null>(`/location/geocode?address=${encodeURIComponent(address)}`, {
    allowNull: true,
  });
  if (!result) return null;
  try {
    const parsed = JSON.parse(result) as {
      features?: Array<{ geometry?: { coordinates?: number[] } }>;
    };
    const [lng, lat] = parsed.features?.[0]?.geometry?.coordinates ?? [];
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}

export async function getNearbyCustomerDrivers(center: RideCoordinates): Promise<NearbyDriverMarker[]> {
  const query = new URLSearchParams({
    latitude: String(center.lat),
    longitude: String(center.lng),
  });
  return (await request<NearbyDriverMarker[]>(`/location/customer/nearby-drivers?${query.toString()}`)) as NearbyDriverMarker[];
}

export async function getCustomerNotifications(): Promise<CustomerNotification[]> {
  return (await request<CustomerNotification[]>('/notifications')) as CustomerNotification[];
}

export async function markCustomerNotificationRead(id: number): Promise<void> {
  await request(`/notifications/${id}/read`, { method: 'PUT', allowNull: true });
}

export async function markAllCustomerNotificationsRead(): Promise<void> {
  await request('/notifications/read-all', { method: 'PUT', allowNull: true });
}

export async function getCustomerVouchers(): Promise<CustomerVoucher[]> {
  return (await request<CustomerVoucher[]>('/customer/vouchers')) as CustomerVoucher[];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const result = (await request<{ unread_count: number }>('/notifications/unread-count')) as {
    unread_count: number;
  };
  return result.unread_count;
}

export async function getCustomerChatMessages(
  rideId: number,
  options: CustomerChatPageOptions = {},
): Promise<CustomerChatPage> {
  const query = new URLSearchParams();
  if (options.beforeId !== undefined) query.set('beforeId', String(options.beforeId));
  if (options.afterId !== undefined) query.set('afterId', String(options.afterId));
  if (options.size !== undefined) query.set('size', String(options.size));
  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : '';
  return (await request<CustomerChatPage>(`/chat/rides/${rideId}/messages${suffix}`)) as CustomerChatPage;
}

export async function sendCustomerChatMessage(
  rideId: number,
  input: CustomerChatSendRequest,
): Promise<CustomerChatMessage> {
  return (await request<CustomerChatMessage>(`/chat/rides/${rideId}/messages`, {
    method: 'POST',
    body: input,
  })) as CustomerChatMessage;
}

export async function markCustomerChatRead(rideId: number, upToMessageId: number): Promise<void> {
  await request(`/chat/rides/${rideId}/read`, {
    method: 'PUT',
    body: { upToMessageId },
  });
}
