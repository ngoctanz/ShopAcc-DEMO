'use client';
import {
  ChevronDown,
  Heart,
  History,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSeason } from '@/contexts/season-context';
import { useAuth, useLogout } from '@/hooks/useAuth';
import useClickOutSide from '@/hooks/useClickOutSide';
import { AdminRoutes, ROUTES } from '@/routes';
import { MobileMenu } from './mobile-menu';
import { SLOGAN_CONFIG } from './seasonal/assets';
import HeaderSeasonalDecor from './seasonal/HeaderSeasonalDecor';
import SeasonSelector from './seasonal/SeasonSelector';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { season } = useSeason();
  const { user, isAuthenticated } = useAuth();
  const { mutate: logout } = useLogout();

  // Memoized values
  const userDisplayName = useMemo(() => user?.name || 'Khách', [user?.name]);
  const userBalance = useMemo(() => user?.balance || 0, [user?.balance]);
  const seasonConfig = useMemo(() => (SLOGAN_CONFIG as any)[season], [season]);

  // Close dropdown when clicking outside
  const { nodeRef: dropdownRef } = useClickOutSide(() => setDropdownOpen(false));

  // Memoized callbacks
  const handleLogout = useCallback(() => {
    setDropdownOpen(false);
    logout();
  }, [logout]);

  const toggleDropdown = useCallback(() => setDropdownOpen((prev) => !prev), []);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="w-full sticky top-0 z-50 transition-all duration-300 relative group">
      {/* Glass Background with Gradient Border Bottom */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50 group-hover:border-primary/20 transition-colors"></div>

      <HeaderSeasonalDecor />

      {/* Top Bar - Made slightly more prominent but elegant */}
      <div className="relative hidden md:block z-10 border-b border-border/40 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-6 text-muted-foreground/80 hover:text-foreground transition-colors">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span className="hidden sm:inline tracking-wide">
                Hệ thống bán acc game uy tín số 1 Việt Nam
              </span>
            </span>
          </div>
          <div className="flex items-center text-muted-foreground/60 gap-4">
            <span className="hover:text-primary cursor-pointer transition-colors">Hỗ trợ 24/7</span>
            <div className="w-px h-3 bg-border"></div>
            <span className="hover:text-primary cursor-pointer transition-colors">
              Tin tức game
            </span>
          </div>
          {/* Show balance for logged in users */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wallet className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                {userBalance.toLocaleString('vi-VN')}đ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-2 md:py-3">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo Section */}
          <Link href={ROUTES.HOME} className="flex items-center gap-3 relative group/logo">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500"></div>
            <img
              src="/images/logo.png"
              alt="Shop Game Logo"
              className="h-14 md:h-[70px] w-auto object-contain relative z-10 transition-transform duration-300 group-hover/logo:scale-105 drop-shadow-sm dark:invert"
            />
          </Link>

          {/* Brand Title - Desktop (Seasonal Slogan) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-auto items-center justify-center flex-col gap-1">
            <h1
              className={`text-xl font-extrabold font-[family-name:var(--font-be-vietnam-pro)] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r animate-gradient bg-[length:200%_auto] hover:scale-105 transition-transform duration-300 cursor-default shadow-sm ${
                seasonConfig?.gradient || 'from-blue-600 via-purple-500 to-pink-500'
              }`}
            >
              {seasonConfig?.text || 'Shop Game Uy Tín'}
            </h1>
            <div className="flex items-center gap-2 w-full justify-center opacity-80">
              <div
                className={`h-[1px] w-12 bg-gradient-to-r from-transparent ${
                  seasonConfig?.dividerStart || 'to-blue-400'
                }`}
              />
              <span className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">
                {seasonConfig?.subtext || 'Chất Lượng • An Toàn'}
              </span>
              <div
                className={`h-[1px] w-12 bg-gradient-to-l from-transparent ${
                  seasonConfig?.dividerEnd || 'to-purple-400'
                }`}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 mr-2">
              <Link
                href={ROUTES.DEPOSIT as any}
                className="relative px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-blue-600 transition-colors group/link overflow-hidden rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/10"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <Wallet className="w-4 h-4 group-hover/link:animate-bounce" />
                  Nạp Tiền
                </div>
              </Link>
            </nav>

            <div className="h-8 w-px bg-border/60 hidden md:block"></div>

            <SeasonSelector />

            <div className="h-8 w-px bg-border/60 hidden md:block"></div>

            <div className="hidden md:block scale-90">
              <ThemeToggle />
            </div>

            {/* User Dropdown */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <Button
                onClick={toggleDropdown}
                variant="ghost"
                className={`flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm border transition-all duration-300 rounded-full shadow-sm hover:shadow-md ${
                  dropdownOpen
                    ? 'border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-foreground max-w-[100px] truncate">
                  {userDisplayName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${
                    dropdownOpen ? 'rotate-180 text-blue-500' : ''
                  }`}
                />
              </Button>

              {/* Enhanced Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                  <div className="p-1">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border/50">
                      <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Tài khoản
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                        {userDisplayName}
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      {isAuthenticated ? (
                        <>
                          {user?.role === 'admin' && (
                            <Link
                              href={AdminRoutes.DASHBOARD as any}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group/item"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/40 transition-colors">
                                <LayoutDashboard className="w-4 h-4" />
                              </div>
                              Quản trị viên
                            </Link>
                          )}
                          <Link
                            href="/user/thong-tin-tai-khoan"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group/item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/40 transition-colors">
                              <User className="w-4 h-4" />
                            </div>
                            Thông tin cá nhân
                          </Link>
                          <Link
                            href="/user/danh-sach-yeu-thich"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all group/item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-green-100 dark:group-hover/item:bg-green-900/40 transition-colors">
                              <Heart className="w-4 h-4" />
                            </div>
                            Yêu thích
                          </Link>
                          <Link
                            href="/user/lich-su-mua-hang"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all group/item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-orange-100 dark:group-hover/item:bg-orange-900/40 transition-colors">
                              <History className="w-4 h-4" />
                            </div>
                            Lịch sử mua
                          </Link>
                          <Link
                            href={ROUTES.TOPUP_HISTORY as any}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-all group/item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-cyan-100 dark:group-hover/item:bg-cyan-900/40 transition-colors">
                              <Wallet className="w-4 h-4" />
                            </div>
                            Lịch sử nạp tiền
                          </Link>
                          <div className="h-px bg-border/50 my-1 mx-2" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all group/item mt-1"
                          >
                            <div className="p-1.5 rounded-lg bg-red-100/50 dark:bg-red-900/40 group-hover/item:bg-red-100 transition-colors">
                              <LogOut className="w-4 h-4" />
                            </div>
                            Đăng xuất
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={ROUTES.LOGIN as any}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group/item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/40 transition-colors">
                              <LogIn className="w-4 h-4" />
                            </div>
                            Đăng nhập
                          </Link>
                          <Link
                            href={ROUTES.REGISTER as any}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all group/item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-purple-100 dark:group-hover/item:bg-purple-900/40 transition-colors">
                              <UserPlus className="w-4 h-4" />
                            </div>
                            Đăng ký ngay
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        <MobileMenu open={menuOpen} onClose={closeMenu} />
      </div>
    </header>
  );
}

export default Header;
