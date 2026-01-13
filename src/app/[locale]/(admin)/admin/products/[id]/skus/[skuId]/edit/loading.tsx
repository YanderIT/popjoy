import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function Loading() {
  return (
    <>
      <Header />
      <Main>
        <MainHeader />
        <div className="md:max-w-xl space-y-6 rounded-lg border p-6">
          {/* SKU, Attributes, Price, OriginalPrice, CostPrice, Stock, Image, Status */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          {/* Submit */}
          <Skeleton className="h-10 w-24" />
        </div>
      </Main>
    </>
  );
}
