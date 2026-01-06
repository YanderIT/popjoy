import { notFound } from 'next/navigation';

import { findProductByIdWithSkus } from '@/shared/models/product';
import { ProductDetail } from '@/shared/blocks/shop/product-detail';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;

  const product = await findProductByIdWithSkus(productId);

  if (!product || product.status !== 'active') {
    notFound();
  }

  return <ProductDetail product={product} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { productId } = await params;
  const product = await findProductByIdWithSkus(productId);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description || `Shop ${product.name}`,
  };
}
