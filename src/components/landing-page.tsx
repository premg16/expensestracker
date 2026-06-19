import { HapticLink } from "@/components/haptic-link";
import { LandingInteractionShell } from "@/components/landing-interactions";
import { testimonials } from "@/lib/spendpilot-data";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Mail,
  Mic,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  WalletCards,
} from "lucide-react";

const problemScenes = [
  {
    step: "01",
    title: "Start with money you can actually touch",
    body: "Bills, goals, card payments, and quiet renewals leave first. The number that remains is the only one worth planning from.",
  },
  {
    step: "02",
    title: "Turn every transaction into a decision",
    body: "Each change becomes a small action: keep it, tag it, lower it, split it, or cancel it before it quietly claims more.",
  },
  {
    step: "03",
    title: "Five minutes a day, nothing more",
    body: "A short daily brief gives you the number, the changes, and the one next move that keeps money admin from becoming a second job.",
  },
] as const;

const problemTitleLines = [
  ["A", "balance", "looks", "rich"],
  ["until", "life", "takes", "its", "cut."],
] as const;

const questionTitleLines = [
  ["Three", "questions."],
  ["One", "moving", "answer."],
] as const;

const questionScenes = [
  {
    step: "01",
    label: "At checkout",
    question: "Can I buy this?",
    answer: "$186",
    answerLabel: "safe to spend today",
    body: "Float answers with the money that is actually yours after the boring obligations already left.",
    action: "Dinner still fits",
    meta: "rent, card, goals already removed",
    tone: "sky",
  },
  {
    step: "02",
    label: "Morning brief",
    question: "What changed today?",
    answer: "Spotify rose $2",
    answerLabel: "before next month hits",
    body: "Price moves, quiet renewals, and odd spend shifts show up as decisions while they are still small.",
    action: "Lower or cancel",
    meta: "change caught 12 days early",
    tone: "gold",
  },
  {
    step: "03",
    label: "Review queue",
    question: "What needs attention?",
    answer: "3 moves",
    answerLabel: "ready in the brief",
    body: "The app does not ask you to interpret charts. It gives the next useful move and lets everything else wait.",
    action: "Keep the day moving",
    meta: "less than five minutes",
    tone: "mint",
  },
] as const;

const briefTitleLines = [
  ["One", "feed."],
  ["Three", "answers."],
  ["No", "spreadsheet", "brain."],
] as const;

const briefScenes = [
  {
    step: "01",
    label: "Always current",
    title: "Your float stays honest",
    body: "Rent, cards, goals, and quiet renewals leave before the spendable number shows up.",
    metric: "$186",
    metricLabel: "safe today",
    action: "today's float",
    icon: WalletCards,
    tone: "sky",
    rows: [
      ["Rent cleared", "sorted"],
      ["Card payment out Friday", "watch"],
      ["Goals protected", "saved"],
    ],
  },
  {
    step: "02",
    label: "Leaks early",
    title: "Quiet changes surface first",
    body: "Price increases, unused trials, duplicate tools, and renewals become review cards before they surprise you.",
    metric: "$2",
    metricLabel: "Spotify rose",
    action: "review renewal",
    icon: Bell,
    tone: "gold",
    rows: [
      ["Spotify went up $2", "lower"],
      ["Storage trial renews", "cancel"],
      ["Duplicate tool found", "merge"],
    ],
  },
  {
    step: "03",
    label: "Direct answers",
    title: "Ask the money question",
    body: "Dinner, payday, what changed, and what to pause are answered as decisions instead of charts.",
    metric: "fits",
    metricLabel: "dinner tonight",
    action: "answer ready",
    icon: Sparkles,
    tone: "mint",
    rows: [
      ["Can I buy this?", "yes"],
      ["What changed?", "3 items"],
      ["Which bill is next?", "Friday"],
    ],
  },
  {
    step: "04",
    label: "Small habit",
    title: "Five minutes keeps it clean",
    body: "A short daily review, weekly recovery, and spending rooms keep money admin from becoming a second job.",
    metric: "< 5m",
    metricLabel: "daily check",
    action: "brief complete",
    icon: Trophy,
    tone: "ink",
    rows: [
      ["Morning brief", "done"],
      ["$42 recovered", "found"],
      ["18 day streak", "live"],
    ],
  },
] as const;

