import { respData, respErr, respOk } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import {
  createUserAddress,
  getUserAddresses,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from '@/shared/models/userAddress';

// GET - Get user addresses
export async function GET() {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    const addresses = await getUserAddresses(user.id);
    return respData({ addresses });
  } catch (e) {
    console.log('get addresses failed:', e);
    return respErr('Failed to get addresses');
  }
}

// POST - Create new address
export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    const body = await req.json();

    const address = await createUserAddress({
      userId: user.id,
      recipientName: body.recipientName,
      phone: body.phone,
      country: body.country,
      state: body.state,
      city: body.city,
      district: body.district,
      street: body.street,
      postalCode: body.postalCode,
      label: body.label,
      isDefault: body.isDefault || false,
    });

    return respData({ address });
  } catch (e) {
    console.log('create address failed:', e);
    return respErr('Failed to create address');
  }
}

// PUT - Update address
export async function PUT(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return respErr('Address ID is required');
    }

    const address = await updateUserAddress(id, data);
    return respData({ address });
  } catch (e) {
    console.log('update address failed:', e);
    return respErr('Failed to update address');
  }
}

// DELETE - Delete address
export async function DELETE(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return respErr('Address ID is required');
    }

    await deleteUserAddress(id);
    return respOk();
  } catch (e) {
    console.log('delete address failed:', e);
    return respErr('Failed to delete address');
  }
}
