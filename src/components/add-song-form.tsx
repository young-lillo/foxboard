"use client";

import { FormEvent, useState, useTransition } from "react";

export function AddSongForm({
  onAdd,
  disabled
}: {
  onAdd: (url: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setMessage("");

      try {
        await onAdd(url);
        setUrl("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not add that video");
      }
    });
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div>
        <h2 style={{ margin: 0 }}>Add to queue</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Paste one `youtube.com/watch?v=` or `youtu.be/` URL.
        </p>
      </div>
      <div className="row">
        <input
          className="input input-grow"
          disabled={disabled || isPending}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          type="url"
          value={url}
        />
        <button className="button button-secondary" disabled={disabled || isPending} type="submit">
          {isPending ? "Adding..." : "Queue song"}
        </button>
      </div>
      {message ? <p className="muted" style={{ margin: 0 }}>{message}</p> : null}
    </form>
  );
}
