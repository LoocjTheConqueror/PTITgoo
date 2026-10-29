import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
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

type ApprovalState = 'pending' | 'rejected' | 'approved';

const HEADER_COLOR = colors.driverHeader;
const DRIVER_PORTRAIT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD-vpsiwPB0A2vHr4nOHsQZgwxdqwU67k_jPtW-Pv_QH4jfVULwG0USZ3-MMPnVAlkHYNKZgQTxtlruuaZel2dIQ9L0XNw-9_eO-xxPCoi0O0pv7SQfc5dMwS680n_5xymb54vtbB7vYqnMqHQcRGz1xuXNGLHIo0LgFzJYnDL3pJfhW8dEmU1wtwZz4ZT1TehwDO9pE5hQ0zMHzQz8975f61Eo3hrCSadeelDLuk9Dd01qOL3JmFb25w';

const APPROVAL_TABS: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: ApprovalState;
}[] = [
  { value: 'pending', label: 'Chờ duyệt', icon: 'pending-actions' },
  { value: 'rejected', label: 'Bị từ chối', icon: 'cancel' },
  { value: 'approved', label: 'Đã duyệt', icon: 'check-circle' },
];

export default function ApprovalStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeState, setActiveState] = useState<ApprovalState>('pending');

  const callSupport = async () => {
    try {
      await Linking.openURL('tel:19006868');
    } catch {
      Alert.alert('Không thể thực hiện cuộc gọi', 'Vui lòng gọi tổng đài 1900 6868.');
    }
  };

  const openLicenseUpload = () => {
    router.push('/(auth)/license-upload' as never);
  };

  const openDriverApp = () => {
    router.replace('/(tabs)/home' as never);
  };

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
            Cài Đặt Tài Xế
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.driverCard} variant="surface">
          <View style={styles.driverIdentity}>
            <Image
              accessibilityLabel="Ảnh đại diện tài xế Nguyễn Văn Tuấn"
              resizeMode="cover"
              source={{ uri: DRIVER_PORTRAIT }}
              style={styles.driverPortrait}
            />
            <View style={styles.driverCopy}>
              <View style={styles.driverNameRow}>
                <Text numberOfLines={1} style={styles.driverName}>
                  Nguyễn Văn Tuấn
                </Text>
                <MaterialIcons
                  color={colors.primary}
                  name="verified"
                  size={fontSize.iconMd}
                />
              </View>
              <Text numberOfLines={1} style={styles.driverMeta}>
                Mã đối tác: #DRV-84920 • Hạng B2
              </Text>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Sync</Text>
          </View>
        </Card>

        <View accessibilityRole="tablist" style={styles.tabs}>
          {APPROVAL_TABS.map((tab) => {
            const selected = activeState === tab.value;

            return (
              <Pressable
                key={tab.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setActiveState(tab.value)}
                style={[styles.tab, selected && styles.tabSelected]}
              >
                <MaterialIcons
                  color={selected ? colors.primary : colors.onSurfaceVariant}
                  name={tab.icon}
                  size={fontSize.iconMd}
                />
                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeState === 'pending' ? (
          <PendingPanel />
        ) : activeState === 'rejected' ? (
          <RejectedPanel onResubmit={openLicenseUpload} />
        ) : (
          <ApprovedPanel onContinue={openDriverApp} />
        )}

        <SafetyStandardsCard />

        <Card style={styles.supportCard} variant="surface">
          <View style={styles.supportIdentity}>
            <View style={styles.supportIcon}>
              <MaterialIcons
                color={colors.primary}
                name="support-agent"
                size={fontSize.iconXl}
              />
            </View>
            <View style={styles.supportCopy}>
              <Text style={styles.supportLabel}>
                Tổng đài hỗ trợ đối tác 24/7
              </Text>
              <Pressable
                accessibilityLabel="Gọi tổng đài 1900 6868"
                accessibilityRole="link"
                onPress={() => void callSupport()}
              >
                <Text style={styles.supportPhone}>1900 6868</Text>
              </Pressable>
            </View>
          </View>
          <Button
            icon="call"
            iconPosition="leading"
            iconSize={fontSize.iconSm}
            label="Gọi ngay"
            numberOfLines={1}
            onPress={() => void callSupport()}
            style={styles.callButton}
            textStyle={styles.callButtonText}
          />
        </Card>
      </ScrollView>
      <View style={{ height: insets.bottom, backgroundColor: colors.background }} />
    </View>
  );
}

function PendingPanel() {
  return (
    <Card style={styles.statusCard} variant="surface">
      <View style={styles.statusTopRow}>
        <View style={styles.pendingIcon}>
          <MaterialIcons
            color={PENDING_COLOR}
            name="hourglass-top"
            size={fontSize.icon2xl}
          />
        </View>
        <View style={styles.pendingBadge}>
          <View style={styles.pendingDot} />
          <Text style={styles.pendingBadgeText}>Đang xác minh</Text>
        </View>
      </View>

      <Text style={styles.statusTitle}>Hồ sơ đang chờ phê duyệt</Text>
      <Text style={styles.statusDescription}>
        Dự kiến phản hồi trong 2-4 giờ làm việc. Nhân viên hỗ trợ đang đối chiếu
        GPLX và lý lịch.
      </Text>

      <Card style={styles.progressCard} variant="muted">
        <View style={styles.progressHeading}>
          <Text style={styles.progressTitle}>Tiến trình kiểm duyệt</Text>
          <Text style={styles.progressPercent}>65% Hoàn tất</Text>
        </View>
        <View
          accessibilityLabel="Tiến trình kiểm duyệt hồ sơ: 65 phần trăm"
          accessibilityRole="progressbar"
          style={styles.progressTrack}
        >
          <View style={styles.progressFill} />
        </View>
        <View style={styles.reviewSteps}>
          <ReviewStep
            label="Ảnh chân dung & Thẻ CCCD"
            status="Khớp chuẩn"
            state="complete"
          />
          <ReviewStep
            label="Giấy phép lái xe (GPLX B2)"
            status="Đang tra cứu"
            state="active"
          />
          <ReviewStep
            label="Xác minh tư pháp số 2"
            status="Chờ xử lý"
            state="waiting"
          />
        </View>
      </Card>

      <Card style={styles.trainingCard} variant="muted">
        <MaterialIcons
          color={colors.primary}
          name="nightlife"
          size={fontSize.iconXl}
        />
        <View style={styles.trainingCopy}>
          <Text style={styles.trainingTitle}>Đào tạo lái xe ban đêm</Text>
          <Text style={styles.trainingDescription}>
            Trong lúc chờ duyệt, bạn có thể xem trước sổ tay quy tắc phục vụ
            khách say xỉn.
          </Text>
        </View>
      </Card>
    </Card>
  );
}

function ReviewStep({
  label,
  state,
  status,
}: {
  label: string;
  state: 'complete' | 'active' | 'waiting';
  status: string;
}) {
  return (
    <View style={[styles.reviewStep, state === 'waiting' && styles.reviewStepWaiting]}>
      {state === 'complete' ? (
        <MaterialIcons
          color={colors.success}
          name="check-circle"
          size={fontSize.iconMd}
        />
      ) : (
        <View
          style={[
            styles.stepNumber,
            state === 'active' ? styles.stepNumberActive : styles.stepNumberWaiting,
          ]}
        >
          <Text
            style={[
              styles.stepNumberText,
              state === 'active' ? styles.activeNumberText : styles.waitingNumberText,
            ]}
          >
            {state === 'active' ? '2' : '3'}
          </Text>
        </View>
      )}
      <Text numberOfLines={2} style={styles.reviewStepLabel}>
        {label}
      </Text>
      <Text
        style={[
          styles.reviewStepStatus,
          state === 'complete' && styles.completeText,
          state === 'active' && styles.activeText,
          state === 'waiting' && styles.waitingText,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

function RejectedPanel({ onResubmit }: { onResubmit: () => void }) {
  return (
    <Card style={styles.statusCard} variant="surface">
      <View style={styles.statusTopRow}>
        <View style={styles.rejectedIcon}>
          <MaterialIcons
            color={colors.error}
            name="error"
            size={fontSize.icon2xl}
          />
        </View>
        <View style={styles.rejectedBadge}>
          <MaterialIcons
            color={colors.onErrorContainer}
            name="cancel"
            size={fontSize.iconSm}
          />
          <Text style={styles.rejectedBadgeText}>Cần bổ sung</Text>
        </View>
      </View>

      <Text style={styles.statusTitle}>Hồ sơ chưa đạt yêu cầu</Text>
      <Text style={styles.statusDescription}>
        Hệ thống không thể đọc trọn vẹn thông tin trên hồ sơ của bạn. Vui lòng
        kiểm tra lý do chi tiết dưới đây:
      </Text>

      <Card style={styles.rejectionReason} variant="muted">
        <MaterialIcons
          color={colors.error}
          name="warning"
          size={fontSize.iconXl}
        />
        <View style={styles.rejectionCopy}>
          <Text style={styles.rejectionTitle}>Chi tiết lỗi phát hiện</Text>
          <Text style={styles.rejectionDescription}>
            Ảnh chụp mặt sau GPLX bị mờ số và lóa đèn flash. Các thông số hạng xe
            và niên hạn không hiển thị rõ ràng.
          </Text>
        </View>
      </Card>

      <Card style={styles.guidanceCard} variant="muted">
        <Text style={styles.guidanceTitle}>Hướng dẫn chụp lại hợp lệ</Text>
        <View style={styles.guidanceRow}>
          <GuidanceTip
            description="Tránh chói mờ số"
            icon="flash-off"
            title="Tắt đèn Flash"
            variant="error"
          />
          <GuidanceTip
            description="Đặt trên mặt phẳng tối"
            icon="crop-free"
            title="Đủ 4 góc thẻ"
            variant="success"
          />
        </View>
      </Card>

      <Button
        icon="upload-file"
        iconPosition="leading"
        iconSize={fontSize.iconLg}
        label="Nộp lại hồ sơ"
        onPress={onResubmit}
        style={styles.actionButton}
        textStyle={styles.actionButtonText}
      />
    </Card>
  );
}

function GuidanceTip({
  description,
  icon,
  title,
  variant,
}: {
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  variant: 'error' | 'success';
}) {
  const iconColor = variant === 'error' ? colors.error : colors.success;

  return (
    <View style={styles.guidanceTip}>
      <MaterialIcons color={iconColor} name={icon} size={fontSize.iconXl} />
      <Text style={styles.guidanceTipTitle}>{title}</Text>
      <Text style={styles.guidanceTipDescription}>{description}</Text>
    </View>
  );
}

function ApprovedPanel({ onContinue }: { onContinue: () => void }) {
  return (
    <Card style={styles.statusCard} variant="surface">
      <View style={styles.statusTopRow}>
        <View style={styles.approvedIcon}>
          <MaterialIcons
            color={colors.success}
            name="verified-user"
            size={fontSize.icon2xl}
          />
        </View>
        <View style={styles.approvedBadge}>
          <MaterialIcons
            color={colors.onPrimary}
            name="done-all"
            size={fontSize.iconSm}
          />
          <Text style={styles.approvedBadgeText}>Sẵn sàng hoạt động</Text>
        </View>
      </View>

      <Text style={styles.statusTitle}>
        Chúc mừng bạn đã trở thành Tài xế Đối tác!
      </Text>
      <Text style={styles.statusDescription}>
        Tài khoản lái xe hộ của bạn đã được kích hoạt đầy đủ quyền hạn trên hệ
        thống trực ban toàn quốc.
      </Text>

      <Card style={styles.perksCard} variant="muted">
        <PerkRow
          icon="security"
          iconBackground={colors.primaryFixed}
          title="Bảo hiểm trách nhiệm 2 tỷ ₫"
          description="Tự động kích hoạt khi mở nhận chuyến xe"
        />
        <PerkRow
          icon="payments"
          iconBackground={SUCCESS_TINT}
          title="Rút tiền tức thì 24/7"
          description="Thu nhập sau mỗi cuốc hoàn thành chuyển thẳng về ví"
        />
      </Card>

      <Button
        icon="near-me"
        iconPosition="leading"
        iconSize={fontSize.iconLg}
        label="Bắt đầu nhận cuốc ngay"
        onPress={onContinue}
        style={styles.actionButton}
        textStyle={styles.actionButtonText}
      />
    </Card>
  );
}

function PerkRow({
  description,
  icon,
  iconBackground,
  title,
}: {
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBackground: string;
  title: string;
}) {
  return (
    <View style={styles.perkRow}>
      <View style={[styles.perkIcon, { backgroundColor: iconBackground }]}>
        <MaterialIcons
          color={colors.onSurface}
          name={icon}
          size={fontSize.iconMd}
        />
      </View>
      <View style={styles.perkCopy}>
        <Text style={styles.perkTitle}>{title}</Text>
        <Text style={styles.perkDescription}>{description}</Text>
      </View>
    </View>
  );
}

function SafetyStandardsCard() {
  return (
    <Card style={styles.standardsCard} variant="muted">
      <View style={styles.standardsHeading}>
        <Text style={styles.standardsTitle}>Quy chuẩn tài xế lái xe hộ</Text>
        <MaterialIcons
          color={colors.outline}
          name="shield"
          size={fontSize.iconMd}
        />
      </View>
      <Text style={styles.standardsDescription}>
        Áp dụng tiêu chuẩn Nghị định 100/2019/NĐ-CP &amp; Luật TTATGTĐB 2024 để
        đảm bảo an toàn tối đa cho phương tiện và tính mạng hành khách.
      </Text>
      <View style={styles.safetyStats}>
        <SafetyStat label="Kinh nghiệm" value="≥ 2 năm" />
        <SafetyStat label="Nồng độ cồn" value="0.00 mg/L" valueStyle={styles.successText} />
        <SafetyStat label="Trang bị" value="Cam hành trình" />
      </View>
    </Card>
  );
}

function SafetyStat({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.safetyStat}>
      <Text numberOfLines={1} style={styles.safetyLabel}>
        {label}
      </Text>
      <Text numberOfLines={2} style={[styles.safetyValue, valueStyle]}>
        {value}
      </Text>
    </View>
  );
}

const PENDING_COLOR = '#b45309';
const PENDING_BG = '#fef3c7';
const SUCCESS_TINT = '#dcfce7';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: HEADER_COLOR,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    height: spacing.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
  },
  backButton: {
    width: spacing.iconButtonMd,
    height: spacing.iconButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.spaceSm,
  },
  headerTitle: {
    ...typography.headlineSm,
    flex: 1,
    color: colors.onPrimary,
    letterSpacing: -0.4,
  },
  profileIcon: {
    width: spacing.avatarMd,
    height: spacing.avatarMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    marginLeft: spacing.spaceSm,
  },
  scrollContent: {
    gap: spacing.spaceMd,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.spaceMd,
    paddingBottom: spacing.spaceXl,
  },
  driverCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
  },
  driverIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    minWidth: 0,
  },
  driverPortrait: {
    width: spacing.avatarLg,
    height: spacing.avatarLg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
  },
  driverCopy: {
    flex: 1,
    minWidth: 0,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  driverName: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flexShrink: 1,
  },
  driverMeta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xxs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryFixed,
  },
  liveDot: {
    width: spacing.gap1_5,
    height: spacing.gap1_5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  liveText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    padding: spacing.xxs,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryFixed,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tab: {
    minHeight: spacing.buttonHeight,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxs,
    borderRadius: borderRadius.lg,
  },
  tabSelected: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  tabTextSelected: {
    color: colors.primary,
  },
  statusCard: {
    gap: spacing.spaceMd,
    padding: spacing.spaceLg,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  pendingIcon: {
    width: spacing.iconButtonLg,
    height: spacing.iconButtonLg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: PENDING_BG,
    shadowColor: PENDING_COLOR,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap1_5,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: '#fffbeb',
  },
  pendingDot: {
    width: spacing.gap1_5,
    height: spacing.gap1_5,
    borderRadius: borderRadius.full,
    backgroundColor: '#f59e0b',
  },
  pendingBadgeText: {
    ...typography.labelSm,
    color: PENDING_COLOR,
  },
  rejectedIcon: {
    width: spacing.iconButtonLg,
    height: spacing.iconButtonLg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.errorContainer,
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorContainer,
  },
  rejectedBadgeText: {
    ...typography.labelSm,
    color: colors.onErrorContainer,
  },
  approvedIcon: {
    width: spacing.iconButtonLg,
    height: spacing.iconButtonLg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: SUCCESS_TINT,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: spacing.py1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  approvedBadgeText: {
    ...typography.labelSm,
    color: colors.onPrimary,
  },
  statusTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  statusDescription: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  progressCard: {
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
    backgroundColor: colors.primary10,
  },
  progressHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
  },
  progressTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  progressPercent: {
    ...typography.labelLg,
    color: colors.primary,
  },
  progressTrack: {
    height: spacing.gap1_5,
    overflow: 'hidden',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  progressFill: {
    width: '65%',
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  reviewSteps: {
    gap: spacing.spaceSm,
  },
  reviewStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  reviewStepWaiting: {
    opacity: 0.6,
  },
  stepNumber: {
    width: spacing.buttonMdHeight / 2.4,
    height: spacing.buttonMdHeight / 2.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  stepNumberActive: {
    backgroundColor: PENDING_BG,
  },
  stepNumberWaiting: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  stepNumberText: {
    ...typography.labelSm,
    fontWeight: '600',
  },
  activeNumberText: {
    color: PENDING_COLOR,
  },
  waitingNumberText: {
    color: colors.onSurfaceVariant,
  },
  reviewStepLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  reviewStepStatus: {
    ...typography.labelSm,
    textAlign: 'right',
  },
  completeText: {
    color: colors.success,
  },
  activeText: {
    color: PENDING_COLOR,
  },
  waitingText: {
    color: colors.onSurfaceVariant,
  },
  trainingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
    backgroundColor: colors.secondaryFixed,
  },
  trainingCopy: {
    flex: 1,
    minWidth: 0,
  },
  trainingTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  trainingDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xxs,
  },
  rejectionReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
    backgroundColor: colors.errorContainer,
  },
  rejectionCopy: {
    flex: 1,
  },
  rejectionTitle: {
    ...typography.labelLg,
    color: colors.onErrorContainer,
    marginBottom: spacing.xxs,
  },
  rejectionDescription: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
  },
  guidanceCard: {
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
  },
  guidanceTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  guidanceRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  guidanceTip: {
    minHeight: 100,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap1,
    padding: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  guidanceTipTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  guidanceTipDescription: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actionButton: {
    height: spacing.ctaHeight,
    borderRadius: borderRadius.xl,
  },
  actionButtonText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  perksCard: {
    gap: spacing.spaceMd,
    padding: spacing.spaceMd,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  perkIcon: {
    width: spacing.avatarMd,
    height: spacing.avatarMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  perkCopy: {
    flex: 1,
    minWidth: 0,
  },
  perkTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  perkDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xxs,
  },
  standardsCard: {
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
    backgroundColor: colors.primary10,
  },
  standardsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  standardsTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  standardsDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  safetyStats: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    paddingTop: spacing.xxs,
  },
  safetyStat: {
    minHeight: 64,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    padding: spacing.spaceSm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  safetyLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  safetyValue: {
    ...typography.labelLg,
    color: colors.onSurface,
    textAlign: 'center',
  },
  successText: {
    color: colors.success,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.spaceSm,
    padding: spacing.spaceMd,
  },
  supportIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    minWidth: 0,
  },
  supportIcon: {
    width: spacing.iconButtonMd,
    height: spacing.iconButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  supportCopy: {
    flex: 1,
    minWidth: 0,
  },
  supportLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  supportPhone: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  callButton: {
    width: 116,
    height: spacing.buttonMdHeight,
    borderRadius: borderRadius.xl,
  },
  callButtonText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
});
