'use client';
import { Heart, History, LogIn, LogOut, User, UserPlus, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { ROUTES } from '@/routes';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { isAuthenticated, user } = useAuth();
  const { mutate: logout } = useLogout();

  if (!open) return null;

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-xl animate-in slide-in-from-top-5 duration-300 z-50">
      <div className="p-3 space-y-2">
        {isAuthenticated && (
          <>
            {/* Số dư */}
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 dark:bg-primary/20 hover:bg-primary/15 dark:hover:bg-primary/25 rounded-lg transition-all border border-primary/20">
              <div className="p-1.5 rounded-md bg-background shadow-sm text-emerald-500">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Số dư</p>
                <p className="text-sm font-bold text-foreground">
                  {user?.balance?.toLocaleString('vi-VN') || '0'}đ
                </p>
              </div>
            </div>

            <nav className="grid gap-1.5">
              {[
                {
                  href: ROUTES.DEPOSIT,
                  icon: Wallet,
                  label: 'Nạp Tiền',
                  color: 'text-blue-500',
                },
                {
                  href: '/user/lich-su-nap-tien',
                  icon: History,
                  label: 'Lịch Sử Nạp',
                  color: 'text-purple-500',
                },
                {
                  href: '/user/danh-sach-yeu-thich',
                  icon: Heart,
                  label: 'Yêu Thích',
                  color: 'text-green-500',
                },
                {
                  href: '/user/lich-su-mua-hang',
                  icon: History,
                  label: 'Lịch Sử Mua',
                  color: 'text-orange-500',
                },
                {
                  href: '/user/thong-tin-tai-khoan',
                  icon: User,
                  label: 'Tài Khoản',
                  color: 'text-cyan-500',
                },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href as any}
                  className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted rounded-lg transition-all active:scale-[0.98]"
                  onClick={onClose}
                >
                  <div className={`p-1.5 rounded-md bg-background shadow-sm ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="h-px bg-border/50"></div>
          </>
        )}

        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-muted-foreground">Giao diện</span>
          <ThemeToggle />
        </div>

        <div className="pt-1">
          {isAuthenticated ? (
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted rounded-lg transition-all active:scale-[0.98]"
            >
              <div className="p-1.5 rounded-md bg-background shadow-sm text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-foreground">Đăng xuất</span>
            </Link>
          ) : (
            <div className="grid gap-1.5">
              <Link href={ROUTES.LOGIN as any} onClick={onClose}>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted rounded-lg transition-all active:scale-[0.98]">
                  <div className="p-1.5 rounded-md bg-background shadow-sm text-blue-500">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Đăng nhập</span>
                </div>
              </Link>
              <Link href={ROUTES.REGISTER as any} onClick={onClose}>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted rounded-lg transition-all active:scale-[0.98]">
                  <div className="p-1.5 rounded-md bg-background shadow-sm text-purple-500">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Đăng ký</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
