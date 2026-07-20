import { ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/json-ld';
import { SEO_CONFIG, buildCanonicalUrl, DEFAULT_PRODUCT_FAQ } from '@/lib/seo';
import ListAccountSection from '@/sections/account-sections/list-account.section';
import { packageService } from '@/services/account-package.service';

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const pkg = await packageService.getPackageById(slug);
    const gameName = pkg.title || 'Liên Quân Mobile';
    
    // SEO-optimized title (50-60 chars target)
    const title = `Mua Nick ${gameName} Giá Rẻ - Bán Acc ${gameName} Uy Tín`;
    
    // SEO-optimized description (130-155 chars)
    const description = `Shop bán nick ${gameName} uy tín. Acc giá rẻ, chất lượng, full tướng skin. Giao dịch tự động 24/7, bảo hành 100%. Nhận acc ngay!`;
    
    const canonicalUrl = buildCanonicalUrl(`/${slug}`);
    
    return {
      title,
      description,
      keywords: [
        `mua nick ${gameName.toLowerCase()}`,
        `bán nick ${gameName.toLowerCase()}`,
        `acc ${gameName.toLowerCase()} giá rẻ`,
        `shop ${gameName.toLowerCase()} uy tín`,
        `nick ${gameName.toLowerCase()} chất lượng`,
        `tài khoản ${gameName.toLowerCase()}`,
        'mua acc liên quân',
        'bán nick liên quân uy tín',
        'acc liên quân giá rẻ',
        'shop acc game uy tín',
      ],
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'vi-VN': canonicalUrl,
          'vi': canonicalUrl,
        },
      },
      openGraph: {
        title: `Mua Nick ${gameName} Uy Tín - Acc Giá Rẻ Chất Lượng | SHOPACVN`,
        description,
        url: canonicalUrl,
        type: 'website',
        locale: 'vi_VN',
        siteName: SEO_CONFIG.brand.name,
        images: [
          {
            url: pkg.image || '/images/banner_topup.jpg',
            width: 1200,
            height: 630,
            alt: `${gameName} - SHOPACVN.COM`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Mua Nick ${gameName} Giá Rẻ | SHOPACVN`,
        description,
        images: [pkg.image || '/images/banner_topup.jpg'],
      },
    };
  } catch {
    return { 
      title: 'Không tìm thấy trang',
      description: 'Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }
}

export default async function AccountListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Get package info only
  let pkg;
  try {
    pkg = await packageService.getPackageById(slug);
  } catch {
    notFound();
  }

  // RANDOM mode should redirect to /random/[slug]
  // CLONE mode is now displayed like LIST (with quantity column)
  if (pkg.mode === 'RANDOM') {
    notFound();
  }

  // Determine if this is a clone package
  const isClonePackage = pkg.mode === 'CLONE';

  // Breadcrumb data for JSON-LD
  const breadcrumbs = [
    { name: 'Trang chủ', url: '/' },
    { name: pkg.title, url: `/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 font-sans transition-colors duration-300">
      {/* JSON-LD Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd items={DEFAULT_PRODUCT_FAQ} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-primary uppercase inline-block tracking-tight">
            {pkg.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Shop bán nick {pkg.title} uy tín, acc giá rẻ, chất lượng cao
          </p>
          <div className="h-1 w-16 bg-primary mx-auto mt-3 rounded-full opacity-50" />
        </div>

        {/* Notification Box */}
        <div className="max-w-4xl mx-auto bg-card border border-primary/30 rounded-lg p-5 mb-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 text-sm font-semibold text-foreground/80 space-y-2 mb-5">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 bg-primary/10 rounded-md text-primary">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs md:text-sm">
                Cam kết bảo hành 100% tài khoản. Hỗ trợ đổi thông tin, bảo mật tài khoản.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 bg-destructive/10 rounded-md text-destructive">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs md:text-sm text-destructive">
                Vui lòng thay đổi mật khẩu ngay sau khi mua để bảo mật tuyệt đối.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            Thông tin liên hệ được lược bỏ trong phiên bản demo.
          </div>
        </div>

        {/* Account List - Client Component with API calls */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5 mb-8 transition-all">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-muted-foreground text-sm font-semibold animate-pulse">
                  Đang tải danh sách nick {pkg.title}...
                </p>
              </div>
            }
          >
            <ListAccountSection packageId={pkg._id} parentSlug={slug} isClone={isClonePackage} />
          </Suspense>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center p-5 bg-muted/10 rounded-lg border border-dashed border-border">
          <p className="font-bold text-muted-foreground">DEMO BY NGOCTANZ</p>
        </div>
      </div>
    </div>
  );
}
