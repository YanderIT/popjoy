import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import {
  findProductById,
  updateProduct,
  ProductStatus,
} from '@/shared/models/product';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.PRODUCTS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.products');

  const product = await findProductById(id);
  if (!product) {
    return <Empty message="Product not found" />;
  }

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/admin' },
    { title: t('edit.crumbs.products'), url: '/admin/products' },
    { title: t('edit.crumbs.edit'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'name',
        type: 'text',
        title: t('fields.name'),
        validation: { required: true },
      },
      {
        name: 'description',
        type: 'textarea',
        title: t('fields.description'),
      },
      {
        name: 'image',
        type: 'upload_image',
        title: t('fields.image'),
      },
      {
        name: 'status',
        type: 'select',
        title: t('fields.status'),
        options: [
          { title: t('status_options.draft'), value: 'draft' },
          { title: t('status_options.active'), value: 'active' },
          { title: t('status_options.inactive'), value: 'inactive' },
        ],
        validation: { required: true },
      },
      {
        name: 'sort',
        type: 'number',
        title: t('fields.sort'),
      },
    ],
    passby: {
      product,
    },
    data: product,
    submit: {
      button: {
        title: t('edit.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const { product: existingProduct } = passby as { product: { id: string } };
        if (!existingProduct) {
          throw new Error('product not found');
        }

        const name = data.get('name') as string;
        const description = data.get('description') as string;
        const image = data.get('image') as string;
        const status = data.get('status') as string;
        const sort = parseInt(data.get('sort') as string) || 0;

        if (!name?.trim()) {
          throw new Error('name is required');
        }

        const result = await updateProduct(existingProduct.id, {
          name: name.trim(),
          description: description?.trim() || null,
          image: image || null,
          status: (status as ProductStatus) || ProductStatus.DRAFT,
          sort,
        });

        if (!result) {
          throw new Error('update product failed');
        }

        return {
          status: 'success',
          message: 'product updated',
          redirect_url: '/admin/products',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
