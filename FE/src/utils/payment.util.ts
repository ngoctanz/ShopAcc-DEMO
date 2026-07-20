import type { Account, AccountPackage, PaymentMethod, User } from '@/types/index.type';

// ============ CONSTANTS ============
export const PAYMENT_CONSTANTS = {
  /** Minimum balance required to make any purchase */
  MIN_BALANCE_FOR_PURCHASE: 0,
  /** Minimum account price allowed */
  MIN_ACCOUNT_PRICE: 1,
  /** Minimum package price allowed */
  MIN_PACKAGE_PRICE: 1,
  /** Maximum single transaction limit (5 million VND) */
  MAX_SINGLE_TRANSACTION: 5000000,
  /** Supported payment methods */
  SUPPORTED_METHODS: ['BALANCE'] as PaymentMethod[],
} as const;

// ============ TYPES ============
export interface PaymentValidationResult {
  isValid: boolean;
  canPurchase: boolean;
  errors: PaymentError[];
  warnings: PaymentWarning[];
  summary: PaymentSummary;
}

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  field?: string;
}

export interface PaymentWarning {
  code: PaymentWarningCode;
  message: string;
}

export interface PaymentSummary {
  accountId: string;
  accountPrice: number;
  originalPrice: number;
  discount: number;
  discountPercent: number;
  userBalance: number;
  remainingBalance: number;
  isBalanceSufficient: boolean;
}

export type PaymentErrorCode =
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_NOT_AVAILABLE'
  | 'ACCOUNT_ALREADY_SOLD'
  | 'ACCOUNT_LOCKED'
  | 'USER_NOT_AUTHENTICATED'
  | 'USER_BANNED'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_PRICE'
  | 'EXCEEDS_TRANSACTION_LIMIT'
  | 'INVALID_PAYMENT_METHOD'
  | 'UNKNOWN_ERROR';

export type PaymentWarningCode =
  | 'LOW_BALANCE_AFTER_PURCHASE'
  | 'HIGH_VALUE_TRANSACTION'
  | 'NO_DISCOUNT_APPLIED';

// ============ VALIDATION FUNCTIONS ============

/**
 * Validates if an account is purchasable
 * @param account - The account to validate
 * @returns Error or null if valid
 */
export function validateAccount(account: Account | null | undefined): PaymentError | null {
  if (!account) {
    return {
      code: 'ACCOUNT_NOT_FOUND',
      message: 'Không tìm thấy thông tin tài khoản.',
      field: 'account',
    };
  }

  if (account.status === 'SOLD') {
    return {
      code: 'ACCOUNT_ALREADY_SOLD',
      message: 'Tài khoản này đã được bán.',
      field: 'account.status',
    };
  }

  if (account.status === 'LOCKED') {
    return {
      code: 'ACCOUNT_LOCKED',
      message: 'Tài khoản này đang bị khóa và không thể giao dịch.',
      field: 'account.status',
    };
  }

  if (account.status !== 'AVAILABLE') {
    return {
      code: 'ACCOUNT_NOT_AVAILABLE',
      message: 'Tài khoản này không khả dụng để mua.',
      field: 'account.status',
    };
  }

  if (!account.price || account.price < PAYMENT_CONSTANTS.MIN_ACCOUNT_PRICE) {
    return {
      code: 'INVALID_PRICE',
      message: `Giá tài khoản không hợp lệ. Giá tối thiểu là ${PAYMENT_CONSTANTS.MIN_ACCOUNT_PRICE.toLocaleString(
        'vi-VN'
      )}đ.`,
      field: 'account.price',
    };
  }

  if (account.price > PAYMENT_CONSTANTS.MAX_SINGLE_TRANSACTION) {
    return {
      code: 'EXCEEDS_TRANSACTION_LIMIT',
      message: `Giao dịch vượt quá giới hạn ${PAYMENT_CONSTANTS.MAX_SINGLE_TRANSACTION.toLocaleString(
        'vi-VN'
      )}đ. Vui lòng liên hệ hỗ trợ.`,
      field: 'account.price',
    };
  }

  return null;
}

/**
 * Validates if a user is eligible to make purchases
 * @param user - The user to validate
 * @returns Error or null if valid
 */
export function validateUser(user: User | null | undefined): PaymentError | null {
  if (!user) {
    return {
      code: 'USER_NOT_AUTHENTICATED',
      message: 'Vui lòng đăng nhập để thực hiện giao dịch.',
      field: 'user',
    };
  }

  if (user.status === 'banned') {
    return {
      code: 'USER_BANNED',
      message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.',
      field: 'user.status',
    };
  }

  return null;
}

/**
 * Validates if user balance is sufficient for the purchase
 * @param balance - User's current balance
 * @param price - Account price
 * @returns Error or null if valid
 */
