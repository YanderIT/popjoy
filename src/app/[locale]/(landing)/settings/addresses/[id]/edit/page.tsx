import { getTranslations } from 'next-intl/server';

import { Empty } from '@/shared/blocks/common';
import { FormCard } from '@/shared/blocks/form';
import {
  findUserAddressById,
  updateUserAddress,
} from '@/shared/models/userAddress';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form as FormType } from '@/shared/types/blocks/form';

export default async function EditAddressPage({
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

  const form: FormType = {
    title: t('edit.title'),
    fields: [
      {
        name: 'recipientName',
        title: t('fields.recipient_name'),
        type: 'text',
        validation: { required: true },
      },
      {
        name: 'phone',
        title: t('fields.phone'),
        type: 'text',
        validation: { required: true },
      },
      {
        name: 'country',
        title: t('fields.country'),
        type: 'text',
        validation: { required: true },
      },
      {
        name: 'state',
        title: t('fields.state'),
        type: 'text',
      },
      {
        name: 'city',
        title: t('fields.city'),
        type: 'text',
        validation: { required: true },
      },
      {
        name: 'district',
        title: t('fields.district'),
        type: 'text',
      },
      {
        name: 'street',
        title: t('fields.street'),
        type: 'text',
        validation: { required: true },
      },
      {
        name: 'postalCode',
        title: t('fields.postal_code'),
        type: 'text',
      },
      {
        name: 'label',
        title: t('fields.label'),
        type: 'select',
        options: [
          { title: t('labels.home'), value: 'home' },
          { title: t('labels.office'), value: 'office' },
          { title: t('labels.other'), value: 'other' },
        ],
      },
      {
        name: 'isDefault',
        title: t('fields.is_default'),
        type: 'checkbox',
      },
    ],
    passby: {
      user: user,
      address: address,
    },
    data: address,
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

        const recipientName = data.get('recipientName') as string;
        const phone = data.get('phone') as string;
        const country = data.get('country') as string;
        const state = data.get('state') as string;
        const city = data.get('city') as string;
        const district = data.get('district') as string;
        const street = data.get('street') as string;
        const postalCode = data.get('postalCode') as string;
        const label = data.get('label') as string;
        const isDefault = data.get('isDefault') === 'on';

        if (!recipientName?.trim()) {
          throw new Error('Recipient name is required');
        }
        if (!phone?.trim()) {
          throw new Error('Phone is required');
        }
        if (!country?.trim()) {
          throw new Error('Country is required');
        }
        if (!city?.trim()) {
          throw new Error('City is required');
        }
        if (!street?.trim()) {
          throw new Error('Street is required');
        }

        await updateUserAddress(address.id, {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          country: country.trim(),
          state: state?.trim() || null,
          city: city.trim(),
          district: district?.trim() || null,
          street: street.trim(),
          postalCode: postalCode?.trim() || null,
          label: label || null,
          isDefault: isDefault,
        });

        return {
          status: 'success',
          message: 'Address updated',
          redirect_url: '/settings/addresses',
        };
      },
      button: {
        title: t('edit.buttons.submit'),
      },
    },
  };

  const crumbs: Crumb[] = [
    {
      title: t('edit.crumbs.addresses'),
      url: '/settings/addresses',
    },
    {
      title: t('edit.crumbs.edit'),
      is_active: true,
    },
  ];

  return (
    <div className="space-y-8">
      <FormCard title={t('edit.title')} crumbs={crumbs} form={form} />
    </div>
  );
}
