import { Skeleton } from "@/components/ui/skeleton";

export default function TextbookLoading() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-12 max-w-5xl mx-auto">
      <Skeleton className="h-9 w-48 mb-2 bg-white/5" />
      <Skeleton className="h-5 w-72 mb-8 bg-white/5" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
