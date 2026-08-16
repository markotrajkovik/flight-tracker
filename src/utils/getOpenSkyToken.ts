let cachedToken: string = "";
let tokenExpiresAt: number = 0;

export async function getOpenSkyToken(): Promise<string> {
  const now = Date.now();

  // Reuse cached token if valid (with 30s buffer)
  if (cachedToken && now < tokenExpiresAt - 30000) {
    return cachedToken;
  }

  const clientId = import.meta.env.VITE_OPENSKY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_OPENSKY_CLIENT_SECRET;

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(
    "/auth/realms/opensky-network/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    },
  );

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return cachedToken;
}
