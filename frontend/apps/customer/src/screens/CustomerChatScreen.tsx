import { borderRadius, colors, spacing, typography } from '@datxe/shared';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderIconButton, ScreenHeader } from '../components/ScreenHeader';
import {
  getCustomerChatMessages,
  getCustomerRide,
  markCustomerChatRead,
  sendCustomerChatMessage,
  uploadCustomerChatImage,
} from '../services/customerApi';
import type { CustomerChatMessage, CustomerRideDetail } from '../services/customerApi';

const CHAT_OPEN_STATUSES = new Set<CustomerRideDetail['status']>([
  'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'VEHICLE_HANDOVER',
  'IN_PROGRESS', 'ARRIVED_DESTINATION', 'VEHICLE_RETURNED',
]);

export default function CustomerChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId?: string }>();
  const rideId = Number(Array.isArray(params.rideId) ? params.rideId[0] : params.rideId);
  const [ride, setRide] = useState<CustomerRideDetail | null>(null);
  const [messages, setMessages] = useState<CustomerChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const messageList = useRef<CustomerChatMessage[]>([]);
  const initialized = useRef(false);
  const requestInFlight = useRef(false);

  const applyMessages = (next: CustomerChatMessage[]) => {
    messageList.current = next;
    setMessages(next);
  };

  const refresh = useCallback(async (initial = false) => {
    if (!rideId) {
      setError('Thiếu mã chuyến để mở cuộc trò chuyện.');
      setLoading(false);
      return;
    }
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    try {
      const currentRide = await getCustomerRide(rideId);
      setRide(currentRide);
      const lastId = messageList.current.at(-1)?.id;
      if (initial || !initialized.current) {
        const page = await getCustomerChatMessages(rideId, { size: 30 });
        const ordered = [...page.messages].reverse();
        applyMessages(ordered);
        setHasMore(page.hasMore);
        initialized.current = true;
        const latestIncoming = [...ordered].reverse().find((message) => message.senderRole === 'DRIVER');
        if (latestIncoming) void markCustomerChatRead(rideId, latestIncoming.id).catch(() => {});
      } else {
        const page = await getCustomerChatMessages(rideId, lastId ? { afterId: lastId, size: 100 } : { size: 30 });
        if (page.messages.length) {
          const merged = new Map(messageList.current.map((message) => [message.id, message]));
          page.messages.forEach((message) => merged.set(message.id, message));
          const ordered = [...merged.values()].sort((a, b) => a.id - b.id);
          applyMessages(ordered);
          setHasMore((current) => current || page.hasMore);
          const latestIncoming = [...page.messages].reverse().find((message) => message.senderRole === 'DRIVER');
          if (latestIncoming) void markCustomerChatRead(rideId, latestIncoming.id).catch(() => {});
        }
      }
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được cuộc trò chuyện.');
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    void refresh(true);
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const loadOlder = async () => {
    const oldestId = messageList.current[0]?.id;
    if (!oldestId || !hasMore || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await getCustomerChatMessages(rideId, { beforeId: oldestId, size: 30 });
      const older = [...page.messages].reverse();
      const merged = new Map([...older, ...messageList.current].map((message) => [message.id, message]));
      applyMessages([...merged.values()].sort((a, b) => a.id - b.id));
      setHasMore(page.hasMore);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được tin nhắn cũ.');
    } finally {
      setLoadingOlder(false);
    }
  };

  const sendText = async () => {
    const content = draft.trim();
    if (!content || sending || !canChat(ride)) return;
    setSending(true);
    setError('');
    try {
      const sent = await sendCustomerChatMessage(rideId, { clientMessageId: makeUuid(), messageType: 'TEXT', content });
      const merged = new Map(messageList.current.map((message) => [message.id, message]));
      merged.set(sent.id, sent);
      applyMessages([...merged.values()].sort((a, b) => a.id - b.id));
      setDraft('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không gửi được tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  const sendImage = async () => {
    if (sending || !canChat(ride)) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
      const file = result.assets?.[0];
      if (result.canceled || !file) return;
      setSending(true);
      setError('');
      const uploaded = await uploadCustomerChatImage(rideId, { uri: file.uri, fileName: file.fileName, mimeType: file.mimeType });
      const sent = await sendCustomerChatMessage(rideId, {
        clientMessageId: makeUuid(),
        messageType: 'IMAGE',
        content: draft.trim() || null,
        attachmentUrl: uploaded.secureUrl,
        attachmentPublicId: uploaded.publicId,
      });
      const merged = new Map(messageList.current.map((message) => [message.id, message]));
      merged.set(sent.id, sent);
      applyMessages([...merged.values()].sort((a, b) => a.id - b.id));
      setDraft('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không gửi được ảnh.');
    } finally {
      setSending(false);
    }
  };

  const chatEnabled = canChat(ride);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Nhắn tin tài xế"
        subtitle={`Chuyến #${rideId}${ride?.driverId ? ` · Tài xế #${ride.driverId}` : ''}`}
        onBack={() => router.back()}
        rightContent={<HeaderIconButton icon="refresh" accessibilityLabel="Làm mới tin nhắn" onPress={() => void refresh(true)} tone="primary" />}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled">
          {hasMore ? <Pressable disabled={loadingOlder} onPress={() => void loadOlder()} style={styles.loadOlder}>
            {loadingOlder ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.link}>Tải tin nhắn cũ</Text>}
          </Pressable> : null}
          {loading && messages.length === 0 ? <ActivityIndicator color={colors.primary} /> : null}
          {!loading && messages.length === 0 ? <View style={styles.empty}>
            <MaterialIcons name="chat-bubble-outline" size={36} color={colors.primary} />
            <Text style={styles.emptyTitle}>{chatEnabled ? 'Bắt đầu cuộc trò chuyện' : 'Chat sẽ mở khi có tài xế nhận chuyến'}</Text>
            <Text style={styles.emptyCopy}>{chatEnabled ? 'Trao đổi với tài xế về điểm đón hoặc chuyến đi.' : 'Backend chỉ mở chat trong các trạng thái từ khi tài xế được phân công đến khi hoàn tất bàn giao.'}</Text>
          </View> : null}
          {messages.map((message) => {
            const mine = message.senderRole === 'CUSTOMER';
            return <View key={message.id} style={[styles.messageRow, mine && styles.messageRowMine]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleDriver]}>
                {message.attachmentUrl ? <Image source={{ uri: message.attachmentUrl }} style={styles.attachment} resizeMode="cover" /> : null}
                {message.content ? <Text style={[styles.messageText, mine && styles.messageTextMine]}>{message.content}</Text> : null}
                {!message.content && !message.attachmentUrl ? <Text style={[styles.messageText, mine && styles.messageTextMine]}>Tin nhắn</Text> : null}
                <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>{new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>;
          })}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </ScrollView>
        {!chatEnabled ? <View style={styles.closedNotice}><Text style={styles.closedText}>{ride ? 'Cuộc trò chuyện hiện đã đóng theo trạng thái chuyến.' : 'Đang tải thông tin chuyến.'}</Text></View> : null}
        <View style={styles.composer}>
          <Pressable accessibilityLabel="Gửi ảnh" disabled={sending || !chatEnabled} onPress={() => void sendImage()} style={[styles.imageButton, (!chatEnabled || sending) && styles.disabled]}>
            <MaterialIcons name="image" size={23} color={colors.primary} />
          </Pressable>
          <TextInput
            accessibilityLabel="Tin nhắn"
            editable={chatEnabled && !sending}
            value={draft}
            onChangeText={setDraft}
            placeholder={chatEnabled ? 'Nhập tin nhắn…' : 'Chat chưa khả dụng'}
            maxLength={1000}
            multiline
            style={styles.input}
          />
          <Pressable accessibilityLabel="Gửi tin nhắn" disabled={!draft.trim() || sending || !chatEnabled} onPress={() => void sendText()} style={[styles.sendButton, (!draft.trim() || sending || !chatEnabled) && styles.disabled]}>
            {sending ? <ActivityIndicator color={colors.onPrimary} size="small" /> : <MaterialIcons name="send" size={21} color={colors.onPrimary} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function canChat(ride: CustomerRideDetail | null): boolean {
  return Boolean(ride?.driverId && CHAT_OPEN_STATUSES.has(ride.status));
}

function makeUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  messages: { flexGrow: 1, padding: spacing.margin, gap: 10, justifyContent: 'flex-end' }, loadOlder: { alignItems: 'center', padding: 8 }, link: { ...typography.labelMd, color: colors.primary },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 9, padding: 24 }, emptyTitle: { ...typography.labelLg, color: colors.onSurface, textAlign: 'center' }, emptyCopy: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' },
  messageRow: { width: '100%', alignItems: 'flex-start' }, messageRowMine: { alignItems: 'flex-end' }, bubble: { maxWidth: '84%', borderRadius: borderRadius.lg, padding: 11, gap: 5 }, bubbleDriver: { backgroundColor: colors.surfaceContainerLowest, borderBottomLeftRadius: 4 }, bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 }, messageText: { ...typography.bodyMd, color: colors.onSurface }, messageTextMine: { color: colors.onPrimary }, messageTime: { ...typography.labelSm, color: colors.onSurfaceVariant, alignSelf: 'flex-end' }, messageTimeMine: { color: colors.primaryFixedTint }, attachment: { width: 210, height: 180, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerHigh },
  error: { ...typography.bodyMd, color: colors.error, textAlign: 'center', padding: 8 }, closedNotice: { paddingHorizontal: spacing.margin, paddingVertical: 8, backgroundColor: colors.surfaceContainerHigh }, closedText: { ...typography.labelSm, color: colors.onSurfaceVariant, textAlign: 'center' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: spacing.margin, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.outlineVariant, backgroundColor: colors.surface }, imageButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.full, backgroundColor: colors.primaryFixedTint }, input: { flex: 1, maxHeight: 120, minHeight: 42, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 21, backgroundColor: colors.surfaceContainerHigh, ...typography.bodyMd, color: colors.onSurface }, sendButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.full, backgroundColor: colors.primary }, disabled: { opacity: 0.45 },
});
