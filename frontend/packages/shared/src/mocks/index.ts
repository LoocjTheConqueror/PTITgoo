import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { AddVehicleScreenTransmission, ConfirmTripScreenPaymentMethod, ConfirmTripScreenVoucher, FindDriverScreenDriverPing, NotificationScreenFilterKey, NotificationScreenNotificationItem, ProfileScreenMenuTone, ProfileScreenMenuItem, RouteSelectionScreenVehicle, TripHistoryScreenFilterKey, TripHistoryScreenTrip, VehicleInspectionScreenCaptureSlot } from '../types';

export const AddVehicleScreenTRANSMISSION_OPTIONS: {
  key: AddVehicleScreenTransmission;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}[] = [
  { key: 'at', icon: 'speed', label: 'Số tự động (AT)' },
  { key: 'mt', icon: 'tune', label: 'Số sàn (MT)' },
];

export const AddVehicleScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnB47ZBz_6X0-MrztV1IzH7egX23hwmkt3A9ziaWmZfcqj2bAXv5fDo0o2bDhzJa1-InVquCkfEsgG5MSd2UvpqKLCSRo8O82vTgsJ4nfvaGEBXeulDaCEpeZlQTijQyoWDQQYfewx--Cb4taJYKC5aAfEZT_VJUvqEN-eieBoeJFSeivxsn8ApbPPK0AxiS3J6IewBvM5vfUGpoLLl4n79CMy-kUgXnXI9hI5Q3L9s2WWIF4ousO1zw',
};

export const AddVehicleScreenSampleCarImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZonheHnYuJmvvExSNcwFFhrTc8AjGmuW4FzpoNajq8LXKpgMGZ4u51dSNe-DDv5rqr7FLn7KPz4j4YI49D89KGJWFFSc39hbPHQi-khw5Sk3nfKRF4LXUUsRIzxVusOix0zHv0JflL2HFJIYZ2uvVIPr_iHtp8lM7hXnyyFWLkAK2UdXsHYSEnuCdjKCE39KxQrVLacUUIykY7KXBxZki00vkpV-0K_V7TiVdPZpQnFtKjQB45hz_cA',
};

export const ConfirmTripScreenPAYMENT_METHODS: ConfirmTripScreenPaymentMethod[] = [
  {
    id: 'momo',
    label: 'Ví MoMo',
    name: 'Ví điện tử MoMo',
    note: 'Liên kết số 0987••••89',
    icon: 'account-balance-wallet',
  },
  {
    id: 'cash',
    label: 'Tiền mặt',
    name: 'Tiền mặt',
    note: 'Thanh toán trực tiếp cho tài xế',
    icon: 'payments',
  },
  {
    id: 'card',
    label: 'Thẻ Quốc tế',
    name: 'Thẻ Visa/Mastercard',
    note: 'Visa, Mastercard, JCB',
    icon: 'credit-card',
  },
];

export const ConfirmTripScreenVOUCHERS: ConfirmTripScreenVoucher[] = [
  {
    id: 'antoan20',
    code: 'ANTOAN20',
    note: 'Giảm ngay 30.000đ cho chuyến đêm',
    icon: 'savings',
    selected: true,
  },
  {
    id: 'bansay15',
    code: 'BANSAY15',
    note: 'Giảm 15% tối đa 40.000đ',
    icon: 'local-activity',
    disabled: true,
  },
  {
    id: 'drivematevip',
    code: 'DRIVEMATEVIP',
    note: 'Giảm 50.000đ (Đơn từ 300.000đ)',
    icon: 'loyalty',
    disabled: true,
    unavailable: true,
  },
];

export const ConfirmTripScreenMETRICS: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  label: string;
}[] = [
  { icon: 'straighten', value: '8.5 km', label: 'Quãng đường' },
  { icon: 'schedule', value: '~22 phút', label: 'Thời gian' },
  { icon: 'directions-car', value: 'Mazda CX-5', label: '30G-889.22' },
];

export const ConfirmTripScreenPRICE_ROWS: {
  label: string;
  value: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { label: 'Giá cước cơ bản (8.5 km)', value: '200.000đ' },
  {
    label: 'Phụ phí đêm muộn (Sau 22:00)',
    value: '50.000đ',
    icon: 'nightlight',
  },
  {
    label: 'Khuyến mãi: ANTOAN20',
    value: '-30.000đ',
    icon: 'check-circle',
  },
];

export const ConfirmTripScreenMapImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuT05sWqslJRwAg9NfLyl1UAmqG4yuBQHRrSTtG_4ik5WFLQhXNeKIR1q-DLxARAX-QL4rYQJxaRti1WBl3_DcYBPvgW0bVdwQzhoFM5QH5Iv-ZZvhYs3xw72H5x-CfFogRTdLrXnrvlrhHJk-JUQ-iKjYYYWq-xUy1pxNWT7U551RUYJ8hLhwJXkbHYhD4bm_vHTNuYJWZp7sTfv9SA32-5EO4LSo_YFUAv7Y4ZYNx1VwUWbxudYttw',
};

export const ConfirmTripScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9nV5gSm57XyDLajmbX_bdEmjWmA9g0WNZ-sRfZ4ZLpsPGHD7VPk0CThdrxz8NQAPGSAdlW9g_hm87d8bGc7tDCSK-TsiK9jkp7tLr2HnpqATxWQ8rwo8AV6rIOE1hbjyDqCSDvajrODy9SDpuHoZcfkZoLBPhSl89VofZvghT5aNHbdaz21gqGteueJ0K6xbcZls6UFeqq18WKtP0oWrdVn7E7JKCmPlVhRjvLqxHu9zl_ZYcXSIl_g',
};

