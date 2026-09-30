import { Chess } from "chess.js";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

async function currentPlayer(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Sign in to play online.");
  return {
    id: identity.tokenIdentifier,
    name: identity.name ?? identity.email ?? "Player",
  };
}

export const getActive = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("games"),
      fen: v.string(),
      status: v.union(v.literal("active"), v.literal("checkmate"), v.literal("draw")),
      whiteName: v.string(),
      blackName: v.string(),
      color: v.union(v.literal("white"), v.literal("black")),
    }),
  ),
  handler: async (ctx) => {
    const player = await currentPlayer(ctx);
    const [whiteGame, blackGame] = await Promise.all([
      ctx.db
        .query("games")
        .withIndex("by_white_player", (q) => q.eq("whitePlayer", player.id))
        .order("desc")
        .first(),
      ctx.db
        .query("games")
        .withIndex("by_black_player", (q) => q.eq("blackPlayer", player.id))
        .order("desc")
        .first(),
    ]);
    const game = [whiteGame, blackGame]
      .filter((candidate) => candidate?.status === "active")
      .sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0))[0];
    if (!game) return null;
    const color: "white" | "black" = game.whitePlayer === player.id ? "white" : "black";
    return {
      id: game._id,
      fen: game.fen,
      status: game.status,
      whiteName: game.whiteName,
      blackName: game.blackName,
      color,
    };
  },
});

export const joinQueue = mutation({
  args: {},
  returns: v.union(
    v.literal("queued"),
    v.literal("matched"),
    v.literal("already_playing"),
  ),
  handler: async (ctx) => {
    const player = await currentPlayer(ctx);
    const [whiteGame, blackGame] = await Promise.all([
      ctx.db
        .query("games")
        .withIndex("by_white_player", (q) => q.eq("whitePlayer", player.id))
        .order("desc")
        .first(),
      ctx.db
        .query("games")
        .withIndex("by_black_player", (q) => q.eq("blackPlayer", player.id))
        .order("desc")
        .first(),
    ]);
    if (whiteGame?.status === "active" || blackGame?.status === "active") {
      return "already_playing";
    }

    const myQueue = await ctx.db
      .query("matchmakingQueue")
      .withIndex("by_user", (q) => q.eq("userId", player.id))
      .first();
    if (myQueue) return "queued";

    const waiting = await ctx.db
      .query("matchmakingQueue")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .take(25);
    const now = Date.now();
    let opponent = null;
    for (const candidate of waiting) {
      if (now - candidate.joinedAt > 120_000) {
        await ctx.db.delete(candidate._id);
      } else if (candidate.userId !== player.id) {
        opponent = candidate;
        break;
      }
    }

    if (!opponent) {
      await ctx.db.insert("matchmakingQueue", {
        userId: player.id,
        displayName: player.name,
        status: "waiting",
        joinedAt: now,
      });
      return "queued";
    }

    await ctx.db.delete(opponent._id);
    const chess = new Chess();
    await ctx.db.insert("games", {
      whitePlayer: opponent.userId,
      blackPlayer: player.id,
      whiteName: opponent.displayName,
      blackName: player.name,
      fen: chess.fen(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return "matched";
  },
});

export const leaveQueue = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const player = await currentPlayer(ctx);
    const entry = await ctx.db
      .query("matchmakingQueue")
      .withIndex("by_user", (q) => q.eq("userId", player.id))
      .first();
    if (entry) await ctx.db.delete(entry._id);
    return null;
  },
});

export const submitMove = mutation({
  args: {
    gameId: v.id("games"),
    from: v.string(),
    to: v.string(),
    promotion: v.optional(v.union(v.literal("q"), v.literal("r"), v.literal("b"), v.literal("n"))),
  },
  returns: v.object({ fen: v.string(), status: v.union(v.literal("active"), v.literal("checkmate"), v.literal("draw")) }),
  handler: async (ctx, args) => {
    const player = await currentPlayer(ctx);
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "active") throw new Error("This game is no longer active.");
    const color = game.whitePlayer === player.id ? "white" : game.blackPlayer === player.id ? "black" : null;
    if (!color) throw new Error("You are not a player in this game.");

    const chess = new Chess(game.fen);
    if ((chess.turn() === "w" ? "white" : "black") !== color) {
      throw new Error("It is your opponent's turn.");
    }
    const move = chess.move({ from: args.from, to: args.to, promotion: args.promotion });
    if (!move) throw new Error("That move is not legal.");

    const status: "active" | "checkmate" | "draw" = chess.isGameOver() ? (chess.isCheckmate() ? "checkmate" : "draw") : "active";
    const now = Date.now();
    await ctx.db.patch(game._id, { fen: chess.fen(), status, updatedAt: now });
    const lastMove = await ctx.db
      .query("moves")
      .withIndex("by_game_and_ply", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .first();
    await ctx.db.insert("moves", {
      gameId: args.gameId,
      ply: (lastMove?.ply ?? 0) + 1,
      playerId: player.id,
      from: move.from,
      to: move.to,
      san: move.san,
      fen: chess.fen(),
    });
    return { fen: chess.fen(), status };
  },
});

export const listMoves = query({
  args: { gameId: v.id("games") },
  returns: v.array(v.object({ ply: v.number(), san: v.string() })),
  handler: async (ctx, args) => {
    const player = await currentPlayer(ctx);
    const game = await ctx.db.get(args.gameId);
    if (!game || (game.whitePlayer !== player.id && game.blackPlayer !== player.id)) {
      throw new Error("You cannot view this game's move history.");
    }
    const moves = await ctx.db
      .query("moves")
      .withIndex("by_game_and_ply", (q) => q.eq("gameId", args.gameId))
      .order("asc")
      .take(200);
    return moves.map((move) => ({ ply: move.ply, san: move.san }));
  },
});
