"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Chess } from "chess.js";
import { useAuth, useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Client } from "eve/client";
import { useEveAgent } from "eve/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ArrowUpRight, Bot, Crown, GraduationCap, Lightbulb, LoaderCircle, MessageCircle, RotateCcw, Sparkles, Swords, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ChessScene = dynamic(() => import("./ChessScene"), {
  ssr: false,
  loading: () => <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-[#17211c] text-sm text-white/45">Setting the pieces…</div>,
});

const levels = [
  { name: "Beginner", detail: "Easy to learn against", skill: 0, depth: 2 },
  { name: "Casual", detail: "A relaxed opponent", skill: 4, depth: 4 },
  { name: "Club player", detail: "Test your strategy", skill: 9, depth: 7 },
  { name: "Expert", detail: "Tough tactical play", skill: 15, depth: 10 },
  { name: "Grandmaster", detail: "Bring your best game", skill: 20, depth: 14 },
];

function CoachChat({ fen, recentMoves, bestMove, level }: { fen: string; recentMoves: string[]; bestMove: string | null; level: string }) {
  const { getToken } = useAuth();
  const registerSession = useMutation(api.eveSessions.register);
  const [session, setSession] = useState<import("eve/client").ClientSession | null>(null);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const client = new Client({
      host: window.location.origin,
      redirect: "error",
      auth: {
        bearer: async () => {
          const token = await getToken({ template: "convex" });
          if (!token) throw new Error("Sign in to start a coaching session.");
          return token;
        },
      },
    });

    void (async () => {
      try {
        const created = await client.sessions.create();
        await registerSession({ sessionId: created.session.state.sessionId });
        if (!cancelled) setSession(created.session);
      } catch {
        if (!cancelled) setSessionError(true);
      }
    })();

    return () => { cancelled = true; };
  }, [getToken, registerSession]);

  if (!session) {
    return <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/[0.08] bg-[#17211c] p-6 text-center text-sm text-white/50">
      {sessionError ? "The tutor could not start a private coaching session." : "Starting your private coaching session…"}
    </section>;
  }

  return <ActiveCoachChat session={session} fen={fen} recentMoves={recentMoves} bestMove={bestMove} level={level} />;
}

