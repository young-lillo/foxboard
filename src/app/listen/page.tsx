import { AppHeader } from "@/components/app-header";
import { ListeningRoomClient } from "@/components/listening-room-client";
import { requireSession } from "@/modules/auth/guards";
import { getListeningRoomState } from "@/modules/listen/queries/get-listening-room-state";

export default async function ListenPage() {
  const session = await requireSession();
  const initialState = await getListeningRoomState();

  return (
    <main className="shell stack">
      <AppHeader email={session.user.email} role={session.user.role} />
      <section className="card stack">
        <p className="muted" style={{ margin: 0 }}>
          Internal listening room
        </p>
        <h1 style={{ margin: "6px 0 0" }}>{initialState.room.name}</h1>
        <p className="muted" style={{ marginBottom: 0 }}>
          One shared room, soft sync, explicit join, and admin-only transport controls.
        </p>
      </section>
      <ListeningRoomClient initialState={initialState} role={session.user.role} />
    </main>
  );
}
