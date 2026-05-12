"use client";

import clsx from "clsx";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/shared/Icon";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ModalProps } from "@/types/modal";
import { modalConfigs } from "@/config/modalConfigs";

const modalInnerClasses = clsx(
  "relative w-[calc(100%-2rem)] max-w-xl min-h-(--fluid-modal-min-h)",
  "py-(--fluid-modal-py) px-(--fluid-modal-px)",
  "flex flex-col items-center justify-center",
  "border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-800"
);
const modalIconClasses = clsx(
  "size-15 flex items-center justify-center",
  "absolute -top-8 left-1/2 transform -translate-x-1/2",
  "shadow-lg rounded-full bg-white dark:bg-gray-800"
);

export default function Modal({
  type,
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  warning,
  buttonDisabled,
  children,
}: ModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = type
    ? modalConfigs[type as keyof typeof modalConfigs]
    : { title: undefined, description: undefined, warning: undefined };
  const finalTitle = title ?? config.title;
  const finalDescription = description ?? config.description;
  const finalWarning = warning ?? config.warning;

  useEffect(() => {
    if (type === "success" || type === "deleteSuccess") {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [type, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-200 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      {/* modal */}
      <div className="fixed inset-0 z-201 flex items-center justify-center">
        <div className={modalInnerClasses}>
          {config?.icon && (
            <div className={modalIconClasses}>
              <Icon
                type={config.icon}
                className={`${config.iconColor}`}
                size={config.iconSize}
              />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <Icon type="x" />
          </button>

          <div className="text-center w-full">
            {children ? (
              children
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {finalTitle}
                </h2>
                <p className="text-base font-medium mt-2 text-gray-700 dark:text-gray-300">
                  {finalDescription}
                </p>

                {finalWarning && (
                  <p className="text-sm font-semibold mt-5 text-red-500 dark:text-red-400">
                    {finalWarning}
                  </p>
                )}

                {config?.info && (
                  <p
                    className={`text-sm font-medium mt-5 ${
                      config.infoColor || "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {config.info}
                  </p>
                )}
              </>
            )}
          </div>

          {(config?.buttonCancelText || config?.buttonConfirmText) && (
            <div className="flex gap-3 justify-center mt-6">
              {config?.buttonCancelText && (
                <Button btnType="basic" variant="basic" onClick={onClose}>
                  {config.buttonCancelText}
                </Button>
              )}
              {config?.buttonConfirmText && (
                <Button
                  btnType="basic"
                  variant="warning"
                  onClick={onConfirm}
                  disabled={buttonDisabled ?? config.buttonDisabled}
                >
                  {config.buttonConfirmText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