export const DriverTrackingScreenDRIVER_PHONE = '0987654321';

export const DriverTrackingScreenSOS_PHONE = '113';

export const DriverTrackingScreenDRIVER_STATS = [
  { id: 'experience', value: '8 năm', label: 'Kinh nghiệm lái xe' },
  { id: 'completion', value: '99.8%', label: 'Tỷ lệ hoàn thành' },
  { id: 'incidents', value: '0', label: 'Sự cố va quẹt' },
  { id: 'attitude', value: '5.0 ★', label: 'Thái độ phục vụ' },
];

export const DriverTrackingScreenDRIVER_SKILLS = [
  'Thuần thục số tự động, số sàn & xe điện cao cấp',
  'Đã vượt qua bài kiểm tra phản xạ nồng độ cồn',
  'Được tập huấn hỗ trợ khách hàng say xỉn lịch sự',
];

export const DriverTrackingScreenMapImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiJero604kf_bqjnBfuEEh7CFvC-BHucvAgXR-rGGmCAD00kIuaevWsvFtM2qJU-iXxYXYiBvLx3dMJPHFtUygtgpz29ZvQCQB0BavOIX08-kjD9FPMPrTaFWqiw4bnEjbL9DoY6mlLuhJKKYhHUal5TjeCYpwsxLHvO6hfxBD-tI2iKU4t2r59FhthB9OixWQiMotSM-h52zgHg_3rkEGIBnxHmeXZ--HTRDg0XqrKu9nFKPaBf4DLQ',
};

export const DriverTrackingScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxYc3Ojkdv4WHnAzvHqTQr2Jh0Wk5XsBV56QC9AorJaQPFJncQrM9svC00LVWL4qKFjW5MRDfzgjHZUKzWcZ7hqZ2lt5yO3q-6ykdI7IUVgy9rrSLOytl41v0ahrLLaA77aLJO0oNLFAKixUze3veEfILi-kLr79Wq6UT22XEXvjMWO9QhLZu5QwhnoRdGSBYkb7OcNCyA1jJfwXQkkuCMG8W3zIKj2Wm6L1PqfYmQN-dfbACl_9mJGQ',
};

export const DriverTrackingScreenDriverImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYkHPARpIWa95JEe5XNlWzUvY5gzkDGR8ZWx-RqAz_LTRmDUSrJeORr9wKRZDtFx_z367OUH173KREmhr7W4ivnefXpTXuSzQJfLBqGdxeqMFjaqVqo0iOI43uyCDq3H8maAXjKGogt3CMeZjmekVNaUZNb83Z_0QQXoxLXosBVnJ9bQneu3Ge91fH3B2Isl13vDg5I8wXMnWcROAEWKVLJ_8_yZdtSntxSya5GWLtZ2kg5w8F3eD-OQ',
};

export const DriverTrackingScreenDriverProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRGrjwWjo40f-XjuGQPMy8mMQbEp4cr_4qE0zl06mZTTTxUHglBVR5NssqUI4muB35YdUT_qfQbaYRHBfQk1M-fh4jycoqHN-L6LuzrbMj_oSXx9xNa5qYWqF2t_JcSGO6FXBigRpiROjhro78cLoeA6sFogwhLyc4ETISEDJyXNvpqT1D7uqmn4CgVa8UyVdbhwONosu66XKQnd56DLECXceYo1RNvie5njkvniRfd2P2dKRxmzisuQ',
};

export const FindDriverScreenDRIVER_PINGS: FindDriverScreenDriverPing[] = [
  {
    id: 'car-320',
    distance: '320m',
    icon: 'directions-car',
    color: colors.primary,
    position: 'topRight',
  },
  {
    id: 'taxi-650',
    distance: '650m',
    icon: 'local-taxi',
    color: colors.secondary,
    position: 'bottomLeft',
  },
];



export const FindDriverScreenMapImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Bc96fn1YnNp5wd3tYQ9VnoANN5fy8j-1Ui1mC7q9DhvpcbDwf-1dNzU76ua4abFcicUwkm0495wdeMJJrj0uCnIEzNKG2Qpq9r_ChW5R4suVTMBIvLIWLDzOvGvk7nCAI5PAaDSDTzc8lZ7585-xyS_-EW6IGWLQTkdrofoEu_56fn-E6hVbdPE0zOo4OdOy-LifpVGKQ4LABDI60ajlmtWU69-G1t7L7y440mZeUFBAZx8_X95JGg',
};

export const FindDriverScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYc6Kz5oPuMe6Sz8sfXhLKlSe89l0fYylOfuKHHAnzBLgVSyiRvb3m2qw-5UQLes62k_3RTFYWaCjT0jsgCFswFwrMS6ZHvaGokk1m2Ynq7uToRXZQVBi8eKnTVTcEBWhsLrtL4UFhmtKMvl_5YdxQIwNMDhse0UlqJ1iKtiM-Ek5eWWkfwi3n_h67Ra4GWnz-Xg0qwf4ySIAefnH04mFk-fQlacDDrDwmxVPDjEsMBb3_aQzJGmXbFQ',
};

export const FindDriverScreenTrustDriverImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAPV2raai_1nB5RFYAinYL2oQ-4e9DsypZd5KKeDisjQoxHZGB2N7bX_9PNiaFtBm12MEm6XBWQ4E7l5f_TBHiVVi_YVVch5psaG7emQDEiWgv8tM4wRu2ZaB4QWwoi870PUh0n0LGxhLJV4Ds5-3xncbpsfSk7g4p8OtdCTmUdm95csD2nSYQQhPWGjUTOcE_SSnIeXwlncCLB_O7zx_FQIoE9uUC4BJw1tTeVgxh0yLDDQqTp330Hg',
};

export const FindDriverScreenTrustKeyImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYR1_GSb24zts1gRVaUv7p5jpmk2WHxLgHOh0EzckSKNotE0fNBKkq4Bf_6oysJ9CpOPxR_pc3U1YSo8FJMQwAdzlL4QkZJgdzVAVWPk8qDSzi3xwtUUeXi2RF3SCn8KDcljQmNUhuhZG0_8VJLlcUVlCYhgjo4jV-ZvhSQD0tlMpyK5iNYsuz4y8M6TGz9AoRhhaDghWeL6moR5tgooUUIwVyfW8pAVcPJJVlez0_sFh1jTqPGvyIWg',
};

export const NotificationScreenINITIAL_NOTIFICATIONS: NotificationScreenNotificationItem[] = [
  {
    id: 'driver-arrived',
    unread: true,
    tone: 'primary',
    icon: 'person-pin-circle',
    title: 'Tài xế đã đến',
    time: '5 phút trước',
    body: [
      { text: 'Tài xế ' },
      { text: 'Trần Văn Hoàng', kind: 'strong' },
      { text: ' đã có mặt tại điểm hẹn ' },
      { text: '45 Quán Thánh', kind: 'strong' },
      { text: '.' },
    ],
    footer: {
      contactLabel: 'Liên hệ tài xế',
      hint: 'Xe đã mở chốt an toàn',
    },
  },
  {
    id: 'promo-tonight',
    unread: true,
    tone: 'tertiary',
    icon: 'local-activity',
    title: 'Ưu đãi tối nay',
    time: '2 giờ trước',
    body: [
      { text: 'Tặng bạn mã ' },
      { text: 'ANTOAN20', kind: 'code' },
      {
        text: ' giảm 20% cho chuyến đi tối nay. Vui tiệc thả ga, về nhà an toàn!',
      },
    ],
    footer: { expiry: 'HSD: 23:59 hôm nay', copyLabel: 'Sao chép mã' },
  },
  {
    id: 'trip-completed',
    unread: false,
    tone: 'primary',
    icon: 'task-alt',
    title: 'Hoàn thành chuyến đi',
    time: '3 ngày trước',
    body: [
      { text: 'Chuyến đi ' },
      { text: '#DX881', kind: 'strong' },
      {
        text: ' ngày 18/10 đã hoàn thành an toàn. Xem biên bản bàn giao xe và hóa đơn điện tử.',
      },
    ],
    footer: { linkLabel: 'Chi tiết biên bản' },
  },
  {
    id: 'vehicle-added',
    unread: false,
    tone: 'primary',
    icon: 'directions-car',
    title: 'Hồ sơ phương tiện',
    time: '1 tuần trước',
    body: [
      { text: 'Bạn vừa thêm xe ' },
      { text: 'Mazda CX-5 (30G-889.22)', kind: 'strong' },
      { text: ' thành công vào danh sách quản lý.' },
    ],
  },
];

export const NotificationScreenFILTERS: { key: NotificationScreenFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'trip', label: 'Chuyến đi' },
  { key: 'promo', label: 'Khuyến mãi' },
  { key: 'vehicle', label: 'Phương tiện' },
];

export const NotificationScreenNAV_ITEMS = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: 'home' as const,
    route: '/(main)/home' as const,
  },
  {
    id: 'history',
    label: 'Lịch sử',
    icon: 'receipt-long' as const,
    route: '/(main)/trip-history' as const,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: 'notifications' as const,
    route: '/(main)/notifications' as const,
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    icon: 'person' as const,
    route: '/(main)/profile' as const,
  },
];

export const NotificationScreenACTIVE_NAV = 'notifications';

export const NotificationScreenLogoImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG27lZIgiKBbmqnCsxdP45fJk47v7EbfR9LTwSGce2jPf4NCHsB8wAFFW5s5JKgC6qShjw4b5j1foj8otp1FNCLr_HRczaG4S-7Emy76CpLBX3gOV5UfmOR8_tLRW_03_-xEopI_cDtvC0oQCni54kipXPpfThU0JYXgzl8VszGzSHbGHK1AhwHSsaSX3IqBRu2LO26OZCS04iVMI-LE998LCSMwsm1fNmKSfB7clq4rwbn6CRxY0bOQ',
};

export const NotificationScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg2Vm73muBPmBRuIlObf4HqHhrMkYwu_0Asu_5nc8DT2h5hCJa005pQncopn7venOuCLpDW_hgBrY3xJvgCq5cPvC4-i3M_PpPOGtRjnXuKOrMvpVRwqkGh04Nvi78FQ-bMoAYpR8Np9rH-QihPQJymkdKgwuu6suRKWk3134Ng3Wq_RwV5sNU-1cjHzgFSF_4lust_TOgY0Gx4lo9nNdgHNkmxqpMd0cMakE7sknpMuc-faYcrD7TkA',
};

export const OtpVerifyScreenOTP_LENGTH = 6;

export const OtpVerifyScreenRESEND_SECONDS = 45;

export const OtpVerifyScreenVERIFY_DELAY_MS = 1200;

export const OtpVerifyScreenKEYPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export const ProfileScreenSTATS = [
  { id: 'trips', value: '28', label: 'Chuyến an toàn', tone: 'primary' as const },
  { id: 'rating', value: '5.0', label: 'Đánh giá', tone: 'surface' as const },
  { id: 'points', value: '350', label: 'Điểm thưởng', tone: 'tertiary' as const },
];