export function validateBalance(balance: number, price: number): PaymentError | null {
  if (typeof balance !== 'number' || Number.isNaN(balance)) {
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: 'Không thể xác định số dư tài khoản.',
      field: 'user.balance',
    };
  }

  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    return {
      code: 'INVALID_PRICE',
      message: 'Giá tài khoản không hợp lệ.',
      field: 'account.price',
    };
  }

  if (balance < price) {
    const shortage = price - balance;
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: `Số dư không đủ. Bạn cần nạp thêm ${shortage.toLocaleString(
        'vi-VN'
      )}đ để thực hiện giao dịch.`,
      field: 'user.balance',
    };
  }

  return null;
}

/**
 * Validates the payment method
 * @param method - The payment method to validate
 * @returns Error or null if valid
 */
export function validatePaymentMethod(method: string): PaymentError | null {
  if (!PAYMENT_CONSTANTS.SUPPORTED_METHODS.includes(method as PaymentMethod)) {
    return {
      code: 'INVALID_PAYMENT_METHOD',
      message: `Phương thức thanh toán "${method}" không được hỗ trợ.`,
      field: 'paymentMethod',
    };
  }
  return null;
}

// ============ CALCULATION FUNCTIONS ============

/**
 * Calculates payment summary including discounts
 * @param account - The account being purchased
 * @param user - The purchasing user
 * @returns Payment summary object
 */
export function calculatePaymentSummary(
  account: Account | null,
  user: User | null
): PaymentSummary {
  const accountPrice = account?.price ?? 0;
  const originalPrice = account?.originalPrice ?? accountPrice;
  const userBalance = user?.balance ?? 0;

  const discount = originalPrice > accountPrice ? originalPrice - accountPrice : 0;
  const discountPercent =
    originalPrice > 0 && discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;

  const remainingBalance = userBalance - accountPrice;
  const isBalanceSufficient = userBalance >= accountPrice && accountPrice > 0;

  return {
    accountId: account?._id ?? '',
    accountPrice,
    originalPrice,
    discount,
    discountPercent,
    userBalance,
    remainingBalance,
    isBalanceSufficient,
  };
}

/**
 * Checks for payment warnings (non-blocking issues)
 * @param summary - The payment summary
 * @returns Array of warnings
 */
export function checkPaymentWarnings(summary: PaymentSummary): PaymentWarning[] {
  const warnings: PaymentWarning[] = [];

  // Warning: Low balance after purchase (< 10% of current balance)
  if (
    summary.isBalanceSufficient &&
    summary.remainingBalance > 0 &&
    summary.remainingBalance < summary.userBalance * 0.1
  ) {
    warnings.push({
      code: 'LOW_BALANCE_AFTER_PURCHASE',
      message: 'Số dư còn lại sau giao dịch sẽ rất thấp. Hãy cân nhắc nạp thêm tiền.',
    });
  }

  // Warning: High value transaction (> 1 million)
  if (summary.accountPrice >= 1000000) {
    warnings.push({
      code: 'HIGH_VALUE_TRANSACTION',
      message: 'Đây là giao dịch có giá trị cao. Vui lòng kiểm tra kỹ thông tin tài khoản.',
    });
  }

  // Warning: No discount applied
  if (summary.discount === 0 && summary.accountPrice > 0) {
    warnings.push({
      code: 'NO_DISCOUNT_APPLIED',
      message: 'Tài khoản này không có giảm giá.',
    });
  }

  return warnings;
}

// ============ MAIN VALIDATION FUNCTION ============

/**
 * Comprehensive payment validation
 * Validates account, user, balance, and payment method
 * @param account - The account to purchase
 * @param user - The purchasing user
 * @param paymentMethod - The payment method
 * @returns Complete validation result
 */
export function validatePayment(
  account: Account | null | undefined,
  user: User | null | undefined,
  paymentMethod: string = 'BALANCE'
): PaymentValidationResult {
  const errors: PaymentError[] = [];
  const warnings: PaymentWarning[] = [];

  // 1. Validate Account
  const accountError = validateAccount(account);
  if (accountError) {
    errors.push(accountError);
  }

  // 2. Validate User
  const userError = validateUser(user);
  if (userError) {
    errors.push(userError);
  }

  // 3. Validate Payment Method
  const methodError = validatePaymentMethod(paymentMethod);
  if (methodError) {
    errors.push(methodError);
  }

  // 4. If account and user are valid, validate balance
  if (!accountError && !userError && account && user) {
    const balanceError = validateBalance(user.balance, account.price);
    if (balanceError) {
      errors.push(balanceError);
    }
  }

  // 5. Calculate Summary
  const summary = calculatePaymentSummary(account ?? null, user ?? null);

  // 6. Check Warnings (only if no critical errors)
  if (errors.length === 0) {
    const paymentWarnings = checkPaymentWarnings(summary);
    warnings.push(...paymentWarnings);
  }

  // 7. Determine if purchase can proceed
  const canPurchase = errors.length === 0 && summary.isBalanceSufficient;

  return {
    isValid: errors.length === 0,
    canPurchase,
    errors,
    warnings,
    summary,
  };
}

