import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import {
  getProducts,
  getProductsCount,
  type Product,
} from '@/shared/models/product';
import {
  getTaxonomies,
  TaxonomyStatus,
  TaxonomyType,
} from '@/shared/models/taxonomy';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.PRODUCTS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.products');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.products'), is_active: true },
  ];

  const total = await getProductsCount();
  const products = await getProducts({ page, limit });

  // Get all categories for mapping
  const categories = await getTaxonomies({
    type: TaxonomyType.CATEGORY,
    status: TaxonomyStatus.PUBLISHED,
    limit: 100,
  });

  // Create category ID to name map
  const categoryMap = new Map(categories.map((c) => [c.id, c.title]));

  // Add category name to products
  const data = products.map((p) => ({
    ...p,
    categoryName: p.categoryId ? categoryMap.get(p.categoryId) || '-' : '-',
  }));

  const table: Table = {
    columns: [
      {
        name: 'id',
        title: t('fields.id'),
        type: 'copy',
        metadata: { message: 'Copied' },
      },
      {
        name: 'image',
        title: t('fields.image'),
        type: 'image',
      },
      { name: 'name', title: t('fields.name') },
      { name: 'categoryName', title: t('fields.category') },
      {
        name: 'status',
        title: t('fields.status'),
        type: 'label',
        metadata: { variant: 'outline' },
      },
      { name: 'sort', title: t('fields.sort') },
      { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
      {
        name: 'action',
        title: '',
        type: 'dropdown',
        callback: (item: Product) => {
          return [
            {
              id: 'edit',
              title: t('list.buttons.edit'),
              icon: 'RiEditLine',
              url: `/admin/products/${item.id}/edit`,
            },
            {
              id: 'skus',
              title: t('list.buttons.skus'),
              icon: 'RiListCheck',
              url: `/admin/products/${item.id}/skus`,
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
      title: t('list.buttons.add'),
      icon: 'RiAddLine',
      url: '/admin/products/add',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('list.title')} actions={actions} />
        <TableCard table={table} />
      </Main>
    </>
  );
}
