'use client';

import { useState } from 'react';
import { Loader, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { NavItem } from '@/shared/types/blocks/common';

export interface DropdownAction extends NavItem {
  onAction?: (id: string) => Promise<{ status: string; message: string }>;
  confirm?: {
    title: string;
    description: string;
  };
  variant?: 'default' | 'destructive';
  itemId?: string;
}

export function Dropdown({
  value,
  placeholder,
  metadata,
  className,
}: {
  value: (NavItem | DropdownAction)[];
  placeholder?: string;
  metadata: Record<string, any>;
  className?: string;
}) {
  const [confirmAction, setConfirmAction] = useState<DropdownAction | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  if (!value || value.length === 0) {
    return null;
  }

  const handleAction = async (action: DropdownAction) => {
    if (!action.onAction || !action.itemId) return;

    setLoading(true);
    try {
      const result = await action.onAction(action.itemId);
      if (result.status === 'success') {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {value?.map((item) => {
            const action = item as DropdownAction;

            if (action.onAction) {
              return (
                <DropdownMenuItem
                  key={item.title}
                  className={
                    action.variant === 'destructive' ? 'text-red-600' : ''
                  }
                  onClick={() => {
                    if (action.confirm) {
                      setConfirmAction(action);
                    } else {
                      handleAction(action);
                    }
                  }}
                >
                  <span className="flex w-full cursor-pointer items-center gap-2">
                    {item.icon && (
                      <SmartIcon
                        name={item.icon as string}
                        className="h-4 w-4"
                      />
                    )}
                    {item.title}
                  </span>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem key={item.title}>
                <Link
                  href={item.url || ''}
                  target={item.target || '_self'}
                  className="flex w-full items-center gap-2"
                >
                  {item.icon && (
                    <SmartIcon
                      name={item.icon as string}
                      className="h-4 w-4"
                    />
                  )}
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{confirmAction?.confirm?.title}</DialogTitle>
            <DialogDescription>
              {confirmAction?.confirm?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => setConfirmAction(null)}
            >
              {metadata?.cancelText || 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                if (confirmAction) {
                  handleAction(confirmAction);
                }
              }}
            >
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {metadata?.confirmText || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
