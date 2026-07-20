'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/routes';
import ClonePackageDetailSection from '@/sections/clone-sections/clone-package-detail.section';
import { packageService } from '@/services/account-package.service';
import type { AccountPackage } from '@/types/index.type';

/**
 * Clone Package Detail Page
 *
 * Shows package details for CLONE mode packages.
 * Clicking "Buy Now" redirects to the payment page.
 */
export default function ClonePackagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [pkg, setPackage] = useState<AccountPackage | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch package data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await packageService.getPackageById(slug);

        // Validate this is a CLONE mode package
        if (!data || data.mode !== 'CLONE') {
          toast.error('Gói không hợp lệ', {
            description: 'Đây không phải gói Clone',
          });
          router.push('/');
          return;
        }

        setPackage(data);
      } catch (error) {
        console.error('Failed to fetch package:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent" />
          <p className="mt-4 text-muted-foreground font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <div className="text-8xl mb-4">😢</div>
          <h2 className="text-3xl font-bold mb-2">Không tìm thấy</h2>
          <p className="text-muted-foreground mb-6">Gói clone này không tồn tại</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Out of stock state
  if (pkg.accountCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20">
        <EmptyState
          mode="out-of-stock"
          title={`Gói "${pkg.title}" tạm hết hàng`}
          description="Vui lòng quay lại sau hoặc liên hệ Admin để đặt hàng số lượng lớn."
        />
      </div>
    );
  }

  const packageTitle = pkg.title || 'Clone Package';

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 z-[-1]">
        {pkg.image ? (
          <>
            <Image src={pkg.image} alt="Background" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-800" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm">
            <Link
              href={ROUTES.HOME}
              className="text-gray-400 hover:text-black dark:hover:text-white hover:underline hover:font-semibold transition-all duration-200"
            >
              Trang chủ
            </Link>
            <span className="text-gray-600 mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-bold">{packageTitle}</span>
          </div>

          {/* Clone Package Detail Section */}
          <ClonePackageDetailSection pkg={pkg} />
        </div>
      </div>
    </>
  );
}
