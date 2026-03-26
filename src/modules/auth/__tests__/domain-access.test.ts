import { isAllowedEmail } from "@/modules/auth/domain-access";

describe("domain access", () => {
  it("allows matching domain", () => {
    expect(isAllowedEmail(`user@${process.env.ALLOWED_EMAIL_DOMAIN ?? "example.com"}`)).toBe(true);
  });

  it("blocks foreign domain", () => {
    expect(isAllowedEmail("user@gmail.com")).toBe(false);
  });
});
