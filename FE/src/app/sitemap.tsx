import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopacvn.com';
  const currentDate = new Date();

  // Static pages with SEO priorities
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - Highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Main category pages - Very high priority
    {
      url: `${baseUrl}/lien-quan-mobile`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    // Random accounts section
    {
      url: `${baseUrl}/random`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    // Category listing
    {
      url: `${baseUrl}/category`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    // Clone accounts section (if applicable)
    {
      url: `${baseUrl}/clone`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // User-related pages (lower priority for SEO)
    {
      url: `${baseUrl}/user/topup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/user/transactions`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Policy and info pages
    {
      url: `${baseUrl}/huong-dan-mua-hang`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/chinh-sach-bao-mat`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dieu-khoan-su-dung`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Try to fetch dynamic product/category data
  // Note: Uncomment and configure when API is available
  /*
  let dynamicPages: MetadataRoute.Sitemap = [];
  
  try {
    // Fetch categories
    const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      
      // Add category pages
      dynamicPages = categories.data.map((category: { slug: string; updatedAt?: string }) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
    
    // Fetch top products (limit to prevent sitemap bloat)
    const productsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/accounts?limit=200&status=AVAILABLE`,
      { next: { revalidate: 3600 } }
    );
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      
      // Add product pages
      const productPages = products.data.map((product: { 
        slug: string; 
        _id: string;
        package?: { slug: string };
        updatedAt?: string;
      }) => ({
        url: `${baseUrl}/${product.package?.slug || 'account'}/${product.slug || product._id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      
      dynamicPages = [...dynamicPages, ...productPages];
    }
  } catch (error) {
    console.error('Error fetching dynamic sitemap data:', error);
  }
  */

  // Return combined sitemap
  return [...staticPages];
}

// Enable ISR for sitemap
export const revalidate = 3600; // Revalidate every hour
