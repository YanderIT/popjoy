'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { CategoryNav } from '@/shared/components/category-nav';
import { usePrice } from '@/shared/hooks/use-price';
import { cn } from '@/shared/lib/utils';

interface ProductSku {
  id: string;
  price: number;
  originalPrice: number | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  currency: string;
  minPrice?: number;
  maxPrice?: number;
  skus: ProductSku[];
}

interface Category {
  id: string;
  slug: string;
  title: string;
  url: string;
}

interface CategoryProductsListProps {
  title: string;
  description: string;
  categories: Category[];
  currentCategory: Category;
  products: Product[];
  total: number;
  page: number;
  limit: number;
  noProductsMessage: string;
}

export function CategoryProductsList({
  title,
  description,
  categories,
  currentCategory,
  products,
  total,
  page,
  limit,
  noProductsMessage,
}: CategoryProductsListProps) {
  const t = useTranslations('shop');
  const { formatPrice } = usePrice();
  const totalPages = Math.ceil(total / limit);

  const renderPrice = (product: Product) => {
    if (!product.minPrice) return null;

    const hasRange = product.maxPrice && product.minPrice !== product.maxPrice;
    const hasDiscount = product.skus.some(
      (s) => s.originalPrice && s.originalPrice > s.price
    );

    return (
      <div className="mb-2 md:mb-4 flex items-baseline gap-1 md:gap-2">
        <span className="text-sm md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {hasRange
            ? `${formatPrice(product.minPrice, product.currency)} - ${formatPrice(product.maxPrice!, product.currency)}`
            : formatPrice(product.minPrice, product.currency)}
        </span>
        {hasDiscount && !hasRange && product.skus[0]?.originalPrice && (
          <span className="text-sm text-zinc-400 line-through">
            {formatPrice(product.skus[0].originalPrice, product.currency)}
          </span>
        )}
      </div>
    );
  };

  return (
    <section className="py-4 md:py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          className="hidden md:block mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            {description}
          </p>
        </motion.div>

        {/* Category Navigation */}
        <motion.div
          className="mb-4 md:mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CategoryNav
            categories={categories}
            currentCategoryId={currentCategory.id}
            variant="button"
            threshold={5}
          />
        </motion.div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link href={`/shop/${product.id}`} className="block">
                    <Card className="group overflow-hidden border-0 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-zinc-900">
                      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-zinc-100 dark:bg-zinc-800">
                        <motion.div
                          className="h-full w-full"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <Image
                            src={product.image || '/imgs/cases/1.png'}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover"
                          />
                        </motion.div>
                        {product.skus.some(
                          (s) => s.originalPrice && s.originalPrice > s.price
                        ) && (
                          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                            {t('product.sale')}
                          </div>
                        )}
                        {product.skus.length > 1 && (
                          <div className="absolute right-3 top-3 rounded-full bg-zinc-900/80 px-2 py-1 text-xs font-medium text-white">
                            {t('product.options_count', { count: product.skus.length })}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2 md:p-5">
                        <h3 className="mb-1 md:mb-2 truncate text-sm md:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </h3>
                        {renderPrice(product)}
                        <Button
                          className="w-full gap-1 md:gap-2 h-8 md:h-10 text-xs md:text-sm bg-zinc-900 font-medium text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                          size="sm"
                        >
                          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                          {t('product.add_to_cart')}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="mt-12 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {page > 1 && (
                  <Link
                    href={`${currentCategory.url}?page=${page - 1}`}
                  >
                    <Button variant="outline">{t('pagination.previous')}</Button>
                  </Link>
                )}
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  {t('pagination.page_of', { page, total: totalPages })}
                </span>
                {page < totalPages && (
                  <Link
                    href={`${currentCategory.url}?page=${page + 1}`}
                  >
                    <Button variant="outline">{t('pagination.next')}</Button>
                  </Link>
                )}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            className="text-muted-foreground py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg">{noProductsMessage}</p>
            <Link href="/shop" className="mt-4 inline-block">
              <Button variant="outline">{t('common.view_all')}</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
