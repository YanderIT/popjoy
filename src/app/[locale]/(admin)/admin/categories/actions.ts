'use server';

import { revalidatePath } from 'next/cache';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { deleteTaxonomy } from '@/shared/models/taxonomy';

export async function deleteCategoryAction(
  id: string
): Promise<{ status: string; message: string }> {
  await requirePermission({
    code: PERMISSIONS.CATEGORIES_WRITE,
  });

  try {
    const result = await deleteTaxonomy(id);

    if (!result) {
      return { status: 'error', message: 'Category not found' };
    }

    revalidatePath('/admin/categories');

    return { status: 'success', message: 'Category deleted' };
  } catch (error: any) {
    return { status: 'error', message: error.message || 'Delete failed' };
  }
}
