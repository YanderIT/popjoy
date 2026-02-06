import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import {
  getBanners,
  getBannersCount,
  type Banner,
} from '@/shared/models/banner';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function BannersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.BANNERS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.banners');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.banners'), is_active: true },
  ];

  const total = await getBannersCount();
  const banners = await getBanners({ page, limit });

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
      { name: 'title', title: t('fields.title') },
      { name: 'link', title: t('fields.link') },
      { name: 'position', title: t('fields.position') },
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
        callback: (item: Banner) => {
          return [
            {
              id: 'edit',
              title: t('list.buttons.edit'),
              icon: 'RiEditLine',
              url: `/admin/banners/${item.id}/edit`,
            },
          ];
        },
      },
    ],
    data: banners,
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
      url: '/admin/banners/add',
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
