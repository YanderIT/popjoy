import { and, desc, eq, isNull, ne } from 'drizzle-orm';

import { db } from '@/core/db';
import { userAddress } from '@/config/db/schema';
import { getUuid } from '@/shared/lib/hash';

// Types
export type UserAddress = typeof userAddress.$inferSelect;
export type NewUserAddress = typeof userAddress.$inferInsert;

// ============================================
// User Address Operations
// ============================================

export async function createUserAddress(
  address: Omit<NewUserAddress, 'id'>
): Promise<UserAddress> {
  const id = getUuid();

  // If this is set as default, clear other defaults first
  if (address.isDefault) {
    await db()
      .update(userAddress)
      .set({ isDefault: false })
      .where(
        and(
          eq(userAddress.userId, address.userId),
          eq(userAddress.isDefault, true)
        )
      );
  }

  const [result] = await db()
    .insert(userAddress)
    .values({ ...address, id })
    .returning();
  return result;
}

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  return db()
    .select()
    .from(userAddress)
    .where(
      and(
        eq(userAddress.userId, userId),
        isNull(userAddress.deletedAt)
      )
    )
    .orderBy(desc(userAddress.isDefault), desc(userAddress.createdAt));
}

export async function findUserAddressById(id: string): Promise<UserAddress | undefined> {
  const [result] = await db()
    .select()
    .from(userAddress)
    .where(eq(userAddress.id, id));
  return result;
}

export async function getDefaultAddress(userId: string): Promise<UserAddress | undefined> {
  const [result] = await db()
    .select()
    .from(userAddress)
    .where(
      and(
        eq(userAddress.userId, userId),
        eq(userAddress.isDefault, true),
        isNull(userAddress.deletedAt)
      )
    );
  return result;
}

export async function updateUserAddress(
  id: string,
  data: Partial<NewUserAddress>
): Promise<UserAddress> {
  // If setting as default, clear other defaults first
  if (data.isDefault) {
    const existing = await findUserAddressById(id);
    if (existing) {
      await db()
        .update(userAddress)
        .set({ isDefault: false })
        .where(
          and(
            eq(userAddress.userId, existing.userId),
            eq(userAddress.isDefault, true),
            ne(userAddress.id, id)
          )
        );
    }
  }

  const [result] = await db()
    .update(userAddress)
    .set(data)
    .where(eq(userAddress.id, id))
    .returning();
  return result;
}

export async function deleteUserAddress(id: string): Promise<void> {
  await db()
    .update(userAddress)
    .set({ deletedAt: new Date() })
    .where(eq(userAddress.id, id));
}

export async function setDefaultAddress(
  userId: string,
  addressId: string
): Promise<void> {
  // Clear all defaults for user
  await db()
    .update(userAddress)
    .set({ isDefault: false })
    .where(
      and(
        eq(userAddress.userId, userId),
        eq(userAddress.isDefault, true)
      )
    );

  // Set new default
  await db()
    .update(userAddress)
    .set({ isDefault: true })
    .where(eq(userAddress.id, addressId));
}
