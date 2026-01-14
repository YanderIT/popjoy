import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getUuid } from '@/shared/lib/hash';
import {
  createProduct,
  NewProduct,
  ProductStatus,
} from '@/shared/models/product';
import {
  getTaxonomies,
  TaxonomyStatus,
  TaxonomyType,
} from '@/shared/models/taxonomy';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function ProductAddPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.PRODUCTS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.products');

  // Fetch categories for dropdown
  const categories = await getTaxonomies({
    type: TaxonomyType.CATEGORY,
    status: TaxonomyStatus.PUBLISHED,
    limit: 100,
  });

  const categoryOptions = [
    { title: t('fields.no_category'), value: '__none__' },
    ...categories.map((c) => ({ title: c.title, value: c.id })),
  ];

  const crumbs: Crumb[] = [
    { title: t('add.crumbs.admin'), url: '/admin' },
    { title: t('add.crumbs.products'), url: '/admin/products' },
    { title: t('add.crumbs.add'), is_active: true },
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
        name: 'categoryId',
        type: 'select',
        title: t('fields.category'),
        options: categoryOptions,
        value: '__none__',
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
        value: 'draft',
        validation: { required: true },
      },
      {
        name: 'sort',
        type: 'number',
        title: t('fields.sort'),
        value: 0,
      },
    ],
    data: {},
    submit: {
      button: {
        title: t('add.buttons.submit'),
      },
      handler: async (data) => {
        'use server';

        const name = data.get('name') as string;
        const categoryId = data.get('categoryId') as string;
        const description = data.get('description') as string;
        const image = data.get('image') as string;
        const status = data.get('status') as string;
        const sort = parseInt(data.get('sort') as string) || 0;

        if (!name?.trim()) {
          throw new Error('name is required');
        }

        const newProduct: NewProduct = {
          id: getUuid(),
          categoryId: categoryId && categoryId !== '__none__' ? categoryId : null,
          name: name.trim(),
          description: description?.trim() || null,
          image: image || null,
          images: null,
          currency: 'USD',
          status: (status as ProductStatus) || ProductStatus.DRAFT,
          sort,
          metadata: null,
        };

        const result = await createProduct(newProduct);

        if (!result) {
          throw new Error('add product failed');
        }

        return {
          status: 'success',
          message: 'product added',
          redirect_url: '/admin/products',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('add.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
