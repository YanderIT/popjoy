import { getTranslations } from 'next-intl/server';

import { Empty } from '@/shared/blocks/common';
import { TableCard } from '@/shared/blocks/table';
import { getUserAddresses, UserAddress } from '@/shared/models/userAddress';
import { getUserInfo } from '@/shared/models/user';
import { Button } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function AddressesPage() {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('settings.addresses');

  const addresses = await getUserAddresses(user.id);

  // Format addresses for display
  const formattedAddresses = addresses.map((addr) => ({
    ...addr,
    fullAddress: [addr.street, addr.district, addr.city, addr.state, addr.country, addr.postalCode]
      .filter(Boolean)
      .join(', '),
    labelDisplay: addr.label ? t(`labels.${addr.label}` as any) : '',
  }));

  const table: Table = {
    title: t('list.title'),
    columns: [
      {
        name: 'recipientName',
        title: t('fields.recipient_name'),
      },
      {
        name: 'phone',
        title: t('fields.phone'),
      },
      {
        name: 'fullAddress',
        title: t('fields.full_address'),
      },
      {
        name: 'labelDisplay',
        title: t('fields.label'),
      },
      {
        name: 'isDefault',
        title: t('fields.is_default'),
        type: 'label',
        callback: (item: UserAddress & { labelDisplay: string; fullAddress: string }) => {
          return item.isDefault ? t('list.default_badge') : '';
        },
      },
      {
        name: 'action',
        title: t('fields.action'),
        type: 'dropdown',
        callback: (item: UserAddress) => {
          return [
            {
              title: t('list.buttons.edit'),
              url: `/settings/addresses/${item.id}/edit`,
              icon: 'RiEditLine',
            },
            {
              title: t('list.buttons.delete'),
              url: `/settings/addresses/${item.id}/delete`,
              icon: 'RiDeleteBinLine',
            },
          ];
        },
      },
    ],
    data: formattedAddresses,
    emptyMessage: t('list.empty_message'),
  };

  const buttons: Button[] = [
    {
      title: t('list.buttons.add'),
      url: '/settings/addresses/create',
      icon: 'Plus',
    },
  ];

  return (
    <div className="space-y-8">
      <TableCard title={t('list.title')} buttons={buttons} table={table} />
    </div>
  );
}