export const ProfileScreenSERVICE_SECTION: ProfileScreenMenuItem[] = [
  {
    id: 'vehicles',
    icon: 'directions-car',
    tone: 'primary',
    title: 'Xe của tôi',
    subtitle: '2 xe: Mazda CX-5, Toyota Vios',
    badge: { label: '2 xe' },
    route: '/(main)/vehicles',
  },
  {
    id: 'vouchers',
    icon: 'confirmation-number',
    tone: 'tertiary',
    title: 'Ưu đãi của tôi',
    subtitle: '3 ưu đãi giảm tới 50k',
    badge: { label: '3 mới', highlighted: true },
    route: '/(main)/vouchers',
  },
  {
    id: 'payments',
    icon: 'account-balance-wallet',
    tone: 'secondary',
    title: 'Phương thức thanh toán',
    subtitle: 'MoMo, Thẻ Visa/Mastercard',
  },
];

export const ProfileScreenSUPPORT_SECTION: ProfileScreenMenuItem[] = [
  {
    id: 'help',
    icon: 'support-agent',
    tone: 'high',
    title: 'Trợ giúp chuyến đi',
    subtitle: 'Trạng thái, lịch sử và tin nhắn với tài xế',
  },
  {
    id: 'safety',
    icon: 'shield',
    tone: 'primary',
    title: 'An toàn chuyến đi',
    subtitle: 'Theo dõi chuyến và xem biên bản bàn giao',
  },
];

export const ProfileScreenNAV_ITEMS = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: 'home' as const,
    route: '/(main)/home' as const,
  },
  {
    id: 'history',
    label: 'Lịch sử',
    icon: 'receipt-long' as const,
    route: '/(main)/trip-history' as const,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: 'notifications' as const,
    route: '/(main)/notifications' as const,
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    icon: 'person' as const,
    route: '/(main)/profile' as const,
  },
];

export const ProfileScreenACTIVE_NAV = 'profile';

export const ProfileScreenTONE_STYLES: Record<ProfileScreenMenuTone, { box: string; icon: string }> = {
  primary: { box: 'primaryFixed', icon: 'primary' },
  tertiary: { box: 'tertiaryFixed', icon: 'tertiary' },
  secondary: { box: 'secondaryFixed', icon: 'secondary' },
  high: { box: 'surfaceContainerHigh', icon: 'primary' },
  error: { box: 'errorContainer', icon: 'error' },
};

export const ProfileScreenLogoImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuISkCRWkJYRgiFHjeYj1e40Vz6O4-Q-zWMHFEBNeXXkFY2y8f49xi_CA7637EUIuri855PrmrhLyojbbpQ3Fo859u2GJQboLvazU-BO8ZIIiYJjDCLTp2oVAkOyomWrCTrpXJhA4_EYD66Eua-_PAy74e37oFipQnH7or2OUOh78V6GytnW_ji5bb8kMs20RBh8aXSC8Dv251ECXMZ_dh71Yq8d52ruSYKvqaqokCZj6bXCdtDoGK5A',
};

export const ProfileScreenHeaderProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYn39QM5JAfunrzcPafqVnyx2t6S4z8cH0dfLh5Ao8r6zfkRaDU_YkHpbHA--zIFRxs1k2R3Teyf3SgPlWgV9iDBbZCMtZzWstdF8iW2YEgmMiQgCYYIo3eZGkxln_nrGti4kZXtbf4sNB4AtfOI20kCHfvobKqDl-6LW42bBW4SaRedWKVmhh5r9iCe2L052dH5h9ap5Li2yqo_9s_JMgvKLDeHhmJoktxi_KkMLWp_RSKvHyjuEZYA',
};

export const ProfileScreenAvatarImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEyTvAKpzx2JZqsje7xGk2pNx44H9efNbAjsO9dgl6CDpTkYUSXSiJH3RJw6DSwDNTPXtkrgCa6lBnWGJtZ-cSeWSafV-BBetd6zlbzlUnpTBBNJNeQBvowpJ_MMBDZHZaYlmnFJW0XU1l4x_gWwSuf56HxGUz719JOqksz_twEMyIlzRuyB0IcOP8Zmop1z9jYcFsFKc-Zf-SRRmyCLT-MbMsuZOiHgmCiOC-C1l7iTfMdYN353UMwQ',
};

export const RouteSelectionScreenVEHICLES: RouteSelectionScreenVehicle[] = [
  {
    id: 'mazda-cx5',
    name: 'Mazda CX-5',
    plate: '30G-889.22',
    transmission: 'Tự động (AT)',
    type: 'SUV 5 chỗ',
  },
  {
    id: 'toyota-vios',
    name: 'Toyota Vios',
    plate: '29A-654.10',
    transmission: 'Số sàn (MT)',
    type: 'Sedan 5 chỗ',
  },
  {
    id: 'mercedes-c200',
    name: 'Mercedes C200',
    plate: '30E-123.45',
    transmission: 'Tự động (AT)',
    type: 'Sedan hạng sang',
  },
];

export const TripCompletedScreenSTARS = [1, 2, 3, 4, 5];

export const TripCompletedScreenCOMPLIMENTS: {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { id: 'safe', label: 'Lái xe an toàn', icon: 'thumb-up' },
  { id: 'friendly', label: 'Thân thiện, lịch sự', icon: 'handshake' },
];

