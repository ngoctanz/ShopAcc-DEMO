'use client';

import { Loader2, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NormalAccountCard } from '@/components/cards/NormalAccountCard';
import { RandomAccountCard } from '@/components/cards/RandomAccountCard';
import { EmptyState } from '@/components/ui/empty-state';
import FilterDropdown from '@/components/ui/filter-dropdown';
import type { Account } from '@/types/index.type';
import { getFilterOptions } from '@/utils/accounts.util';
import { accountService } from '@/services/account.service';

interface ListAccountSectionProps {
  packageId: string;
  parentSlug: string;
  isClone?: boolean; // CLONE mode - show quantity instead of regular card
}

export default function ListAccountSection({ packageId, parentSlug, isClone = false }: ListAccountSectionProps) {
  const { sortOptions, priceFilterOptions } = getFilterOptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceFilter, setPriceFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Parse price filter to min/max values
  const parsePriceFilter = (filter: string): { minPrice?: number; maxPrice?: number } => {
    switch (filter) {
      case '0-100k':
        return { minPrice: 0, maxPrice: 100000 };
      case '100k-500k':
        return { minPrice: 100000, maxPrice: 500000 };
      case '500k-plus':
        return { minPrice: 500000 };
      default:
        return {};
    }
  };

  // Build query params
  const buildQueryParams = useCallback(() => {
    const { minPrice, maxPrice } = parsePriceFilter(priceFilter);
    return {
      packageId,
      page,
      limit: 20,
      sortBy: sortBy !== 'default' ? sortBy : undefined,
      search: searchQuery.trim() || undefined,
      minPrice,
      maxPrice,
    };
  }, [packageId, page, sortBy, priceFilter, searchQuery]);

  // Fetch accounts using React Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['accounts', packageId, page, sortBy, priceFilter, searchQuery],
    queryFn: () => accountService.getAccounts(buildQueryParams()),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const accounts = data?.data || [];
  const meta = data?.meta;

  // Handlers
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1); // Reset to first page
  };

  const handlePriceChange = (value: string) => {
    setPriceFilter(value);
    setPage(1); // Reset to first page
  };

  const handleSearchSubmit = () => {
    setPage(1); // Reset to first page
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || sortBy !== 'default' || priceFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('default');
    setPriceFilter('all');
    setPage(1);
  };

  const displayCount = meta?.total || 0;
  const isPending = isLoading || isFetching;

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-6 sm:mb-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl p-3 sm:p-5 transition-colors duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
          {/* Search Input */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <label className="text-gray-400 text-xs mb-1.5 sm:mb-2 font-medium">Tìm kiếm</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm mã acc, skin..."
                className="flex-1 min-w-0 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 text-sm border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 focus:border-blue-500 rounded-lg px-3 sm:px-4 h-10 sm:h-[42px] focus:outline-none transition-all"
              />
              <button
                onClick={handleSearchSubmit}
                disabled={isPending}
                className="px-3 sm:px-4 h-10 sm:h-[42px] bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                title="Tìm kiếm"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-col">
            <label className="text-gray-400 text-xs mb-1.5 sm:mb-2 font-medium">Sắp xếp theo</label>
            <FilterDropdown
              label="Chọn cách sắp xếp"
              options={sortOptions}
              value={sortBy}
              onChange={handleSortChange}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="text-gray-400 text-xs mb-1.5 sm:mb-2 font-medium">Mức giá</label>
            <FilterDropdown
              label="Chọn mức giá"
              options={priceFilterOptions}
              value={priceFilter}
              onChange={handlePriceChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-800">
          <div className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              Hiển thị <span className="text-blue-400 font-semibold">{accounts.length}</span> /{' '}
              {displayCount} tài khoản
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              disabled={isPending}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              ✖ Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-semibold">Đang tải danh sách...</p>
        </div>
      ) : accounts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {accounts.map((account) => {
              const pkg = account.package;
              const typeName = pkg?.type?.name || pkg?.title || 'Game';
              const isRandomType = pkg?.mode === 'RANDOM';
              const isCloneAccount = isClone || account.isClone;

              // For clone accounts, we still use NormalAccountCard but it will show quantity
              return isRandomType ? (
                <RandomAccountCard key={account._id} account={account} typeName={typeName} />
              ) : (
                <NormalAccountCard 
                  key={account._id} 
                  account={account} 
                  typeName={typeName} 
                  showQuantity={isCloneAccount}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrevious || isPending}
                className="px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
              >
                Trước
              </button>
              <span className="text-sm text-muted-foreground">
                Trang {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNext || isPending}
                className="px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : hasActiveFilters ? (
        <EmptyState mode="search-not-found" onReset={handleResetFilters} />
      ) : (
        <EmptyState
          mode="out-of-stock"
          title="Danh sách đang trống"
          description="Hiện tại chưa có tài khoản nào trong danh mục này. Vui lòng quay lại sau hoặc tham khảo các danh mục game khác nhé!"
          showContactButton
        />
      )}
    </>
  );
}
