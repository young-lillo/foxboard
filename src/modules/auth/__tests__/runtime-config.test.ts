describe("auth runtime config", () => {
  const originalAppUrl = process.env.APP_URL;
  const originalAuthUrl = process.env.AUTH_URL;
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;
  const originalAuthTrustHost = process.env.AUTH_TRUST_HOST;

  beforeEach(() => {
    vi.resetModules();
    process.env.APP_URL = "https://foxboard.youngllilo.works/";
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.AUTH_TRUST_HOST;
  });

  afterAll(() => {
    process.env.APP_URL = originalAppUrl;
    process.env.AUTH_URL = originalAuthUrl;
    process.env.NEXTAUTH_URL = originalNextAuthUrl;
    process.env.AUTH_TRUST_HOST = originalAuthTrustHost;
  });

  it("forces auth runtime urls to match APP_URL", async () => {
    const { applyAuthRuntimeEnv } = await import("@/modules/auth/runtime-config");

    applyAuthRuntimeEnv();

    expect(process.env.AUTH_URL).toBe("https://foxboard.youngllilo.works");
    expect(process.env.NEXTAUTH_URL).toBe("https://foxboard.youngllilo.works");
    expect(process.env.AUTH_TRUST_HOST).toBe("true");
  });
});
