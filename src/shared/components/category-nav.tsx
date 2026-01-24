'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  slug: string;
  title: string;
  url?: string;
}

interface CategoryNavProps {
  categories: Category[];
  currentCategoryId?: string;
  variant?: 'link' | 'button';
  threshold?: number;
  allLabel?: string;
  allUrl?: string;
  className?: string;
}

export function CategoryNav({
  categories,
  currentCategoryId,
  variant = 'link',
  threshold = 5,
  allLabel,
  allUrl,
  className,
}: CategoryNavProps) {
  const t = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMore = categories.length > threshold;
  const visibleCategories = hasMore && !isExpanded
    ? categories.slice(0, threshold)
    : categories;
  const hiddenCount = categories.length - threshold;

  const renderCategory = (category: Category) => {
    const url = category.url || `/shop/category/${category.slug}`;
    const isActive = category.id === currentCategoryId;

    if (variant === 'button') {
      return (
        <Link key={category.id} href={url}>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full px-3 py-1 text-xs md:text-sm',
              isActive &&
                'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'
            )}
          >
            {category.title}
          </Button>
        </Link>
      );
    }

    return (
      <Link
        key={category.id}
        href={url}
        className={cn(
          'text-sm md:text-base font-semibold transition-colors whitespace-nowrap',
          isActive
            ? 'text-foreground'
            : 'text-foreground/70 hover:text-foreground'
        )}
      >
        {category.title}
      </Link>
    );
  };

  const renderAllLink = () => {
    if (!allLabel || !allUrl) return null;

    if (variant === 'button') {
      const isActive = !currentCategoryId;
      return (
        <Link href={allUrl}>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full px-3 py-1 text-xs md:text-sm',
              isActive &&
                'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'
            )}
          >
            {allLabel}
          </Button>
        </Link>
      );
    }

    return (
      <Link
        href={allUrl}
        className={cn(
          'text-sm md:text-base font-semibold transition-colors whitespace-nowrap',
          !currentCategoryId
            ? 'text-foreground'
            : 'text-foreground/70 hover:text-foreground'
        )}
      >
        {allLabel}
      </Link>
    );
  };

  const toggleButton = (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        'inline-flex items-center gap-1 text-xs md:text-sm font-medium transition-colors',
        variant === 'button'
          ? 'rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 px-3 py-1 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-600 dark:text-zinc-400'
          : 'text-foreground/50 hover:text-foreground/70'
      )}
    >
      {isExpanded ? (
        <>
          {t('category_nav.collapse')}
          <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
        </>
      ) : (
        <>
          {t('category_nav.more', { count: hiddenCount })}
          <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
        </>
      )}
    </button>
  );

  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-center gap-2 md:gap-4',
        className
      )}
    >
      {renderAllLink()}

      <AnimatePresence mode="popLayout">
        {visibleCategories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {renderCategory(category)}
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && toggleButton}
    </nav>
  );
}
