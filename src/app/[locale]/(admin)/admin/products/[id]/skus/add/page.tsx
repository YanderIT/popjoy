import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getUuid } from '@/shared/lib/hash';
import { unitToCents } from '@/shared/lib/price';
import {
  createProductSku,
  findProductById,
  NewProductSku,
} from '@/shared/models/product';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function SkuAddPage({
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
    { title: t('skus.add.crumbs.admin'), url: '/admin' },
    { title: t('skus.add.crumbs.products'), url: '/admin/products' },
    { title: product.name, url: `/admin/products/${id}/edit` },
    { title: t('skus.add.crumbs.skus'), url: `/admin/products/${id}/skus` },
    { title: t('skus.add.crumbs.add'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'sku',
        type: 'text',
        title: t('fields.sku'),
        tip: 'Unique SKU code for this variant',
        validation: { required: true },
      },
      {
        name: 'attributes',
        type: 'textarea',
        title: t('fields.attributes'),
        tip: 'JSON format, e.g. {"color": "Red", "size": "M"}',
        value: '{}',
        validation: { required: true },
      },
      {
        name: 'price',
        type: 'number',
        title: t('fields.price'),
        tip: 'Price (e.g. 99.99)',
        validation: { required: true },
      },
      {
        name: 'originalPrice',
        type: 'number',
        title: t('fields.original_price'),
        tip: 'Original price (leave empty if no discount)',
      },
      {
        name: 'costPrice',
        type: 'number',
        title: t('fields.cost_price'),
        tip: 'Cost price',
      },
      {
        name: 'stock',
        type: 'number',
        title: t('fields.stock'),
        value: 0,
        validation: { required: true },
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
          { title: t('status_options.active'), value: 'active' },
          { title: t('status_options.inactive'), value: 'inactive' },
        ],
        value: 'active',
        validation: { required: true },
      },
    ],
    passby: {
      productId: id,
    },
    data: {},
    submit: {
      button: {
        title: t('skus.add.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const { productId } = passby as { productId: string };

        const sku = data.get('sku') as string;
        const attributes = data.get('attributes') as string;
        const price = unitToCents(parseFloat(data.get('price') as string) || 0);
        const originalPrice = data.get('originalPrice')
          ? unitToCents(parseFloat(data.get('originalPrice') as string))
          : null;
        const costPrice = data.get('costPrice')
          ? unitToCents(parseFloat(data.get('costPrice') as string))
          : null;
        const stock = parseInt(data.get('stock') as string) || 0;
        const image = data.get('image') as string;
        const status = data.get('status') as string;

        if (!sku?.trim()) {
          throw new Error('SKU is required');
        }

        if (!price || price <= 0) {
          throw new Error('Valid price is required');
        }

        // Validate JSON format
        try {
          JSON.parse(attributes);
        } catch {
          throw new Error('Attributes must be valid JSON');
        }

        const newSku: NewProductSku = {
          id: getUuid(),
          productId,
          sku: sku.trim(),
          attributes,
          price,
          originalPrice,
          costPrice,
          stock,
          image: image || null,
          status: status || 'active',
          sort: 0,
        };

        const result = await createProductSku(newSku);

        if (!result) {
          throw new Error('add SKU failed');
        }

        return {
          status: 'success',
          message: 'SKU added',
          redirect_url: `/admin/products/${productId}/skus`,
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={`${product.name} - ${t('skus.add.title')}`} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
