import { isAllowedEmail } from "@/modules/auth/domain-access";

describe("domain access", () => {
  it("allows a matching configured domain", () => {
    expect(isAllowedEmail("user@example.com")).toBe(true);
  });

  it("blocks foreign domain", () => {
    expect(isAllowedEmail("user@gmail.com")).toBe(false);
  });

  it("allows any configured domain in a comma-separated list", () => {
    const previous = process.env.ALLOWED_EMAIL_DOMAIN;

    process.env.ALLOWED_EMAIL_DOMAIN = "foxcatcher.com.au, labelium.com";

    expect(isAllowedEmail("user@foxcatcher.com.au")).toBe(true);
    expect(isAllowedEmail("user@labelium.com")).toBe(true);

    process.env.ALLOWED_EMAIL_DOMAIN = previous;
  });
});
