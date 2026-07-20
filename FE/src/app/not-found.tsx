import { Home, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-8xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Không tìm thấy trang
        </h1>

        {/* Error Description */}
        <p className="text-muted-foreground mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Hoặc xem các trang phổ biến:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/lien-quan-mobile"
              className="text-sm text-primary hover:underline font-medium"
            >
              Nick Liên Quân
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/user/topup"
              className="text-sm text-primary hover:underline font-medium"
            >
              Nạp tiền
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
