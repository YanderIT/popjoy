import { getTranslations } from 'next-intl/server';

import { Empty } from '@/shared/blocks/common';
import { FormCard } from '@/shared/blocks/form';
import {
  findUserAddressById,
  deleteUserAddress,
} from '@/shared/models/userAddress';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form as FormType } from '@/shared/types/blocks/form';

export default async function DeleteAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const address = await findUserAddressById(id);
  if (!address) {
    return <Empty message="Address not found" />;
  }

  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  if (address.userId !== user.id) {
    return <Empty message="no permission" />;
  }

  const t = await getTranslations('settings.addresses');

  // Format full address for display
  const fullAddress = [
    address.street,
    address.district,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const form: FormType = {
    title: t('delete.title'),
    description: t('delete.description'),
    fields: [
      {
        name: 'recipientName',
        title: t('fields.recipient_name'),
        type: 'text',
        attributes: { disabled: true },
      },
      {
        name: 'phone',
        title: t('fields.phone'),
        type: 'text',
        attributes: { disabled: true },
      },
      {
        name: 'fullAddress',
        title: t('fields.full_address'),
        type: 'text',
        attributes: { disabled: true },
      },
    ],
    passby: {
      user: user,
      address: address,
    },
    data: {
      ...address,
      fullAddress,
    },
    submit: {
      handler: async (data: FormData, passby: any) => {
        'use server';

        const { user, address } = passby;

        if (!address) {
          throw new Error('address not found');
        }

        if (!user) {
          throw new Error('no auth');
        }

        if (address.userId !== user.id) {
          throw new Error('no permission');
        }

        await deleteUserAddress(address.id);

        return {
          status: 'success',
          message: 'Address deleted',
          redirect_url: '/settings/addresses',
        };
      },
      button: {
        title: t('delete.buttons.submit'),
        variant: 'destructive',
        icon: 'RiDeleteBinLine',
      },
    },
  };

  const crumbs: Crumb[] = [
    {
      title: t('delete.crumbs.addresses'),
      url: '/settings/addresses',
    },
    {
      title: t('delete.crumbs.delete'),
      is_active: true,
    },
  ];

  return (
    <div className="space-y-8">
      <FormCard title={t('delete.title')} crumbs={crumbs} form={form} />
    </div>
  );
}
