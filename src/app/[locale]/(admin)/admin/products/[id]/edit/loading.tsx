import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function Loading() {
  return (
    <>
      <Header />
      <Main>
        <MainHeader />
        <div className="md:max-w-xl space-y-6 rounded-lg border p-6">
          {/* Name */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          {/* Image */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-32 w-32" />
          </div>
          {/* Status */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          {/* Sort */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
          {/* Submit */}
          <Skeleton className="h-10 w-24" />
        </div>
      </Main>
    </>
  );
}
