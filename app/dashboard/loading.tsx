import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-12 max-w-5xl mx-auto">
      <Skeleton className="h-9 w-40 mb-2 bg-white/5" />
      <Skeleton className="h-5 w-64 mb-8 bg-white/5" />
      <Skeleton className="h-5 w-16 mb-4 bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Skeleton className="h-36 rounded-2xl bg-white/5" />
        <Skeleton className="h-36 rounded-2xl bg-white/5" />
      </div>
      <Skeleton className="h-5 w-24 mb-4 bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-36 rounded-2xl bg-white/5" />
        <Skeleton className="h-36 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}
