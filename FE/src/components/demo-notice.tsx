import { Info } from 'lucide-react';
import Link from 'next/link';

export function DemoNotice({ feature }: { feature: string }) {
  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-2xl items-center px-4">
      <section className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
        <Info className="mx-auto mb-4 size-10 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-bold">{feature}</h1>
        <p className="mt-3 text-muted-foreground">
          Tính năng này đã được tạm lược bỏ trong phiên bản demo công khai.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground"
        >
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
