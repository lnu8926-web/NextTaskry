import { cn } from "@/lib/utils/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * 프로젝트 전반에서 사용하는 표준 페이지 콘텐츠 컨테이너.
 * max-w-6xl / px-6 / py-8 을 기준선으로 모든 주요 페이지에서 동일한 폭을 유지.
 */
export default function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-6 py-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
