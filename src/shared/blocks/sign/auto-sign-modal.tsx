'use client';

import { useEffect, useRef } from 'react';

import { useSession } from '@/core/auth/client';
import { useAppContext } from '@/shared/contexts/app';

import { SignModal } from './sign-modal';

export function AutoSignModal({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const { setIsShowSignModal } = useAppContext();
  const { data: session, isPending } = useSession();
  const hasShownRef = useRef(false);

  useEffect(() => {
    // Wait until session check is complete
    if (isPending) return;

    // Only show if no session and we haven't shown yet
    if (!session?.user && !hasShownRef.current) {
      hasShownRef.current = true;
      setIsShowSignModal(true);
    }
  }, [session, isPending, setIsShowSignModal]);

  return <SignModal callbackUrl={callbackUrl} />;
}