// ============ HELPER FUNCTIONS ============

/**
 * Formats a price to Vietnamese currency format
 * @param price - The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '0đ';
  }
  return `${price.toLocaleString('vi-VN')}đ`;
}

/**
 * Gets the first error message from validation result
 * @param result - The validation result
 * @returns First error message or null
 */
export function getFirstErrorMessage(result: PaymentValidationResult): string | null {
  return result.errors.length > 0 ? result.errors[0].message : null;
}

/**
 * Checks if a specific error code exists in validation result
 * @param result - The validation result
 * @param code - The error code to check
 * @returns Boolean
 */
export function hasErrorCode(result: PaymentValidationResult, code: PaymentErrorCode): boolean {
  return result.errors.some((error) => error.code === code);
}

// ============ PACKAGE VALIDATION FUNCTIONS ============

export type PackageErrorCode =
  | 'PACKAGE_NOT_FOUND'
  | 'PACKAGE_NOT_ACTIVE'
  | 'PACKAGE_OUT_OF_STOCK'
  | 'USER_NOT_AUTHENTICATED'
  | 'USER_BANNED'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_PRICE'
  | 'EXCEEDS_TRANSACTION_LIMIT'
  | 'INVALID_PAYMENT_METHOD'
  | 'UNKNOWN_ERROR';

export interface PackagePaymentError {
  code: PackageErrorCode;
  message: string;
  field?: string;
}

export interface PackagePaymentSummary {
  packageId: string;
  packagePrice: number;
  originalPrice: number;
  discount: number;
  discountPercent: number;
  userBalance: number;
  remainingBalance: number;
  isBalanceSufficient: boolean;
}

export interface PackagePaymentValidationResult {
  isValid: boolean;
  canPurchase: boolean;
  errors: PackagePaymentError[];
  warnings: PaymentWarning[];
  summary: PackagePaymentSummary;
}

/**
 * Validates if a package is purchasable
 * @param pkg - The package to validate
 * @param stockCount - Available stock count (optional)
 * @returns Error or null if valid
 */
export function validatePackage(
  pkg: AccountPackage | null | undefined,
  stockCount?: number
): PackagePaymentError | null {
  if (!pkg) {
    return {
      code: 'PACKAGE_NOT_FOUND',
      message: 'Không tìm thấy thông tin gói.',
      field: 'package',
    };
  }

  if (pkg.isActive === false) {
    return {
      code: 'PACKAGE_NOT_ACTIVE',
      message: 'Gói này hiện không khả dụng.',
      field: 'package.isActive',
    };
  }

  // Check stock if provided
  if (stockCount !== undefined && stockCount <= 0) {
    return {
      code: 'PACKAGE_OUT_OF_STOCK',
      message: 'Gói này đã hết hàng.',
      field: 'stockCount',
    };
  }

  const price = pkg.discountPrice || pkg.price || 0;

  if (!price || price < PAYMENT_CONSTANTS.MIN_PACKAGE_PRICE) {
    return {
      code: 'INVALID_PRICE',
      message: `Giá gói không hợp lệ. Giá tối thiểu là ${PAYMENT_CONSTANTS.MIN_PACKAGE_PRICE.toLocaleString(
        'vi-VN'
      )}đ.`,
      field: 'package.price',
    };
  }

  if (price > PAYMENT_CONSTANTS.MAX_SINGLE_TRANSACTION) {
    return {
      code: 'EXCEEDS_TRANSACTION_LIMIT',
      message: `Giao dịch vượt quá giới hạn ${PAYMENT_CONSTANTS.MAX_SINGLE_TRANSACTION.toLocaleString(
        'vi-VN'
      )}đ. Vui lòng liên hệ hỗ trợ.`,
      field: 'package.price',
    };
  }

  return null;
}

/**
 * Validates balance for package purchase
 * @param balance - User's current balance
 * @param price - Package price
 * @returns Error or null if valid
 */
export function validatePackageBalance(balance: number, price: number): PackagePaymentError | null {
  if (typeof balance !== 'number' || Number.isNaN(balance)) {
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: 'Không thể xác định số dư tài khoản.',
      field: 'user.balance',
    };
  }

  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    return {
      code: 'INVALID_PRICE',
      message: 'Giá gói không hợp lệ.',
      field: 'package.price',
    };
  }

  if (balance < price) {
    const shortage = price - balance;
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: `Số dư không đủ. Bạn cần nạp thêm ${shortage.toLocaleString(
        'vi-VN'
      )}đ để thực hiện giao dịch.`,
      field: 'user.balance',
    };
  }

  return null;
}

