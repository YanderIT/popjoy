/**
 * Seed product categories to taxonomy table
 * Run: npx tsx scripts/seed-categories.ts
 */

import 'dotenv/config';
import { eq } from 'drizzle-orm';

import { db } from '../src/core/db';
import { taxonomy, user } from '../src/config/db/schema';
import { getUuid } from '../src/shared/lib/hash';

// System user for seeded data
const SYSTEM_USER = {
  id: 'system-seed-user',
  name: 'System',
  email: 'system@seed.local',
};

// Product categories to seed
const categories = [
  {
    slug: 'labubu',
    title: 'Labubu',
    description: 'Labubu series designer toys and collectibles',
    icon: 'toy',
  },
  {
    slug: 'sp-series',
    title: 'SP Series',
    description: 'Special edition series with unique designs',
    icon: 'sparkles',
  },
  {
    slug: 'limited-edition',
    title: 'Limited Edition',
    description: 'Exclusive limited edition collectibles',
    icon: 'star',
  },
  {
    slug: 'collaborations',
    title: 'Collaborations',
    description: 'Brand collaboration and crossover items',
    icon: 'handshake',
  },
  {
    slug: 'new-arrivals',
    title: 'New Arrivals',
    description: 'Latest releases and newest additions',
    icon: 'clock',
  },
];

async function ensureSystemUser() {
  // Check if system user exists
  const existingUser = await db()
    .select()
    .from(user)
    .where(eq(user.id, SYSTEM_USER.id))
    .limit(1);

  if (existingUser.length === 0) {
    console.log('📝 Creating system user for seeded data...');
    await db().insert(user).values({
      id: SYSTEM_USER.id,
      name: SYSTEM_USER.name,
      email: SYSTEM_USER.email,
      emailVerified: true,
    });
    console.log('✅ System user created\n');
  } else {
    console.log('✅ System user already exists\n');
  }

  return SYSTEM_USER.id;
}

async function seedCategories() {
  console.log('🏷️  Seeding product categories...\n');

  try {
    // Ensure system user exists first
    const userId = await ensureSystemUser();

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const id = getUuid();

      await db()
        .insert(taxonomy)
        .values({
          id,
          userId,
          slug: cat.slug,
          type: 'category',
          title: cat.title,
          description: cat.description,
          icon: cat.icon,
          status: 'published',
          sort: categories.length - i, // Higher sort = earlier in list
        })
        .onConflictDoNothing(); // Skip if slug already exists

      console.log(`✅ Created category: ${cat.title} (${cat.slug})`);
    }

    console.log('\n🎉 Categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedCategories();
