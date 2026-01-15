import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { centsToUnit, unitToCents } from '@/shared/lib/price';
import {
  findProductById,
  findSkuById,
  updateProductSku,
} from '@/shared/models/product';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function SkuEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; skuId: string }>;
}) {
  const { locale, id, skuId } = await params;
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

  const sku = await findSkuById(skuId);
  if (!sku) {
    return <Empty message="SKU not found" />;
  }

  const crumbs: Crumb[] = [
    { title: t('skus.edit.crumbs.admin'), url: '/admin' },
    { title: t('skus.edit.crumbs.products'), url: '/admin/products' },
    { title: product.name, url: `/admin/products/${id}/edit` },
    { title: t('skus.edit.crumbs.skus'), url: `/admin/products/${id}/skus` },
    { title: t('skus.edit.crumbs.edit'), is_active: true },
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
        validation: { required: true },
      },
    ],
    passby: {
      productId: id,
      skuId,
    },
    data: {
      ...sku,
      price: centsToUnit(sku.price),
      originalPrice: sku.originalPrice ? centsToUnit(sku.originalPrice) : null,
      costPrice: sku.costPrice ? centsToUnit(sku.costPrice) : null,
    },
    submit: {
      button: {
        title: t('skus.edit.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const { productId, skuId: existingSkuId } = passby as {
          productId: string;
          skuId: string;
        };

        const skuCode = data.get('sku') as string;
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

        if (!skuCode?.trim()) {
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

        const result = await updateProductSku(existingSkuId, {
          sku: skuCode.trim(),
          attributes,
          price,
          originalPrice,
          costPrice,
          stock,
          image: image || null,
          status: status || 'active',
        });

        if (!result) {
          throw new Error('update SKU failed');
        }

        return {
          status: 'success',
          message: 'SKU updated',
          redirect_url: `/admin/products/${productId}/skus`,
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={`${product.name} - ${t('skus.edit.title')}`} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
