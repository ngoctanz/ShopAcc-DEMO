/**
 * Base entity interface (MongoDB)
 */
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt?: string;
}

// ============ USER ============
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  balance: number;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  lastLogin?: string;
}

// ============ ACCOUNT SYSTEM ============

/**
 * AccountType - Loại tài khoản (Admin quản lý)
 */
export interface AccountType extends BaseEntity {
  code: string; // "RANK", "REG", "CLONE", "RANDOM"
  name: string; // "Acc Rank", "Acc Reg"
  description?: string;
  isActive?: boolean;
  slug?: string;
}

/**
 * AccountPackage Mode
 * - LIST: Shows list of accounts in package, user picks one
 * - RANDOM: User pays package price, gets random account
 * - CLONE: User pays package price, gets an account (similar to RANDOM but different UX)
 */
export type AccountPackageMode = 'LIST' | 'RANDOM' | 'CLONE';

/**
 * AccountPackage - Gói sản phẩm hiển thị trên homepage
 */
export interface AccountPackage extends BaseEntity {
  typeId: string;
  type?: AccountType; // Populated
  title: string; // "Acc Rank Bạc", "Túi Mù 29K"
  slug?: string;
  mode: AccountPackageMode;
  price?: number | null; // Giá bán (RANDOM/CLONE mode)
  discountPrice?: number | null;
  priceRange?: {
    // Filter accounts (RANDOM mode only)
    min?: number | null;
    max?: number | null;
  };
  image?: string;
  description?: string; // Package description (used in CLONE mode)
  order?: number;
  isActive?: boolean;
  // Virtuals
  hasDiscount?: boolean;
  finalPrice?: number;
  accountCount?: number;
}

/**
 * Account Status
 */
export type AccountStatus = 'AVAILABLE' | 'SOLD' | 'LOCKED';

/**
 * Account - Tài khoản game (thuộc về một Package cụ thể)
 */
export interface Account extends BaseEntity {
  packageId: string;
  package?: AccountPackage; // Populated
  code?: string;
  accountInfo: string;
  price: number;
  originalPrice?: number;
  images: string[];
  coverImage?: string;
  status: AccountStatus;
  featuredSkins?: string[];
  // Clone account fields
  isClone?: boolean;
  quantity?: number;
  cloneAccounts?: Array<{
    username: string;
    password: string;
    additionalInfo?: string;
  }>;
  // Virtuals
  hasDiscount?: boolean;
  credentials?: any;
  isWishlisted?: boolean;
}

/**
 * Type with packages grouped (for homepage)
 */
export interface TypeWithPackages {
  type: AccountType;
  packages: AccountPackage[];
}

// ============ WISHLIST ============
export interface WishlistItem {
  accountId: string;
  addedAt: string;
  account?: Account;
}

export interface Wishlist extends BaseEntity {
  userId: string;
  items: WishlistItem[];
  itemCount: number;
}

// ============ TRANSACTION ============
export type PaymentMethod = 'BALANCE' | 'MOMO' | 'ATM' | 'CARD';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Transaction extends BaseEntity {
  userId: string;
  user?: User;
  accountId: string;
  account?: Account;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
}

// ============ NOTIFICATION ============
export interface Notification extends BaseEntity {
  userId?: string;
  type: 'system' | 'promotion' | 'maintenance' | 'news';
  title: string;
  message: string;
  link?: string;
  isRead?: boolean;
}

// ============ ORDER ============
export interface Order extends BaseEntity {
  userId: string | User;
  accountId: string | Account;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  batchId?: string | null; // For bulk purchases - groups multiple orders
  accountCredentials?: {
    username: string;
    password: string;
    additionalInfo?: string;
  };
  accountSnapshot?: {
    code?: string;
    packageTitle?: string;
    image?: string;
  };
}

// ============ AUTH ============
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ============ PAGINATION ============
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============ FILTER PARAMS ============
export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AccountFilterParams extends FilterParams {
  packageId?: string;
  typeId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: AccountStatus;
}
