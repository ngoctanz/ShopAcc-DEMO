'use client';

import { useId } from 'react';
import {
  organizationJsonLd,
  websiteJsonLd,
  productJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  DEFAULT_PRODUCT_FAQ,
} from '@/lib/seo';

/**
 * Base JSON-LD Component
 */
function JsonLdScript({ data, id }: { data: object; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}

/**
 * Organization JSON-LD - Use in layout.tsx
 */
export function OrganizationJsonLd() {
  const id = useId();
  return <JsonLdScript data={organizationJsonLd()} id={`org-jsonld-${id}`} />;
}

/**
 * Website JSON-LD with SearchAction - Use in layout.tsx
 */
export function WebsiteJsonLd() {
  const id = useId();
  return <JsonLdScript data={websiteJsonLd()} id={`website-jsonld-${id}`} />;
}

/**
 * LocalBusiness JSON-LD - Use in layout.tsx
 */
export function LocalBusinessJsonLd() {
  const id = useId();
  return <JsonLdScript data={localBusinessJsonLd()} id={`local-biz-jsonld-${id}`} />;
}

/**
 * Product JSON-LD - Use in product detail pages
 */
export function ProductJsonLd({
  product,
}: {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    gameName?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    condition?: 'NewCondition' | 'UsedCondition';
    sku?: string;
    rating?: {
      value: number;
      count: number;
    };
  };
}) {
  const id = useId();
  return <JsonLdScript data={productJsonLd(product)} id={`product-jsonld-${id}`} />;
}

/**
 * Breadcrumb JSON-LD - Use in all pages with breadcrumbs
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const id = useId();
  return <JsonLdScript data={breadcrumbJsonLd(items)} id={`breadcrumb-jsonld-${id}`} />;
}

/**
 * FAQ JSON-LD - Use in product pages or FAQ sections
 */
export function FAQJsonLd({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const id = useId();
  return <JsonLdScript data={faqJsonLd(items)} id={`faq-jsonld-${id}`} />;
}

/**
 * Default Product FAQ JSON-LD
 */
export function DefaultProductFAQJsonLd() {
  const id = useId();
  return <JsonLdScript data={faqJsonLd(DEFAULT_PRODUCT_FAQ)} id={`default-faq-jsonld-${id}`} />;
}

/**
 * Combined JSON-LD for Homepage - Organization + Website + LocalBusiness
 */
export function HomepageJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <LocalBusinessJsonLd />
    </>
  );
}

/**
 * Combined JSON-LD for Product Pages
 */
export function ProductPageJsonLd({
  product,
  breadcrumbs,
  includeFaq = true,
}: {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    gameName?: string;
  };
  breadcrumbs: Array<{ name: string; url: string }>;
  includeFaq?: boolean;
}) {
  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {includeFaq && <DefaultProductFAQJsonLd />}
    </>
  );
}
