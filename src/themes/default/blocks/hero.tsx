import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { getTaxonomies, TaxonomyType } from '@/shared/models/taxonomy';

export async function Hero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  // Fetch categories from database
  const categories = await getTaxonomies({
    type: TaxonomyType.CATEGORY,
    limit: 10,
  });

  return (
    <section
      id={section.id}
      className={cn(
        `pt-24 pb-8 md:pt-32 md:pb-8`,
        section.className,
        className
      )}
    >
      {/* Category Navigation */}
      <div className="mx-auto max-w-6xl px-4 mb-6">
        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4">
          <Link
            href="/shop"
            className="text-foreground/70 hover:text-foreground text-sm md:text-base font-medium transition-colors"
          >
            All Designs
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/category/${category.slug}`}
              className="text-foreground/70 hover:text-foreground text-sm md:text-base font-medium transition-colors"
            >
              {category.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Full-width Banner */}
      {section.image?.src && (
        <div className="mx-4 md:mx-8 lg:mx-16">
          <div className="relative w-full overflow-hidden rounded-2xl">
            {section.image.link ? (
              <Link href={section.image.link} className="block cursor-pointer">
                <Image
                  src={section.image.src}
                  alt={section.image.alt || ''}
                  width={section.image.width || 1920}
                  height={section.image.height || 800}
                  className="w-full h-auto object-cover"
                  sizes="100vw"
                  priority
                  quality={75}
                  unoptimized={section.image.src.startsWith('http')}
                />
              </Link>
            ) : (
              <Image
                src={section.image.src}
                alt={section.image.alt || ''}
                width={section.image.width || 1920}
                height={section.image.height || 800}
                className="w-full h-auto object-cover"
                sizes="100vw"
                priority
                quality={75}
                unoptimized={section.image.src.startsWith('http')}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
