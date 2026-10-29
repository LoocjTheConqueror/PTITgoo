import {
  borderRadius,
  Card,
  colors,
  fontSize,
  ProfileScreenSERVICE_SECTION,
  ProfileScreenSUPPORT_SECTION,
  ProfileScreenTONE_STYLES,
  signOutFirebase,
  spacing,
  typography,
} from '@datxe/shared';
import type { ProfileScreenMenuItem } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HEADER_SAFETY_ACTION_WIDTH, HeaderLabeledIconButton, ScreenHeader } from '../components/ScreenHeader';
import { getCustomerDisplayName, getCustomerInitials } from '../utils/customerName';
import {
  getCustomerProfile,
  getCustomerRideCount,
  getCustomerVehicles,
  getCustomerVouchers,
  deleteCustomerAccount,
  getUnreadNotificationCount,
  updateCustomerProfile,
  uploadCustomerProfileAvatar,
  type CustomerProfile,
  type PaymentMethod,
} from '../services/customerApi';
import { CustomerTabBar } from '../components/CustomerTabBar';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [rideCount, setRideCount] = useState<number | null>(null);
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [voucherCount, setVoucherCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editError, setEditError] = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftDateOfBirth, setDraftDateOfBirth] = useState('');
  const [draftGender, setDraftGender] = useState('');
  const [draftPaymentMethod, setDraftPaymentMethod] = useState<PaymentMethod | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);
      setLoadError('');

      void Promise.allSettled([
        getCustomerProfile(),
        getCustomerRideCount(),
        getCustomerVehicles(),
        getCustomerVouchers(),
        getUnreadNotificationCount(),
      ]).then(([profileResult, rideResult, vehicleResult, voucherResult, unreadResult]) => {
        if (!mounted) return;
        const failures: unknown[] = [];
        if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
        else failures.push(profileResult.reason);
        if (rideResult.status === 'fulfilled') setRideCount(rideResult.value);
        else failures.push(rideResult.reason);
        if (vehicleResult.status === 'fulfilled') setVehicleCount(vehicleResult.value.length);
        else failures.push(vehicleResult.reason);
        if (voucherResult.status === 'fulfilled') setVoucherCount(voucherResult.value.length);
        else failures.push(voucherResult.reason);
        if (unreadResult.status === 'fulfilled') setUnreadCount(unreadResult.value);
        if (failures.length > 0) setLoadError(getApiErrorMessage(failures[0]));
        setLoading(false);
      });

      return () => {
        mounted = false;
      };
    }, [reloadKey]),
  );

  const openEdit = () => {
    if (!profile) return;
    setDraftName(profile.full_name ?? '');
    setDraftEmail(profile.email ?? '');
    setDraftDateOfBirth(profile.date_of_birth ?? '');
    setDraftGender(profile.gender ?? '');
    setDraftPaymentMethod(profile.default_payment_method === 'CASH' ? 'CASH' : null);
    setEditError('');
    setEditVisible(true);
  };

  const changeAvatar = async () => {
    if (uploadingAvatar || !profile) return;
    setUploadingAvatar(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      setProfile(await uploadCustomerProfileAvatar({ uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType }));
      Alert.alert('Đã cập nhật ảnh', 'Ảnh đại diện đã được lưu vào hồ sơ.');
    } catch (error) {
      Alert.alert('Không thể cập nhật ảnh', getApiErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    const fullName = draftName.trim();
    const email = draftEmail.trim();
    const dateOfBirth = draftDateOfBirth.trim();
    if (!fullName) {
      setEditError('Họ và tên không được để trống.');
      return;
    }
    if (fullName.length > 255) {
      setEditError('Họ và tên không được dài quá 255 ký tự.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEditError('Email không đúng định dạng.');
      return;
    }
    if (email.length > 255) {
      setEditError('Email không được dài quá 255 ký tự.');
      return;
    }
    if (dateOfBirth && !isPastIsoDate(dateOfBirth)) {
      setEditError('Ngày sinh phải theo định dạng YYYY-MM-DD và nằm trong quá khứ.');
      return;
    }

    setSaving(true);
    setEditError('');
    try {
      const updated = await updateCustomerProfile({
        full_name: fullName,
        email: email || null,
        date_of_birth: dateOfBirth || null,
        gender: draftGender || null,
        default_payment_method: draftPaymentMethod,
      });
      setProfile(updated);
      setEditVisible(false);
      Alert.alert('Đã cập nhật', 'Thông tin tài khoản đã được lưu.');
    } catch (error) {
      setEditError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (deletingAccount) return;
    setDeletingAccount(true);
    setDeleteError('');
    try {
      await deleteCustomerAccount();
      await signOutFirebase();
      router.replace('/(auth)/login' as never);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    } finally {
      setDeletingAccount(false);
    }
  };

  const profileStats = [
    { id: 'trips', value: countLabel(rideCount), label: 'Chuyến đi', tone: 'primary' as const },
    { id: 'vehicles', value: countLabel(vehicleCount), label: 'Xe đã lưu', tone: 'surface' as const },
    { id: 'vouchers', value: countLabel(voucherCount), label: 'Ưu đãi', tone: 'tertiary' as const },
  ];

  const serviceItems = ProfileScreenSERVICE_SECTION.map((item) => {
    if (item.id === 'vehicles') {
      const count = vehicleCount;
      return {
        ...item,
        subtitle: count === null ? 'Đang tải dữ liệu xe' : `${count} xe đã lưu`,
        badge: { label: count === null ? '…' : `${count} xe` },
      };
    }
    if (item.id === 'vouchers') {
      const count = voucherCount;
      return {
        ...item,
        subtitle: count === null
          ? 'Đang tải ưu đãi'
          : count === 0 ? 'Chưa có ưu đãi khả dụng' : `${count} ưu đãi đang khả dụng`,
        badge: {
          label: count === null ? '…' : `${count} ưu đãi`,
          highlighted: count !== null && count > 0,
        },
      };
    }
    if (item.id === 'payments') {
      return {
        ...item,
        subtitle: `Mặc định: ${getPaymentMethodLabel(profile?.default_payment_method ?? null)}`,
      };
    }
    return item;
  });

  const renderMenuItem = (item: ProfileScreenMenuItem) => {
    const tone = ProfileScreenTONE_STYLES[item.tone];
    return (
      <Card
        key={item.id}
        accessibilityLabel={item.title}
        onPress={() => {
          if (item.route) router.push(item.route as never);
          else if (item.id === 'payments') openEdit();
          else if (item.id === 'help') router.push({ pathname: '/(main)/support', params: { topic: 'help' } });
          else if (item.id === 'safety') router.push({ pathname: '/(main)/support', params: { topic: 'safety' } });
        }}
        style={styles.menuRow}
      >
        <View style={styles.menuLeft}>
          <View
            style={[
              styles.menuIconBox,
              { backgroundColor: colors[tone.box as keyof typeof colors] },
            ]}
          >
            <MaterialIcons
              name={item.icon}
              size={fontSize.icon2xl}
              color={colors[tone.icon as keyof typeof colors]}
            />
          </View>
          <View style={styles.menuCopy}>
            <Text style={styles.menuTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.menuSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.menuRight}>
          {item.badge ? (
            <View
              style={[
                styles.menuBadge,
                item.badge.highlighted && styles.menuBadgeHighlighted,
              ]}
            >
              <Text
                style={[
                  styles.menuBadgeText,
                  item.badge.highlighted && styles.menuBadgeTextHighlighted,
                ]}
              >
                {item.badge.label}
              </Text>
            </View>
          ) : null}
          <MaterialIcons
            name="chevron-right"
            size={fontSize.iconLg}
            color={colors.outline}
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Hồ sơ"
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
        {loading && !profile ? <ActivityIndicator color={colors.primary} /> : null}
        {loadError ? (
          <Pressable onPress={() => setReloadKey((key) => key + 1)} style={styles.loadErrorBox}>
            <Text accessibilityRole="alert" style={styles.loadErrorText}>{loadError}</Text>
            <Text style={styles.retryText}>Chạm để thử lại</Text>
          </Pressable>
        ) : null}

        <Card style={styles.identityCard}>
          <View style={styles.identityRow}>
            <Pressable accessibilityLabel="Thay đổi ảnh đại diện" disabled={uploadingAvatar || !profile} onPress={() => void changeAvatar()} style={styles.avatarWrap}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitials}>{getCustomerInitials(profile?.full_name)}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>{uploadingAvatar ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <MaterialIcons name="photo-camera" size={fontSize.iconSm} color={colors.onPrimary} />}</View>
            </Pressable>
            <View style={styles.identityCopy}>
              <Text style={styles.userName} numberOfLines={2}>
                {getCustomerDisplayName(profile?.full_name) || 'Khách hàng'}
              </Text>
              {profile?.phone_number ? <Text style={styles.userPhone}>{profile.phone_number}</Text> : <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/add-phone-number' as never)}><Text style={styles.phoneLink}>Thêm số điện thoại</Text></Pressable>}
              <Text style={styles.userEmail} numberOfLines={1}>
                {profile?.email || 'Chưa cập nhật email'}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Chỉnh sửa thông tin"
              disabled={!profile}
              onPress={openEdit}
              style={styles.editButton}
            >
              <MaterialIcons
                name="edit"
                size={fontSize.iconLg}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          </View>

          <View style={styles.statsGrid}>
            {profileStats.map((stat) => (
              <View key={stat.id} style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    stat.tone === 'primary' && styles.statValuePrimary,
                    stat.tone === 'tertiary' && styles.statValueTertiary,
                  ]}
                >
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dịch vụ &amp; Xe</Text>
          {serviceItems.map(renderMenuItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hỗ trợ &amp; An toàn</Text>
          {ProfileScreenSUPPORT_SECTION.map(renderMenuItem)}
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityLabel="Đăng xuất"
            onPress={() => setLogoutVisible(true)}
            style={styles.logoutButton}
          >
            <MaterialIcons
              name="logout"
              size={fontSize.iconXl}
              color={colors.onSurfaceVariant}
            />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => { setDeleteError(''); setDeleteVisible(true); }}
            style={({ pressed }) => [styles.deleteAccountButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.deleteAccountText}>Xóa tài khoản</Text>
          </Pressable>
          <View style={styles.legalLinks}>
            <Pressable accessibilityRole="link" onPress={() => router.push('/terms-of-service' as never)}>
              <Text style={styles.legalLinkText}>Điều khoản dịch vụ</Text>
            </Pressable>
            <Text style={styles.legalSeparator}>·</Text>
            <Pressable accessibilityRole="link" onPress={() => router.push('/privacy-policy' as never)}>
              <Text style={styles.legalLinkText}>Chính sách bảo mật</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <CustomerTabBar active="profile" unreadCount={unreadCount} />

      <Modal
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
        transparent
        visible={editVisible}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.editDialogCard}>
            <Text style={styles.dialogTitle}>Chỉnh sửa thông tin</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.editLabel}>Họ và tên</Text>
              <TextInput
                autoCapitalize="words"
                maxLength={255}
                onChangeText={setDraftName}
                placeholder="Nguyễn Văn An"
                style={styles.editInput}
                value={draftName}
              />

              <Text style={styles.editLabel}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                maxLength={255}
                onChangeText={setDraftEmail}
                placeholder="email@example.com"
                style={styles.editInput}
                value={draftEmail}
              />

              <Text style={styles.editLabel}>Ngày sinh (YYYY-MM-DD)</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setDraftDateOfBirth}
                placeholder="1995-08-20"
                style={styles.editInput}
                value={draftDateOfBirth}
              />

              <Text style={styles.editLabel}>Giới tính</Text>
              <View style={styles.editChoices}>
                {[
                  { value: 'MALE', label: 'Nam' },
                  { value: 'FEMALE', label: 'Nữ' },
                  { value: 'OTHER', label: 'Khác' },
                ].map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setDraftGender(draftGender === option.value ? '' : option.value)}
                    style={[styles.editChoice, draftGender === option.value && styles.editChoiceSelected]}
                  >
                    <Text style={[styles.editChoiceText, draftGender === option.value && styles.editChoiceTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.editLabel}>Phương thức thanh toán mặc định</Text>
              <View style={styles.editChoices}>
                {([['CASH', 'Tiền mặt']] as const).map(([value, label]) => (
                  <Pressable
                    key={value}
                    onPress={() => setDraftPaymentMethod(draftPaymentMethod === value ? null : value)}
                    style={[styles.editChoice, draftPaymentMethod === value && styles.editChoiceSelected]}
                  >
                    <Text style={[styles.editChoiceText, draftPaymentMethod === value && styles.editChoiceTextSelected]}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.dialogHint}>Backend hiện chỉ xử lý thanh toán tiền mặt khi đặt chuyến.</Text>

              {editError ? <Text accessibilityRole="alert" style={styles.errorText}>{editError}</Text> : null}
            </ScrollView>
            <View style={styles.dialogActions}>
              <Pressable
                disabled={saving}
                onPress={() => setEditVisible(false)}
                style={[styles.dialogButton, styles.dialogButtonGhost]}
              >
                <Text style={styles.dialogButtonGhostText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={saving}
                onPress={() => void saveProfile()}
                style={[styles.dialogButton, styles.dialogButtonPrimary, saving && styles.buttonDisabled]}
              >
                <Text style={styles.dialogButtonPrimaryText}>{saving ? 'Đang lưu...' : 'Lưu thông tin'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => { if (!deletingAccount) setDeleteVisible(false); }}
        transparent
        visible={deleteVisible}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.deleteDialogCard}>
            <View style={styles.dialogIcon}><MaterialIcons name="delete-outline" size={fontSize.icon2xl} color={colors.error} /></View>
            <Text style={styles.dialogTitle}>Xóa tài khoản?</Text>
            <Text style={styles.deleteDialogText}>Backend sẽ ẩn danh hồ sơ và xóa số điện thoại, ảnh đại diện, ảnh xe đã lưu. Lịch sử chuyến vẫn được giữ lại. Bạn không thể hoàn tác thao tác này.</Text>
            <Text style={styles.deleteDialogText}>Không thể xóa khi bạn còn chuyến chưa kết thúc.</Text>
            {deleteError ? <Text accessibilityRole="alert" style={styles.errorText}>{deleteError}</Text> : null}
            <View style={styles.dialogActions}>
              <Pressable disabled={deletingAccount} onPress={() => setDeleteVisible(false)} style={[styles.dialogButton, styles.dialogButtonGhost]}>
                <Text style={styles.dialogButtonGhostText}>Giữ tài khoản</Text>
              </Pressable>
              <Pressable disabled={deletingAccount} onPress={() => void confirmDeleteAccount()} style={[styles.dialogButton, styles.deleteConfirmButton, deletingAccount && styles.buttonDisabled]}>
                {deletingAccount ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.dialogButtonPrimaryText}>Xóa tài khoản</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setLogoutVisible(false)}
        transparent
        visible={logoutVisible}
      >
        <Pressable
          onPress={() => setLogoutVisible(false)}
          style={styles.dialogOverlay}
        >
          <Pressable style={styles.dialogCard}>
            <View style={styles.dialogIcon}>
              <MaterialIcons
                name="logout"
                size={fontSize.icon2xl}
                color={colors.error}
              />
            </View>
            <View style={styles.dialogCopy}>
              <Text style={styles.dialogTitle}>
                Bạn có chắc muốn đăng xuất?
              </Text>
              <Text style={styles.dialogMeta}>
                Thông tin chuyến đi và voucher đang lưu sẽ vẫn an toàn khi bạn
                đăng nhập lại.
              </Text>
            </View>
            <View style={styles.dialogActions}>
              <Pressable
                onPress={() => setLogoutVisible(false)}
                style={[styles.dialogButton, styles.dialogButtonGhost]}
              >
                <Text style={styles.dialogButtonGhostText}>Ở lại</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void signOutFirebase()
                    .then(() => {
                      setLogoutVisible(false);
                      router.replace('/(auth)/login' as never);
                    })
                    .catch((error: unknown) => Alert.alert('Không thể đăng xuất', getApiErrorMessage(error)));
                }}
                style={[styles.dialogButton, styles.dialogButtonDanger]}
              >
                <Text style={styles.dialogButtonDangerText}>Đăng xuất</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function countLabel(value: number | null): string {
  return value === null ? '—' : new Intl.NumberFormat('vi-VN').format(value);
}

function getPaymentMethodLabel(method: PaymentMethod | null): string {
  if (method === 'CASH') return 'Tiền mặt';
  if (method === 'WALLET') return 'Ví';
  if (method === 'VNPAY') return 'VNPay';
  if (method === 'MOMO') return 'MoMo';
  return 'Chưa thiết lập';
}

function isPastIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
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
    paddingTop: spacing.spaceMd,
    paddingBottom: spacing.spaceLg,
    gap: spacing.spaceLg,
  },
  identityCard: {
    gap: spacing.spaceMd,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
  },
  avatarWrap: {
    flexShrink: 0,
    position: 'relative',
  },
  avatar: {
    width: spacing.profileAvatar,
    height: spacing.profileAvatar,
    borderRadius: borderRadius.full,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  avatarInitials: {
    ...typography.headlineSm,
    color: colors.primary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  loadErrorBox: {
    padding: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.errorContainer,
  },
  loadErrorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
  retryText: {
    ...typography.labelMd,
    color: colors.error,
    marginTop: spacing.py1,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
    marginTop: spacing.spaceSm,
  },
  editDialogCard: {
    width: '100%',
    maxWidth: spacing.modalMaxWidth,
    maxHeight: '88%',
    alignSelf: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    padding: spacing.spaceMd,
    gap: spacing.spaceMd,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  editLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.spaceSm,
    marginBottom: spacing.py1,
  },
  dialogHint: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  editInput: {
    minHeight: spacing.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.spaceSm,
    color: colors.onSurface,
    backgroundColor: colors.surface,
  },
  editChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.spaceXs,
  },
  editChoice: {
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.spaceXs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  editChoiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  editChoiceText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  editChoiceTextSelected: {
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dialogButtonPrimary: {
    backgroundColor: colors.primary,
  },
  dialogButtonPrimaryText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  userName: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flexShrink: 1,
  },
  userPhone: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  phoneLink: {
    ...typography.labelMd,
    color: colors.primary,
  },
  userEmail: {
    ...typography.labelSm,
    color: colors.outline,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.px2_5,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.tertiaryFixed,
    marginTop: spacing.spaceXs,
  },
  memberPillText: {
    ...typography.labelSm,
    color: colors.onTertiaryFixed,
  },
  editButton: {
    width: spacing.editButton,
    height: spacing.editButton,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.spaceXs,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: spacing.spaceXs,
    paddingVertical: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  statValue: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  statValuePrimary: {
    color: colors.primary,
  },
  statValueTertiary: {
    color: colors.tertiary,
  },
  statLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  section: {
    gap: spacing.spaceSm,
  },
  sectionLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: spacing.letterSpacingWider,
    paddingHorizontal: spacing.spaceXs,
  },
  menuRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
    flex: 1,
    minWidth: 0,
  },
  menuIconBox: {
    width: spacing.menuIconBox,
    height: spacing.menuIconBox,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuCopy: {
    flex: 1,
    minWidth: 0,
  },
  menuTitle: {
    ...typography.bodyLgMedium,
    color: colors.onSurface,
  },
  menuSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
    flexShrink: 0,
  },
  menuBadge: {
    paddingHorizontal: spacing.px2,
    paddingVertical: spacing.py0_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
  },
  menuBadgeHighlighted: {
    backgroundColor: colors.tertiaryFixedDim,
  },
  menuBadgeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  menuBadgeTextHighlighted: {
    color: colors.onTertiaryFixed,
    fontWeight: '700',
  },
  footer: {
    paddingTop: spacing.spaceXs,
    gap: spacing.spaceMd,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    height: spacing.buttonMdHeight,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceSm,
  },
  logoutText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  deleteAccountButton: {
    width: '100%',
    height: spacing.buttonMdHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.error,
  },
  buttonPressed: { opacity: 0.8 },
  legalLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.spaceSm, paddingVertical: spacing.spaceXs },
  legalLinkText: { ...typography.labelSm, color: colors.primary, textDecorationLine: 'underline' },
  legalSeparator: { ...typography.labelSm, color: colors.onSurfaceVariant },
  deleteAccountText: {
    ...typography.labelLg,
    color: colors.onError,
  },
  tabBar: {
    height: spacing.headerHeight,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
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
  tabLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.margin,
    backgroundColor: colors.inverseSurface40,
  },
  dialogCard: {
    width: '100%',
    maxWidth: spacing.modalMaxWidth,
    alignSelf: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    padding: spacing.spaceMd,
    gap: spacing.spaceMd,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  deleteDialogCard: {
    width: '100%',
    maxWidth: spacing.modalMaxWidth,
    alignSelf: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    padding: spacing.spaceMd,
    gap: spacing.spaceMd,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  deleteDialogText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  dialogIcon: {
    width: spacing.editButton,
    height: spacing.editButton,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dialogCopy: {
    alignItems: 'center',
  },
  dialogTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: 'center',
  },
  dialogMeta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.py1,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  dialogButton: {
    flex: 1,
    height: spacing.buttonMdHeight,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogButtonGhost: {
    backgroundColor: colors.surfaceContainer,
  },
  dialogButtonGhostText: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  dialogButtonDanger: {
    backgroundColor: colors.error,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteConfirmButton: { backgroundColor: colors.error },
  dialogButtonDangerText: {
    ...typography.labelLg,
    color: colors.onError,
  },
});
