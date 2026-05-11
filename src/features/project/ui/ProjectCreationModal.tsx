"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Collapsible from "@radix-ui/react-collapsible";
import { X, ChevronDown, ChevronUp, Briefcase, User, BookOpen, Building2 } from "lucide-react";
import { createProject, updateProjectMember } from "../model";
import { showToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/queryKeys";
import { ComboBox, type Item } from "./ComboBox";
import { getUser } from "@/lib/api/users";
import { useQuery } from "@tanstack/react-query";

const PROJECT_TYPES = [
  { value: "팀 프로젝트", label: "팀 프로젝트", description: "여러 사람이 함께하는 협업 프로젝트", icon: Briefcase },
  { value: "개인 프로젝트", label: "개인 프로젝트", description: "나만의 프로젝트를 관리해요", icon: User },
  { value: "학습 프로젝트", label: "학습 프로젝트", description: "새로운 기술을 배우고 연습해요", icon: BookOpen },
  { value: "상용 프로젝트", label: "상용 프로젝트", description: "비즈니스 목적의 프로젝트", icon: Building2 },
];

const DURATION_OPTIONS = [
  { value: 1, label: "1개월" },
  { value: 3, label: "3개월" },
  { value: 6, label: "6개월" },
  { value: "custom" as const, label: "직접 입력" },
];

interface ProjectCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MemberItem {
  projectId: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
}

export function ProjectCreationModal({ open, onOpenChange }: ProjectCreationModalProps) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | "custom" | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Item | null>(null);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: userList = [] } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const result = await getUser();
      return (result.data || []).map(({ user_id, user_name, email }) => ({
        id: user_id,
        label: `${user_name} (${email})`,
        value: user_name,
        email,
      })) as Item[];
    },
    staleTime: 1000 * 60 * 10,
    enabled: open,
  });

  const reset = () => {
    setStep(1);
    setName("");
    setNameError("");
    setType(null);
    setDuration(null);
    setStartDate("");
    setEndDate("");
    setDescription("");
    setTechStack("");
    setIsExpanded(false);
    setSelectedUser(null);
    setMembers([]);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setNameError("이름을 입력해주세요");
        return;
      }
      setNameError("");
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleAddMember = (item: Item | null) => {
    if (!item) return;
    if (members.some((m) => m.userId === item.id)) {
      alert("이미 추가된 멤버입니다.");
      return;
    }
    setMembers((prev) => [...prev, { projectId: "", userId: item.id, userName: item.value, email: item.email, role: "member" }]);
  };

  const handleSubmit = async () => {
    if (!name || !type || !duration) return;

    const today = new Date();
    let endedAt: Date;

    if (duration === "custom") {
      endedAt = endDate ? new Date(endDate) : today;
    } else {
      endedAt = new Date(today);
      endedAt.setMonth(endedAt.getMonth() + duration);
    }

    const startedAt = duration === "custom" && startDate ? new Date(startDate) : today;

    setIsSubmitting(true);
    try {
      const { data } = await createProject({
        projectName: name,
        type,
        status: "active",
        startedAt,
        endedAt,
        description: description,
        techStack: techStack,
      });

      const projectId = data?.[0]?.project_id;
      if (projectId && members.length > 0) {
        await updateProjectMember(projectId, members.map((m) => ({ ...m, projectId })));
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      showToast("프로젝트가 생성되었습니다.", "success");
      handleClose();
    } catch {
      showToast("생성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!duration && (duration !== "custom" || (!!startDate && !!endDate));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl shadow-sm border border-border z-50 w-[calc(100%-2rem)] sm:w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-card border-b border-border px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-main-400 dark:bg-main-300" : "bg-gray-200 dark:bg-gray-600"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Step {step} / 3</p>
            </div>
            <Dialog.Close asChild>
              <button onClick={handleClose} className="ml-4 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* 콘텐츠 */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">프로젝트 이름</h2>
                </div>
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(""); }}
                    placeholder="프로젝트 이름을 입력해주세요"
                    className="w-full px-6 py-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-main-400 text-foreground text-lg placeholder:text-muted-foreground text-center"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  />
                  {nameError && <p className="text-red-100 text-sm mt-2 text-center">{nameError}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">어떤 프로젝트인가요?</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROJECT_TYPES.map(({ value, label, description: desc, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setType(value)}
                      className={`p-5 rounded-xl border transition-all text-left ${
                        type === value
                          ? "border-main-400 bg-main-400/10 dark:border-main-300 dark:bg-main-300/10"
                          : "border-border bg-card hover:border-main-400/50 dark:hover:border-main-300/50"
                      }`}
                    >
                      <Icon className={`w-7 h-7 mb-3 ${type === value ? "text-main-400 dark:text-main-300" : "text-muted-foreground"}`} />
                      <h3 className="font-medium text-foreground mb-1">{label}</h3>
                      <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">기간을 정해볼까요?</h2>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                        duration === opt.value
                          ? "bg-main-400 dark:bg-main-300 text-white dark:text-gray-900"
                          : "bg-card border border-border text-foreground hover:border-main-400 dark:hover:border-main-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {duration === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">시작일</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-main-400 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">종료일</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-main-400 text-foreground"
                      />
                    </div>
                  </div>
                )}

                {/* 선택적 추가 정보 */}
                <div className="pt-2">
                  <Collapsible.Root open={isExpanded} onOpenChange={setIsExpanded}>
                    <Collapsible.Trigger className="w-full flex items-center justify-between py-3 text-muted-foreground hover:text-foreground transition-colors border-t border-border">
                      <span className="text-sm font-medium">+ 추가 정보 입력하기 (선택사항)</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Collapsible.Trigger>
                    <Collapsible.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
                      <div className="pt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">프로젝트 설명</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="프로젝트를 간단히 설명해주세요 (최대 300자)"
                            rows={3}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-main-400 text-foreground placeholder:text-muted-foreground resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">기술 스택</label>
                          <input
                            type="text"
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            placeholder="예) React, TypeScript"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-main-400 text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">구성원 추가</label>
                          <ComboBox
                            items={userList}
                            value={selectedUser}
                            setValue={setSelectedUser}
                            onChange={handleAddMember}
                          />
                          {members.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {members.map((m) => (
                                <span
                                  key={m.userId}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-main-400/10 dark:bg-main-300/10 text-main-500 dark:text-main-300 text-sm rounded-lg"
                                >
                                  {m.userName}
                                  <button
                                    onClick={() => setMembers((prev) => prev.filter((x) => x.userId !== m.userId))}
                                    className="hover:opacity-70"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-card border-t border-border px-6 sm:px-8 py-4 sm:py-5">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button onClick={handleBack} className="px-5 py-2.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
                  이전
                </button>
              )}
              <div className="flex-1" />
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 2 && !type}
                  className="px-8 py-2.5 bg-main-400 dark:bg-main-300 text-white dark:text-gray-900 rounded-lg hover:bg-main-500 dark:hover:bg-main-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  다음
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="px-8 py-2.5 bg-main-400 dark:bg-main-300 text-white dark:text-gray-900 rounded-lg hover:bg-main-500 dark:hover:bg-main-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isSubmitting ? "생성 중..." : "생성하기"}
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