export const TripCompletedScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaCubebLqU-CG4ie6Q-sMBfkTrUQTR9_Se2Ebxiiu51XCf5V38dCz50nFpRrmyd-hOjSP5yoLJM2MtlPnya0sr4twKgZfB9Fi5f55nZxvQ1O19kdkigkWjDaF-EBXtdt9jhERE0GyuNiIo2Oj1-QVbHC_pR2uaRtTVuZ6ENaJ5GpQOM15MXUHmcZ3fgVp04BHoGNtTGD5XWx6jsJAGF8j5FZVLL2Y7QdjliyWiXai-Hz1Nh-78CopgxQ',
};

export const TripCompletedScreenDriverImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBvmCb3H9yGB-QutFWtFx3Grz27OIWvWaiprgRUkzwQq1I_LT-BS3HgRqcudIj-RBvAIUzMAGQsH_CGqLi1mdAe_9vS4Bsao5NiKS_80m6K5SPAhg-5Oy1FFf6v3EwFRHQIEJGzYKCuQIF20FQEs7HtBPxug1Enj20_WMVxZ8l1csM4i7mb1LcC9YE8bxvoOj47UPS8Wa7YEWwTZmSx-CcwR1Z53KHYBlJc_DLLk2x5Gpui4DhMuEB_Q',
};

