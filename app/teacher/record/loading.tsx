import { Skeleton } from "@/components/ui/skeleton";

export default function RecordLoading() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
      <Skeleton className="h-9 w-56 mb-2 bg-white/5" />
      <Skeleton className="h-5 w-80 mb-8 bg-white/5" />
      <Skeleton className="h-40 rounded-2xl bg-white/5 mb-4" />
      <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
    </div>
  );
}
