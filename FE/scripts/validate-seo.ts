/**
 * SEO Metadata Validation Script
 * Run with: npx ts-node scripts/validate-seo.ts
 * Or add to package.json: "validate-seo": "ts-node scripts/validate-seo.ts"
 */

interface SEOValidationResult {
  page: string;
  title: {
    value: string;
    length: number;
    valid: boolean;
    warning?: string;
  };
  description: {
    value: string;
    length: number;
    valid: boolean;
    warning?: string;
  };
  keywords: string[];
  hasCanonical: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasJsonLd: boolean;
}

interface ValidationSummary {
  totalPages: number;
  validPages: number;
  warnings: string[];
  errors: string[];
}

// SEO validation rules
const RULES = {
  title: {
    minLength: 30,
    maxLength: 60,
    optimalMin: 50,
    optimalMax: 60,
  },
  description: {
    minLength: 100,
    maxLength: 160,
    optimalMin: 130,
    optimalMax: 155,
  },
  keywords: {
    required: [
      'liên quân',
      'bán nick',
      'mua acc',
      'uy tín',
      'giá rẻ',
    ],
  },
};

// Pages to validate
const PAGES_TO_VALIDATE = [
  { path: '/', name: 'Trang chủ' },
  { path: '/lien-quan-mobile', name: 'Liên Quân Mobile' },
  { path: '/random', name: 'Random Account' },
  { path: '/category', name: 'Danh mục' },
];

function validateTitle(title: string): SEOValidationResult['title'] {
  const length = title.length;
  let valid = true;
  let warning: string | undefined;

  if (length < RULES.title.minLength) {
    valid = false;
    warning = `Title quá ngắn (${length} chars). Tối thiểu ${RULES.title.minLength} chars.`;
  } else if (length > RULES.title.maxLength) {
    valid = false;
    warning = `Title quá dài (${length} chars). Tối đa ${RULES.title.maxLength} chars.`;
  } else if (length < RULES.title.optimalMin) {
    warning = `Title ngắn hơn tối ưu (${length} chars). Tối ưu ${RULES.title.optimalMin}-${RULES.title.optimalMax} chars.`;
  }

  return { value: title, length, valid, warning };
}

function validateDescription(description: string): SEOValidationResult['description'] {
  const length = description.length;
  let valid = true;
  let warning: string | undefined;

  if (length < RULES.description.minLength) {
    valid = false;
    warning = `Description quá ngắn (${length} chars). Tối thiểu ${RULES.description.minLength} chars.`;
  } else if (length > RULES.description.maxLength) {
    valid = false;
    warning = `Description quá dài (${length} chars). Tối đa ${RULES.description.maxLength} chars.`;
  } else if (length < RULES.description.optimalMin || length > RULES.description.optimalMax) {
    warning = `Description ngoài vùng tối ưu (${length} chars). Tối ưu ${RULES.description.optimalMin}-${RULES.description.optimalMax} chars.`;
  }

  return { value: description, length, valid, warning };
}

function checkRequiredKeywords(keywords: string[], title: string, description: string): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  const missing: string[] = [];

  for (const keyword of RULES.keywords.required) {
    if (!combined.includes(keyword.toLowerCase())) {
      missing.push(keyword);
    }
  }

  return missing;
}

// Sample metadata for testing (in real usage, fetch from pages)
const SAMPLE_METADATA = {
  '/': {
    title: 'Shop Bán Nick Liên Quân Uy Tín - Mua Acc LQ Giá Rẻ, Chất Lượng | SHOPACVN',
    description: 'SHOPACVN.COM - Shop bán nick Liên Quân uy tín #1 Việt Nam. Mua acc Liên Quân giá rẻ, chất lượng, full tướng skin. Giao dịch tự động 24/7, bảo hành 100%.',
    keywords: ['bán nick liên quân', 'mua acc liên quân', 'shop acc uy tín'],
    hasCanonical: true,
    hasOpenGraph: true,
    hasTwitterCard: true,
    hasJsonLd: true,
  },
};

function runValidation(): void {
  console.log('🔍 SHOPACVN.COM SEO Validation\n');
  console.log('='.repeat(60));
  
  const summary: ValidationSummary = {
    totalPages: 0,
    validPages: 0,
    warnings: [],
    errors: [],
  };

  for (const page of PAGES_TO_VALIDATE) {
    const metadata = SAMPLE_METADATA[page.path as keyof typeof SAMPLE_METADATA];
    
    if (!metadata) {
      console.log(`\n⚠️ ${page.name} (${page.path}): Không có metadata sample`);
      summary.warnings.push(`${page.path}: Thiếu metadata sample`);
      continue;
    }

    console.log(`\n📄 ${page.name} (${page.path})`);
    console.log('-'.repeat(40));

    summary.totalPages++;

    // Validate title
    const titleResult = validateTitle(metadata.title);
    const titleIcon = titleResult.valid ? '✅' : '❌';
    console.log(`${titleIcon} Title: ${titleResult.length} chars`);
    if (titleResult.warning) {
      console.log(`   ⚠️ ${titleResult.warning}`);
      summary.warnings.push(`${page.path}: ${titleResult.warning}`);
    }

    // Validate description
    const descResult = validateDescription(metadata.description);
    const descIcon = descResult.valid ? '✅' : '❌';
    console.log(`${descIcon} Description: ${descResult.length} chars`);
    if (descResult.warning) {
      console.log(`   ⚠️ ${descResult.warning}`);
      summary.warnings.push(`${page.path}: ${descResult.warning}`);
    }

    // Check required keywords
    const missingKeywords = checkRequiredKeywords(
      metadata.keywords,
      metadata.title,
      metadata.description
    );
    if (missingKeywords.length > 0) {
      console.log(`⚠️ Thiếu keywords: ${missingKeywords.join(', ')}`);
      summary.warnings.push(`${page.path}: Thiếu keywords - ${missingKeywords.join(', ')}`);
    } else {
      console.log('✅ Keywords: Đầy đủ');
    }

    // Check other SEO elements
    console.log(`${metadata.hasCanonical ? '✅' : '❌'} Canonical URL`);
    console.log(`${metadata.hasOpenGraph ? '✅' : '❌'} Open Graph`);
    console.log(`${metadata.hasTwitterCard ? '✅' : '❌'} Twitter Card`);
    console.log(`${metadata.hasJsonLd ? '✅' : '❌'} JSON-LD`);

    if (titleResult.valid && descResult.valid) {
      summary.validPages++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total pages checked: ${summary.totalPages}`);
  console.log(`Valid pages: ${summary.validPages}/${summary.totalPages}`);
  console.log(`Warnings: ${summary.warnings.length}`);
  console.log(`Errors: ${summary.errors.length}`);

  if (summary.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    summary.warnings.forEach(w => console.log(`   - ${w}`));
  }

  if (summary.errors.length > 0) {
    console.log('\n❌ Errors:');
    summary.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log('\n✨ Validation complete!');
}

// Run validation
runValidation();
