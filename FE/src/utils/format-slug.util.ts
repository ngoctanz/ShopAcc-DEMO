import slugify from 'slugify';
import type { Account } from '@/types/index.type';

export function createSlug(text: string): string {
  if (!text) return '';
  return slugify(text, {
    locale: 'en',
    lower: true,
  });
}

/**
 * Tạo slug với ID (format: slug-id)
 * Ví dụ: wuthering-waves-4
 */
export function createSlugWithId(text: string, id: number | string): string {
  return `${createSlug(text)}-${id}`;
}

/**
 * Tạo slug HTML (format: slug-id.html)
 * Ví dụ: account-name-123.html
 */
export function createSlugHtml(text: string, id: number | string): string {
  return `${createSlug(text)}-ms-${id}.html`;
}

/**
 * Parse slug để lấy ID (từ format slug-id hoặc slug-id.html)
 * Ví dụ: "wuthering-waves-4" hoặc "account-name-123.html" -> "4" hoặc "123"
 */
export function parseSlugId(slug: string): string {
  if (!slug) return '';

  // Loại bỏ .html nếu có
  const cleanSlug = slug.replace('.html', '');

  // Tìm separator '-ms-'
  if (cleanSlug.includes('-ms-')) {
    const parts = cleanSlug.split('-ms-');
    return parts[parts.length - 1]; // Trả về phần sau '-ms-'
  }

  // Fallback cho logic cũ (lấy phần cuối sau dấu gạch ngang)
  const parts = cleanSlug.split('-');
  return parts[parts.length - 1];
}

/**
 * Parse slug với ID để lấy thông tin game name và game ID
 */
export function parseSlugWithId(slug: string): {
  gameName: string;
  gameId: string;
} {
  const cleanSlug = slug.replace('.html', '');
  let gameId = '';
  let textPart = '';

  if (cleanSlug.includes('-ms-')) {
    const parts = cleanSlug.split('-ms-');
    gameId = parts[parts.length - 1];
    textPart = parts.slice(0, -1).join('-ms-');
  } else {
    gameId = parseSlugId(slug);
    textPart = cleanSlug.split('-').slice(0, -1).join('-');
  }

  const gameName = textPart
    .split('-')
    .join(' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

  return { gameName, gameId };
}

// Account type utilities
export const ACCOUNT_TYPES: Record<string, { slug: string; display: string; apiValue: string }> = {
  'acc-reg': { slug: 'acc-reg', display: 'ACC REG', apiValue: 'acc-reg' },
  'acc-rank': { slug: 'acc-rank', display: 'ACC RANK', apiValue: 'acc-rank' },
  'tui-mu': { slug: 'tui-mu', display: 'TÚI MÙ', apiValue: 'tui-mu' },
  vip: { slug: 'vip', display: 'VIP', apiValue: 'vip' },
  reroll: { slug: 'reroll', display: 'REROLL', apiValue: 'reroll' },
  normal: { slug: 'normal', display: 'NORMAL', apiValue: 'normal' },
  'random-3k': { slug: 'random-3k', display: 'RANDOM 3K', apiValue: 'random-3k' },
  'random-1k': { slug: 'random-1k', display: 'RANDOM 1K', apiValue: 'random-1k' },
  random: { slug: 'random', display: 'RANDOM', apiValue: 'random' },
} as const;

export const KNOWN_TYPES = Object.keys(ACCOUNT_TYPES);

export type AccountTypeSlug = keyof typeof ACCOUNT_TYPES;

export function normalizeAccountType(type?: string) {
  if (!type) return ACCOUNT_TYPES.normal;

  const normalized = type.toLowerCase();
  const accountType = ACCOUNT_TYPES[normalized];

  if (!accountType) {
    return ACCOUNT_TYPES.normal;
  }

  return {
    slug: accountType.slug,
    display: accountType.display,
    apiValue: accountType.apiValue,
  };
}

/**
 * Parse slug format: {type}-{gameName}-{gameId} OR {gameName}-{gameId}
 */
export function parseOneLevelSlug(slug: string) {
  if (!slug) return { gameId: null, gameName: '', type: 'normal' };

  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const gameId = Number(lastPart);

  if (Number.isNaN(gameId)) {
    return { gameId: null, gameName: slug, type: 'normal' };
  }

  const textPart = parts.slice(0, parts.length - 1).join('-');

  // Sort prefixes by length descending to match longest first
  const sortedTypes = [...KNOWN_TYPES].sort((a, b) => b.length - a.length);

  let type = 'normal';
  let gameName = textPart;

  for (const knownType of sortedTypes) {
    if (textPart === knownType || textPart.startsWith(`${knownType}-`)) {
      type = knownType;
      const remainder = textPart.slice(knownType.length);
      if (remainder.startsWith('-')) {
        gameName = remainder.substring(1);
      } else if (remainder === '') {
        gameName = '';
      }
      break;
    }
  }

  // Format gameName back to Title Case
  const formattedGameName = gameName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return { gameId, gameName: formattedGameName, type };
}

/**
 * Lấy package slug từ account data
 * Ưu tiên: package.slug > packageId.slug (nếu populated) > format từ title
 */
export function getPackageSlugFromAccount(account: Account): string {
  // 1. Nếu có package populated với slug
  if (account.package?.slug) {
    return account.package.slug;
  }

  // 2. Nếu packageId là object (populated), lấy slug từ đó
  if (typeof account.packageId === 'object' && account.packageId !== null) {
    const pkg = account.packageId as any;
    if (pkg.slug) return pkg.slug;
    // Fallback: format từ title
    if (pkg.title) return createSlug(pkg.title);
  }

  // 3. Nếu có package populated với title
  if (account.package?.title) {
    return createSlug(account.package.title);
  }

  // 4. Fallback
  return 'account';
}

/**
 * Build URL chi tiết account
 * Format: /{package-slug}/{account-info-slug}-ms-{accountId}.html
 */
export function buildAccountDetailUrl(account: Account, accountInfoOverride?: string): string {
  const packageSlug = getPackageSlugFromAccount(account);
  const accountInfo = accountInfoOverride || account.accountInfo || 'chi-tiet';
  const accountSlug = createSlugHtml(accountInfo.substring(0, 50), account._id);

  return `/${packageSlug}/${accountSlug}`;
}