export const TripHistoryScreenTRIPS: TripHistoryScreenTrip[] = [
  {
    id: 'trip-1',
    status: 'completed',
    vehicle: 'Mazda CX-5',
    plate: '30H-889.26',
    timeIcon: 'schedule',
    timeText: 'Hôm nay, 23:15 (Vừa xong)',
    price: '220.000đ',
    highlight: true,
    statusDot: true,
    from: 'Quán bia Thu Hằng (Quán Thánh)',
    to: 'Park 8, Vinhomes Times City, Hai Bà Trưng',
    toLabel: 'Điểm trả xe an toàn',
    driver: {
      name: 'Tài xế Nguyễn Văn Hải',
      meta: '5.0 ★ (1.240 chuyến)',
      avatar: {
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYHdXIlDTVppR7hM0KyaQaKXOuyFGEmmng1gQ56fPoZgjKf8UUuIBGvRqIYa7hMVlb5cc3oI9SYYMOsR8oVzgsNkPbih2erbmeDLEu8oAXMKMKTkKuumNJR6OUMJD4Bg5veYUA3SonruNLRr86CuHKhPwYjO6Jf7F9C6KBZchIUf-CSxcjrxh3Dw_lrNJmJvJbixLF68KUIoGeQexKrElbWXtJ5oaP9_rUqjJlkVVt-1aTP4jIrJOzlw',
      },
    },
    actionIcon: 'photo-camera',
    actionLabel: 'Xem ảnh 6 góc',
    actionVariant: 'high',
    inspection: {
      title: 'Ảnh bàn giao kiểm tra 6 góc vỏ xe',
      showVerified: true,
      timings: 'Lúc đón 23:18 • Lúc trả 23:54',
      images: [
        {
          id: 'front',
          badge: '1. Đầu xe',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOG-jo7qh5Vhuqa8l2NWXtV1imNqKMAQlGCEAON9O_2oeiiqDcBcPNgwIcpY4N7pLUEm_WeaL8LP89mTM_ChcZnFnlGveLcgbxnZw5TsrR1Omj6ZbE5bb3cn_b_6d_HjKVy2OtKTGApA7XK8La0AUfhv_Np2vQZ8uuaqycLUogfbDctnQToBh1oQP5KpNZ31gN7xf2fNAubQZKQs67sEYD78UPhnOxrgmcQu_tmg2-YMPy58O5mcjo9Q',
        },
        {
          id: 'rear',
          badge: '2. Đuôi xe',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy_-_nT_-4gsu_JehiOdoDDTVZ2SOJeMP87vY6yhgEKJ5DuCfrov2LjRE_c0g3nX6eXrXEPFG0rmXp2h1I--kP-UZ6uWpkz-nb7fuh-LdIoMr3W6ZlcI-4OizyIWcDtvPn7gm6xBO1WCGuvdzkOxAGH7U5QNaNJZzzRbE_lGW6l6Z5tY2rnFex4ML7dhEd1y_yz5l9GnSoSc3V0ogDSArvChFdzZ0Di8IvOjPse_vfX_qCqy8LdBKIZA',
        },
        {
          id: 'left',
          badge: '3. Sườn trái',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC4695Dm6iWWr4a9-G6OCwEPt74E8djkWQMPuVVQLV2ma632mG2ob4hQjGw9eefUbqO1njpOXUlmkzRZVCzY5NFdVWurrrcNqdbjDDqNqGLbnBFqwXYlJ-gdfY6icif5DaaBoijaqn_F7C3gc2-K2UteyGatHvyGH3tAhxmwimh9dD3ai3dnrb-AO3wZPlDeIJ4QlZ8EfHJ70jV5PGjSdb3wQorHdHM3wSuSJwA7EUoK9freIIMSq-XQ',
        },
        {
          id: 'right',
          badge: '4. Sườn phải',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIlg5kM88aalXRFtWvBmESw2_OiuYnZ3PsDPAjJ_-fRYSePPKTt0pQf5sbBz7n054aj-LNiLRlggfc_dcq-SjgUF76FtqKJPG4fY7xQDaFuS70otFcOfAWlGiDlfbRiqpwBFxQnuh1qHAAd45pRysjZ-ug7jRaD5PrHYGP4Nf94VC3gPJGRD2eMJA06xKs3X_9ecPKanHvfIpTZTQEVJnjbWj2e8r0txYlFPHvfVb1VZZIBCE_2-WJLw',
        },
        {
          id: 'odo',
          badge: '5. ODO & Xăng',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAun0ZmJUkGumE0oMsxYsj5YZNyMQ7YwU-_U-dTK8XRwhVU0P9GZzbfH5M-QwFSRR3xPmUhGCRZ2NolwPbB-OnNk2LAWmwW3nR2vYCKpOoVEcJp6bJJHPY9DUQEpJWklv52InOiLuzLFsjN5epg5iGGzwfnMsC_uNzfN-tU6yFPrPwy1-8rYsdyED_9URMVP3GVq-gWsiInuu8a6qSMTB0EU3fMJ79JGcai8rRScTI3OFGs33twWzrU5g',
        },
        {
          id: 'interior',
          badge: '6. Nội thất',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNfhLFJmxCOC1-On3YjjpIdL7AP6WKEMbmoX3BHmS29Xg_Ld_ytvXXua45zGDCvt-xcJmbqsc7DvODlYmhBG7PFCN2pBc56XZWUE0JPPmFjqYwYD4vmDCi6Yn8wkVw4GcXAhbmkKOCenGMqcOxO-rZbDaEOWvjOyaIZM_bZLb3OG9ydTxCnVYTiKalee7nD1JdFN-4efq-BmspeZX1pIl027jzmggcx-oZuRUGoJtd_yRC0KlkImlcbQ',
        },
      ],
      receipt: { code: 'Biên bản số điện tử: #LH-9921', note: 'Xe an toàn 100%' },
    },
  },
  {
    id: 'trip-2',
    status: 'completed',
    vehicle: 'Mazda CX-5',
    plate: '30H-889.26',
    timeIcon: 'calendar-today',
    timeText: '18/10/2023 • 22:30',
    price: '280.000đ',
    highlight: false,
    statusDot: false,
    from: 'Nhà hàng Sen Tây Hồ, Lạc Long Quân',
    to: 'Sảnh R2, Vinhomes Royal City, Thanh Xuân',
    toLabel: 'Điểm trả',
    driver: {
      name: 'Tài xế Trần Quốc Tuấn (4.9 ★)',
      muted: true,
      avatar: {
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWurDsQsV6ErOo_0Nl4Fz90wkB7nkoNs9o3TDd3sSksw-wvmn5ddnF9ia6lq-KuCr7C47mYGg5uT4HWW3r51Xl_aNyK8j_fi2BQ3BTKABh3PgcpREeUDgH_r-Qo5f4m7UsvOOpRJIspg88_sUg-lTgGH907j5VLSG47wU6of2jz0iQQUi7ZXslOaI9uu4Tl2yL6PgFbuj25GVWF2IBkiTuDTZ9xTHTryuKSqZEXg53nSZPnsBXU5sMVw',
      },
    },
    actionIcon: 'collections',
    actionLabel: 'Xem 6 góc xe',
    actionVariant: 'default',
    inspection: {
      title: 'Kiểm tra lúc nhận xe: 22:33 • Trả: 23:14',
      timings: '',
      note: 'Bảo toàn nguyên vẹn',
      images: [
        {
          id: 'front',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaqmqsTh62fSbJoIsOm7tZ55UDXWyVN1-Jy_GwtHrZFVk9cv3m7Q8RZ1dyVTtMi0sE734GbqUO3VKuESEVTbs3WxA_uo4FFoF-B-h5oKB85UXiFLPQPI98iMa33mJ4o42uuCzie_mKZdzRJmEeoBv-pcZeWKG8e6lVCgwEw1LaTgMUIr_PhEigW6iSP6HIposOL2nHgZTgAd6cwWr0GJLNYWaXCnPzoUPEQ2riGKOYoH_HMNyU_sQwcg',
        },
        {
          id: 'rear',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9d2dgcTb9JlgOTWGv-qTxd1OozoQs0CmZQU2rGrVuQgcoYBUGZpCgwkPQVP434Su-XBm5aBz3DBDFvyNzWm89-MXHC9q0vNLTdqJEV9RiTpEuq0PY81L_UfkjGCV8-6p5VKp_s2pal0SA1oMhisCRvZ_qAjUHWJpZh3H6OwkOXIWDqARaUmWwbMooTf3NYHm9voYpHPjJt0Yt4Z0_OfgvltM2qPZSD4OMuLwBwuSB2Tugwq6bnQgNVQ',
        },
        {
          id: 'wheel',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTV8gMqE5p5pd3hPGsFyqR7ngUe2JdgJvn89dY1_5DMPSvWGhnSWcbggD9XA6-gOEhp7_Pdi84id337-vvAYiSTGFufa_AAuoJkfzLow87B3wrYr4soOEHLg85BIN0Fg1JMg22VSEWB03gfspnPAofMYovGhVH_5w-qt4GfD_3_1JRHeZLyeEHD0eLGzLAkOZjy8BViPUWldKK6T_kdJP24vd_oz56sXRwTHCAevGOCGIBVRb8XGbCeg',
        },
      ],
    },
  },
  {
    id: 'trip-3',
    status: 'completed',
    vehicle: 'Toyota Vios',
    plate: '29A-671.45',
    timeIcon: 'calendar-today',
    timeText: '12/10/2023 • 21:00',
    price: '350.000đ',
    highlight: false,
    statusDot: false,
    from: '19/8 Cầu Giấy, Quan Hoa',
    to: 'Thảo Nguyên, Khu Đô Thị Ecopark, Văn Giang',
    toLabel: 'Điểm trả',
    driver: {
      name: 'Tài xế Lê Hoàng Anh (5.0 ★)',
      muted: true,
      avatar: {
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACo7zjd1MDmW-b8jho7g1RC8rTd1lmeVJE0tb1W8ssvywRkypzJYnNN03AfzIxjO1aCHiU2E6gB4zRm5QoAqwtYMdm0RuT268ItO04L86tyM0FG94WtKSOd1tgleUFgmo0tkyE_weWnf0NAK0PIo5H7ObNmuluIzCHhaeu5u42Nu1sC_Q8PGp6OGKrJ4iEccBTYbnnAgc7BA-Gqjeuu0_jVvefJNshLoeTtn6SvTLPB5gcC02_QHsoaQ',
      },
    },
    actionIcon: 'collections',
    actionLabel: 'Xem 6 góc xe',
    actionVariant: 'default',
    inspection: {
      title: 'Kiểm tra lúc nhận xe: 21:05 • Trả: 22:10',
      timings: '',
      note: 'Bảo toàn nguyên vẹn',
      images: [
        {
          id: 'front',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmvuBWPx8MC95GFxgafFMNGK15k90_HsXbfJFbExh0BImdt26hgkAwGgxoLDAEIT-Tj-bkPRO2kwyVDYHHWV4jTtKjqbQMd4kzPZPMp9iGvXS7JWuX8VqLdZzvMHvea19pIWPSg2O85vc9Vgpw9uqVmwFyzz1NcHUReL-TTSBjBFStmoKFXvIOZ8k9e7rg3H-uw0kFRyVLr6xyLWhvOZdx9Bo_9jYwpKR2EgCDYeP1NZT_YqGfuj38_w',
        },
        {
          id: 'rear',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7_HaW6G85B6AnPOUbCh-PdS-XHEfSSdGwB3iVfHRNuMOWV1nemuA5DlJbjTLtkJcbhXg0vYNT3W7w-btgGsGHpiYNzFuHVglpVelPCyBCgm1zOvOB6MpyFehnUN87hyEuv8O6djE5cVb9_GCUYawEzUFsR65Hs6HempVipYctI3aRLWtaelao5n9f1R3Lpl1HuYPXh4TMqm7Bxj2_kFShyh6x45-i5rp_ercU9CuO4DbQJcJEszEouQ',
        },
        {
          id: 'odo',
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACL4YLP8hrslNsrOHdynpIwwFFgkNzYVKrvplB761S47KMOwrZILgUhXiGaCvrIgz-EU1SlX4UxP8tonlsAV2qX_Wq5Bz5EtVqml6uMkHP3mziz6oCZE5HMr2LdmJqk7AE4vTEJ72VEFuP3HuG2T_IRPhctQ8fbhb6mPiOj8dh02pYHM2ZzATzD0LRJuqcQswdywnqEzUrneUwdnC7A8HnCh1FeWzyBddsQnURQD5s6jDcm1AF6jytOQ',
        },
      ],
    },
  },
];

