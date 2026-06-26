"use client"

import { useState } from "react"
import { Search, ChevronDown, Users } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/shadcn/Command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/shadcn/Popover"
import { cn } from "@/lib/utils/utils"

export type Item = {
  id: string
  value: string
  label: string
  email: string
}

const AVATAR_PALETTE = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
]

export function getAvatarColor(name: string): string {
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[idx]
}

interface ComboBoxProps {
  items: Item[]
  value: Item | null
  setValue: (item: Item | null) => void
  onChange?: (item: Item | null) => void
  placeholder?: string
}

export function ComboBox({
  items,
  value,
  setValue,
  onChange,
  placeholder = "팀원 이름 또는 이메일로 검색",
}: ComboBoxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "w-full flex items-center gap-2.5 h-10 px-3 rounded-lg",
            "border border-input bg-background text-sm text-left",
            "transition-all duration-150 outline-none",
            "hover:border-neutral-400 dark:hover:border-neutral-500",
            "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring",
            open && "ring-2 ring-ring/30 border-ring"
          )}
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className={cn("flex-1 truncate text-sm", value ? "text-foreground" : "text-muted-foreground")}>
            {value ? value.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0 rounded-xl border border-border shadow-lg overflow-hidden"
        align="start"
        sideOffset={6}
      >
        <Command>
          <CommandInput placeholder="이름 또는 이메일 검색..." />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">검색 결과가 없습니다</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    다른 이름이나 이메일로 검색해보세요
                  </p>
                </div>
              </div>
            </CommandEmpty>
            <CommandGroup className="p-1.5">
              {items.map((item) => {
                const avatarColor = getAvatarColor(item.value)
                const initial = item.value?.charAt(0)?.toUpperCase() ?? "?"
                return (
                  <CommandItem
                    key={item.id}
                    value={item.value}
                    onSelect={() => {
                      setValue(item)
                      if (onChange) onChange(item)
                      setOpen(false)
                    }}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer"
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", avatarColor)}>
                      {initial}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground leading-snug">{item.value}</span>
                      <span className="text-xs text-muted-foreground truncate">{item.email}</span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
