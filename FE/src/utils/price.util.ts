import type { Account, AccountPackage } from '@/types/index.type';

interface PriceInfo {
  currentPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
}

/**
 * Calculate price info for Account
 */
export function getAccountPriceInfo(account: Account): PriceInfo {
  const currentPrice = Number(account.price || 0);
  const originalPrice = account.originalPrice || currentPrice;
  const hasDiscount = !!account.originalPrice && account.originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return { currentPrice, originalPrice, hasDiscount, discountPercent };
}

/**
 * Calculate price info for AccountPackage
 */
export function getPackagePriceInfo(pkg: AccountPackage): PriceInfo {
  const currentPrice = pkg.discountPrice || pkg.price || 0;
  const originalPrice = pkg.price || currentPrice;
  const hasDiscount = !!(pkg.discountPrice && pkg.price && pkg.discountPrice < pkg.price);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return { currentPrice, originalPrice, hasDiscount, discountPercent };
}
