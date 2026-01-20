"use client";

import Image from 'next/image';
import { Link } from '@/core/i18n/navigation';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/shared/components/ui/carousel';
import { Image as ImageType } from '@/shared/types/blocks/common';

export function BannerCarousel({ images }: { images: ImageType[] }) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
      className="w-full group"
    >
      <CarouselContent className="ml-0">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-0">
            <div className="relative w-full overflow-hidden rounded-2xl">
              {image.link ? (
                <Link href={image.link} className="block cursor-pointer">
                  <Image
                    src={image.src}
                    alt={image.alt || ''}
                    width={image.width || 1920}
                    height={image.height || 800}
                    className="w-full h-auto object-cover"
                    sizes="100vw"
                    priority={index === 0}
                    quality={75}
                    unoptimized={image.src.startsWith('http')}
                  />
                </Link>
              ) : (
                <Image
                  src={image.src}
                  alt={image.alt || ''}
                  width={image.width || 1920}
                  height={image.height || 800}
                  className="w-full h-auto object-cover"
                  sizes="100vw"
                  priority={index === 0}
                  quality={75}
                  unoptimized={image.src.startsWith('http')}
                />
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity" />
      <CarouselNext className="right-4 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity" />
    </Carousel>
  );
}
