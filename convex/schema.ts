import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  eveSessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_session_id", ["sessionId"]),
  matchmakingQueue: defineTable({
    userId: v.string(),
    displayName: v.string(),
    status: v.literal("waiting"),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  games: defineTable({
    whitePlayer: v.string(),
    blackPlayer: v.string(),
    whiteName: v.string(),
    blackName: v.string(),
    fen: v.string(),
    status: v.union(v.literal("active"), v.literal("checkmate"), v.literal("draw")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_white_player", ["whitePlayer"])
    .index("by_black_player", ["blackPlayer"]),
  moves: defineTable({
    gameId: v.id("games"),
    ply: v.number(),
    playerId: v.string(),
    from: v.string(),
    to: v.string(),
    san: v.string(),
    fen: v.string(),
  }).index("by_game_and_ply", ["gameId", "ply"]),
});
