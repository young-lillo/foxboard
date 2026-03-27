type SessionUserProps = {
  email: string;
  role: "admin" | "viewer";
};

export function SessionUser({ email, role }: SessionUserProps) {
  return (
    <div className="session-pill">
      <span className={`status-pill ${role === "admin" ? "status-pill--dark" : "status-pill--ok"}`}>
        {role}
      </span>
      <span className="session-email">{email}</span>
    </div>
  );
}
