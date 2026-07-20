import type { Account } from '@/types/index.type';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

/**
 * Get all images from account (coverImage + images array)
 */
export function getAccountImages(account: Account): string[] {
  const images: string[] = [];

  if (account.coverImage) {
    images.push(account.coverImage);
  }

  if (account.images?.length) {
    images.push(...account.images);
  }

  return images.length > 0 ? images : [PLACEHOLDER_IMAGE];
}

/**
 * Get primary image (cover or first image)
 */
export function getPrimaryImage(account: Account): string {
  return account.coverImage || account.images?.[0] || PLACEHOLDER_IMAGE;
}
