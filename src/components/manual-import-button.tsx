"use client";

import { useState, useTransition } from "react";

type ManualImportButtonProps = {
  buttonClassName?: string;
  idleLabel?: string;
  pendingLabel?: string;
  wrapperClassName?: string;
};

export function ManualImportButton({
  buttonClassName = "button",
  idleLabel = "Run import now",
  pendingLabel = "Running...",
  wrapperClassName = "row"
}: ManualImportButtonProps) {
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className={wrapperClassName}>
      <button
        className={buttonClassName}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setMessage("");
            try {
              const response = await fetch("/api/admin/import-runs/trigger", {
                method: "POST"
              });
              const payload = await response.json();

              if (!response.ok) {
                throw new Error(payload.error ?? "Import failed");
              }

              setMessage(
                `${payload.scanned} scanned / ${payload.processed} processed / ${payload.failed} failed`
              );
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Import failed");
            }
          })
        }
        type="button"
      >
        {isPending ? pendingLabel : idleLabel}
      </button>
      {message ? <span className="status-pill status-pill--downloaded">{message}</span> : null}
    </div>
  );
}
