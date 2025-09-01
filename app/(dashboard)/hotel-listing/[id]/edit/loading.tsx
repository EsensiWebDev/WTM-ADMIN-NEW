import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingHotelDetail() {
  return (
    <main className="flex flex-col gap-8 p-6 md:pt-0 md:p-12 bg-[#f6fdff] min-h-screen">
      {/* Gallery Skeleton */}
      <section className="w-full max-w-6xl mx-auto">
        <Skeleton className="w-full h-64 md:h-96 rounded-xl" />
      </section>
      {/* Info Skeleton */}
      <section className="w-full max-w-6xl mx-auto gap-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/6" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </section>
      {/* Room Card Skeletons */}
      <section className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="mb-6">
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
