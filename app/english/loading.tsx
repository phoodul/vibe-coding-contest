import { Skeleton } from "@/components/ui/skeleton";

export default function EnglishLoading() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-12 max-w-5xl mx-auto">
      <Skeleton className="h-9 w-48 mb-2 bg-white/5" />
      <Skeleton className="h-5 w-72 mb-8 bg-white/5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
