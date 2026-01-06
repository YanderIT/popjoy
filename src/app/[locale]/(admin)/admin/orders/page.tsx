import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import {
  getShopOrders,
  getShopOrdersCount,
  ShopOrderStatus,
} from '@/shared/models/shopOrder';
import { Crumb, Filter, Search, Tab } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

import { ShipOrderButton } from './ship-order-button';

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: number;
    pageSize?: number;
    status?: string;
    orderNo?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.PAYMENTS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.orders');

  const { page: pageNum, pageSize, status, orderNo } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.orders'), is_active: true },
  ];

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/admin/orders',
      is_active: !status || status === 'all',
    },
    {
      name: 'pending_shipment',
      title: t('list.tabs.pending_shipment'),
      url: '/admin/orders?status=pending_shipment',
      is_active: status === 'pending_shipment',
    },
    {
      name: 'shipped',
      title: t('list.tabs.shipped'),
      url: '/admin/orders?status=shipped',
      is_active: status === 'shipped',
    },
    {
      name: 'delivered',
      title: t('list.tabs.delivered'),
      url: '/admin/orders?status=delivered',
      is_active: status === 'delivered',
    },
  ];

  const filters: Filter[] = [
    {
      name: 'status',
      title: t('list.filters.status.title'),
      value: status,
      options: [
        { value: 'all', label: t('list.filters.status.options.all') },
        {
          value: ShopOrderStatus.PENDING_PAYMENT,
          label: t('list.filters.status.options.pending_payment'),
        },
        {
          value: ShopOrderStatus.PENDING_SHIPMENT,
          label: t('list.filters.status.options.pending_shipment'),
        },
        {
          value: ShopOrderStatus.SHIPPED,
          label: t('list.filters.status.options.shipped'),
        },
        {
          value: ShopOrderStatus.DELIVERED,
          label: t('list.filters.status.options.delivered'),
        },
        {
          value: ShopOrderStatus.COMPLETED,
          label: t('list.filters.status.options.completed'),
        },
        {
          value: ShopOrderStatus.CANCELED,
          label: t('list.filters.status.options.canceled'),
        },
        {
          value: ShopOrderStatus.REFUNDED,
          label: t('list.filters.status.options.refunded'),
        },
      ],
    },
  ];

  const search: Search = {
    name: 'orderNo',
    title: t('list.search.order_no.title'),
    placeholder: t('list.search.order_no.placeholder'),
    value: orderNo,
  };

  const total = await getShopOrdersCount({
    orderNo: orderNo ? (orderNo as string) : undefined,
    status: status && status !== 'all' ? (status as ShopOrderStatus) : undefined,
  });

  const orders = await getShopOrders({
    orderNo: orderNo ? (orderNo as string) : undefined,
    status: status && status !== 'all' ? (status as ShopOrderStatus) : undefined,
    getUser: true,
    page,
    limit,
  });

  const table: Table = {
    columns: [
      { name: 'orderNo', title: t('fields.order_no'), type: 'copy' },
      { name: 'user', title: t('fields.user'), type: 'user' },
      {
        title: t('fields.amount'),
        callback: (item) => {
          return (
            <div className="text-primary">{`${item.totalAmount / 100} ${
              item.currency
            }`}</div>
          );
        },
      },
      { name: 'status', title: t('fields.status'), type: 'label' },
      {
        name: 'shippingCarrier',
        title: t('fields.shipping_carrier'),
        placeholder: '-',
      },
      {
        name: 'trackingNumber',
        title: t('fields.tracking_number'),
        type: 'copy',
        placeholder: '-',
      },
      { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
      {
        title: t('fields.action'),
        callback: (item) => {
          if (item.status === ShopOrderStatus.PENDING_SHIPMENT) {
            return <ShipOrderButton orderNo={item.orderNo} />;
          }
          return null;
        },
      },
    ],
    data: orders,
    pagination: {
      total,
      page,
      limit,
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader
          title={t('list.title')}
          tabs={tabs}
          filters={filters}
          search={search}
        />
        <TableCard table={table} />
      </Main>
    </>
  );
}
