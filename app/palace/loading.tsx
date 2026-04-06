import { Skeleton } from "@/components/ui/skeleton";

export default function PalaceLoading() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2 bg-white/5" />
          <Skeleton className="h-5 w-64 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-white/5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
