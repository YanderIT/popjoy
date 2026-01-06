/**
 * Seed products with SKUs to database
 * Run: npx tsx scripts/seed-products.ts
 */

import 'dotenv/config';
import { eq } from 'drizzle-orm';

import { db } from '../src/core/db';
import { product, productSku } from '../src/config/db/schema';
import { getUuid } from '../src/shared/lib/hash';

// Product data (SPU)
const products = [
  {
    id: getUuid(),
    name: 'Labubu Coca-Cola Edition',
    description: 'Limited edition Labubu designer toy featuring the iconic Coca-Cola branding. A perfect blend of pop culture and collectible art.',
    image: '/imgs/cases/1.png',
    status: 'active',
    sort: 5,
    skus: [
      { color: 'Classic Red', price: 5999, originalPrice: 7999, stock: 50 },
      { color: 'Silver Limited', price: 7999, originalPrice: 9999, stock: 20 },
      { color: 'Gold Collector', price: 9999, originalPrice: null, stock: 10 },
    ],
  },
  {
    id: getUuid(),
    name: 'SP Dawn',
    description: 'The Dawn series captures the serene beauty of early morning light. Delicate pastel colors meet premium craftsmanship.',
    image: '/imgs/cases/2.png',
    status: 'active',
    sort: 4,
    skus: [
      { color: 'Sunrise Pink', price: 4999, originalPrice: null, stock: 40 },
      { color: 'Morning Blue', price: 4999, originalPrice: null, stock: 35 },
    ],
  },
  {
    id: getUuid(),
    name: 'SP Morning Dew',
    description: 'Inspired by fresh morning dewdrops, this collectible features a stunning translucent finish with subtle sparkle effects.',
    image: '/imgs/cases/3.png',
    status: 'active',
    sort: 3,
    skus: [
      { color: 'Crystal Clear', price: 5499, originalPrice: 6499, stock: 45 },
      { color: 'Mint Green', price: 5499, originalPrice: 6499, stock: 30 },
      { color: 'Ocean Blue', price: 5999, originalPrice: 6999, stock: 25 },
    ],
  },
  {
    id: getUuid(),
    name: 'SP Jade Fantasy',
    description: 'A mesmerizing jade-inspired design that brings ancient elegance to modern collectibles. Hand-painted details on premium vinyl.',
    image: '/imgs/cases/4.png',
    status: 'active',
    sort: 2,
    skus: [
      { color: 'Imperial Jade', price: 6999, originalPrice: null, stock: 20 },
      { color: 'White Jade', price: 6999, originalPrice: null, stock: 25 },
    ],
  },
  {
    id: getUuid(),
    name: 'SP Gentle Warmth',
    description: 'Radiating cozy vibes, the Gentle Warmth edition features warm sunset tones and a comforting presence for any collection.',
    image: '/imgs/cases/5.png',
    status: 'active',
    sort: 1,
    skus: [
      { color: 'Sunset Orange', price: 4999, originalPrice: 5999, stock: 50 },
      { color: 'Warm Amber', price: 4999, originalPrice: 5999, stock: 40 },
      { color: 'Rose Gold', price: 5999, originalPrice: 6999, stock: 30 },
    ],
  },
];

async function seedProducts() {
  console.log('🌱 Seeding products with SKUs...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing product data...');
    await db().delete(productSku);
    await db().delete(product);
    console.log('✅ Cleared existing data\n');

    for (const prod of products) {
      // Create product (SPU)
      const { skus, ...productData } = prod;
      await db().insert(product).values(productData);
      console.log(`📦 Created product: ${prod.name}`);

      // Create SKUs
      for (const sku of skus) {
        const skuCode = `${prod.name.toLowerCase().replace(/\s+/g, '-')}-${sku.color.toLowerCase().replace(/\s+/g, '-')}`;
        await db().insert(productSku).values({
          id: getUuid(),
          productId: prod.id,
          sku: skuCode,
          attributes: JSON.stringify({ color: sku.color }),
          price: sku.price,
          originalPrice: sku.originalPrice,
          stock: sku.stock,
          status: 'active',
          sort: 0,
        });
        console.log(`   └─ SKU: ${sku.color} - $${(sku.price / 100).toFixed(2)}`);
      }
      console.log('');
    }

    console.log('🎉 Products seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedProducts();
