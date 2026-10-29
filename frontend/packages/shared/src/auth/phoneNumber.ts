export type PhoneCountry = {
  iso2: string;
  name: string;
  flag: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  groups: number[];
  example: string;
  trunkPrefix?: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso2: 'VN', name: 'Việt Nam', flag: '🇻🇳', dialCode: '+84', minLength: 10, maxLength: 10, groups: [4, 3, 3], example: '0912 345 678', trunkPrefix: '0' },
  { iso2: 'US', name: 'Hoa Kỳ', flag: '🇺🇸', dialCode: '+1', minLength: 10, maxLength: 10, groups: [3, 3, 4], example: '415 555 0123' },
  { iso2: 'GB', name: 'Vương quốc Anh', flag: '🇬🇧', dialCode: '+44', minLength: 11, maxLength: 11, groups: [4, 3, 4], example: '0207 946 0958', trunkPrefix: '0' },
  { iso2: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', minLength: 10, maxLength: 10, groups: [3, 3, 4], example: '416 555 0123' },
  { iso2: 'AU', name: 'Úc', flag: '🇦🇺', dialCode: '+61', minLength: 10, maxLength: 10, groups: [4, 3, 3], example: '0412 345 678', trunkPrefix: '0' },
  { iso2: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', minLength: 8, maxLength: 8, groups: [4, 4], example: '8123 4567' },
  { iso2: 'TH', name: 'Thái Lan', flag: '🇹🇭', dialCode: '+66', minLength: 10, maxLength: 10, groups: [3, 3, 4], example: '081 234 5678', trunkPrefix: '0' },
  { iso2: 'JP', name: 'Nhật Bản', flag: '🇯🇵', dialCode: '+81', minLength: 10, maxLength: 11, groups: [3, 4, 4], example: '090 1234 5678', trunkPrefix: '0' },
  { iso2: 'KR', name: 'Hàn Quốc', flag: '🇰🇷', dialCode: '+82', minLength: 10, maxLength: 11, groups: [3, 4, 4], example: '010 1234 5678', trunkPrefix: '0' },
  { iso2: 'CN', name: 'Trung Quốc', flag: '🇨🇳', dialCode: '+86', minLength: 11, maxLength: 11, groups: [3, 4, 4], example: '138 0013 8000' },
  { iso2: 'HK', name: 'Hồng Kông', flag: '🇭🇰', dialCode: '+852', minLength: 8, maxLength: 8, groups: [4, 4], example: '9123 4567' },
  { iso2: 'TW', name: 'Đài Loan', flag: '🇹🇼', dialCode: '+886', minLength: 10, maxLength: 10, groups: [4, 3, 3], example: '0912 345 678', trunkPrefix: '0' },
  { iso2: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', minLength: 9, maxLength: 11, groups: [3, 4, 4], example: '012 3456 789', trunkPrefix: '0' },
  { iso2: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', minLength: 9, maxLength: 13, groups: [4, 4, 5], example: '0812 3456 7890', trunkPrefix: '0' },
  { iso2: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', minLength: 11, maxLength: 11, groups: [4, 3, 4], example: '0917 123 4567', trunkPrefix: '0' },
  { iso2: 'IN', name: 'Ấn Độ', flag: '🇮🇳', dialCode: '+91', minLength: 10, maxLength: 10, groups: [5, 5], example: '98765 43210' },
  { iso2: 'AE', name: 'Các Tiểu vương quốc Ả Rập Thống nhất', flag: '🇦🇪', dialCode: '+971', minLength: 10, maxLength: 10, groups: [3, 3, 4], example: '050 123 4567', trunkPrefix: '0' },
  { iso2: 'SA', name: 'Ả Rập Xê Út', flag: '🇸🇦', dialCode: '+966', minLength: 10, maxLength: 10, groups: [3, 3, 4], example: '055 123 4567', trunkPrefix: '0' },
  { iso2: 'FR', name: 'Pháp', flag: '🇫🇷', dialCode: '+33', minLength: 10, maxLength: 10, groups: [2, 2, 2, 2, 2], example: '06 12 34 56 78', trunkPrefix: '0' },
  { iso2: 'DE', name: 'Đức', flag: '🇩🇪', dialCode: '+49', minLength: 10, maxLength: 12, groups: [4, 3, 5], example: '0151 234 56789', trunkPrefix: '0' },
  { iso2: 'ES', name: 'Tây Ban Nha', flag: '🇪🇸', dialCode: '+34', minLength: 9, maxLength: 9, groups: [3, 3, 3], example: '612 345 678' },
  { iso2: 'IT', name: 'Ý', flag: '🇮🇹', dialCode: '+39', minLength: 9, maxLength: 11, groups: [3, 4, 4], example: '312 345 6789' },
  { iso2: 'NL', name: 'Hà Lan', flag: '🇳🇱', dialCode: '+31', minLength: 10, maxLength: 10, groups: [2, 4, 4], example: '06 1234 5678', trunkPrefix: '0' },
  { iso2: 'CH', name: 'Thụy Sĩ', flag: '🇨🇭', dialCode: '+41', minLength: 10, maxLength: 10, groups: [2, 3, 2, 3], example: '079 123 45 67', trunkPrefix: '0' },
  { iso2: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353', minLength: 9, maxLength: 10, groups: [3, 3, 4], example: '085 123 4567', trunkPrefix: '0' },
  { iso2: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', minLength: 9, maxLength: 10, groups: [3, 3, 4], example: '021 123 4567', trunkPrefix: '0' },
  { iso2: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', minLength: 10, maxLength: 10, groups: [2, 4, 4], example: '55 1234 5678' },
  { iso2: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', minLength: 10, maxLength: 11, groups: [2, 5, 4], example: '11 91234 5678' },
  { iso2: 'RU', name: 'Nga', flag: '🇷🇺', dialCode: '+7', minLength: 10, maxLength: 10, groups: [3, 3, 4], example: '912 345 6789' },
  { iso2: 'TR', name: 'Thổ Nhĩ Kỳ', flag: '🇹🇷', dialCode: '+90', minLength: 11, maxLength: 11, groups: [4, 3, 4], example: '0532 123 4567', trunkPrefix: '0' },
  { iso2: 'ZA', name: 'Nam Phi', flag: '🇿🇦', dialCode: '+27', minLength: 10, maxLength: 10, groups: [3, 3, 4], example: '082 123 4567', trunkPrefix: '0' },
];

export const DEFAULT_PHONE_COUNTRY: PhoneCountry = PHONE_COUNTRIES[0]!;

export function formatNationalPhoneNumber(value: string, country: PhoneCountry): string {
  const digits = value.replace(/\D/g, '').slice(0, country.maxLength);
  let remaining = digits;
  const chunks: string[] = [];
  for (const groupLength of country.groups) {
    if (!remaining) break;
    chunks.push(remaining.slice(0, groupLength));
    remaining = remaining.slice(groupLength);
  }
  if (remaining) chunks.push(remaining);
  return chunks.join(' ');
}

export function isValidInternationalPhoneNumber(value: string, country: PhoneCountry): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length < country.minLength || digits.length > country.maxLength) return false;
  return !country.trunkPrefix || digits.startsWith(country.trunkPrefix);
}

export function toInternationalPhoneNumber(value: string, country: PhoneCountry): string {
  let nationalDigits = value.replace(/\D/g, '').slice(0, country.maxLength);
  if (country.trunkPrefix && nationalDigits.startsWith(country.trunkPrefix)) {
    nationalDigits = nationalDigits.slice(country.trunkPrefix.length);
  }
  return nationalDigits ? `${country.dialCode}${nationalDigits}` : '';
}
