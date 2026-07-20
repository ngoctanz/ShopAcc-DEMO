import LayoutDefault from '@/components/layout/layout-default';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <LayoutDefault>{children}</LayoutDefault>;
}
