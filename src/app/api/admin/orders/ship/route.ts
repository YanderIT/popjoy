import { PERMISSIONS } from '@/core/rbac';
import { hasPermission } from '@/shared/services/rbac';
import { respData, respErr } from '@/shared/lib/resp';
import { shipOrder } from '@/shared/models/shopOrder';
import { getUserInfo } from '@/shared/models/user';

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Unauthorized');
    }

    const allowed = await hasPermission(user.id, PERMISSIONS.PAYMENTS_READ);
    if (!allowed) {
      return respErr('Permission denied');
    }

    const { orderNo, shippingCarrier, trackingNumber } = await req.json();

    if (!orderNo || !shippingCarrier || !trackingNumber) {
      return respErr('Missing required fields');
    }

    const order = await shipOrder(orderNo, {
      shippingCarrier,
      trackingNumber,
    });

    return respData({ order });
  } catch (e: any) {
    console.error('Ship order failed:', e);
    return respErr('Failed to ship order: ' + e.message);
  }
}
