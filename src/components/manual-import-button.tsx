"use client";

import { useState, useTransition } from "react";

export function ManualImportButton() {
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="row">
      <button
        className="button button-secondary"
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
        {isPending ? "Running..." : "Run import now"}
      </button>
      {message ? <span className="muted">{message}</span> : null}
    </div>
  );
}
