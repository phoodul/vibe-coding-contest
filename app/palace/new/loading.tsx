import { Skeleton } from "@/components/ui/skeleton";

export default function NewPalaceLoading() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
      <Skeleton className="h-9 w-64 mb-2 bg-white/5" />
      <Skeleton className="h-5 w-80 mb-8 bg-white/5" />
      <Skeleton className="h-5 w-24 mb-4 bg-white/5" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
