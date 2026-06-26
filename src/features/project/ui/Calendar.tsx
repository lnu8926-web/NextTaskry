"use client";

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/shadcn/Button"
import { Calendar } from "@/components/ui/shadcn/Calendar"
import { cn } from "@/lib/utils/utils"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/shadcn/Popover"
import { format } from "date-fns"

interface Calendar22Props {
  value?: Date; // 외부에서 주입될 날짜 값
  onValueChange?: (date: Date | undefined) => void; // 외부로 날짜 변경을 알릴 함수
  placeholder?: string; // 플레이스홀더 텍스트
}

export function Calendar22({
  value,
  onValueChange,
  placeholder = "Select Date"
}: Calendar22Props) {
  const [open, setOpen] = React.useState(false)

  const handleSelectDate = (selectedDate: Date | undefined) => {
    // 외부로 변경 사항을 알립니다.
    if (onValueChange) {
      onValueChange(selectedDate);
    }
    // Popover를 닫습니다.
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={cn(
              "w-full justify-between font-normal text-sm px-3.5 py-2.5 h-auto",
              "bg-white dark:bg-input/30",
              "border-slate-200 dark:border-border",
              "shadow-sm",
              "hover:border-slate-300 hover:shadow-md hover:bg-white",
              "focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 dark:focus-visible:ring-sky-900/30",
              "transition-[border-color,box-shadow] duration-150",
              !value && "text-slate-400 dark:text-muted-foreground",
              value && "text-foreground",
            )}
          >
            {value ? format(value, "yyyy년 MM월 dd일") : placeholder}
            <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value} // 외부에서 받은 value를 Calendar의 selected 프롭에 전달
            captionLayout="dropdown"
            onSelect={handleSelectDate} // 수정된 핸들러 사용
            startMonth={new Date(1900, 0)}
            endMonth={new Date(2100, 11)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