function ActiveCoachChat({ session, fen, recentMoves, bestMove, level }: { session: import("eve/client").ClientSession; fen: string; recentMoves: string[]; bestMove: string | null; level: string }) {
  const { getToken } = useAuth();
  const agent = useEveAgent({
    session,
    auth: {
      bearer: async () => {
        const token = await getToken({ template: "convex" });
        if (!token) throw new Error("Sign in to start a coaching session.");
        return token;
      },
    },
  });
  const [draft, setDraft] = useState("");
  const busy = agent.status === "submitted" || agent.status === "streaming" || agent.status === "resuming";

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || busy) return;
    setDraft("");
    void agent.send(`${question}\n\nLive game context:\nDifficulty: ${level}\nPosition (FEN): ${fen}\nRecent moves: ${recentMoves.join(" ") || "starting position"}\nEngine's best move: ${bestMove ?? "not analyzed yet"}`);
  }

  return (
    <section className="flex min-h-[520px] flex-col rounded-3xl border border-white/[0.08] bg-[#17211c] shadow-[0_24px_70px_-34px_rgba(0,0,0,.8)]">
      <header className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
        <div className="grid size-10 place-items-center rounded-2xl bg-[#c4e8a4]/10 text-[#c4e8a4]"><Sparkles size={18} /></div>
        <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-[#f0f1de]">Your chess tutor</div><div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40"><span className="size-1.5 rounded-full bg-[#b5db8e]" />Knows this position</div></div>
        <span className="rounded-full border border-[#c4e8a4]/20 px-2.5 py-1 text-[10px] font-semibold tracking-[.14em] text-[#c4e8a4]">PRO</span>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {agent.data.messages.length === 0 && <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 grid size-16 place-items-center rounded-[22px] border border-[#c4e8a4]/15 bg-[#c4e8a4]/[0.06] text-[#c4e8a4]"><GraduationCap size={26} /></div>
          <p className="max-w-[220px] text-[15px] font-semibold leading-6 text-[#f0f1de]">A stronger game starts with one good question.</p>
          <p className="mt-2 max-w-[230px] text-xs leading-5 text-white/45">Ask about a tactic, a plan, or the engine’s top move.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">{["What should I look for?", "Explain this position"].map((prompt) => <button key={prompt} type="button" onClick={() => setDraft(prompt)} className="rounded-full border border-white/10 px-3 py-2 text-[11px] text-white/60 transition hover:border-[#c4e8a4]/30 hover:text-[#eaf5df]">{prompt}</button>)}</div>
        </div>}
        {agent.data.messages.map((message) => <article key={message.id} className={`max-w-[94%] rounded-2xl px-3.5 py-3 text-[13px] leading-6 ${message.role === "user" ? "ml-auto bg-[#2c4134] text-[#e7f2df]" : "border border-white/[0.06] bg-white/[0.035] text-white/75"}`}>
          {message.parts.map((part, index) => part.type === "text" ? <p key={index} className="whitespace-pre-wrap">{part.text}</p> : null)}
        </article>)}
        {busy && <div className="flex items-center gap-2 px-2 text-xs text-[#c4e8a4]/75"><LoaderCircle className="animate-spin" size={14} />Thinking through the position…</div>}
        {agent.error && <p className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2 text-xs text-rose-200/80">The tutor could not connect just now. Check that an Eve model connection is configured.</p>}
      </div>
      <form onSubmit={send} className="m-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111a15] p-2 pl-3 focus-within:border-[#c4e8a4]/35">
        <input value={draft} onChange={(event) => setDraft(event.currentTarget.value)} placeholder="Ask your chess tutor…" className="min-w-0 flex-1 bg-transparent py-2 text-xs text-white outline-none placeholder:text-white/30" />
        <Button type="submit" disabled={!draft.trim() || busy} size="icon" className="size-9 rounded-xl bg-[#c4e8a4] text-[#17231b] hover:bg-[#d0efb3]"><ArrowUpRight size={17} /></Button>
      </form>
    </section>
  );
}

export function ChessmasterApp() {
  const { isLoaded, isSignedIn, has } = useAuth();
  const { user } = useUser();
  const canTutor = has?.({ feature: "ai_tutor" }) ?? false;
  const [mode, setMode] = useState<"idle" | "ai" | "online">("idle");
  const [levelIndex, setLevelIndex] = useState(1);
  const [localFen, setLocalFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState<{ from: string; to: string } | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [engineMessage, setEngineMessage] = useState("Engine is ready when you are");
  const [gameMessage, setGameMessage] = useState("Your board is waiting for its first move.");
  const [joining, setJoining] = useState(false);
  const [movePending, setMovePending] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const engineTask = useRef<"opponent" | "hint" | null>(null);
  const currentMode = useRef(mode);
  const gameRef = useRef(new Chess());
  const joinQueue = useMutation(api.games.joinQueue);
  const leaveQueue = useMutation(api.games.leaveQueue);
  const submitMove = useMutation(api.games.submitMove);
  const onlineGame = useQuery(api.games.getActive, isSignedIn ? {} : "skip");
  const onlineMoves = useQuery(api.games.listMoves, onlineGame ? { gameId: onlineGame.id } : "skip");
  const fen = mode === "online" && onlineGame ? onlineGame.fen : localFen;
  const position = useMemo(() => {
    try { return new Chess(fen); } catch { return new Chess(); }
  }, [fen]);
  const currentLevel = levels[levelIndex];
  const isOnline = mode === "online" && !!onlineGame;
  const orientation = isOnline ? onlineGame.color : "white";
  const recentMoves = isOnline ? (onlineMoves ?? []).map((move) => move.san) : position.history();
  const targets = selected ? position.moves({ square: selected as never, verbose: true }).map((move) => move.to) : [];
  const isMyTurn = mode === "online" && onlineGame
    ? (position.turn() === "w" ? "white" : "black") === onlineGame.color
    : position.turn() === "w";
  const gameOver = position.isGameOver();

  useEffect(() => { currentMode.current = mode; }, [mode]);

  useEffect(() => {
    const worker = new Worker("/stockfish/stockfish-19-lite-single.js");
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<string>) => {
      const line = String(event.data ?? "");
      if (line === "uciok") worker.postMessage("isready");
      if (line === "readyok") {
        setEngineReady(true);
        setEngineMessage("Stockfish 19 ready · lite WASM");
      }
      const match = line.match(/\bbestmove\s+([a-h][1-8])([a-h][1-8])([qrbn])?/);
      if (!match) return;
      const task = engineTask.current;
      engineTask.current = null;
      if (task === "hint") {
        setHint({ from: match[1], to: match[2] });
        setEngineMessage(`Top line: ${match[1]} → ${match[2]}${match[3] ?? ""}`);
      }
      if (task === "opponent" && currentMode.current === "ai") {
        const next = new Chess(gameRef.current.fen());
        try {
          next.move({ from: match[1], to: match[2], promotion: match[3] ?? "q" });
          gameRef.current = next;
          setLocalFen(next.fen());
          setSelected(null);
          setHint(null);
          setGameMessage(next.isGameOver() ? "Game complete. Want a rematch?" : "Your move. Take your time.");
        } catch {
          setGameMessage("Stockfish returned an invalid move. Start a new game to retry.");
        }
      }
    };
    worker.onerror = () => setEngineMessage("Stockfish could not load in this browser.");
    worker.postMessage("uci");
    return () => { worker.terminate(); workerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!engineReady || mode !== "ai" || gameOver || position.turn() !== "b" || engineTask.current) return;
    engineTask.current = "opponent";
    setGameMessage(`${currentLevel.name} is thinking…`);
    workerRef.current?.postMessage(`setoption name Skill Level value ${currentLevel.skill}`);
    workerRef.current?.postMessage(`position fen ${fen}`);
    workerRef.current?.postMessage(`go depth ${currentLevel.depth}`);
  }, [engineReady, mode, gameOver, position, fen, currentLevel]);

  const resetGame = useCallback(() => {
    if (mode === "online" && !onlineGame) void leaveQueue({});
    const fresh = new Chess();
    gameRef.current = fresh;
    setLocalFen(fresh.fen());
    setSelected(null);
    setHint(null);
    engineTask.current = null;
    setMode("idle");
    setJoining(false);
    setGameMessage("Your board is waiting for its first move.");
  }, [mode, onlineGame, leaveQueue]);

  const startAi = useCallback(() => {
    if (mode === "online" && !onlineGame) void leaveQueue({});
    const fresh = new Chess();
    gameRef.current = fresh;
    setLocalFen(fresh.fen());
    setSelected(null);
    setHint(null);
    engineTask.current = null;
    setMode("ai");
    setJoining(false);
    setGameMessage(engineReady ? `You are White. ${currentLevel.name} is ready.` : "Loading Stockfish…");
  }, [mode, onlineGame, leaveQueue, engineReady, currentLevel]);

  const startOnline = useCallback(async () => {
    if (!isSignedIn) return;
    setMode("online");
    setJoining(true);
    setGameMessage("Finding a player near your level…");
    try {
      await joinQueue({});
      setJoining(true);
    } catch (error) {
      setJoining(false);
      setGameMessage(error instanceof Error ? error.message : "Could not enter matchmaking.");
    }
  }, [isSignedIn, joinQueue]);

  const askForHint = useCallback(() => {
    if (!engineReady || !isMyTurn || gameOver) return;
    engineTask.current = "hint";
    setHint(null);
    setEngineMessage("Analyzing the position…");
    workerRef.current?.postMessage(`position fen ${fen}`);
    workerRef.current?.postMessage(`go depth ${Math.max(10, currentLevel.depth + 4)}`);
  }, [engineReady, isMyTurn, gameOver, fen, currentLevel]);

  const handleSquareClick = useCallback(async (square: string) => {
    if (mode === "idle" || gameOver || !isMyTurn || movePending) return;
    const next = new Chess(fen);
    if (selected) {
      try {
        const move = next.move({ from: selected, to: square, promotion: "q" });
        if (move) {
          workerRef.current?.postMessage("stop");
          engineTask.current = null;
          setMovePending(mode === "online");
          setSelected(null);
          setHint(null);
          gameRef.current = next;
          if (mode !== "online") setLocalFen(next.fen());
          if (mode === "online" && onlineGame) {
            try {
              await submitMove({ gameId: onlineGame.id, from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion as "q" | "r" | "b" | "n" } : {}) });
            } catch (error) {
              const rollback = new Chess(onlineGame.fen);
              gameRef.current = rollback;
              setLocalFen(rollback.fen());
              setGameMessage(error instanceof Error ? error.message : "That move could not be sent.");
            } finally { setMovePending(false); }
          } else {
            setGameMessage(next.isGameOver() ? "Game complete. Want a rematch?" : next.isCheck() ? "Check. Keep an eye on the king." : "Move played. Look for your opponent’s reply.");
          }
          return;
        }
      } catch {
        // Selecting another friendly piece below is still allowed.
      }
    }
    const piece = next.get(square as never);
    const ownColor = mode === "online" ? (onlineGame?.color === "white" ? "w" : "b") : "w";
    if (piece?.color === ownColor) setSelected(square);
    else setSelected(null);
  }, [mode, gameOver, isMyTurn, movePending, selected, onlineGame, submitMove, fen]);

  const pieces = useMemo(() => position.board().flatMap((row, rowIndex) => row.flatMap((piece, colIndex) => piece ? [{
    square: `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`,
    type: piece.type,
    color: piece.color,
  }] : [])), [position]);

  const opponentName = isOnline ? (onlineGame.color === "white" ? onlineGame.blackName : onlineGame.whiteName) : currentLevel.name;
  const liveStatus = mode === "online" && onlineGame
    ? gameOver ? "Game complete." : isMyTurn ? "Your turn. Find the best move." : `${opponentName} to move.`
    : gameMessage;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121b17] text-[#f0f1de]">
      <div className="quiet-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-60" />
      <header className="relative z-10 border-b border-white/[0.07] bg-[#121b17]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Chessmaster home">
            <div className="grid size-10 place-items-center rounded-2xl border border-[#c4e8a4]/20 bg-[#c4e8a4]/[0.08] text-[#c4e8a4]"><Crown size={19} /></div>
            <div><div className="text-[15px] font-black tracking-[.13em]">CHESS<span className="text-[#c4e8a4]">MASTER</span></div><div className="mt-0.5 text-[9px] tracking-[.25em] text-white/35">THINK BEYOND THE BOARD</div></div>
          </Link>
          <nav className="hidden items-center gap-8 text-xs text-white/50 md:flex">
            <a href="#play" className="transition hover:text-white">Play</a><a href="#learn" className="transition hover:text-white">Learn</a><Link href="/pricing" className="transition hover:text-white">Membership</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden items-center gap-1.5 rounded-full border border-[#c4e8a4]/20 bg-[#c4e8a4]/[0.06] px-3 py-2 text-[11px] font-semibold text-[#c4e8a4] sm:flex"><Sparkles size={13} />Chessmaster Pro</Link>
            {!isLoaded ? <div className="size-8 animate-pulse rounded-full bg-white/10" /> : isSignedIn ? <UserButton /> : <SignInButton mode="modal"><Button variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.03] px-4 text-xs text-white hover:bg-white/10">Sign in</Button></SignInButton>}
          </div>
        </div>
      </header>

      <main id="play" className="relative z-10 mx-auto max-w-[1480px] px-4 pb-14 pt-8 sm:px-8 sm:pt-11">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.24em] text-[#b8dc9a]"><span className="h-px w-7 bg-[#b8dc9a]/60" />Make every move count</div><h1 className="text-balance text-3xl font-semibold tracking-[-.045em] text-[#f4f2df] sm:text-[42px]">A better game begins <span className="text-[#b8dc9a]">here.</span></h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/45">Play a thinking opponent, meet players online, and grow one move at a time.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-[11px] text-white/45"><span className="size-1.5 rounded-full bg-[#9ec780]" />Stockfish 19 engine <span className="mx-1 h-3 w-px bg-white/15" /> Online matchmaking</div>
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[230px_minmax(380px,1fr)_320px] 2xl:grid-cols-[250px_minmax(480px,1fr)_340px]">
          <aside className="space-y-4">
            <section className="rounded-3xl border border-white/[0.08] bg-[#18231d] p-4 shadow-[0_22px_60px_-38px_rgba(0,0,0,.8)]">
              <div className="mb-4 px-1"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/38">Choose your game</p></div>
              <button onClick={startAi} className={`group mb-2.5 flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${mode === "ai" ? "border-[#b8dc9a]/35 bg-[#b8dc9a]/[0.09]" : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.055]"}`}>
                <span className={`grid size-10 place-items-center rounded-xl ${mode === "ai" ? "bg-[#b8dc9a]/15 text-[#c8e9ae]" : "bg-white/[0.06] text-white/65"}`}><Bot size={19} /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Play vs AI</span><span className="mt-1 block text-[10px] text-white/40">Five levels · Stockfish</span></span><ArrowUpRight size={15} className="text-white/25 transition group-hover:text-[#c8e9ae]" />
              </button>
              <button onClick={startOnline} disabled={joining} className={`group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${mode === "online" ? "border-[#b8dc9a]/35 bg-[#b8dc9a]/[0.09]" : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.055]"}`}>
                <span className={`grid size-10 place-items-center rounded-xl ${mode === "online" ? "bg-[#b8dc9a]/15 text-[#c8e9ae]" : "bg-white/[0.06] text-white/65"}`}>{joining ? <LoaderCircle size={18} className="animate-spin" /> : <Users size={18} />}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Find a player</span><span className="mt-1 block text-[10px] text-white/40">Live online match</span></span><ArrowUpRight size={15} className="text-white/25 transition group-hover:text-[#c8e9ae]" />
              </button>
              {!isSignedIn && <p className="mt-3 px-1 text-[10px] leading-4 text-white/35">Sign in with Clerk to queue for a live match.</p>}

              <div className="mb-2 mt-6 flex items-center justify-between px-1"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/38">AI difficulty</p><span className="text-[10px] text-[#b8dc9a]">{levelIndex + 1} / 5</span></div>
              <div className="space-y-1">{levels.map((level, index) => <button key={level.name} onClick={() => { setLevelIndex(index); if (mode === "ai") setGameMessage(`${level.name} selected. Your next game will use this level.`); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${levelIndex === index ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"}`}><span className={`grid size-6 place-items-center rounded-lg text-[10px] font-bold ${levelIndex === index ? "bg-[#b8dc9a] text-[#19231c]" : "bg-white/[0.06] text-white/45"}`}>{index + 1}</span><span className="min-w-0 flex-1"><span className={`block text-[11px] font-medium ${levelIndex === index ? "text-white" : "text-white/60"}`}>{level.name}</span></span>{levelIndex === index && <span className="size-1.5 rounded-full bg-[#b8dc9a]" />}</button>)}</div>
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-[#18231d] p-4">
              <div className="flex items-center gap-2.5"><div className="grid size-9 place-items-center rounded-xl bg-[#d2b477]/10 text-[#d2b477]"><Swords size={17} /></div><div><p className="text-xs font-semibold">At the board</p><p className="mt-0.5 text-[10px] text-white/40">{mode === "online" && !onlineGame ? (joining ? "In the matchmaking queue" : "Not in a match") : mode === "idle" ? "Start a match to begin" : "Live game"}</p></div></div>
              <div className="my-4 h-px bg-white/[0.07]" />
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/40">Moves played</span><span className="font-medium text-white/75">{Math.floor(recentMoves.length / 2) + (recentMoves.length % 2 ? 1 : 0)}</span></div>
              <div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-white/40">Your side</span><span className="inline-flex items-center gap-1.5 text-white/75">{orientation === "white" ? <span className="size-2.5 rounded-full bg-[#eee5d3]" /> : <span className="size-2.5 rounded-full border border-white/30 bg-[#2c4134]" />}{mode === "idle" ? "White" : orientation === "white" ? "White" : "Black"}</span></div>
            </section>
          </aside>

          <section className="min-w-0 overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#17211c] shadow-[0_30px_80px_-40px_rgba(0,0,0,.85)]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-white/[0.06] text-[#c8e9ae]">{mode === "online" ? <Users size={17} /> : <Bot size={18} />}</div><div className="min-w-0"><p className="truncate text-xs font-semibold">{mode === "online" && onlineGame ? opponentName : mode === "online" ? "Matchmaking" : mode === "ai" ? `Chessmaster · ${currentLevel.name}` : "Your next opponent"}</p><p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40"><span className="size-1.5 rounded-full bg-[#a4d286]" />{liveStatus}</p></div></div>
              <div className="flex items-center gap-1"><Button onClick={resetGame} variant="ghost" size="icon" className="size-8 rounded-xl text-white/45 hover:text-white" aria-label="Reset board"><RotateCcw size={15} /></Button></div>
            </div>
            <div className="grid items-center gap-3 px-3 pt-3 sm:px-6 sm:pt-5">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 sm:px-4"><div className="flex min-w-0 items-center gap-2.5"><div className="grid size-7 place-items-center rounded-lg bg-[#293a30] text-[11px] font-semibold text-white/70">{opponentName.slice(0, 1).toUpperCase()}</div><span className="truncate text-[11px] font-medium text-white/70">{mode === "online" && onlineGame ? onlineGame.color === "white" ? onlineGame.blackName : onlineGame.whiteName : mode === "ai" ? `${currentLevel.name} · Stockfish 19` : "Opponent"}</span></div><span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[9px] text-white/35">{mode === "online" && onlineGame ? onlineGame.color === "white" ? "Black" : "White" : "Level " + (levelIndex + 1)}</span></div>
              <div className="relative mx-auto aspect-square w-full max-w-[680px] overflow-hidden rounded-[22px] bg-[#17211c]">
                <ChessScene pieces={pieces} orientation={orientation} selected={selected} targets={targets} hint={hint} onSquareClick={(square) => void handleSquareClick(square)} />
                {mode === "idle" && <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#101813]/80 via-transparent to-transparent p-5 sm:items-center sm:bg-[#101813]/20"><button onClick={startAi} className="flex items-center gap-2 rounded-full bg-[#c4e8a4] px-5 py-3 text-xs font-semibold text-[#17221b] shadow-xl transition hover:bg-[#d1efb7]"><Bot size={16} />Start a game</button></div>}
                {mode === "online" && !onlineGame && <div className="absolute inset-0 grid place-items-center bg-[#101813]/65 backdrop-blur-[3px]"><div className="max-w-xs px-6 text-center"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[#b8dc9a]/10 text-[#c8e9ae]">{joining ? <LoaderCircle className="animate-spin" size={21} /> : <Users size={21} />}</div><h3 className="text-sm font-semibold">{joining ? "Looking for your match" : "Ready when you are"}</h3><p className="mt-2 text-xs leading-5 text-white/45">{joining ? "We’ll seat you as soon as another player joins." : "Queue for a live game with another Chessmaster player."}</p><div className="mt-5 flex justify-center gap-2">{joining ? <Button onClick={resetGame} variant="outline" className="rounded-full border-white/15 bg-transparent px-4 text-xs text-white">Cancel search</Button> : <Button onClick={() => void startOnline()} className="rounded-full bg-[#c4e8a4] px-4 text-xs text-[#17221b]">Find a player</Button>}</div></div></div>}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 sm:px-4"><div className="flex min-w-0 items-center gap-2.5"><div className="grid size-7 place-items-center rounded-lg bg-[#c4e8a4]/10 text-[11px] font-semibold text-[#c8e9ae]">{user?.firstName?.slice(0, 1) ?? "Y"}</div><span className="truncate text-[11px] font-medium text-white/70">{user?.firstName ?? "You"} · {orientation === "white" ? "White" : "Black"}</span></div><span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[9px] text-white/35">{isMyTurn ? "Your move" : mode === "ai" ? "Thinking" : "Waiting"}</span></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-3 sm:px-6 sm:pb-5">
              <div className="flex items-center gap-2 text-[10px] text-white/35"><span className={`size-1.5 rounded-full ${engineReady ? "bg-[#a4d286]" : "animate-pulse bg-[#d2b477]"}`} />{engineMessage}</div>
              <div className="flex items-center gap-2">{canTutor ? <Button onClick={askForHint} disabled={!engineReady || !isMyTurn || gameOver} variant="outline" className="h-9 rounded-full border-white/10 bg-white/[0.035] px-3.5 text-[10px] text-white/70 hover:bg-white/[0.08] disabled:opacity-40"><Lightbulb size={14} className="mr-1.5 text-[#d2b477]" />Analyze move</Button> : <Link href="/pricing" className="inline-flex h-9 items-center rounded-full border border-[#d2b477]/20 bg-[#d2b477]/[0.05] px-3.5 text-[10px] text-[#e5d2a6]"><Lightbulb size={13} className="mr-1.5" />Pro move analysis <Crown size={12} className="ml-1.5" /></Link>}{mode === "online" && onlineGame && <span className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/[0.035] px-3.5 text-[10px] text-white/65"><ArrowLeftRight size={14} className="mr-1.5" />Live match</span>}</div>
            </div>
            {hint && <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-[#d2b477]/20 bg-[#d2b477]/[0.06] px-3 py-2.5 text-xs text-[#e5d2a6] sm:mx-6"><Lightbulb size={14} />Best move highlighted: {hint.from} → {hint.to}</div>}
          </section>

          <aside id="learn" className="space-y-4">
            {isLoaded && isSignedIn && canTutor ? <CoachChat fen={fen} recentMoves={recentMoves.slice(-16)} bestMove={hint ? `${hint.from}${hint.to}` : null} level={mode === "ai" ? currentLevel.name : mode === "online" ? "Online game" : "Practice"} /> : <section className="relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-[#c4e8a4]/15 bg-[radial-gradient(ellipse_at_top_right,rgba(160,204,127,.12),transparent_55%),#17211c] p-5">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl border border-[#c4e8a4]/20 bg-[#c4e8a4]/[0.08] text-[#c4e8a4]"><Sparkles size={18} /></div><div><div className="text-sm font-semibold">Chessmaster Pro</div><div className="mt-0.5 text-[10px] text-white/40">Your personal AI coach</div></div></div>
              <div className="my-7 h-px bg-white/[0.07]" />
              <div className="flex flex-1 flex-col items-center justify-center text-center"><div className="relative mb-6 grid size-[104px] place-items-center rounded-[32px] border border-[#c4e8a4]/15 bg-[#c4e8a4]/[0.04]"><div className="absolute inset-3 rounded-[25px] border border-[#c4e8a4]/10" /><GraduationCap size={34} className="text-[#c4e8a4]" /><span className="absolute right-3 top-3 size-2 rounded-full bg-[#c4e8a4] shadow-[0_0_12px_#c4e8a4]" /></div><h3 className="max-w-[240px] text-xl font-semibold leading-7 tracking-[-.025em]">See the move. <span className="text-[#b8dc9a]">Understand the why.</span></h3><p className="mt-3 max-w-[250px] text-xs leading-5 text-white/45">An on-board AI tutor that reads your position, explains engine lines, and answers your chess questions.</p>
                <ul className="mt-6 w-full max-w-[250px] space-y-3 text-left">{["Best-move visual analysis", "Personalized, interactive chat", "Tactics and position lessons"].map((item) => <li key={item} className="flex items-center gap-2.5 text-[11px] text-white/60"><span className="grid size-5 place-items-center rounded-full bg-[#c4e8a4]/10 text-[#c4e8a4]"><Sparkles size={10} /></span>{item}</li>)}</ul>
              </div>
              <div className="mt-7"><Link href="/pricing" className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#c4e8a4] text-xs font-semibold text-[#17221b] transition hover:bg-[#d2edb8]">Unlock Chessmaster Pro <ArrowUpRight size={15} /></Link><p className="mt-2.5 text-center text-[10px] text-white/35">$9.99 monthly · save with annual billing</p>{isLoaded && !isSignedIn && <SignInButton mode="modal"><button className="mt-3 w-full text-center text-[10px] text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white/75">Sign in to access your membership</button></SignInButton>}</div>
            </section>}
            <section className="rounded-3xl border border-white/[0.08] bg-[#18231d] p-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.17em] text-white/38">Move history</p><p className="mt-1 text-[10px] text-white/35">{recentMoves.length ? `${recentMoves.length} plies recorded` : "Your story starts here"}</p></div><div className="mt-3 max-h-28 overflow-y-auto">{recentMoves.length === 0 ? <div className="rounded-xl border border-dashed border-white/[0.09] px-3 py-4 text-center text-[10px] text-white/35">Moves will appear here after you play.</div> : <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">{Array.from({ length: Math.ceil(recentMoves.length / 2) }, (_, row) => <div key={row} className="contents"><span className="flex gap-2 text-white/35"><span>{row + 1}.</span><span className="text-white/70">{recentMoves[row * 2]}</span></span><span className="text-white/70">{recentMoves[row * 2 + 1] ?? ""}</span></div>)}</div>}</div></section>
          </aside>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[10px] text-white/30"><span>Chessmaster · Built for thoughtful play.</span><div className="flex items-center gap-5"><Link href="/pricing" className="hover:text-white/60">Membership</Link><a href="https://stockfishchess.org/" target="_blank" rel="noreferrer" className="hover:text-white/60">Stockfish engine</a><a href="/stockfish/COPYING.txt" target="_blank" rel="noreferrer" className="hover:text-white/60">Engine license</a><span className="inline-flex items-center gap-1"><MessageCircle size={11} />Powered by Eve</span></div></footer>
      </main>
    </div>
  );
}
