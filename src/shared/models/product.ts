import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { product, productSku } from '@/config/db/schema';

// Types
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type ProductSku = typeof productSku.$inferSelect;
export type NewProductSku = typeof productSku.$inferInsert;

// Product with SKUs
export type ProductWithSkus = Product & {
  skus: ProductSku[];
  minPrice?: number;
  maxPrice?: number;
};

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

// ============================================
// Product (SPU) Operations
// ============================================

export async function createProduct(newProduct: NewProduct) {
  const [result] = await db().insert(product).values(newProduct).returning();
  return result;
}

export async function getProducts({
  status,
  page = 1,
  limit = 30,
}: {
  status?: ProductStatus;
  page?: number;
  limit?: number;
} = {}): Promise<Product[]> {
  const result = await db()
    .select()
    .from(product)
    .where(
      and(
        status ? eq(product.status, status) : undefined,
        isNull(product.deletedAt)
      )
    )
    .orderBy(desc(product.sort), desc(product.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

export async function getProductsCount({
  status,
}: {
  status?: ProductStatus;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(product)
    .where(
      and(
        status ? eq(product.status, status) : undefined,
        isNull(product.deletedAt)
      )
    );
  return result?.count || 0;
}

export async function getActiveProducts(limit = 30): Promise<Product[]> {
  const result = await db()
    .select()
    .from(product)
    .where(eq(product.status, 'active'))
    .orderBy(desc(product.sort))
    .limit(limit);
  return result;
}

export async function getActiveProductsWithSkus(limit = 30): Promise<ProductWithSkus[]> {
  const products = await getActiveProducts(limit);

  const productsWithSkus: ProductWithSkus[] = await Promise.all(
    products.map(async (p) => {
      const skus = await getProductSkus(p.id);
      const prices = skus.map(s => s.price).filter(Boolean);
      return {
        ...p,
        skus,
        minPrice: prices.length > 0 ? Math.min(...prices) : undefined,
        maxPrice: prices.length > 0 ? Math.max(...prices) : undefined,
      };
    })
  );

  return productsWithSkus;
}

export async function findProductById(id: string): Promise<Product | undefined> {
  const [result] = await db()
    .select()
    .from(product)
    .where(eq(product.id, id));
  return result;
}

export async function updateProduct(id: string, updateData: Partial<NewProduct>) {
  const [result] = await db()
    .update(product)
    .set(updateData)
    .where(eq(product.id, id))
    .returning();
  return result;
}

export async function deleteProduct(id: string) {
  return updateProduct(id, {
    status: ProductStatus.DELETED,
    deletedAt: new Date(),
  });
}

// ============================================
// Product SKU Operations
// ============================================

export async function createProductSku(newSku: NewProductSku) {
  const [result] = await db().insert(productSku).values(newSku).returning();
  return result;
}

export async function getProductSkus(productId: string): Promise<ProductSku[]> {
  const result = await db()
    .select()
    .from(productSku)
    .where(
      and(
        eq(productSku.productId, productId),
        eq(productSku.status, 'active')
      )
    )
    .orderBy(desc(productSku.sort));
  return result;
}

export async function getAllProductSkus(productId: string): Promise<ProductSku[]> {
  const result = await db()
    .select()
    .from(productSku)
    .where(eq(productSku.productId, productId))
    .orderBy(desc(productSku.sort));
  return result;
}

export async function getProductSkusCount(productId: string): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(productSku)
    .where(eq(productSku.productId, productId));
  return result?.count || 0;
}

export async function deleteProductSku(id: string) {
  const [result] = await db()
    .delete(productSku)
    .where(eq(productSku.id, id))
    .returning();
  return result;
}

export async function findSkuById(id: string): Promise<ProductSku | undefined> {
  const [result] = await db()
    .select()
    .from(productSku)
    .where(eq(productSku.id, id));
  return result;
}

export async function findSkuBySku(sku: string): Promise<ProductSku | undefined> {
  const [result] = await db()
    .select()
    .from(productSku)
    .where(eq(productSku.sku, sku));
  return result;
}

export async function updateProductSku(id: string, updateData: Partial<NewProductSku>) {
  const [result] = await db()
    .update(productSku)
    .set(updateData)
    .where(eq(productSku.id, id))
    .returning();
  return result;
}

export async function updateSkuStock(id: string, quantity: number) {
  const existingSku = await findSkuById(id);
  if (!existingSku) {
    throw new Error('SKU not found');
  }

  const newStock = existingSku.stock + quantity;
  if (newStock < 0) {
    throw new Error('Insufficient stock');
  }

  return updateProductSku(id, { stock: newStock });
}

// ============================================
// Combined Operations
// ============================================

export async function findProductByIdWithSkus(id: string): Promise<ProductWithSkus | undefined> {
  const productData = await findProductById(id);
  if (!productData) return undefined;

  const skus = await getProductSkus(id);
  const prices = skus.map((s) => s.price).filter(Boolean);

  return {
    ...productData,
    skus,
    minPrice: prices.length > 0 ? Math.min(...prices) : undefined,
    maxPrice: prices.length > 0 ? Math.max(...prices) : undefined,
  };
}
