"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type WorkspaceView = "kanban" | "calendar";

interface WorkspaceNavContextType {
  isActive: boolean;
  projectName: string;
  currentView: WorkspaceView;
  showMemoPanel: boolean;
  setView: (view: WorkspaceView) => void;
  toggleMemo: () => void;
  closeMemo: () => void;
  setProjectContext: (name: string) => void;
  clearWorkspace: () => void;
}

const WorkspaceNavContext = createContext<WorkspaceNavContextType | null>(null);

export function WorkspaceNavProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [currentView, setCurrentView] = useState<WorkspaceView>("kanban");
  const [showMemoPanel, setShowMemoPanel] = useState(false);

  const setView = useCallback((view: WorkspaceView) => {
    setCurrentView(view);
    setShowMemoPanel(false);
  }, []);

  const toggleMemo = useCallback(() => {
    setShowMemoPanel((prev) => !prev);
  }, []);

  const closeMemo = useCallback(() => {
    setShowMemoPanel(false);
  }, []);

  const setProjectContext = useCallback((name: string) => {
    setIsActive(true);
    setProjectName(name);
  }, []);

  const clearWorkspace = useCallback(() => {
    setIsActive(false);
    setProjectName("");
    setCurrentView("kanban");
    setShowMemoPanel(false);
  }, []);

  return (
    <WorkspaceNavContext.Provider
      value={{ isActive, projectName, currentView, showMemoPanel, setView, toggleMemo, closeMemo, setProjectContext, clearWorkspace }}
    >
      {children}
    </WorkspaceNavContext.Provider>
  );
}

export function useWorkspaceNav() {
  const ctx = useContext(WorkspaceNavContext);
  if (!ctx) throw new Error("useWorkspaceNav must be used within WorkspaceNavProvider");
  return ctx;
}
