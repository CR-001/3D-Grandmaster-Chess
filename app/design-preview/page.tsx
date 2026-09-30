"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Chess } from "chess.js";
import type { Color } from "chess.js";
import { ArrowDownLeft, ArrowLeft, ArrowRight, AudioLines, Bot, ChevronDown, CircleHelp, Crown, Flag, GraduationCap, Lightbulb, MessageCircle, MoreHorizontal, RotateCcw, Settings2, Shield, Sparkles, Swords, Timer, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

const ChessScene = dynamic(() => import("@/components/chess/ChessScene"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-[28px] bg-[#1a251f]" />,
});

type Direction = "match" | "lesson" | "pro";

const directions: { id: Direction; number: string; label: string; description: string }[] = [
  { id: "match", number: "01", label: "Live match", description: "Competitive, calm, and focused" },
  { id: "lesson", number: "02", label: "AI lesson", description: "A friendly coach in the room" },
  { id: "pro", number: "03", label: "Pro tutor", description: "Visual analysis while you play" },
];

const panels: Record<Direction, { eyebrow: string; title: string; message: string; detail: string; action: string }> = {
  match: {
    eyebrow: "LIVE MATCH · 10 + 0",
    title: "A steady position",
    message: "Your pieces are ready to join the center. Take a moment to choose your plan.",
    detail: "You're playing White · move 5",
    action: "Ask for a hint",
  },
  lesson: {
    eyebrow: "AI LESSON · CLUB PLAYER",
    title: "Build your center",
    message: "Try moving the pawn in front of your queen one square forward. It supports your center pawn and gives your pieces more room.",
    detail: "Lesson 2 of 5 · Opening plans",
    action: "Tell me more",
  },
  pro: {
    eyebrow: "PRO TUTOR · POSITION REVIEW",
    title: "A useful next move",
    message: "Move the pawn in front of your queen one square forward. This supports your center and opens a route for your bishop.",
    detail: "Best idea · build a strong center",
    action: "Why is this best?",
  },
};

function Avatar({ initials, tone = "sage" }: { initials: string; tone?: "sage" | "gold" | "stone" }) {
  const styles = {
    sage: "bg-[#b8d29b] text-[#1c2a20]",
    gold: "bg-[#d7b879] text-[#2c261a]",
    stone: "bg-[#9ca89e] text-[#1c2420]",
  };
  return <div className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold tracking-wide ${styles[tone]}`}>{initials}</div>;
}

export default function DesignPreviewPage() {
  const [direction, setDirection] = useState<Direction>("pro");
  const [activeTab, setActiveTab] = useState<"coach" | "moves">("coach");
  const [message, setMessage] = useState("");
  const game = useMemo(() => {
    const chess = new Chess();
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"].forEach((move) => chess.move(move));
    return chess;
  }, []);
  const pieces = useMemo(() => game.board().flat().filter((piece): piece is NonNullable<typeof piece> => piece !== null).map((piece) => ({
    square: piece.square,
    type: piece.type,
    color: piece.color as Color,
  })), [game]);
  const panel = panels[direction];
  const isPro = direction === "pro";

  return (
    <main className="min-h-screen bg-[#101611] px-3 pb-8 text-[#eee9dc] sm:px-7">
      <div className="mx-auto max-w-[1540px]">
        <header className="flex h-[60px] items-center justify-between border-b border-white/[0.08] sm:h-[76px]">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Chessmaster home">
              <div className="grid size-9 place-items-center rounded-xl bg-[#bdd49f] text-[#17221a]"><Crown size={19} /></div>
              <div className="leading-none"><div className="text-[13px] font-bold tracking-[.16em]">GRANDMASTER</div><div className="mt-1 text-[9px] tracking-[.28em] text-white/40">CHESS CLUB</div></div>
            </Link>
            <nav className="hidden items-center gap-6 text-xs text-white/48 md:flex"><span className="text-[#e7e1d2]">Play</span><span>Learn</span><span>Puzzles</span></nav>
          </div>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 text-[11px] text-white/55 sm:flex"><span className="size-1.5 rounded-full bg-[#b8d29b]" /> Design preview</div><Avatar initials="CH" /></div>
        </header>

        <section className="mx-auto max-w-[1190px] pt-4 sm:pt-7">
          <div className="mb-4 flex flex-col justify-between gap-3 lg:mb-6 lg:flex-row lg:items-end lg:gap-5">
            <div><div className="mb-1.5 text-[9px] font-semibold tracking-[.2em] text-[#b8d29b] sm:mb-2 sm:text-[10px]">3D GRANDMASTER CHESS · DESIGN STUDY</div><h1 className="text-[21px] font-semibold tracking-[-.035em] sm:text-[30px]">A more human way to play.</h1><p className="mt-2 hidden max-w-[560px] text-[13px] leading-6 text-white/46 sm:block">Three directions for bringing a live 3D board, real opponents, and an approachable chess tutor together.</p></div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Design directions">{directions.map((item) => <button key={item.id} role="tab" aria-selected={direction === item.id} onClick={() => setDirection(item.id)} className={`rounded-xl border px-3.5 py-2.5 text-left transition ${direction === item.id ? "border-[#b8d29b]/40 bg-[#b8d29b]/[0.09] text-[#ecf3e4]" : "border-white/[0.08] bg-[#151c17] text-white/50 hover:text-white/80"}`}><span className="mr-2 text-[9px] tracking-[.12em] text-[#b8d29b]">{item.number}</span><span className="text-[11px] font-medium">{item.label}</span></button>)}</div>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_326px] xl:gap-5">
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#151c17] px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3"><Avatar initials="GM" tone="gold" /><div className="min-w-0"><div className="truncate text-[12px] font-semibold">Arbor <span className="font-normal text-white/35">· Expert AI</span></div><div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/40"><span className="size-1.5 rounded-full bg-[#b8d29b]" />{direction === "match" ? "Opponent connected" : "Ready when you are"}</div></div></div>
                <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-[9px] tracking-[.14em] text-white/34">OPPONENT CLOCK</div><div className="mt-0.5 font-mono text-[20px] tabular-nums">09:42</div></div><button className="grid size-9 place-items-center rounded-xl border border-white/[0.08] text-white/50" aria-label="More opponent options"><MoreHorizontal size={18} /></button></div>
              </div>

              <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#17211c] p-2 sm:max-w-none sm:p-3">
                <div className="aspect-square w-full"><ChessScene pieces={pieces} orientation="white" selected={null} targets={[]} hint={isPro ? { from: "c2", to: "c3" } : null} onSquareClick={() => undefined} /></div>
                {isPro && <div className="absolute left-1/2 top-[48%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-[#d3b775]/25 bg-[#1b211b]/95 px-3 py-2 text-[10px] font-medium text-[#f0ddb0] backdrop-blur-sm"><Lightbulb size={13} /> Try supporting the center</div>}
                <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111813]/90 px-3 py-2 text-[10px] text-white/65 backdrop-blur-sm"><span className="size-1.5 rounded-full bg-[#b8d29b]" /> 3D board · drag to rotate</div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#151c17] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3"><Avatar initials="YOU" /><div><div className="text-[12px] font-semibold">You <span className="font-normal text-white/35">· 1,240</span></div><div className="mt-1 text-[10px] text-white/38">White · your move</div></div></div>
                <div className="flex items-center gap-4"><div className="text-right"><div className="text-[9px] tracking-[.14em] text-white/34">YOUR CLOCK</div><div className="mt-0.5 font-mono text-[20px] tabular-nums">09:58</div></div><div className="hidden h-8 w-px bg-white/10 sm:block" /><button className="hidden items-center gap-2 text-[10px] text-white/45 sm:flex"><RotateCcw size={13} /> Flip board</button></div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] text-white/38"><div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-1.5"><Timer size={13} /> 10 min rapid</span><span className="flex items-center gap-1.5"><Swords size={13} /> Game 1 of 3</span><span>Move 6</span></div><div className="flex items-center gap-2"><button className="rounded-lg px-2 py-1.5 hover:bg-white/[0.05]"><Volume2 size={14} /></button><button className="rounded-lg px-2 py-1.5 hover:bg-white/[0.05]"><Settings2 size={14} /></button><button className="rounded-lg px-2 py-1.5 hover:bg-white/[0.05]"><Flag size={14} /></button></div></div>
            </section>

            <aside className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#151c17]">
              <div className="flex items-center gap-2 border-b border-white/[0.07] p-2">
                <button onClick={() => setActiveTab("coach")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-medium ${activeTab === "coach" ? "bg-[#252f28] text-[#eaf0e4]" : "text-white/40 hover:text-white/70"}`}><Sparkles size={14} /> {direction === "match" ? "Game chat" : "AI coach"}</button>
                <button onClick={() => setActiveTab("moves")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-medium ${activeTab === "moves" ? "bg-[#252f28] text-[#eaf0e4]" : "text-white/40 hover:text-white/70"}`}><AudioLines size={14} /> Moves</button>
              </div>

              {activeTab === "coach" ? <div className="flex min-h-[470px] flex-col p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between"><div><div className="text-[9px] font-semibold tracking-[.18em] text-[#b8d29b]">{panel.eyebrow}</div><div className="mt-2 text-[16px] font-semibold tracking-[-.02em]">{panel.title}</div></div><div className="grid size-9 place-items-center rounded-xl bg-[#b8d29b]/[0.1] text-[#c8dfa9]">{direction === "match" ? <MessageCircle size={17} /> : <GraduationCap size={18} />}</div></div>
                <div className="mb-4 flex gap-3 rounded-2xl border border-white/[0.06] bg-[#111813] p-3.5"><Avatar initials={direction === "match" ? "OP" : "AI"} tone="sage" /><div><div className="text-[11px] font-semibold">{direction === "match" ? "Opponent" : direction === "lesson" ? "Arbor · Chess coach" : "Grandmaster tutor"}</div><p className="mt-1.5 text-[11px] leading-[1.75] text-white/58">{panel.message}</p></div></div>
                {direction !== "match" && <div className="mb-4 rounded-2xl border border-[#b8d29b]/15 bg-[#b8d29b]/[0.045] p-3.5"><div className="flex items-center gap-2 text-[9px] font-semibold tracking-[.12em] text-[#c4dca6]"><Lightbulb size={13} /> THE IDEA</div><div className="mt-2 text-[11px] leading-[1.7] text-white/60">{direction === "pro" ? "A stronger center gives your pieces more useful squares." : "Look at the four squares in the middle of the board."}</div></div>}
                <div className="mt-auto">
                  <div className="mb-3 flex flex-wrap gap-1.5">{(direction === "pro" ? ["Why this move?", "Show the threat"] : direction === "lesson" ? ["Give me a hint", "What is the center?"] : ["Ask for a hint", "Offer a draw"]).map((suggestion) => <button key={suggestion} onClick={() => setMessage(suggestion)} className="rounded-full border border-white/[0.09] px-2.5 py-1.5 text-[9px] text-white/48 transition hover:border-[#b8d29b]/30 hover:text-white/80">{suggestion}</button>)}</div>
                  <div className="rounded-2xl border border-white/[0.09] bg-[#101611] p-2"><div className="flex items-center gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={direction === "match" ? "Message your opponent…" : "Ask about this position…"} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[10px] text-white outline-none placeholder:text-white/30" /><button aria-label="Send message" className="grid size-8 place-items-center rounded-xl bg-[#bdd49f] text-[#17221a]"><ArrowRight size={15} /></button></div></div>
                  <div className="mt-3 flex items-center justify-between text-[9px] text-white/32"><span>{panel.detail}</span><span className="flex items-center gap-1"><Shield size={11} /> Private lesson</span></div>
                </div>
              </div> : <div className="min-h-[470px] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between"><div><div className="text-[9px] font-semibold tracking-[.18em] text-[#b8d29b]">MOVE HISTORY</div><div className="mt-1.5 text-[15px] font-semibold">Opening · Ruy Lopez</div></div><button className="rounded-lg p-2 text-white/40"><ChevronDown size={16} /></button></div>
                <div className="grid grid-cols-[32px_1fr_1fr] border-b border-white/[0.06] py-2 text-[9px] uppercase tracking-[.12em] text-white/30"><span>Turn</span><span>White</span><span>Black</span></div>
                {[ ["1", "e4", "e5"], ["2", "Nf3", "Nc6"], ["3", "Bb5", "a6"], ["4", "Ba4", "Nf6"], ["5", "O-O", "Be7"] ].map(([turn, white, black]) => <div key={turn} className={`grid grid-cols-[32px_1fr_1fr] border-b border-white/[0.045] py-3 text-[11px] ${turn === "5" ? "text-[#d5e6bf]" : "text-white/65"}`}><span className="text-white/30">{turn}</span><span>{white}</span><span>{black}</span></div>)}
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-white/[0.035] p-3 text-[10px] leading-5 text-white/47"><CircleHelp size={14} className="mt-0.5 shrink-0 text-[#b8d29b]" />Move notation is optional. Switch to the coach for plain-language explanations.</div>
                <button className="mt-4 flex items-center gap-2 text-[10px] text-white/40"><ArrowDownLeft size={13} /> Review from this move</button>
              </div>}
              <footer className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3 text-[9px] text-white/35"><span className="flex items-center gap-1.5"><Bot size={13} /> Chessmaster assistant</span><span className="flex items-center gap-1.5"><Volume2 size={12} /> Voice on</span></footer>
            </aside>
          </div>

          <div className="mt-7 grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-3">{directions.map((item) => <button key={item.id} onClick={() => setDirection(item.id)} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${direction === item.id ? "bg-white/[0.045]" : "hover:bg-white/[0.025]"}`}><span className="pt-0.5 text-[10px] font-semibold tracking-[.12em] text-[#b8d29b]">{item.number}</span><span><span className="block text-[11px] font-medium text-white/80">{item.label}</span><span className="mt-1 block text-[10px] text-white/38">{item.description}</span></span></button>)}</div>
          <div className="mt-3 flex items-center justify-between text-[9px] text-white/28"><Link href="/" className="flex items-center gap-1.5 hover:text-white/70"><ArrowLeft size={12} /> Return to game</Link><span>Concept preview · 3D board uses the in-game model</span></div>
        </section>
      </div>
    </main>
  );
}
