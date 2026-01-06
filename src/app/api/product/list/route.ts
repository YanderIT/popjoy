import { respData, respErr } from '@/shared/lib/resp';
import { getActiveProductsWithSkus } from '@/shared/models/product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const products = await getActiveProductsWithSkus(limit);

    return respData({
      products,
      total: products.length,
    });
  } catch (e) {
    console.log('get products failed:', e);
    return respErr('get products failed');
  }
}
