import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { borderRadius, colors, fontSize, spacing, typography } from '../theme/colors';
import {
  formatNationalPhoneNumber,
  PHONE_COUNTRIES,
  type PhoneCountry,
} from './phoneNumber';

type Props = {
  value: string;
  country: PhoneCountry;
  onChangeText: (value: string) => void;
  onSelectCountry: (country: PhoneCountry) => void;
  label?: string;
  disabled?: boolean;
  invalid?: boolean;
  accessibilityLabel?: string;
};

export function PhoneNumberInput({
  value,
  country,
  onChangeText,
  onSelectCountry,
  label,
  disabled = false,
  invalid = false,
  accessibilityLabel = 'Số điện thoại',
}: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const query = normalizeSearch(search);
    if (!query) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter((item) =>
      normalizeSearch(item.name).includes(query)
      || item.iso2.toLowerCase().includes(query)
      || item.dialCode.includes(query),
    );
  }, [search]);

  const closePicker = () => {
    Keyboard.dismiss();
    setPickerVisible(false);
    setSearch('');
  };

  const selectCountry = (nextCountry: PhoneCountry) => {
    onSelectCountry(nextCountry);
    closePicker();
  };

  return (
    <>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, invalid && styles.inputRowInvalid]}>
        <Pressable
          accessibilityLabel={`Chọn quốc gia, hiện tại ${country.name} ${country.dialCode}`}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            Keyboard.dismiss();
            setPickerVisible(true);
          }}
          style={styles.countryButton}
        >
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={styles.dialCode}>{country.dialCode}</Text>
          <MaterialIcons color={colors.onSurfaceVariant} name="arrow-drop-down" size={fontSize.iconXl} />
        </Pressable>
        <View style={styles.divider} />
        <TextInput
          accessibilityLabel={accessibilityLabel}
          autoComplete="off"
          editable={!disabled}
          keyboardType="phone-pad"
          maxLength={country.maxLength + country.groups.length}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, country.maxLength))}
          placeholder={country.example}
          placeholderTextColor={colors.outline70}
          style={styles.phoneInput}
          value={formatNationalPhoneNumber(value, country)}
        />
        {value ? (
          <Pressable
            accessibilityLabel="Xóa số đã nhập"
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => onChangeText('')}
            style={styles.clearButton}
          >
            <MaterialIcons color={colors.onSurfaceVariant} name="close" size={fontSize.icon16} />
          </Pressable>
        ) : null}
      </View>

      <Modal
        animationType="slide"
        onRequestClose={closePicker}
        statusBarTranslucent
        transparent
        visible={pickerVisible}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Đóng danh sách quốc gia"
            accessibilityRole="button"
            onPress={closePicker}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chọn quốc gia hoặc vùng lãnh thổ</Text>
              <Pressable
                accessibilityLabel="Đóng"
                accessibilityRole="button"
                onPress={closePicker}
                style={styles.closeButton}
              >
                <MaterialIcons color={colors.onSurface} name="close" size={fontSize.iconXl} />
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              <MaterialIcons color={colors.onSurfaceVariant} name="search" size={fontSize.iconXl} />
              <TextInput
                accessibilityLabel="Tìm quốc gia hoặc mã gọi"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setSearch}
                placeholder="Tìm tên hoặc mã gọi"
                placeholderTextColor={colors.outline70}
                style={styles.searchInput}
                value={search}
              />
            </View>

            <FlatList
              keyboardShouldPersistTaps="always"
              data={filteredCountries}
              keyExtractor={(item) => item.iso2}
              keyboardDismissMode="none"
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.iso2 === country.iso2 }}
                  onPress={() => selectCountry(item)}
                  style={styles.countryRow}
                >
                  <Text style={styles.rowFlag}>{item.flag}</Text>
                  <Text numberOfLines={1} style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.rowDialCode}>{item.dialCode}</Text>
                  {item.iso2 === country.iso2 ? (
                    <MaterialIcons color={colors.primary} name="check" size={fontSize.iconLg} />
                  ) : null}
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy quốc gia phù hợp.</Text>}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

const styles = StyleSheet.create({
  label: { ...typography.labelLg, color: colors.onSurface, marginBottom: spacing.gap1_5 },
  inputRow: {
    minHeight: spacing.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.spaceSm,
  },
  inputRowInvalid: { borderColor: colors.error, backgroundColor: colors.errorContainer30 },
  countryButton: {
    minWidth: 94,
    minHeight: spacing.inputHeight - 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.spaceXs,
    paddingHorizontal: spacing.spaceXs,
  },
  flag: { fontSize: fontSize.iconXl },
  dialCode: { ...typography.labelLg, color: colors.onSurface },
  divider: { width: spacing.phoneDividerWidth, height: spacing.phoneDividerHeight, backgroundColor: colors.outlineVariant, marginHorizontal: spacing.spaceXs },
  phoneInput: { ...typography.bodyMd, color: colors.onSurface, flex: 1, minWidth: 0, paddingHorizontal: spacing.spaceXs, paddingVertical: 0 },
  clearButton: { width: spacing.clearButton, height: spacing.clearButton, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim60 },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.spaceSm,
    paddingBottom: spacing.spaceXl,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: borderRadius.full, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.spaceMd },
  sheetHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.spaceSm },
  sheetTitle: { ...typography.headlineSm, color: colors.onSurface, flex: 1 },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.spaceSm },
  searchRow: { minHeight: spacing.inputHeight, flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, backgroundColor: colors.surfaceContainerLow, borderRadius: borderRadius.xl, paddingHorizontal: spacing.spaceMd, marginBottom: spacing.spaceSm },
  searchInput: { ...typography.bodyMd, color: colors.onSurface, flex: 1, minWidth: 0, padding: 0 },
  countryRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.spaceSm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.outlineVariant, paddingHorizontal: spacing.spaceXs },
  rowFlag: { fontSize: fontSize.iconXl, width: 30 },
  countryName: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  rowDialCode: { ...typography.labelMd, color: colors.onSurfaceVariant, minWidth: 46, textAlign: 'right' },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', paddingVertical: spacing.spaceXl },
});