/**
 * Calculates payment summary for package
 * @param pkg - The package being purchased
 * @param user - The purchasing user
 * @returns Payment summary object
 */
export function calculatePackagePaymentSummary(
  pkg: AccountPackage | null,
  user: User | null
): PackagePaymentSummary {
  const packagePrice = pkg?.discountPrice || pkg?.price || 0;
  const originalPrice = pkg?.price || packagePrice;
  const userBalance = user?.balance ?? 0;

  const discount = originalPrice > packagePrice ? originalPrice - packagePrice : 0;
  const discountPercent =
    originalPrice > 0 && discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;

  const remainingBalance = userBalance - packagePrice;
  const isBalanceSufficient = userBalance >= packagePrice && packagePrice > 0;

  return {
    packageId: pkg?._id ?? '',
    packagePrice,
    originalPrice,
    discount,
    discountPercent,
    userBalance,
    remainingBalance,
    isBalanceSufficient,
  };
}

/**
 * Checks for package payment warnings (non-blocking issues)
 * @param summary - The payment summary
 * @returns Array of warnings
 */
export function checkPackagePaymentWarnings(summary: PackagePaymentSummary): PaymentWarning[] {
  const warnings: PaymentWarning[] = [];

  // Warning: Low balance after purchase (< 10% of current balance)
  if (
    summary.isBalanceSufficient &&
    summary.remainingBalance > 0 &&
    summary.remainingBalance < summary.userBalance * 0.1
  ) {
    warnings.push({
      code: 'LOW_BALANCE_AFTER_PURCHASE',
      message: 'Số dư còn lại sau giao dịch sẽ rất thấp. Hãy cân nhắc nạp thêm tiền.',
    });
  }

  // Warning: High value transaction (> 1 million)
  if (summary.packagePrice >= 1000000) {
    warnings.push({
      code: 'HIGH_VALUE_TRANSACTION',
      message: 'Đây là giao dịch có giá trị cao. Vui lòng kiểm tra kỹ thông tin gói.',
    });
  }

  return warnings;
}

/**
 * Comprehensive package payment validation
 * Validates package, user, balance, and payment method
 * @param pkg - The package to purchase
 * @param user - The purchasing user
 * @param stockCount - Available stock count (optional)
 * @param paymentMethod - The payment method
 * @returns Complete validation result
 */
export function validatePackagePayment(
  pkg: AccountPackage | null | undefined,
  user: User | null | undefined,
  stockCount?: number,
  paymentMethod: string = 'BALANCE'
): PackagePaymentValidationResult {
  const errors: PackagePaymentError[] = [];
  const warnings: PaymentWarning[] = [];

  // 1. Validate Package
  const packageError = validatePackage(pkg, stockCount);
  if (packageError) {
    errors.push(packageError);
  }

  // 2. Validate User
  const userError = validateUser(user);
  if (userError) {
    errors.push({
      code: userError.code as PackageErrorCode,
      message: userError.message,
      field: userError.field,
    });
  }

  // 3. Validate Payment Method
  const methodError = validatePaymentMethod(paymentMethod);
  if (methodError) {
    errors.push({
      code: methodError.code as PackageErrorCode,
      message: methodError.message,
      field: methodError.field,
    });
  }

  // 4. If package and user are valid, validate balance
  if (!packageError && !userError && pkg && user) {
    const price = pkg.discountPrice || pkg.price || 0;
    const balanceError = validatePackageBalance(user.balance, price);
    if (balanceError) {
      errors.push(balanceError);
    }
  }

  // 5. Calculate Summary
  const summary = calculatePackagePaymentSummary(pkg ?? null, user ?? null);

  // 6. Check Warnings (only if no critical errors)
  if (errors.length === 0) {
    const paymentWarnings = checkPackagePaymentWarnings(summary);
    warnings.push(...paymentWarnings);
  }

  // 7. Determine if purchase can proceed
  const canPurchase = errors.length === 0 && summary.isBalanceSufficient;

  return {
    isValid: errors.length === 0,
    canPurchase,
    errors,
    warnings,
    summary,
  };
}

/**
 * Gets the first error message from package validation result
 * @param result - The validation result
 * @returns First error message or null
 */
export function getFirstPackageErrorMessage(result: PackagePaymentValidationResult): string | null {
  return result.errors.length > 0 ? result.errors[0].message : null;
}

/**
 * Checks if a specific error code exists in package validation result
 * @param result - The validation result
 * @param code - The error code to check
 * @returns Boolean
 */
export function hasPackageErrorCode(
  result: PackagePaymentValidationResult,
  code: PackageErrorCode
): boolean {
  return result.errors.some((error) => error.code === code);
}
