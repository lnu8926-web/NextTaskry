"use client";

import Button from "@/components/ui/Button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/Dialog";

interface DeleteDialogProps {
  onClick: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteDialog({ onClick, open = false, onOpenChange }: DeleteDialogProps) {
  const handleDelete = () => {
    onClick();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>프로젝트를 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            삭제한 프로젝트는 다시 되돌릴 수 없습니다.
            <br /> 프로젝트 관련 모든 데이터가 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="warning" onClick={handleDelete}>
            삭제
          </Button>
          <DialogClose asChild>
            <Button variant="basic">취소</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
