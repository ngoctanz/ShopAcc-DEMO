'use client';

import SeasonalNotificationModal from '@/components/modals/seasonal-notification.modal';
import { usePackagesGroupedByType } from '@/hooks/usePackages';
import BannerHomeSection from '@/sections/home-sections/banner.home.section';
import DynamicCategorySection from '@/sections/home-sections/dynamic-category.section';

export default function Home() {
  const { data, loading } = usePackagesGroupedByType();

  return (
    <>
      <SeasonalNotificationModal />

      <div className="relative z-10 min-h-screen pb-20">
        <div className="w-full flex flex-col items-center pt-8">
          <BannerHomeSection />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1300px] py-12 space-y-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <p className="mt-4 text-muted-foreground">Đang tải...</p>
            </div>
          ) : (
            <>
              {data.map((item) => (
                <DynamicCategorySection key={item.type._id} data={item} />
              ))}

              {data.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Chưa có dữ liệu</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
