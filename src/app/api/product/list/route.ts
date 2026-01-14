import { respData, respErr } from '@/shared/lib/resp';
import { getProductsWithSkus, ProductStatus } from '@/shared/models/product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const categoryId = searchParams.get('categoryId') || undefined;

    const { products, total } = await getProductsWithSkus({
      status: ProductStatus.ACTIVE,
      categoryId,
      page,
      limit,
    });

    return respData({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.log('get products failed:', e);
    return respErr('get products failed');
  }
}
