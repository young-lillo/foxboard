type SessionUserProps = {
  email: string;
  role: "admin" | "viewer";
};

export function SessionUser({ email, role }: SessionUserProps) {
  return (
    <div className="row">
      <span className={`badge ${role === "admin" ? "badge-danger" : "badge-success"}`}>
        {role}
      </span>
      <span className="muted">{email}</span>
    </div>
  );
}
