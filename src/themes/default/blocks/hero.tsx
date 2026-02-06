import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { Image as ImageType } from '@/shared/types/blocks/common';
import { getTaxonomies, TaxonomyType } from '@/shared/models/taxonomy';
import { getActiveBanners, BannerPosition } from '@/shared/models/banner';
import { BannerCarousel } from './banner-carousel';
import { CategoryNav } from '@/shared/components/category-nav';

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

  // Fetch active banners from database
  const dbBanners = await getActiveBanners(BannerPosition.HERO, 10);

  // Convert database banners to ImageType format
  const bannerImages: ImageType[] = dbBanners.map((b) => ({
    src: b.image,
    alt: b.alt || '',
    width: b.width || 1920,
    height: b.height || 800,
    link: b.link || undefined,
  }));

  // Use database banners if available, otherwise fall back to section.images
  const displayImages = bannerImages.length > 0 ? bannerImages : section.images;

  return (
    <section
      id={section.id}
      className={cn(
        `pt-16 pb-8 md:pt-32 md:pb-16`,
        section.className,
        className
      )}
    >
      {/* Category Navigation */}
      <div className="mx-auto max-w-6xl px-4 mb-1 md:mb-6 py-2 md:py-4">
        <CategoryNav
          categories={categories}
          variant="button"
          threshold={5}
          allLabel="All Designs"
          allUrl="/shop"
        />
      </div>

      {/* Full-width Banner */}
      {displayImages && displayImages.length > 0 ? (
        <div className="mx-4 md:mx-8 lg:mx-16">
          <BannerCarousel images={displayImages} />
        </div>
      ) : section.image?.src && (
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
