import { Skeleton } from "@/components/ui/shadcn/Skeleton";

export default function ProjectCardSkeleton() {
  return (
    <div className="relative flex flex-col rounded-xl border border-border p-6">
      {/* ⋮ 메뉴 버튼 자리 */}
      <Skeleton className="absolute top-3 right-3 h-7 w-7 rounded-lg" />

      {/* status dot + type 라벨 */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-1.5 w-1.5 rounded-full shrink-0" />
        <Skeleton className="h-3 w-12" />
      </div>

      {/* 프로젝트명 */}
      <Skeleton className="h-[22px] w-3/4 mb-2" />

      {/* 설명 2줄 */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-5" />

      {/* 마감일 + 멤버 수 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}
