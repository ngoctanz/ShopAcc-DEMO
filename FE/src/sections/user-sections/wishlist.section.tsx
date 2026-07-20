'use client';

import { Calendar, Heart, Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomPagination } from '@/components/ui/custom-pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePagination } from '@/hooks/usePagination';
import { type WishlistItemResponse, wishlistService } from '@/services/wishlist.service';
import { buildAccountDetailUrl } from '@/utils/format-slug.util';

export function WishlistSection() {
  const [items, setItems] = useState<WishlistItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedItems,
    setCurrentPage,
  } = usePagination({
    data: items,
    itemsPerPage: 5,
  });

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      // Fetch all items at once (no server-side pagination for now)
      const response = await wishlistService.getWishlist({
        page: 1,
        limit: 100,
      });
      // Handle both response formats: { data: [...] } or { items: [...] }
      const wishlistItems = response.data || (response as any).items || [];
      setItems(Array.isArray(wishlistItems) ? wishlistItems : []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Không thể tải danh sách yêu thích');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await wishlistService.removeFromWishlist(itemToDelete);
      toast.success('Đã xóa khỏi danh sách yêu thích');

      // Remove item from local state
      setItems((prev) => prev.filter((item) => item.accountId._id !== itemToDelete));
    } catch (_error) {
      toast.error('Lỗi khi xóa tài khoản');
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            Danh Sách Yêu Thích
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Quản lý các tài khoản bạn đang quan tâm
          </p>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl px-5 py-3">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Đã lưu</p>
          <p className="text-xl font-black text-red-600">{items.length} tài khoản</p>
        </div>
      </div>

      {/* Main Content List */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Danh sách trống</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
              Bạn chưa lưu tài khoản nào. Hãy dạo một vòng cửa hàng và thả tim cho tài khoản bạn
              thích nhé!
            </p>
            <Link href="/">
              <Button>Khám phá ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedItems.map((item, index) => {
              const account = item.accountId;
              if (!account) return null; // Skip if account is null

              // BE populates packageId, not package
              const pkg = (account as any).packageId || account.package;
              const accountType = pkg?.typeId || pkg?.type;
              const typeName = accountType?.name || pkg?.title || 'Game Account';
              const accountInfo =
                account.accountInfo || `Tài khoản #${account.code || account._id}`;
              const accountImage =
                account.coverImage || account.images?.[0] || '/images/placeholder.svg';

              // Build URL dùng hàm chung - cần cast account với package info
              const accountWithPkg = { ...account, package: pkg };
              const detailLink = buildAccountDetailUrl(accountWithPkg as any);

              return (
                <div
                  key={account._id || index}
                  className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between group"
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted border shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={accountImage}
                        alt="Account Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {account.status === 'SOLD' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white border border-white/50 px-1 rounded">
                            ĐÃ BÁN
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="text-[10px] px-1.5 h-5 font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          #{account.code || account._id.slice(-6).toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.addedAt)}
                        </span>
                      </div>

                      <Link
                        href={detailLink}
                        className="block group-hover:text-primary transition-colors"
                      >
                        <h3 className="font-bold text-foreground line-clamp-1 text-base sm:text-lg">
                          {pkg?.title || typeName}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{accountInfo}</p>
                      </Link>

                      <p className="text-lg font-bold text-red-600">
                        {account.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        onClick={() => setItemToDelete(account._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>

                      <Link href={detailLink} className="flex-1 sm:flex-none">
                        <Button
                          className="w-full sm:w-auto gap-2"
                          disabled={account.status === 'SOLD'}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {account.status === 'SOLD' ? 'Đã bán' : 'Mua ngay'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && items.length > 0 && (
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa khỏi danh sách yêu thích?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản này khỏi danh sách yêu thích không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button
              onClick={() => handleRemoveItem()}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Xóa ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
