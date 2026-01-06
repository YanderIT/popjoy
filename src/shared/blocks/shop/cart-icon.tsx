'use client';

import { ShoppingCart } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useCart } from '@/shared/contexts/cart';

interface CartIconProps {
  onClick?: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { getItemCount, isLoading } = useCart();
  const count = getItemCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
      aria-label="Shopping cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {!isLoading && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  );
}
