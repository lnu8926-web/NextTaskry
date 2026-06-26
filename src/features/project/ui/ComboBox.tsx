"use client"

import { useState } from "react"
import { Button } from "@/components/ui/shadcn/Button"
import { ChevronDown, UserPlus } from "lucide-react"
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


export type Item = {
  id: string;
  value: string;
  label: string;
  email: string;
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
  placeholder = "추가하고 싶은 팀원을 선택해주세요."
}: ComboBoxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between px-4 h-11 text-left font-normal border-input hover:bg-muted/40"
        >
          <span className="flex items-center gap-2 min-w-0">
            <UserPlus className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className={`truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
              {value ? value.label : placeholder}
            </span>
          </span>
          <ChevronDown className="shrink-0 w-4 h-4 text-muted-foreground ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <ItemList
          setOpen={setOpen}
          setValue={setValue}
          onChange={onChange}
          items={items}
        />
      </PopoverContent>
    </Popover>
  )
}

interface ItemListProps {
  setOpen: (open: boolean) => void
  setValue: (item: Item | null) => void
  onChange?: (item: Item | null) => void
  items: Item[]
}

function ItemList({ setOpen, setValue, onChange, items }: ItemListProps) {
  return (
    <Command>
      <CommandInput placeholder="이름 또는 이메일 검색..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup>
          {items.map((item) => {
            const initial = item.value?.charAt(0) ?? "?"
            return (
              <CommandItem
                key={item.id}
                value={item.value}
                onSelect={() => {
                  setValue(item)
                  if (onChange) onChange(item)
                  setOpen(false)
                }}
                className="flex items-center gap-3 py-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {initial}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm">{item.value}</span>
                  <span className="text-xs text-muted-foreground">{item.email}</span>
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
