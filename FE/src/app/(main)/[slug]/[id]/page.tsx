import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductPageJsonLd } from '@/components/seo/json-ld';
import { SEO_CONFIG, buildCanonicalUrl } from '@/lib/seo';
import { ROUTES } from '@/routes';
import AccountDetailSection from '@/sections/account-sections/account-detail.section';
import { accountService } from '@/services/account.service';
import { parseSlugId } from '@/utils/format-slug.util';
import { packageService } from '@/services/account-package.service';

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const accountId = parseSlugId(id);

  try {
    const account = await accountService.getAccountById(accountId);

    const gameName = account.package?.type?.name || account.package?.title || 'Liên Quân Mobile';
    const price = account.price;
    const accountCode = account.code || accountId;

    // SEO-optimized title (50-60 chars)
    const title = `Nick ${gameName} #${accountCode} - ${price.toLocaleString('vi-VN')}đ Uy Tín`;
    
    // SEO-optimized description (130-155 chars)
    const shortInfo = account.accountInfo?.substring(0, 60) || 'Acc chất lượng cao';
    const description = `Mua nick ${gameName} #${accountCode}. ${shortInfo}. Giá ${price.toLocaleString('vi-VN')}đ. Giao dịch tự động 24/7, bảo hành 100%.`;
    
    const canonicalUrl = buildCanonicalUrl(`/${slug}/${id}`);
    const images = account.images?.length > 0 ? account.images : ['/images/banner_topup.jpg'];

    return {
      title,
      description,
      keywords: [
        `nick ${gameName.toLowerCase()} ${accountCode}`,
        `mua nick ${gameName.toLowerCase()}`,
        `bán acc ${gameName.toLowerCase()}`,
        `acc ${gameName.toLowerCase()} giá rẻ`,
        `nick ${gameName.toLowerCase()} uy tín`,
        `tài khoản ${gameName.toLowerCase()} chất lượng`,
        'mua acc liên quân',
        'bán nick liên quân uy tín',
        'acc liên quân giá rẻ',
        'shop acc game uy tín',
        'nick game bảo hành',
      ],
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'vi-VN': canonicalUrl,
          'vi': canonicalUrl,
        },
      },
      openGraph: {
        title: `Nick ${gameName} #${accountCode} - Acc Uy Tín Giá Rẻ | SHOPACVN`,
        description,
        url: canonicalUrl,
        type: 'website',
        locale: 'vi_VN',
        siteName: SEO_CONFIG.brand.name,
        images: images.map((img, index) => ({
          url: img.startsWith('http') ? img : `${SEO_CONFIG.siteUrl}${img}`,
          width: 1200,
          height: 630,
          alt: `Nick ${gameName} #${accountCode} - Hình ${index + 1}`,
        })),
      },
      twitter: {
        card: 'summary_large_image',
        title: `Nick ${gameName} #${accountCode} - ${price.toLocaleString('vi-VN')}đ`,
        description: `Mua nick ${gameName} uy tín. ${shortInfo}. Giao dịch tự động, bảo hành 100%.`,
        images: images.slice(0, 1),
      },
    };
  } catch {
    return { 
      title: 'Không tìm thấy tài khoản',
      description: 'Tài khoản bạn tìm kiếm không tồn tại hoặc đã được bán.',
    };
  }
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const accountId = parseSlugId(id);

  let account;
  try {
    account = await accountService.getAccountById(accountId);
  } catch {
    notFound();
  }

  if (!account) {
    notFound();
  }

  // Fetch related packages
  const packages = (await packageService.getAllPackages({ isActive: true })).slice(0, 4);

  const gameName =
    (typeof account.package?.type === 'object'
      ? account.package?.type?.name
      : account.package?.type) ||
    account.package?.title ||
    'Liên Quân Mobile';

  // Đảm bảo packageSlug luôn là string
  const getPackageSlug = () => {
    if (account.package?.slug && typeof account.package.slug === 'string') {
      return account.package.slug;
    }
    if (typeof slug === 'string') {
      return slug;
    }
    return '';
  };
  const packageSlug = getPackageSlug();
  const packageTitle = account.package?.title || gameName;

  // Product data for JSON-LD
  const productData = {
    id: accountId,
    name: `Nick ${gameName} #${account.code || accountId}`,
    description: account.accountInfo || `Tài khoản ${gameName} chất lượng cao`,
    price: account.price,
    images: account.images || [],
    gameName,
    availability: 'InStock' as const,
  };

  // Breadcrumb data for JSON-LD
  const breadcrumbs = [
    { name: 'Trang chủ', url: '/' },
    { name: packageTitle, url: `/${packageSlug}` },
    { name: `#${account.code}`, url: `/${packageSlug}/${id}` },
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <ProductPageJsonLd product={productData} breadcrumbs={breadcrumbs} includeFaq={true} />

      {/* Background */}
      <div className="fixed inset-0 z-[-1]">
        {account.coverImage || (account.images && account.images.length > 0) ? (
          <>
            <Image
              src={account.coverImage || account.images[0]}
              alt={`Nick ${gameName} #${account.code} - SHOPACVN.COM`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Breadcrumb with semantic markup */}
          <nav aria-label="Đường dẫn" className="mb-6 text-sm">
            <ol className="flex items-center" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link
                  href={ROUTES.HOME}
                  itemProp="item"
                  className="text-gray-400 hover:text-black dark:hover:text-white hover:underline hover:font-semibold transition-all duration-200"
                >
                  <span itemProp="name">Trang chủ</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <span className="text-gray-600 mx-2">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link
                  href={`/${packageSlug}`}
                  itemProp="item"
                  className="text-gray-400 hover:text-black dark:hover:text-white hover:underline hover:font-semibold transition-all duration-200"
                >
                  <span itemProp="name">{packageTitle}</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <span className="text-gray-600 mx-2">/</span>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span itemProp="name" className="text-gray-900 dark:text-white font-bold">
                  #{account.code}
                </span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>

          {/* Account Detail Section */}
          <AccountDetailSection account={account} gameName={gameName} />

          {/* Instruction Section */}
          <div className="mt-8 bg-card rounded-lg p-6 shadow-xl text-foreground transition-colors duration-300 relative group overflow-hidden">
            <div className="space-y-3 font-medium text-[15px] leading-relaxed relative z-10">
              <p className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span>
                  <span className="font-bold text-primary">Thanh toán bằng số dư Shop</span> - Nạp
                  tiền vào tài khoản trước khi mua.
                  <span className="text-muted-foreground italic ml-1">
                    (Kiểm tra kỹ thông tin nạp tiền trước khi chuyển khoản)
                  </span>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span>
                  Sau khi mua thành công, xem thông tin tài khoản trong{' '}
                  <Link
                    href="/user/lich-su-mua-hang"
                    className="text-primary underline font-bold uppercase"
                  >
                    LỊCH SỬ MUA HÀNG
                  </Link>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span>
                  <span className="text-destructive px-1.5 py-0.5 font-bold text-sm">
                    QUAN TRỌNG:
                  </span>{' '}
                  Đổi mật khẩu ngay sau khi nhận acc để bảo mật tài khoản
                  <span className="text-primary mx-1">==&gt;</span>
                  <a
                    href="https://account.garena.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-bold uppercase"
                  >
                    ĐỔI MẬT KHẨU TẠI ĐÂY
                  </a>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span>
                  Thông tin fanpage và khuyến mãi được lược bỏ trong phiên bản demo.
                </span>
              </p>

              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
