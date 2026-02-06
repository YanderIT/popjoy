import { and, asc, count, desc, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { banner } from '@/config/db/schema';

// Types
export type Banner = typeof banner.$inferSelect;
export type NewBanner = typeof banner.$inferInsert;
export type UpdateBanner = Partial<Omit<NewBanner, 'id' | 'createdAt'>>;

export enum BannerPosition {
  HERO = 'hero',
  PROMO = 'promo',
  SIDEBAR = 'sidebar',
}

export enum BannerStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum BannerTarget {
  SELF = '_self',
  BLANK = '_blank',
}

/**
 * Create a new banner
 */
export async function createBanner(data: NewBanner): Promise<Banner> {
  const [result] = await db().insert(banner).values(data).returning();
  return result;
}

/**
 * Update an existing banner
 */
export async function updateBanner(
  id: string,
  data: UpdateBanner
): Promise<Banner | undefined> {
  const [result] = await db()
    .update(banner)
    .set(data)
    .where(eq(banner.id, id))
    .returning();
  return result;
}

/**
 * Soft delete a banner
 */
export async function deleteBanner(id: string): Promise<Banner | undefined> {
  return updateBanner(id, {
    status: BannerStatus.INACTIVE,
    deletedAt: new Date(),
  });
}

/**
 * Find a banner by ID
 */
export async function findBannerById(id: string): Promise<Banner | undefined> {
  const [result] = await db()
    .select()
    .from(banner)
    .where(and(eq(banner.id, id), isNull(banner.deletedAt)));
  return result;
}

/**
 * Get banners with pagination and filters
 */
export async function getBanners({
  position,
  status,
  page = 1,
  limit = 30,
}: {
  position?: BannerPosition;
  status?: BannerStatus;
  page?: number;
  limit?: number;
} = {}): Promise<Banner[]> {
  const result = await db()
    .select()
    .from(banner)
    .where(
      and(
        position ? eq(banner.position, position) : undefined,
        status ? eq(banner.status, status) : undefined,
        isNull(banner.deletedAt)
      )
    )
    .orderBy(desc(banner.sort), desc(banner.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

/**
 * Get count of banners with filters
 */
export async function getBannersCount({
  position,
  status,
}: {
  position?: BannerPosition;
  status?: BannerStatus;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(banner)
    .where(
      and(
        position ? eq(banner.position, position) : undefined,
        status ? eq(banner.status, status) : undefined,
        isNull(banner.deletedAt)
      )
    );
  return result?.count || 0;
}

/**
 * Get active banners for frontend display
 * Returns banners sorted by sort field in descending order
 */
export async function getActiveBanners(
  position: BannerPosition = BannerPosition.HERO,
  limit: number = 10
): Promise<Banner[]> {
  const result = await db()
    .select()
    .from(banner)
    .where(
      and(
        eq(banner.position, position),
        eq(banner.status, BannerStatus.ACTIVE),
        isNull(banner.deletedAt)
      )
    )
    .orderBy(desc(banner.sort), asc(banner.createdAt))
    .limit(limit);

  return result;
}