export const TripHistoryScreenFILTERS: { key: TripHistoryScreenFilterKey; label: string; count: number }[] = [
  { key: 'all', label: 'Tất cả', count: 3 },
  { key: 'completed', label: 'Đã hoàn thành', count: 3 },
  { key: 'cancelled', label: 'Đã hủy', count: 0 },
];

export const TripHistoryScreenNAV_ITEMS = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: 'home' as const,
    route: '/(main)/home' as const,
  },
  {
    id: 'history',
    label: 'Lịch sử',
    icon: 'receipt-long' as const,
    route: '/(main)/trip-history' as const,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: 'notifications' as const,
    route: '/(main)/notifications' as const,
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    icon: 'person' as const,
    route: '/(main)/profile' as const,
  },
];

export const TripHistoryScreenLogoImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKts7gRzxCgR0RmXLFxFodyCoNLvyNQkqQrHZY8mCJ3uKrofv078vuzJ-ctrQTi20OAFeZ740Wsy3dN4b2IUtvnPkbmdgFOjlyMCc9SYFgqg92DeylRW2OEkTCK_L9LBA7gNxPaqqP2PRDmOo3rHSsTwVJ2CeJOfzrsye3m7mDDt5LFLklT5gdRebrpM9qshQ6vJysCkmIkIzSLLDXuTcmyV3MdSHrOpKgN1ss7ydY3e9oLwFy51a3yA',
};

export const TripHistoryScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqkRIR-v2cj8V99VoobI3s3HnoAAfX3EdLZzlwdOVo88LpQGV9uPNbxGWZNa5DUDyMMQXkgJhkcPlnG05MwJTi-NPfjQRFBWPnt6rD3I4UDpPHwapL_X-ZRHUYpz1wHqEF3zWLdiZGKzYphooGgqADV3ZJncUo4aaVDUSvNu9o6YencP7yHFwGhSf2n1X3GObSHiAobZVpGWenSj2OoxIdq4HUr5H5Q6BzlDW0R5OG40py9atZERTQqA',
};

export const TripHistoryScreenACTIVE_NAV = 'history';

