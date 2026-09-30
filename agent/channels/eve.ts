import { verifyToken } from "@clerk/backend";
import { ConvexHttpClient } from "convex/browser";
import { extractBearerToken, type AuthFn } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";
import { api } from "../../convex/_generated/api";

const clerkSession: AuthFn<Request> = async (request) => {
  const token = extractBearerToken(request.headers.get("authorization"));
  const secretKey = process.env.CLERK_SECRET_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!token || !secretKey || !convexUrl) return null;

  try {
    const claims = await verifyToken(token, { secretKey });
    if (typeof claims.sub !== "string") return null;

    const sessionRoute = new URL(request.url).pathname.match(
      /\/eve\/v1\/session\/([^/]+)/,
    );
    if (sessionRoute) {
      const convex = new ConvexHttpClient(convexUrl);
      convex.setAuth(token);
      const ownsSession = await convex.query(api.eveSessions.isOwner, {
        sessionId: decodeURIComponent(sessionRoute[1]),
      });
      if (!ownsSession) return null;
    }

    return {
      attributes: {},
      authenticator: "oidc",
      issuer: typeof claims.iss === "string" ? claims.iss : "clerk",
      principalId: claims.sub,
      principalType: "user",
      subject: claims.sub,
    };
  } catch {
    return null;
  }
};

export default eveChannel({ auth: [clerkSession] });
