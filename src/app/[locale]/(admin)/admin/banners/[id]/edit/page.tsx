import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import {
  findBannerById,
  updateBanner,
  BannerStatus,
  BannerPosition,
  BannerTarget,
} from '@/shared/models/banner';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function BannerEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.BANNERS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.banners');

  const banner = await findBannerById(id);
  if (!banner) {
    return <Empty message="Banner not found" />;
  }

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/admin' },
    { title: t('edit.crumbs.banners'), url: '/admin/banners' },
    { title: t('edit.crumbs.edit'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'title',
        type: 'text',
        title: t('fields.title'),
        placeholder: 'Banner title for admin reference',
      },
      {
        name: 'image',
        type: 'upload_image',
        title: t('fields.image'),
        validation: { required: true },
      },
      {
        name: 'alt',
        type: 'text',
        title: t('fields.alt'),
        placeholder: 'Image alt text for accessibility',
      },
      {
        name: 'link',
        type: 'url',
        title: t('fields.link'),
        placeholder: 'https://example.com/page',
      },
      {
        name: 'target',
        type: 'select',
        title: t('fields.target'),
        options: [
          { title: t('target_options._self'), value: '_self' },
          { title: t('target_options._blank'), value: '_blank' },
        ],
      },
      {
        name: 'position',
        type: 'select',
        title: t('fields.position'),
        options: [
          { title: t('position_options.hero'), value: 'hero' },
          { title: t('position_options.promo'), value: 'promo' },
          { title: t('position_options.sidebar'), value: 'sidebar' },
        ],
        validation: { required: true },
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
      banner,
    },
    data: banner,
    submit: {
      button: {
        title: t('edit.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const { banner: existingBanner } = passby as { banner: { id: string } };
        if (!existingBanner) {
          throw new Error('banner not found');
        }

        const image = data.get('image') as string;
        const title = data.get('title') as string;
        const alt = data.get('alt') as string;
        const link = data.get('link') as string;
        const target = data.get('target') as string;
        const position = data.get('position') as string;
        const status = data.get('status') as string;
        const sort = parseInt(data.get('sort') as string) || 0;

        if (!image?.trim()) {
          throw new Error('image is required');
        }

        const result = await updateBanner(existingBanner.id, {
          title: title?.trim() || null,
          image: image.trim(),
          alt: alt?.trim() || null,
          link: link?.trim() || null,
          target: (target as BannerTarget) || BannerTarget.SELF,
          position: (position as BannerPosition) || BannerPosition.HERO,
          status: (status as BannerStatus) || BannerStatus.DRAFT,
          sort,
        });

        if (!result) {
          throw new Error('update banner failed');
        }

        return {
          status: 'success',
          message: 'banner updated',
          redirect_url: '/admin/banners',
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