const trustTitleLines = [
  ["Playful", "interface."],
  ["Serious", "money", "boundaries."],
] as const;

const trustScenes = [
  {
    step: "01",
    label: "Protected app shell",
    title: "Only the person signed in gets the room",
    body: "Google sign-in keeps the app door clear, sessions stay scoped, and every money view opens from the same protected shell.",
    signal: "Access",
    status: "protected",
    icon: ShieldCheck,
    tone: "mint",
    rows: [
      ["Google sign-in", "active"],
      ["App shell", "guarded"],
      ["Session check", "current"],
    ],
  },
  {
    step: "02",
    label: "Email import path",
    title: "Imports are reviewed before they matter",
    body: "Receipts and renewal notices can become useful cards without turning the inbox into an automatic money machine.",
    signal: "Review",
    status: "before saving",
    icon: Mail,
    tone: "sky",
    rows: [
      ["Receipt found", "review"],
      ["Renewal notice", "flagged"],
      ["Saved history", "exportable"],
    ],
  },
  {
    step: "03",
    label: "Voice-first money questions",
    title: "Questions stay fast without losing context",
    body: "Ask what changed, what is safe, or what needs attention. Float answers from the same money story already on screen.",
    signal: "Ask",
    status: "with context",
    icon: Mic,
    tone: "ink",
    rows: [
      ["What changed?", "answered"],
      ["Can I buy this?", "checked"],
      ["What is next?", "ready"],
    ],
  },
] as const;

export function LandingPage() {
  return (
    <LandingInteractionShell>
      <StickyNav />
      <HeroSection />
      <ProblemSection />
      <LifestyleSection />
      <FeatureSection />
      <SocialProofSection />
      <SecuritySection />
      <FinalCta />
    </LandingInteractionShell>
  );
}

