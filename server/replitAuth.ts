import { Issuer, generators, type Client } from "openid-client";
import type { Request, Response } from "express";

let client: Client | null = null;

interface ReplitUserInfo {
  sub: string;
  name: string;
  email?: string;
  profile_picture?: string;
}

export async function initializeReplitAuth() {
  const replId = process.env.REPL_ID;
  const issuerUrl = process.env.ISSUER_URL || "https://replit.com/oidc";

  if (!replId) {
    console.warn("⚠️ REPL_ID nicht gesetzt - Replit Auth deaktiviert");
    return;
  }

  try {
    const issuer = await Issuer.discover(issuerUrl);
    
    const redirectUri = process.env.NODE_ENV === "production"
      ? `https://${replId}.repl.co/api/auth/callback`
      : "http://localhost:5000/api/auth/callback";

    client = new issuer.Client({
      client_id: replId,
      response_types: ["code"],
      redirect_uris: [redirectUri],
      token_endpoint_auth_method: "none",
    });

    console.log("✅ Replit Auth initialisiert");
    console.log("📍 Redirect URI:", redirectUri);
  } catch (error) {
    console.error("❌ Replit Auth Fehler:", error);
  }
}

export function getAuthClient(): Client {
  if (!client) {
    throw new Error("Replit Auth nicht initialisiert");
  }
  return client;
}

export function generateAuthUrl(req: Request): { url: string; state: string; codeVerifier: string } {
  if (!client) {
    throw new Error("Replit Auth nicht verfügbar");
  }

  const state = generators.state();
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);

  const url = client.authorizationUrl({
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return { url, state, codeVerifier };
}

export async function handleCallback(
  req: Request,
  res: Response,
  storedState: string,
  codeVerifier: string
): Promise<ReplitUserInfo> {
  if (!client) {
    throw new Error("Replit Auth nicht verfügbar");
  }

  const params = client.callbackParams(req);
  
  if (params.state !== storedState) {
    throw new Error("Invalid state parameter");
  }

  const tokenSet = await client.callback(
    client.redirect_uris[0],
    params,
    {
      code_verifier: codeVerifier,
      state: storedState,
    }
  );

  const userInfo = await client.userinfo(tokenSet.access_token!);

  return {
    sub: userInfo.sub,
    name: userInfo.name as string,
    email: userInfo.email as string | undefined,
    profile_picture: userInfo.profile_picture as string | undefined,
  };
}

export function isAuthAvailable(): boolean {
  return client !== null;
}
