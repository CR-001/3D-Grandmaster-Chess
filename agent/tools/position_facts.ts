import { Chess } from "chess.js";
import { defineTool } from "eve/tools";
import { z } from "zod";

const pieceNames = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
} as const;

export default defineTool({
  description: "Inspect a supplied legal chess position. Use this before discussing candidate moves or tactics.",
  inputSchema: z.object({ fen: z.string(), recentMoves: z.array(z.string()).max(20) }),
  execute({ fen, recentMoves }) {
    const chess = new Chess(fen);
    return {
      sideToMove: chess.turn() === "w" ? "White" : "Black",
      inCheck: chess.isCheck(),
      gameOver: chess.isGameOver(),
      recentMoves,
      legalMoves: chess.moves({ verbose: true }).slice(0, 40).map((move) => ({
        piece: pieceNames[move.piece],
        color: move.color === "w" ? "White" : "Black",
        from: move.from,
        to: move.to,
        captures: move.captured ? pieceNames[move.captured] : null,
        promotesTo: move.promotion ? pieceNames[move.promotion] : null,
        isCheck: /[+#]$/.test(move.san),
      })),
    };
  },
});
