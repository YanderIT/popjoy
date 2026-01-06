import { respData, respErr } from '@/shared/lib/resp';
import { findProductByIdWithSkus } from '@/shared/models/product';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await findProductByIdWithSkus(id);

    if (!product) {
      return respErr('Product not found');
    }

    return respData({ product });
  } catch (e) {
    console.log('get product failed:', e);
    return respErr('get product failed');
  }
}
