// 하위 할 일 섹션 컴포넌트
import { FieldLabel } from "@/features/task/ui/shared/FieldLabel";
import SubtaskList from "@/features/task/ui/fields/SubtaskList";
import { Subtask } from "@/types";

export function SubtaskSection({
  subtasks,
  onUpdate,
  disabled = false,
}: {
  subtasks: Subtask[];
  onUpdate?: (list: Subtask[]) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel icon="checkList" title="하위 할 일" />
      <SubtaskList
        subtasks={subtasks}
        editable={!disabled}
        onUpdate={onUpdate}
        disabled={disabled}
      />
    </div>
  );
}
