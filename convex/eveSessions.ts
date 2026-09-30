import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const register = mutation({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to start a coaching session.");

    const existing = await ctx.db
      .query("eveSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .unique();
    if (existing) {
      if (existing.userId !== identity.tokenIdentifier) {
        throw new Error("This coaching session belongs to another player.");
      }
      return null;
    }

    await ctx.db.insert("eveSessions", {
      sessionId,
      userId: identity.tokenIdentifier,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const isOwner = query({
  args: { sessionId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const session = await ctx.db
      .query("eveSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .unique();
    return session?.userId === identity.tokenIdentifier;
  },
});
