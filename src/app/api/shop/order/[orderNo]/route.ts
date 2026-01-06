import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { findShopOrderByOrderNoWithItems } from '@/shared/models/shopOrder';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderNo: string }> }
) {
  try {
    const { orderNo } = await params;

    // Validate user
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    // Get order
    const order = await findShopOrderByOrderNoWithItems(orderNo);
    if (!order) {
      return respErr('Order not found');
    }

    // Validate ownership
    if (order.userId !== user.id) {
      return respErr('Order not found');
    }

    return respData({ order });
  } catch (e) {
    console.log('get shop order failed:', e);
    return respErr('Failed to get order');
  }
}
