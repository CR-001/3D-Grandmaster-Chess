import Link from "next/link";
import { PricingTable } from "@clerk/nextjs";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#121b17] px-4 py-8 text-[#f0f1de] sm:px-8">
      <div className="quiet-grid pointer-events-none absolute inset-x-0 top-0 h-[440px] opacity-60" />
      <div className="relative mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-white/50 transition hover:text-white"><ArrowLeft size={14} />Back to the board</Link>
        <div className="mx-auto mt-14 max-w-2xl text-center sm:mt-20">
          <div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-[#c4e8a4]/20 bg-[#c4e8a4]/[0.08] text-[#c4e8a4]"><Crown size={21} /></div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.24em] text-[#b8dc9a]">Membership</p>
          <h1 className="text-balance text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Play well. <span className="text-[#b8dc9a]">Learn faster.</span></h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/45">Go beyond the board with a personal AI chess tutor that sees your position and helps you understand the game.</p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-white/[0.09] bg-[#18231d] p-3 shadow-[0_35px_100px_-55px_rgba(0,0,0,.9)] sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 pt-2 sm:px-3">
            <div className="flex items-center gap-2 text-xs font-semibold"><Sparkles size={15} className="text-[#c4e8a4]" />Chessmaster Pro</div>
            <span className="rounded-full border border-[#c4e8a4]/15 bg-[#c4e8a4]/[0.06] px-3 py-1.5 text-[10px] text-[#c4e8a4]">Monthly and annual plans</span>
          </div>
          <PricingTable for="user" newSubscriptionRedirectUrl="/" />
        </div>
        <section className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
          {["Visual best-move analysis", "Interactive AI coaching", "Lessons tailored to your position"].map((benefit) => <div key={benefit} className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-[11px] text-white/55"><span className="grid size-5 place-items-center rounded-full bg-[#c4e8a4]/10 text-[#c4e8a4]"><Check size={11} /></span>{benefit}</div>)}
        </section>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[10px] leading-5 text-white/30">Clerk securely handles your subscription and checkout. Development billing uses Clerk’s shared test gateway; production payments require a connected Stripe account.</p>
      </div>
    </main>
  );
}
