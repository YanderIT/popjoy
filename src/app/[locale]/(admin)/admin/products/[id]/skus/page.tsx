import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import {
  findProductById,
  getAllProductSkus,
  getProductSkusCount,
  type ProductSku,
} from '@/shared/models/product';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function ProductSkusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.PRODUCTS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.products');

  const product = await findProductById(id);
  if (!product) {
    return <Empty message="Product not found" />;
  }

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const crumbs: Crumb[] = [
    { title: t('skus.list.crumbs.admin'), url: '/admin' },
    { title: t('skus.list.crumbs.products'), url: '/admin/products' },
    { title: product.name, url: `/admin/products/${id}/edit` },
    { title: t('skus.list.crumbs.skus'), is_active: true },
  ];

  const total = await getProductSkusCount(id);
  const data = await getAllProductSkus(id);

  const table: Table = {
    columns: [
      {
        name: 'sku',
        title: t('fields.sku'),
        type: 'copy',
        metadata: { message: 'Copied' },
      },
      {
        name: 'image',
        title: t('fields.image'),
        type: 'image',
      },
      {
        name: 'attributes',
        title: t('fields.attributes'),
        callback: (item: ProductSku) => {
          try {
            const attrs = JSON.parse(item.attributes);
            return Object.entries(attrs)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ');
          } catch {
            return item.attributes;
          }
        },
      },
      {
        name: 'price',
        title: t('fields.price'),
        callback: (item: ProductSku) => {
          return `$${(item.price / 100).toFixed(2)}`;
        },
      },
      {
        name: 'originalPrice',
        title: t('fields.original_price'),
        callback: (item: ProductSku) => {
          return item.originalPrice ? `$${(item.originalPrice / 100).toFixed(2)}` : '-';
        },
      },
      { name: 'stock', title: t('fields.stock') },
      {
        name: 'status',
        title: t('fields.status'),
        type: 'label',
        metadata: { variant: 'outline' },
      },
      {
        name: 'action',
        title: '',
        type: 'dropdown',
        callback: (item: ProductSku) => {
          return [
            {
              id: 'edit',
              title: t('skus.list.buttons.edit'),
              icon: 'RiEditLine',
              url: `/admin/products/${id}/skus/${item.id}/edit`,
            },
          ];
        },
      },
    ],
    data,
    pagination: {
      total,
      page,
      limit,
    },
  };

  const actions: Button[] = [
    {
      id: 'add',
      title: t('skus.list.buttons.add'),
      icon: 'RiAddLine',
      url: `/admin/products/${id}/skus/add`,
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={`${product.name} - ${t('skus.list.title')}`} actions={actions} />
        <TableCard table={table} />
      </Main>
    </>
  );
}
