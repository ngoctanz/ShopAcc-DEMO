import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopacvn.com';

  return {
    rules: [
      // General crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/user/',
          '/auth/',
          '/_next/',
          '/private/',
          '/*.json$',
          '/payment/callback',
          '/payment/result',
        ],
      },
      // Googlebot - Priority crawler
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/user/', '/auth/', '/payment/'],
      },
      // Googlebot Image
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/public/'],
      },
      // Bingbot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/user/', '/auth/', '/payment/'],
        crawlDelay: 1,
      },
      // Cốc Cốc - Vietnamese search engine
      {
        userAgent: 'coccocbot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/user/', '/auth/', '/payment/'],
        crawlDelay: 1,
      },
      // Cốc Cốc Image Bot
      {
        userAgent: 'coccocbot-image',
        allow: ['/images/', '/public/'],
      },
      // Yandex
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/user/', '/auth/', '/payment/'],
        crawlDelay: 2,
      },
      // DuckDuckBot
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/user/', '/auth/', '/payment/'],
      },
      // Facebot - Facebook crawler
      {
        userAgent: 'facebot',
        allow: '/',
      },
      // Twitterbot
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      // Block bad bots
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
