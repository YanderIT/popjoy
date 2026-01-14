'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useAppContext } from '@/shared/contexts/app';
import { useMediaQuery } from '@/shared/hooks/use-media-query';

import { SignInForm } from './sign-in-form';

export function SignModal({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const t = useTranslations('common.sign');
  const { isShowSignModal, setIsShowSignModal } = useAppContext();

  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={isShowSignModal} onOpenChange={setIsShowSignModal}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-[720px]">
          <div className="grid md:grid-cols-2">
            {/* Left - Product Image */}
            <div className="relative hidden min-h-[520px] md:block bg-gray-50">
              <Image
                src="/imgs/productList/Labubu Preserved Bouquet/109.9Love-Large Labubu Preserved Bouquet.jpg"
                alt="Promotion"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Right - Form */}
            <div className="flex flex-col justify-center px-6 py-12">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-3xl font-normal leading-tight">
                  {t('promo_title')}
                </DialogTitle>
                <DialogDescription className="mt-4 space-y-2 text-base">
                  <span className="block font-medium text-foreground">
                    {t('promo_subtitle')}
                  </span>
                  <span className="block">{t('promo_description')}</span>
                </DialogDescription>
              </DialogHeader>
              <SignInForm callbackUrl={callbackUrl} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isShowSignModal} onOpenChange={setIsShowSignModal}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl font-normal">
            {t('promo_title')}
          </DrawerTitle>
          <DrawerDescription className="mt-2 space-y-1">
            <span className="block font-medium text-foreground">
              {t('promo_subtitle')}
            </span>
            <span className="block">{t('promo_description')}</span>
          </DrawerDescription>
        </DrawerHeader>
        <SignInForm callbackUrl={callbackUrl} className="mt-4 px-4" />
        <DrawerFooter className="pt-4">
          <DrawerClose asChild>
            <Button variant="outline">{t('cancel_title')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
