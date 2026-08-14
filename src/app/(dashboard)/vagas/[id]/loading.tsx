import { Skeleton } from "@/components/ui/skeleton";

export default function JobLoading() {
  return <div className="space-y-6"><Skeleton className="h-8 w-32" /><Skeleton className="h-32 w-full" /><div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]"><Skeleton className="h-[520px]" /><Skeleton className="h-80" /></div></div>;
}
