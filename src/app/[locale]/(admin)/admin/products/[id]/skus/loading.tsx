import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function Loading() {
  return (
    <>
      <Header />
      <Main>
        <MainHeader />
        <div className="rounded-lg border">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Table rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Main>
    </>
  );
}
