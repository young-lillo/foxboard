import { handleJwt, handleSession, handleSignIn } from "@/modules/auth/callbacks";
import * as syncUserModule from "@/modules/auth/sync-user";

vi.mock("@/modules/auth/sync-user", () => ({
  getUserByEmail: vi.fn(),
  syncUser: vi.fn()
}));

const syncUserMock = vi.mocked(syncUserModule.syncUser);
const getUserByEmailMock = vi.mocked(syncUserModule.getUserByEmail);

describe("auth callbacks", () => {
  beforeEach(() => {
    syncUserMock.mockReset();
    getUserByEmailMock.mockReset();
  });

  it("allows only the configured company domain on sign-in", async () => {
    await expect(handleSignIn({ user: { email: "user@example.com" } })).resolves.toBe(true);
    await expect(handleSignIn({ user: { email: "user@gmail.com" } })).resolves.toBe(false);
  });

  it("writes the user record on fresh sign-in", async () => {
    syncUserMock.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      image: null,
      role: "viewer"
    });

    const token = await handleJwt({
      token: {},
      user: { email: "user@example.com", name: "User", image: null }
    });

    expect(syncUserMock).toHaveBeenCalledTimes(1);
    expect(getUserByEmailMock).not.toHaveBeenCalled();
    expect(token.userId).toBe("user-1");
    expect(token.role).toBe("viewer");
  });

  it("does not hit the database again for already-hydrated tokens", async () => {
    const token = await handleJwt({
      token: { email: "user@example.com", userId: "user-1", role: "admin" }
    });

    expect(syncUserMock).not.toHaveBeenCalled();
    expect(getUserByEmailMock).not.toHaveBeenCalled();
    expect(token.userId).toBe("user-1");
    expect(token.role).toBe("admin");
  });

  it("rehydrates legacy tokens with a read-only lookup", async () => {
    getUserByEmailMock.mockResolvedValue({
      id: "user-2",
      email: "user@example.com",
      name: "User",
      image: null,
      role: "admin"
    });

    const token = await handleJwt({
      token: { email: "user@example.com" }
    });

    expect(syncUserMock).not.toHaveBeenCalled();
    expect(getUserByEmailMock).toHaveBeenCalledWith("user@example.com");
    expect(token.userId).toBe("user-2");
    expect(token.role).toBe("admin");
  });

  it("keeps session DB identity empty when token.userId is missing", () => {
    const session = handleSession({
      session: { expires: "2099-01-01", user: { email: "user@example.com" } },
      token: { sub: "oauth-subject", role: "viewer" }
    }) as unknown as { user: { id: string; role: "admin" | "viewer" } };

    expect(session.user.id).toBe("");
    expect(session.user.role).toBe("viewer");
  });
});
