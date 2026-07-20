/**
 * Account Tags Utility
 * Parse account info string and extract tags
 */

export interface AccountTag {
  text: string;
  color: string;
}

/**
 * Tag configurations with colors
 */
const TAG_CONFIGS: Record<string, AccountTag> = {
  TRANG_THONG_TIN: {
    text: 'Trắng Thông Tin',
    color:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  GMAIL: {
    text: 'Gmail',
    color:
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  },
  FACEBOOK: {
    text: 'Facebook',
    color:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  SDT: {
    text: 'SĐT',
    color:
      'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
  },
  CCCD: {
    text: 'CCCD',
    color:
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  },
};

/**
 * Keywords mapping to tag types
 */
const KEYWORD_MAP: Record<string, string[]> = {
  TRANG_THONG_TIN: ['trắng', 'trang'],
  GMAIL: ['gmail', 'mail'],
  FACEBOOK: ['facebook', 'fb'],
  SDT: ['sđt', 'số', 'phone'],
  CCCD: ['cccd', 'cmnd'],
};

/**
 * Parse account info string and extract tags
 * @param accountInfo - Account info string
 * @returns Array of tags
 */
export function parseAccountTags(accountInfo: string): AccountTag[] {
  if (!accountInfo) return [];

  const info = accountInfo.toLowerCase().trim();
  const tags: AccountTag[] = [];
  const foundTypes = new Set<string>();

  // Check each keyword mapping
  for (const [tagType, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (info.includes(keyword) && !foundTypes.has(tagType)) {
        const config = TAG_CONFIGS[tagType];
        if (config) {
          tags.push(config);
          foundTypes.add(tagType);
        }
        break;
      }
    }
  }

  return tags;
}

/**
 * Check if account info has any recognizable tags
 * @param accountInfo - Account info string
 * @returns true if has tags, false otherwise
 */
export function hasAccountTags(accountInfo: string): boolean {
  return parseAccountTags(accountInfo).length > 0;
}

/**
 * Get fallback display text when no tags found
 * @param accountInfo - Account info string
 * @returns Display text
 */
export function getAccountInfoFallback(accountInfo: string): string {
  return accountInfo || 'Thông tin đang cập nhật';
}
