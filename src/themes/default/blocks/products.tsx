'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { usePrice } from '@/shared/hooks/use-price';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

interface ProductSku {
  id: string;
  sku: string;
  attributes: string;
  price: number;
  originalPrice: number | null;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  currency: string;
  status: string;
  skus: ProductSku[];
  minPrice?: number;
  maxPrice?: number;
}

export function Products({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const t = useTranslations('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = usePrice();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/product/list?limit=12');
        const data = await res.json();
        if (data.data?.products) {
          setProducts(data.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const renderPrice = (product: Product) => {
    if (!product.minPrice) return null;

    const hasRange = product.maxPrice && product.minPrice !== product.maxPrice;
    const hasDiscount = product.skus.some(s => s.originalPrice && s.originalPrice > s.price);

    return (
      <div className="mb-2 md:mb-4 flex items-baseline gap-1 md:gap-2">
        <span className="text-sm md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {hasRange
            ? `${formatPrice(product.minPrice, product.currency)} - ${formatPrice(product.maxPrice!, product.currency)}`
            : formatPrice(product.minPrice, product.currency)
          }
        </span>
        {hasDiscount && !hasRange && product.skus[0]?.originalPrice && (
          <span className="text-sm text-zinc-400 line-through">
            {formatPrice(product.skus[0].originalPrice, product.currency)}
          </span>
        )}
      </div>
    );
  };

  const getSkuCount = (product: Product) => {
    return product.skus.length;
  };

  return (
    <section
      id={section.id || 'products'}
      className={cn('py-4 md:py-24', section.className, className)}
    >
      <div className="container">
        <motion.div
          className="hidden md:block mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {section.title || t('common.featured_collection')}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            {section.description || t('common.featured_description')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-4 h-6 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link href={`/shop/${product.id}`} className="block">
                  <Card className="group overflow-hidden border-0 p-0 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-zinc-900">
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </motion.div>
                      {getSkuCount(product) > 1 && (
                        <div className="absolute right-3 top-3 rounded-full bg-zinc-900/80 px-2 py-1 text-xs font-medium text-white">
                          {t('product.colors_count', { count: getSkuCount(product) })}
                        </div>
                      )}
                      {product.skus.some(s => s.originalPrice && s.originalPrice > s.price) && (
                        <div className="absolute right-3 bottom-3 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                          {t('product.sale')}
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
        ) : (
          <motion.div
            className="text-muted-foreground py-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('common.no_products')}
          </motion.div>
        )}

        {section.buttons && section.buttons.length > 0 && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button variant="outline" size="lg" asChild>
              <a href="/shop">{t('common.view_all')}</a>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
