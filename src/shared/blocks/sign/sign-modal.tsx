'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useAppContext } from '@/shared/contexts/app';

import { SignInForm } from './sign-in-form';

export function SignModal({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const t = useTranslations('common.sign');
  const { isShowSignModal, setIsShowSignModal } = useAppContext();

  return (
    <Dialog open={isShowSignModal} onOpenChange={setIsShowSignModal}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[720px]">
        <div className="grid md:grid-cols-2">
          {/* Left - Product Image (desktop only) */}
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
          <div className="flex flex-col justify-center px-6 py-8 md:py-12">
            <DialogHeader className="mb-6 md:mb-8">
              <DialogTitle className="text-2xl md:text-3xl font-normal leading-tight">
                {t('promo_title')}
              </DialogTitle>
              <DialogDescription className="mt-3 md:mt-4 space-y-1 md:space-y-2 text-sm md:text-base">
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
