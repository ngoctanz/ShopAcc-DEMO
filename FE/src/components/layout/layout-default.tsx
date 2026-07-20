'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import SeasonalEffect from '@/components/layout/seassonal-effect';

function LayoutDefault({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <SeasonalEffect />
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}

export default LayoutDefault;
