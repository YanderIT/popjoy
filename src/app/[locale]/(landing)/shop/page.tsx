import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { CategoryProductsList } from '@/shared/blocks/shop/category-products-list';
import {
  getProductsWithSkus,
  ProductStatus,
  ProductWithSkus,
} from '@/shared/models/product';
import {
  getTaxonomies,
  TaxonomyStatus,
  TaxonomyType,
} from '@/shared/models/taxonomy';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('pages.shop.metadata');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical:
        locale !== envConfigs.locale
          ? `${envConfigs.app_url}/${locale}/shop`
          : `${envConfigs.app_url}/shop`,
    },
  };
}

interface CategoryProduct {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  currency: string;
  minPrice?: number;
  maxPrice?: number;
  skus: {
    id: string;
    price: number;
    originalPrice: number | null;
  }[];
}

interface Category {
  id: string;
  slug: string;
  title: string;
  url: string;
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.shop');

  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);
  const limit = 12;

  // Get all active products
  const { products: productsData, total } = await getProductsWithSkus({
    status: ProductStatus.ACTIVE,
    page,
    limit,
  });

  // Get all categories for navigation
  const categoriesData = await getTaxonomies({
    type: TaxonomyType.CATEGORY,
    status: TaxonomyStatus.PUBLISHED,
  });

  // Current "All" category
  const currentCategory: Category = {
    id: 'all',
    slug: 'all',
    title: t('messages.all'),
    url: '/shop',
  };

  // Build categories list
  const categories: Category[] = categoriesData.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    title: cat.title,
    url: `/shop/category/${cat.slug}`,
  }));
  categories.unshift(currentCategory);

  // Build products
  const products: CategoryProduct[] = productsData.map((p: ProductWithSkus) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.image,
    currency: p.currency,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    skus: p.skus.map((s) => ({
      id: s.id,
      price: s.price,
      originalPrice: s.originalPrice,
    })),
  }));

  return (
    <CategoryProductsList
      title={t('page.sections.products.title')}
      description={t('page.sections.products.description')}
      categories={categories}
      currentCategory={currentCategory}
      products={products}
      total={total}
      page={page}
      limit={limit}
      noProductsMessage={t('messages.no_products')}
    />
  );
}
