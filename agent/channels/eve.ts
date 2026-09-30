import { createClerkClient } from "@clerk/backend";
import { ConvexHttpClient } from "convex/browser";
import { extractBearerToken, type AuthFn } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";
import { api } from "../../convex/_generated/api";

const clerkSession: AuthFn<Request> = async (request) => {
  const token = extractBearerToken(request.headers.get("authorization"));
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!token || !secretKey || !publishableKey || !convexUrl) return null;

  try {
    const clerk = createClerkClient({ secretKey, publishableKey });
    const authState = await clerk.authenticateRequest(request, {
      acceptsToken: "session_token",
    });
    if (!authState.isAuthenticated) return null;

    const auth = authState.toAuth();
    if (!auth.isAuthenticated || !auth.has({ feature: "ai_tutor" })) return null;

    const convexToken = await auth.getToken({ template: "convex" });
    if (!convexToken) return null;

    const sessionRoute = new URL(request.url).pathname.match(
      /\/eve\/v1\/session\/([^/]+)/,
    );
    if (sessionRoute) {
      const convex = new ConvexHttpClient(convexUrl);
      convex.setAuth(convexToken);
      const ownsSession = await convex.query(api.eveSessions.isOwner, {
        sessionId: decodeURIComponent(sessionRoute[1]),
      });
      if (!ownsSession) return null;
    }

    return {
      attributes: {},
      authenticator: "oidc",
      issuer: typeof auth.sessionClaims.iss === "string" ? auth.sessionClaims.iss : "clerk",
      principalId: auth.userId,
      principalType: "user",
      subject: auth.userId,
    };
  } catch {
    return null;
  }
};

export default eveChannel({ auth: [clerkSession] });