function StickyNav() {
  return (
    <>
      <div className="landing-nav-wrap fixed inset-x-0 top-4 z-50 px-4 sm:px-6 lg:px-8">
        <nav className="landing-nav mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/88 px-3 py-3 shadow-[0_22px_80px_rgba(23,23,23,0.12)] backdrop-blur-2xl">
          <HapticLink href="/" className="landing-nav-brand flex items-center gap-2 text-lg font-black">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
              <WalletCards size={18} />
            </span>
            <span className="font-display text-2xl leading-none display-kern">Float</span>
          </HapticLink>
          <div className="landing-nav-links hidden items-center gap-6 text-sm font-semibold text-ink/62 lg:flex">
            <a href="#story" className="transition hover:text-ink">
              The problem
            </a>
            <a href="#features" className="transition hover:text-ink">
              How it works
            </a>
            <a href="#love" className="transition hover:text-ink">
              Proof
            </a>
            <a href="#trust" className="transition hover:text-ink">
              Trust
            </a>
          </div>
          <div className="landing-nav-actions flex items-center gap-2">
            <HapticLink
              href="/sign-in"
              className="hidden rounded-full px-4 py-2 text-sm font-bold transition hover:bg-white sm:block"
            >
              Sign in
            </HapticLink>
            <HapticLink href="/app" className="black-button haptic rounded-full px-5 py-2.5 text-sm font-bold">
              Open app
            </HapticLink>
          </div>
        </nav>
      </div>
      <div className="h-20 sm:h-24" aria-hidden="true" />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative px-4 pb-5 pt-8 sm:px-6 lg:px-8">
      <HeroAtmosphere />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-7 pb-20 pt-10 text-center lg:min-h-[calc(100vh-5rem)] lg:pt-10">
        <div className="hero-copy-stage mx-auto w-full">
          <h1
            className="hero-title font-display display-kern mx-auto max-w-[1320px] text-[6.95rem] font-black leading-[0.84] tracking-normal text-ink max-xl:text-[5.8rem] max-lg:text-[4.8rem] max-sm:text-[3.9rem]"
            aria-label="Know what you can spend today."
          >
            <span className="hero-title-line sm:whitespace-nowrap">Know what you can</span>
            <span className="hero-title-line font-semibold" style={{ animationDelay: "240ms" }}>
              spend today.
            </span>
          </h1>
          <p className="hero-support-reveal mx-auto mt-7 max-w-[760px] text-xl leading-8 text-ink/68 max-sm:text-lg">
            Your balance shows what is there. Float shows what is actually yours after rent, cards, goals, and
            every quiet renewal that has already claimed it.
          </p>

          <div className="hero-actions-reveal mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <HapticLink
              href="/app"
              className="black-button haptic inline-flex h-14 items-center justify-center gap-2 rounded-[1.25rem] px-7 text-base font-black"
            >
              See my float
              <ArrowRight size={18} />
            </HapticLink>
            <HapticLink
              href="#story"
              className="haptic inline-flex h-14 items-center justify-center gap-2 rounded-[1.25rem] border border-white/80 bg-white/62 px-7 text-base font-black backdrop-blur-xl transition hover:bg-white"
            >
              How it works
              <ChevronRight size={18} />
            </HapticLink>
          </div>
        </div>

        <HeroProductVisual />
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section
      id="story"
      data-problem-scroll="true"
      className="problem-story relative h-[430svh] scroll-mt-0"
    >
      <div
        data-problem-stage="prelude"
        data-problem-step="-1"
        className="problem-story-stage sticky top-0 h-dvh overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/22 to-transparent" />
        <div className="problem-story-inner relative mx-auto h-dvh max-w-7xl">
          <div className="problem-headline-lockup">
            <p className="problem-eyebrow">The actual problem</p>
            <h2
              className="problem-main-title font-display display-kern mt-4 font-black leading-none"
              aria-label="A balance looks rich until life takes its cut."
            >
              {problemTitleLines.map((line, lineIndex) => (
                <span key={line.join(" ")} className="problem-title-line" aria-hidden="true">
                  {line.map((word) => (
                    <span key={`${lineIndex}-${word}`} className="problem-title-word" data-problem-word>
                      {word}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>

          <div className="problem-sync-copy max-w-xl">
            {problemScenes.map((scene, index) => (
              <article key={scene.title} className={`problem-sync-step problem-sync-step-${index + 1} relative pl-14`}>
                <span className="problem-sync-number money-figures absolute left-0 top-1 text-sm font-black text-ink/36">
                  {scene.step}
                </span>
                <h3 className="text-lg font-black leading-6 text-ink">{scene.title}</h3>
                <p className="mt-1.5 max-w-lg text-[0.95rem] font-semibold leading-6 text-ink/56">{scene.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div
          data-cursor-card="true"
          className="problem-phone cursor-reactive absolute w-full max-w-none"
        >
          <div className="problem-product-canvas relative min-h-[560px] overflow-hidden rounded-[2.35rem] border border-white/72 bg-[#e8f8fd]/78 p-5 shadow-[0_34px_100px_rgba(23,23,23,0.13)]">
            <div className="problem-phone-grid" aria-hidden="true" />

            <article className="problem-phone-scene problem-phone-scene-one">
              <div className="relative z-10 rounded-[1.8rem] bg-ink p-5 text-white shadow-[0_26px_70px_rgba(23,23,23,0.25)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">Bank balance says</p>
                <p className="money-figures mt-3 text-6xl font-black leading-none tracking-normal">$4,812</p>
                <div className="mt-4 h-1.5 rounded-full bg-white/12">
                  <div className="problem-phone-bar h-full rounded-full bg-coral" />
                </div>
                <p className="mt-5 text-sm font-semibold leading-6 text-white/62">
                  Looks useful until already-claimed money starts leaving the room.
                </p>
              </div>

              <div className="relative z-10 mt-4 grid gap-3">
                {[
                  ["Rent already committed", "-$2,400"],
                  ["Card closes Friday", "-$1,102"],
                  ["Quiet renewals", "-$124"],
                ].map(([label, amount]) => (
                  <div key={label} className="problem-phone-row flex items-center justify-between rounded-[1.2rem] bg-white/82 px-4 py-3">
                    <span className="text-sm font-black text-ink/68">{label}</span>
                    <span className="money-figures text-lg font-black text-coral">{amount}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="problem-phone-scene problem-phone-scene-two">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-ink/42">What changed</p>
                <h3 className="font-display display-kern mt-2 text-5xl font-black leading-[0.95] text-ink">
                  Spotify rose $2.
                </h3>
                <p className="mt-4 text-base font-semibold leading-7 text-ink/60">
                  Float turns the change into a decision before the renewal hits next month.
                </p>
              </div>
              <div className="relative z-10 mt-7 grid gap-3">
                {[
                  ["Keep", "still inside today"],
                  ["Lower", "find cheaper plan"],
                  ["Cancel", "save $14/mo"],
                ].map(([action, note], index) => (
                  <div
                    key={action}
                    className={`problem-action-row flex items-center justify-between rounded-[1.35rem] border border-white/74 px-4 py-4 shadow-[0_14px_40px_rgba(23,23,23,0.08)] ${index === 2 ? "bg-ink text-white" : index === 1 ? "bg-mint/88 text-ink" : "bg-white/82 text-ink"
                      }`}
                  >
                    <div>
                      <p className="text-lg font-black">{action}</p>
                      <p className={`text-sm font-semibold ${index === 2 ? "text-white/58" : "text-ink/50"}`}>{note}</p>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                ))}
              </div>
            </article>

            <article className="problem-phone-scene problem-phone-scene-three">
              <div className="relative z-10 rounded-[1.9rem] bg-sky p-5 shadow-[0_24px_70px_rgba(47,191,233,0.24)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-ink/42">Safe to spend today</p>
                <p className="money-figures mt-3 text-7xl font-black leading-none tracking-normal text-ink">$186</p>
                <p className="mt-4 text-base font-semibold leading-7 text-ink/62">
                  After rent, cards, goals, groceries, and renewals have taken their share.
                </p>
              </div>
              <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.35rem] bg-white/82 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-ink/40">Recovered</p>
                  <p className="money-figures mt-5 text-4xl font-black">$42</p>
                  <p className="mt-1 text-sm font-semibold text-ink/50">this week</p>
                </div>
                <div className="rounded-[1.35rem] bg-mint/90 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-ink/40">Time spent</p>
                  <p className="money-figures mt-5 text-4xl font-black">&lt; 5m</p>
                  <p className="mt-1 text-sm font-semibold text-ink/50">daily check</p>
                </div>
              </div>
              <div className="problem-phone-stamp relative z-10 mt-4 grid h-20 w-20 place-items-center rounded-full bg-ink text-center text-xs font-black uppercase leading-4 text-white">
                actually
                <br />
                yours
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function LifestyleSection() {
  return (
    <section data-question-scroll="true" className="question-story relative h-[430svh] scroll-mt-0">
      <div
        data-question-stage="prelude"
        data-question-step="-1"
        className="question-story-stage sticky top-0 h-dvh overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-white/16 to-transparent" />
        <div className="question-story-inner relative mx-auto h-dvh max-w-7xl">
          <div className="question-chapter-copy">
            <p className="question-eyebrow">Real life, not a spreadsheet</p>
            <h2
              className="question-chapter-title font-display display-kern mt-4 font-black leading-none"
              aria-label="Three questions. One moving answer."
            >
              {questionTitleLines.map((line, lineIndex) => (
                <span key={line.join(" ")} className="question-title-line" aria-hidden="true">
                  {line.map((word) => (
                    <span key={`${lineIndex}-${word}`} className="question-title-word" data-question-word>
                      {word}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>

          <div className="question-track">
            {questionScenes.map((scene) => (
              <article key={scene.question} className="question-step relative pl-14">
                <span className="question-step-number money-figures absolute left-0 top-1 text-sm font-black text-ink/36">
                  {scene.step}
                </span>
                <p className="text-sm font-black uppercase tracking-[0.11em] text-ink/42">{scene.label}</p>
                <h3 className="font-display display-kern mt-2 text-5xl font-black leading-none">{scene.question}</h3>
                <p className="mt-4 max-w-[34rem] text-xl font-semibold leading-8 text-ink/62">{scene.body}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/72 px-4 py-2 text-sm font-black shadow-[0_14px_40px_rgba(23,23,23,0.08)]">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-sky text-ink">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {scene.action}
                </div>
              </article>
            ))}
          </div>

          <div data-cursor-card="true" className="question-board cursor-reactive">
            <div className="question-board-grid" aria-hidden="true" />
            {questionScenes.map((scene, index) => (
              <article key={scene.answer} className={`question-board-scene question-board-scene-${index + 1}`}>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-ink/42">{scene.label}</p>
                    <h3 className="font-display display-kern mt-4 text-6xl font-black leading-none">{scene.answer}</h3>
                    <p className="mt-3 text-lg font-bold text-ink/56">{scene.answerLabel}</p>
                  </div>
                  <span
                    className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${
                      scene.tone === "gold" ? "bg-[#ffcf6e]" : scene.tone === "mint" ? "bg-mint" : "bg-sky"
                    }`}
                  >
                    {scene.step}
                  </span>
                </div>

                <div className="mt-10 grid gap-3">
                  {index === 0 ? (
                    <>
                      <QuestionRow label="Rent cleared" value="removed" tone="dark" />
                      <QuestionRow label="Card closes Friday" value="claimed" tone="light" />
                      <QuestionRow label="Fun money" value="$186" tone="blue" />
                    </>
                  ) : index === 1 ? (
                    <>
                      <QuestionRow label="Keep" value="still fits" tone="light" />
                      <QuestionRow label="Lower" value="find plan" tone="mint" />
                      <QuestionRow label="Cancel" value="save $14/mo" tone="dark" />
                    </>
                  ) : (
                    <>
                      <QuestionRow label="Refund landed" value="+$42" tone="blue" />
                      <QuestionRow label="Renewal review" value="2 min" tone="light" />
                      <QuestionRow label="Next move" value="done" tone="dark" />
                    </>
                  )}
                </div>

                <div className="question-board-footer mt-8 flex items-center justify-between rounded-[1.4rem] bg-white/72 px-4 py-3">
                  <span className="text-sm font-black text-ink/46">{scene.meta}</span>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase text-white">current</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuestionRow({ label, value, tone }: { label: string; value: string; tone: "blue" | "dark" | "light" | "mint" }) {
  return (
    <div
      className={`question-row flex items-center justify-between rounded-[1.25rem] px-4 py-3 ${
        tone === "dark"
          ? "bg-ink text-white"
          : tone === "blue"
            ? "bg-sky text-ink"
            : tone === "mint"
              ? "bg-mint text-ink"
              : "bg-white/82 text-ink"
      }`}
    >
      <span className="font-black">{label}</span>
      <span className={`money-figures font-black ${tone === "dark" ? "text-white" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function FeatureSection() {
  return (
    <section id="features" data-brief-scroll="true" className="brief-story relative h-[520svh] scroll-mt-0">
      <div
        data-brief-stage="prelude"
        data-brief-step="-1"
        className="brief-story-stage sticky top-0 h-dvh overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-white/18 to-transparent" />
        <div className="brief-story-inner relative mx-auto h-dvh max-w-7xl">
          <div className="brief-headline-lockup">
            <p className="brief-eyebrow">The daily brief</p>
            <h2
              className="brief-main-title font-display display-kern mt-4 font-black leading-none"
              aria-label="One feed. Three answers. No spreadsheet brain."
            >
              {briefTitleLines.map((line, lineIndex) => (
                <span key={line.join(" ")} className="brief-title-line" aria-hidden="true">
                  {line.map((word) => (
                    <span key={`${lineIndex}-${word}`} className="brief-title-word" data-brief-word>
                      {word}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>

          <div className="brief-sync-copy">
            {briefScenes.map((scene) => (
              <article key={scene.title} className="brief-sync-step relative pl-14">
                <span className="brief-sync-number money-figures absolute left-0 top-1 text-sm font-black text-ink/36">
                  {scene.step}
                </span>
                <p className="text-sm font-black uppercase tracking-[0.11em] text-ink/42">{scene.label}</p>
                <h3 className="mt-2 font-black leading-none text-ink">{scene.title}</h3>
                <p className="mt-3 max-w-[33rem] font-semibold text-ink/60">{scene.body}</p>
              </article>
            ))}
          </div>

          <div data-cursor-card="true" className="brief-board cursor-reactive">
            <div className="brief-board-grid" aria-hidden="true" />
            {briefScenes.map((scene, index) => {
              const Icon = scene.icon;

              return (
                <article key={scene.title} className={`brief-board-scene brief-board-scene-${index + 1}`}>
                  <div className="brief-board-top relative z-10 rounded-[1.8rem] bg-ink p-5 text-white shadow-[0_26px_70px_rgba(23,23,23,0.25)]">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">{scene.label}</p>
                        <p className="money-figures mt-3 text-6xl font-black leading-none tracking-normal">
                          {scene.metric}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-white/62">{scene.metricLabel}</p>
                      </div>
                      <span
                        className={`grid h-15 w-15 shrink-0 place-items-center rounded-full ${
                          scene.tone === "gold"
                            ? "bg-[#ffcf6e] text-ink"
                            : scene.tone === "mint"
                              ? "bg-mint text-ink"
                              : scene.tone === "ink"
                                ? "bg-white text-ink"
                                : "bg-sky text-ink"
                        }`}
                      >
                        <Icon size={24} strokeWidth={2.6} />
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 grid gap-3">
                    {scene.rows.map(([label, status]) => (
                      <div key={label} className="brief-feed-row flex items-center justify-between rounded-[1.2rem] bg-white/84 px-4 py-3">
                        <span className="text-sm font-black text-ink/70">{label}</span>
                        <span className="rounded-full bg-ink px-3 py-1 text-xs font-black text-white">{status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="brief-next-move relative z-10 mt-4 flex items-center justify-between rounded-[1.4rem] bg-sky px-4 py-4">
                    <span className="text-sm font-black uppercase tracking-[0.14em] text-ink/48">Next move</span>
                    <span className="font-black text-ink">{scene.action}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section id="love" data-social-scroll="true" className="social-proof-story relative h-[430svh] scroll-mt-0">
      <div
        data-social-stage="prelude"
        data-social-step="-1"
        className="social-proof-stage sticky top-0 h-dvh overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-white/18 to-transparent" />
        <div className="social-proof-inner relative mx-auto h-dvh max-w-7xl">
          <div className="social-headline-lockup">
            <p className="social-eyebrow">What users actually say</p>
            <h2
              className="social-main-title font-display display-kern mt-4 font-black leading-none"
              aria-label='Not "budget variance." More like "dinner still fits."'
            >
              <span className="social-title-line" aria-hidden="true">
                <span className="social-title-word" data-social-word>Not</span>
                <span className="social-quote-mark social-highlight-green">&ldquo;</span>
                <span className="social-title-word social-highlight-green" data-social-word>budget</span>
                <span className="social-title-word social-highlight-green" data-social-word>variance.</span>
                <span className="social-quote-mark social-highlight-green">&rdquo;</span>
              </span>
              <span className="social-title-line" aria-hidden="true">
                <span className="social-title-word" data-social-word>More</span>
                <span className="social-title-word" data-social-word>like</span>
                <span className="social-quote-mark social-highlight-yellow">&ldquo;</span>
                <span className="social-title-word social-highlight-yellow" data-social-word>dinner</span>
                <span className="social-title-word social-highlight-yellow" data-social-word>still</span>
                <span className="social-title-word social-highlight-yellow" data-social-word>fits.</span>
                <span className="social-quote-mark social-highlight-yellow">&rdquo;</span>
              </span>
            </h2>
          </div>

          <div className="social-testimonial-grid">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                data-cursor-card="true"
                className={`social-testimonial-card social-testimonial-card-${index + 1} cursor-reactive flex min-h-[390px] flex-col justify-between rounded-4xl p-6 shadow-[0_24px_80px_rgba(23,23,23,0.10)] sm:p-7 lg:min-h-[440px] ${index === 0 ? "card-blue" : index === 1 ? "card-mint" : "bg-[#ffcf6e] text-ink"
                  }`}
              >
                <p className="font-display display-kern text-3xl font-black leading-[1.12] max-lg:text-2xl">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-10">
                  <div className="mb-7 flex gap-1.5">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} size={17} fill="currentColor" />
                    ))}
                  </div>
                  <p className="font-black">{item.name}</p>
                  <p className="text-sm opacity-60">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="trust" data-trust-scroll="true" className="trust-story relative h-[430svh] scroll-mt-0">
      <div
        data-trust-stage="prelude"
        data-trust-step="-1"
        className="trust-story-stage sticky top-0 h-dvh overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-white/16 to-transparent" />
        <div className="trust-story-inner relative mx-auto h-dvh max-w-7xl">
          <div className="trust-headline-lockup">
            <p className="trust-eyebrow">Trust layer</p>
            <h2
              className="trust-main-title font-display display-kern mt-4 font-black leading-none"
              aria-label="Playful interface. Serious money boundaries."
            >
              {trustTitleLines.map((line, lineIndex) => (
                <span key={line.join(" ")} className="trust-title-line" aria-hidden="true">
                  {line.map((word) => (
                    <span key={`${lineIndex}-${word}`} className="trust-title-word" data-trust-word>
                      {word}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>

          <div className="trust-sync-copy">
            {trustScenes.map((scene) => (
              <article key={scene.title} className="trust-sync-step relative pl-14">
                <span className="trust-sync-number money-figures absolute left-0 top-1 text-sm font-black text-ink/36">
                  {scene.step}
                </span>
                <p className="text-sm font-black uppercase tracking-[0.11em] text-ink/42">{scene.label}</p>
                <h3 className="mt-2 font-black leading-none text-ink">{scene.title}</h3>
                <p className="mt-3 max-w-[34rem] font-semibold text-ink/60">{scene.body}</p>
              </article>
            ))}
          </div>

          <div data-cursor-card="true" className="trust-board cursor-reactive">
            <div className="trust-board-grid" aria-hidden="true" />

            {trustScenes.map((scene, index) => {
              const Icon = scene.icon;

              return (
                <article key={scene.title} className={`trust-board-scene trust-board-scene-${index + 1}`}>
                  <div className={`trust-console trust-console-${scene.tone}`}>
                    <div className="trust-console-head">
                      <div>
                        <p className="trust-console-kicker">{scene.label}</p>
                        <h3 className="trust-console-title font-display display-kern">{scene.title}</h3>
                      </div>
                      <span className="trust-console-icon">
                        <Icon size={25} strokeWidth={2.6} />
                      </span>
                    </div>

                    <p className="trust-console-body">{scene.body}</p>

                    <div className="trust-rule-band">
                      <span>Current rule</span>
                      <strong>{scene.status}</strong>
                    </div>

                    <div className="trust-proof-grid">
                      <div className="trust-proof-tile trust-proof-tile-feature">
                        <span>{scene.signal}</span>
                        <strong>{scene.status}</strong>
                      </div>
                      {scene.rows.map(([label, status]) => (
                        <div key={label} className="trust-proof-tile">
                          <span>{label}</span>
                          <strong>{status}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 pb-10 pt-16 sm:px-6 lg:px-8">
      <div
        data-cursor-card="true"
        className="cursor-reactive mx-auto max-w-7xl overflow-hidden rounded-[2.8rem] bg-sky p-6 shadow-[0_34px_110px_rgba(23,23,23,0.18)] sm:p-10"
        data-reveal="cta"
      >
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <AnimatedLine className="absolute right-8 top-6 hidden h-28 w-56 text-ink/50 lg:block" />
          <div>
            <p className="text-sm font-black uppercase text-ink/45">Start with today&apos;s number</p>
            <h2 className="font-display display-kern text-balance mt-4 max-w-3xl text-6xl font-black leading-none max-sm:text-4xl">
              Open Float before the day spends itself.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/68">
              See what is safe, what changed, what needs review, and what can wait.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <HapticLink
              href="/app"
              className="black-button haptic inline-flex h-14 items-center justify-center gap-2 rounded-[1.25rem] px-7 text-base font-black"
            >
              Open Float
              <ArrowRight size={18} />
            </HapticLink>
            <HapticLink
              href="/sign-in"
              className="haptic inline-flex h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-white px-7 text-base font-black"
            >
              Create account
              <ChevronRight size={18} />
            </HapticLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-12rem] top-20 h-[34rem] w-[34rem] rounded-full bg-white/35 blur-3xl" />
      <div className="absolute right-[-9rem] top-10 h-[30rem] w-[30rem] rounded-full bg-sky/55 blur-3xl" />
      <div className="absolute bottom-[-14rem] left-[30%] h-[30rem] w-[30rem] rounded-full bg-[#ffcf6e]/25 blur-3xl" />
      <AnimatedSpark className="absolute right-[8%] top-[12%] hidden h-24 w-24 text-sky lg:block" />
      <AnimatedLine className="absolute left-[9%] top-[25%] hidden h-28 w-56 text-ink lg:block" />
    </div>
  );
}

function HeroProductVisual() {
  return (
    <div
      data-cursor-card="true"
      className="hero-product-reveal cursor-reactive relative mx-auto -mt-2 hidden h-[610px] w-full max-w-[900px] self-center lg:block"
    >
      <div className="absolute left-1/2 top-10 h-[520px] w-[740px] -translate-x-1/2 rotate-[-1deg] rounded-[3rem] border border-white/70 bg-white/28 shadow-[0_34px_120px_rgba(23,23,23,0.10)]" />
      <div className="absolute left-1/2 top-0 h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-sky/30 blur-3xl" />

      <div className="float-soft absolute inset-x-0 top-6 overflow-hidden rounded-[2.6rem] border border-white/75 bg-white/76 p-5 text-left shadow-[0_38px_120px_rgba(23,23,23,0.18)] backdrop-blur-2xl">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-4xl bg-ink p-6 text-white">
            <AnimatedLine className="absolute right-[-1.5rem] top-4 h-28 w-48 text-white/14" />
            <p className="text-xs font-black uppercase tracking-widest text-white/42">Spend permission</p>
            <div className="relative mt-8">
              <p className="text-sm font-bold text-white/50">Safe to spend today</p>
              <p className="money-figures mt-2 font-mono text-[5.5rem] font-black leading-none">$186</p>
              <p className="mt-4 max-w-sm text-base leading-7 text-white/58">
                After rent, cards, goals, groceries, and weekend plans already claimed their share.
              </p>
            </div>
            <div className="relative mt-8 grid grid-cols-3 gap-2">
              {[
                ["Bills", "$1,740", "#87dcfb"],
                ["Goals", "$420", "#c8e9ca"],
                ["Fun", "$186", "#ffcf6e"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-2xl bg-white/9 p-3">
                  <span className="block h-1.5 w-8 rounded-full" style={{ background: color }} />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/38">{label}</p>
                  <p className="money-figures mt-1 font-mono text-lg font-black">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <div className="rounded-4xl bg-[#ffcf6e] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-ink/45">What changed</p>
              <h3 className="font-display display-kern mt-3 text-4xl font-black leading-none">Spotify rose $2.</h3>
              <p className="mt-3 text-sm leading-6 text-ink/58">
                The renewal is flagged before it hits next month&apos;s float.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.7rem] bg-mint p-5">
                <p className="text-xs font-black uppercase tracking-widest text-ink/42">Recovered</p>
                <p className="money-figures mt-8 font-mono text-4xl font-black">$42</p>
                <p className="mt-1 text-sm font-bold text-ink/52">this week</p>
              </div>
              <div className="rounded-[1.7rem] bg-sky p-5">
                <p className="text-xs font-black uppercase tracking-widest text-ink/42">Time spent</p>
                <p className="money-figures mt-8 font-mono text-4xl font-black">&lt; 5m</p>
                <p className="mt-1 text-sm font-bold text-ink/52">daily check</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 grid gap-3 rounded-4xl bg-white/72 p-4 shadow-sm">
          {[
            ["Rent cleared", "Removed from today's spendable number", "current"],
            ["Trader Joe's on plan", "$84 groceries, still inside the room", "steady"],
            ["Refund landed", "$28 added back to weekend float", "found"],
          ].map(([title, detail, state]) => (
            <div key={title} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.25rem] border border-ink/6 bg-white p-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
                <CreditCard size={16} />
              </span>
              <div>
                <p className="font-black">{title}</p>
                <p className="text-xs font-semibold text-ink/45">{detail}</p>
              </div>
              <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-xs font-black text-[#065f46]">{state}</span>
            </div>
          ))}
        </section>
      </div>

      <div className="float-delay absolute bottom-6 right-10 flex items-center gap-3 rounded-[1.4rem] bg-ink px-5 py-4 text-white shadow-[0_20px_70px_rgba(23,23,23,0.24)]">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-sky text-ink">
          <Check size={18} />
        </span>
        <div>
          <p className="text-xs font-bold text-white/45">Next move</p>
          <p className="font-black">Dinner still fits</p>
        </div>
      </div>
    </div>
  );
}

function AnimatedLine({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 110" fill="none" aria-hidden="true">
      <path
        className="draw-line"
        d="M6 83C42 32 75 109 108 48C130 8 153 65 205 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnimatedSpark({ className = "" }: { className?: string }) {
  return (
    <svg className={`star-spin ${className}`} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path
        d="M60 4L72 39L108 25L86 58L116 78L78 82L82 116L58 88L32 116L38 78L4 72L36 54L16 22L50 38L60 4Z"
        fill="currentColor"
        stroke="#171717"
        strokeWidth="2"
      />
    </svg>
  );
}
