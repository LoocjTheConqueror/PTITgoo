export function getCustomerDisplayName(value: string | null | undefined): string {
  if (!value) return '';

  const name = value.trim().replace(/^([A-Z0-9]{6,})\s*[-–—]\s*/i, (match: string, code: string) => (
    /[A-Z]/i.test(code) && /\d/.test(code) ? '' : match
  ));

  return name
    .replace(/\s*\([^()\s]+\)\s*$/, '')
    .trim();
}

export function getCustomerInitials(value: string | null | undefined): string {
  const name = getCustomerDisplayName(value);
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  if (words.length === 0) return 'K';

  return words
    .slice(-2)
    .map((word) => [...word][0] ?? '')
    .join('')
    .toLocaleUpperCase('vi-VN');
}
