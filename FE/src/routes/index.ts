import { createSlug, createSlugHtml, createSlugWithId } from '@/utils/format-slug.util';

export const ROUTES = {
  HOME: '/',
  POLICIES: '/policies',
  LOGIN: '/login',
  REGISTER: '/register',
  DEPOSIT: '/user/nap-tien',
  TOPUP_HISTORY: '/user/lich-su-nap-tien',
  WISHLIST: '/user/danh-sach-yeu-thich',
  HISTORIES: '/histories',
  CART: '/cart',
} as const;

export const AdminRoutes = {
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/dashboard/accounts',
  USERS: '/dashboard/users',
  USER_DETAIL: (id: string) => `/dashboard/users/${id}`,
  SETTINGS: '/dashboard/settings',
} as const;

export const GameRoutes = {
  /**
   * Trang game category
   * Format: /{game-name-id}
   * Ví dụ: /wuthering-waves-4
   */
  game: (gameName: string, gameId: number | string) => `/${createSlugWithId(gameName, gameId)}`,

  /**
   * Trang danh sách account theo type
   * Format: /{type}-{game-name-id} (1 level nesting)
   * Ví dụ: /vip-wuthering-waves-4
   */
  accountType: (gameName: string, gameId: number | string, type: string) =>
    `/${createSlug(type)}-${createSlugWithId(gameName, gameId)}`,

  /**
   * Trang chi tiết account (legacy - dùng cho backward compatibility)
   * Format: /{type}-{game-name-id}/{account-title-id.html}
   * Ví dụ: /vip-wuthering-waves-4/premium-account-123.html
   */
  accountDetail: (
    gameName: string,
    gameId: number | string,
    type: string,
    accountTitle: string,
    accountId: number | string
  ) =>
    `/${createSlug(type)}-${createSlugWithId(
      gameName,
      gameId
    )}/${createSlugHtml(accountTitle, accountId)}`,

  /**
   * Trang chi tiết account (mới - dùng package.slug từ BE)
   * Format: /{package-slug}/{account-slug}.html
   * Ví dụ: /acc-rank-cao/acc-log-email-full-ngoc-ms-123.html
   */
  accountDetailBySlug: (packageSlug: string, accountTitle: string, accountId: string) =>
    `/${packageSlug}/${createSlugHtml(accountTitle, accountId)}`,

  /**
   * Trang thanh toán
   * Format: /payment/{account-id}
   */
  accountPayment: (accountId: string) => `/payment/${accountId}`,

  /**
   * Alias cho accountType (backward compatibility)
   */
  accountList: (gameName: string, gameId: number | string, type: string) =>
    `/${createSlug(type)}-${createSlugWithId(gameName, gameId)}`,
} as const;

export type Route =
  | (typeof ROUTES)[keyof typeof ROUTES]
  | ReturnType<(typeof GameRoutes)[keyof typeof GameRoutes]>;

export default {
  ...ROUTES,
  admin: AdminRoutes,
  games: GameRoutes,
};
