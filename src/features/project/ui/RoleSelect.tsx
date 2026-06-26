import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/Select"
import { cn } from "@/lib/utils/utils"

interface RoleSelectProps {
  value: string
  onValueChange: (value: string) => void
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  leader: {
    label: "리더",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-700/40",
  },
  member: {
    label: "멤버",
    className:
      "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-700/40",
  },
}

export function RoleSelect({ value, onValueChange }: RoleSelectProps) {
  const config = ROLE_CONFIG[value] ?? ROLE_CONFIG.member

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-6 w-16 rounded-full text-xs font-semibold border px-2.5 py-0",
          "focus:ring-1 focus:ring-ring/40 focus:ring-offset-0 outline-none",
          "transition-colors duration-150 cursor-pointer [&>svg]:hidden",
          config.className
        )}
      >
        <SelectValue>{config.label}</SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-24 rounded-lg">
        <SelectGroup>
          <SelectItem value="leader">
            <span className="text-violet-600 font-medium dark:text-violet-400">리더</span>
          </SelectItem>
          <SelectItem value="member">
            <span className="text-sky-600 font-medium dark:text-sky-400">멤버</span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
