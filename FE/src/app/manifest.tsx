import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SHOPACVN.COM - Shop Bán Nick Liên Quân Uy Tín',
    short_name: 'SHOPACVN',
    description:
      'Shop bán nick Liên Quân uy tín #1 Việt Nam. Mua acc Liên Quân giá rẻ, chất lượng, full tướng skin. Giao dịch tự động 24/7, bảo hành 100%.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#0f172a',
    theme_color: '#8b5cf6',
    orientation: 'portrait-primary',
    lang: 'vi',
    dir: 'ltr',
    categories: ['games', 'shopping', 'entertainment'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/images/logo.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/images/banner_topup.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
        // @ts-ignore - form_factor is valid but not in types
        form_factor: 'wide',
        label: 'SHOPACVN.COM - Shop Bán Nick Liên Quân Uy Tín',
      },
    ],
    shortcuts: [
      {
        name: 'Trang chủ',
        short_name: 'Trang chủ',
        description: 'Về trang chủ SHOPACVN',
        url: '/',
        icons: [{ src: '/images/logo.png', sizes: '96x96' }],
      },
      {
        name: 'Nick Liên Quân',
        short_name: 'Nick LQ',
        description: 'Xem danh sách nick Liên Quân',
        url: '/lien-quan-mobile',
        icons: [{ src: '/images/logo.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
  };
}