export const VehicleInspectionScreenCAPTURE_SLOTS: VehicleInspectionScreenCaptureSlot[] = [
  {
    id: 'front',
    title: '1. Đầu xe',
    subtitle: 'Góc trước bên phụ',
    footer: '22:45 • GPS OK',
    badge: 'Đã lưu',
    captured: true,
    image: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-43iCrhWTrPMs3iZ3NgMWyiRxlx_eoF0hl6INlA5i_WAxUVy8-byeWuKbJFf2CSuMVqiXPgoLLpaJWp6jljmsCNQkflgEYonCfO2jCoLSzSrHZrsK6jj_BZfB8PXoHUcS2mKfLPfaXgY0U1Xo2GbH5QHfO21XHTVSPJC5sb-XMo5IuGvUm_WUdTIufX343mwSQJOwLD1VSk_dimbp6oilNiIBwzbIbYioBg2Sdk9Z4N9Ly87xIqZOBQ',
    },
  },
  {
    id: 'rear',
    title: '2. Đuôi xe',
    subtitle: 'Biển số & cản sau',
    footer: 'Đuôi xe & Biển số',
    badge: 'Đã lưu',
    captured: true,
    image: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxoS3NQJs-8vAZPawpK0npdqvDfi1wvGcJ9vW0x7hqdHWbpXWNggrVd1qUiAZbjj4Sj3WVjQL8VJ2gWfcrWl1g_bip8OKE6e7cAQA_j2egiTp_M0Et-hdsLwMRtc6hBuUvvKaW7yXp6_-aTte_jl4ij4E0Wyj6VyxB2anlQLsdonuKjF_9TAkd9LjATMrpGtB5UGDJCsKIkg9cqyE6QCG3KyFMsxC-eEopmjSkYbR4p79NVNNuGrWe4A',
    },
  },
  {
    id: 'left',
    title: '3. Sườn trái',
    subtitle: 'Bắt buộc chụp',
    footer: '',
    captured: false,
  },
  {
    id: 'right',
    title: '4. Sườn phải',
    subtitle: 'Bắt buộc chụp',
    footer: '',
    captured: false,
  },
  {
    id: 'interior',
    title: '5. Nội thất',
    subtitle: 'Khoang lái nguyên vẹn',
    footer: 'Khoang lái & ghế',
    badge: 'Đã lưu',
    captured: true,
    image: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByT1go8Fa_dw_ljLQTwPilaarsF6bhkzO43lr-CC4EA1FWzEoO7rWZo3OY_rLGiIYnMMYYuVRVjaeCrpU0Gi0x1amytlk-yD7QHoE_mxROHs-wehj9n7-fBQgyGZF3WLjym-m0fb6WeJUdeXXLqvHaxdhpefB9kgals_GKyGbJglbYAORyPlXntuatd7aVDM3yLQC1KYFhV1uiOdJmKUtZ1LgwpoN1pRDyxAclrZ6Wsf_u-X4i_60hoA',
    },
  },
  {
    id: 'odometer',
    title: '6. Đồng hồ km',
    subtitle: '45.210 km ODO',
    footer: 'Xăng: 85%',
    badge: '45.210 km',
    captured: true,
    image: {
      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANHL3XRm36kUaVOcnJlvCnJcln37DJz-ZouLqI8oRWD098BF0D_i51NdlaFFAsSs5w5AwRj_gv9QqtGCEDXDYLBAZECw_Y4yYz-sgeFvjlE5T5Kk6gTZS8RG48cb6rknPYLnvkClxUMrmNiZFhZLhDTyWMylmPmQ6y79LQ2e0DePTCdkP4eskk-CgP87faebTsDqrOOdvLnps7904cVSz6vp3jDiANIlckpEYZ8aFPu914ywGYgqhn8Q',
    },
  },
];

export const VehicleInspectionScreenCOMPARE_IMAGES = {
  pickup: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzMtUs_anU1IgiEYpUwocraxLCbONAtzF8ZQsakHXHz09XJ4Zc6j5ijhdCqfCze6RJAQjuFgkbg2P7R09aZUc4UUx4KE8LGwkJ8tq9YthSaflqNnCcP66-KT9jPn4bjOqLHWt3lKge4TOky_7acjGzlqRqk7WBVO1xjkmqAukAWhw7UKriST3zTCI4xCB8NO5APYoD6DrJ0yhH5l1J0piSkXPLNgEODOrnmSyRW0ar43dkR73ZUnXxUg',
  },
  dropoff: {
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB86dp3vLTm8dHDHpv8ss0uGHNEeWm7pahfTY4on5twSx6AOdx4j43yyPiAMPsKO-LBFagWtZvJyPfLKSQKLZUVsl_Zx2ZPHFQV1cQ6YP43NGgOedhwMi_J1RiawB2PB99db4GjQCq1lUfLZmrItX3eso95XpqLNZOtR_a6e2nwNFwys_2PyrjQ4nMUVchWJX9zHjws7FE-_Z-TpQ_KOyKnIH4ZcThdkKvhXAvluJ_1tpcnNz828vP0FQ',
  },
};

export const VehicleInspectionScreenProfileImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq9RkRiH3N-9tJ7-M4DSEY0RFIvV13E6X24gkJbx8X3B_o6a2M40qG436o6LXGO2R6ldEWU-X9wW30KZo_QY9d0kGvLAGygvIB_LZRzx1-7cv2wTSVqa-S7qw6tiAfNggqBujWs7WvugrqDsXyjjG28VhkWlEIRBBHMQx8capwR5U6fOHyEsDB5pd_p4R3Godm-vkXv0h0-PkgJCNj1soHDJC-FwYNI8uROjvv3Se0L-8U-58XDe0kGQ',
};


export const FindDriverScreenTRUST_TILES = [
  {
    id: 'rating',
    image: FindDriverScreenTrustDriverImage,
    title: 'Chuẩn 5 sao',
    meta: 'Hồ sơ xác minh',
  },
  {
    id: 'car-keeping',
    image: FindDriverScreenTrustKeyImage,
    title: 'Giữ xe an toàn',
    meta: 'Bàn giao tận tay',
  },
];
