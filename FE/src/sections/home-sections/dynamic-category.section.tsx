'use client';

import PackageCard from '@/components/cards/package-card';
import type { TypeWithPackages } from '@/types/index.type';

interface DynamicCategorySectionProps {
  data: TypeWithPackages;
}

export default function DynamicCategorySection({ data }: DynamicCategorySectionProps) {
  const { type, packages } = data;

  if (packages.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wide">
          {type.name}
        </h2>
        {type.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 px-4">
            {type.description}
          </p>
        )}
        <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-primary to-purple-500 mx-auto mt-2 sm:mt-3 rounded-full" />
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg._id} pkg={pkg} />
        ))}
      </div>
    </div>
  );
}
