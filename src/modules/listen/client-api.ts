import { ListeningRoomSnapshot } from "@/modules/listen/types";

export async function fetchListeningRoomState() {
  const response = await fetch("/api/listen/state", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not refresh room state");
  }

  return (await response.json()) as ListeningRoomSnapshot;
}

export async function postListeningRoomSnapshot(
  url: string,
  body: Record<string, unknown>
) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Mutation failed");
  }

  return payload;
}

export async function postListeningHeartbeat(body: Record<string, unknown>) {
  await fetch("/api/listen/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
