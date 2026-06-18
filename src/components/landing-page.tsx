import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Fingerprint,
  Mail,
  Mic,
  ShieldCheck,
  Star,
  WalletCards,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { HapticLink } from "@/components/haptic-link";
import { LandingInteractionShell } from "@/components/landing-interactions";
import {
  landingFeatures,
  lifestyleImages,
  testimonials,
  trustSignals,
} from "@/lib/spendpilot-data";

const moneyNotes = [
  "rent already cleared",
  "card payment out Friday",
  "Spotify went up $2",
  "dinner still in budget",
  "refund hit the account",
  "$42 recovered this week",
];

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
      className="problem-story relative h-[520svh] scroll-mt-0"
    >
      <div
        data-problem-stage="prelude"
        data-problem-step="-1"
        className="problem-story-stage sticky top-0 h-dvh overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/22 to-transparent" />
        <div className="problem-story-inner relative mx-auto h-dvh max-w-7xl">
          <div className="problem-headline-lockup">
            <p className="problem-eyebrow text-sm font-black uppercase text-ink/42">The actual problem</p>
            <h2 className="problem-main-title font-display display-kern text-balance mt-4 font-black leading-none">
              A balance looks rich until life takes its cut.
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
                      className={`problem-action-row flex items-center justify-between rounded-[1.35rem] border border-white/74 px-4 py-4 shadow-[0_14px_40px_rgba(23,23,23,0.08)] ${
                        index === 2 ? "bg-ink text-white" : index === 1 ? "bg-mint/88 text-ink" : "bg-white/82 text-ink"
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
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-ink/42" data-reveal="left">Real life, not a spreadsheet</p>
            <h2
              className="font-display display-kern text-balance mt-3 max-w-3xl text-6xl font-black leading-none max-sm:text-4xl"
              data-reveal="left"
              style={{ transitionDelay: "80ms" }}
            >
              Built for the three questions people actually ask.
            </h2>
          </div>
          <div data-reveal="right" style={{ transitionDelay: "120ms" }}>
            <AnimatedCardWave />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {lifestyleImages.map((image, index) => (
            <article
              key={image.src}
              data-cursor-card="true"
              className={`cursor-reactive image-card group relative min-h-[520px] overflow-hidden rounded-[2.2rem] border border-white/70 bg-ink/8 shadow-[0_32px_90px_rgba(23,23,23,0.16)] ${
                index === 1 ? "lg:mt-12" : ""
              }`}
              data-reveal={index === 0 ? "left" : index === 1 ? "center" : "right"}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/78 via-ink/18 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="inline-flex rounded-full bg-white/18 px-3 py-1 text-sm font-bold backdrop-blur-xl">
                  {image.label}
                </p>
                <h3 className="font-display display-kern mt-4 text-3xl font-black">
                  {index === 0 ? "Can I buy this?" : index === 1 ? "What changed today?" : "What needs my attention?"}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            data-cursor-card="true"
            className="cursor-reactive rounded-[2.4rem] bg-ink p-6 text-white shadow-[0_34px_110px_rgba(23,23,23,0.22)] sm:p-8"
            data-reveal="left"
          >
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-black uppercase text-white/42">The daily brief</p>
                <h2 className="font-display display-kern text-balance mt-4 max-w-xl text-6xl font-black leading-none max-sm:text-4xl">
                  One feed. Three answers. No spreadsheet brain.
                </h2>
              </div>
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#87dcfb] text-ink">
                <Zap size={26} />
              </span>
            </div>

            <div className="mt-10 grid gap-3">
              {moneyNotes.map((note, index) => (
                <div
                  key={note}
                  className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/8 p-4"
                  data-reveal={index % 2 === 0 ? "right" : "left"}
                  style={{ transitionDelay: `${180 + index * 80}ms` }}
                >
                  <span className="font-bold">{note}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ink">
                    {index % 2 === 0 ? "sorted" : "watch"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {landingFeatures.map((feature, index) => (
              <article
                key={feature.title}
                data-cursor-card="true"
                className="cursor-reactive group rounded-[2rem] border border-white/75 bg-white/70 p-6 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl transition duration-300 hover:bg-white"
                data-reveal={index % 2 === 0 ? "right" : "center"}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <span className="grid h-13 w-13 place-items-center rounded-full bg-[#87dcfb] transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <feature.icon size={22} />
                </span>
                <h3 className="font-display display-kern mt-8 text-2xl font-black">{feature.title}</h3>
                <p className="mt-4 text-base leading-7 text-ink/62">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section id="love" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          data-cursor-card="true"
          className="cursor-reactive rounded-[2.5rem] border border-white/70 bg-white/62 p-6 shadow-[0_34px_100px_rgba(23,23,23,0.13)] backdrop-blur-xl sm:p-8"
          data-reveal="center"
        >
          <div className="grid gap-9">
            <div data-reveal="left">
              <p className="text-sm font-black uppercase text-ink/42">What users actually say</p>
              <h2 className="font-display display-kern text-balance mt-4 w-full max-w-none text-6xl font-black leading-none max-sm:text-4xl lg:text-[5.35rem]">
                Not &ldquo;budget variance.&rdquo; More like &ldquo;dinner still fits.&rdquo;
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((item, index) => (
                <article
                  key={item.name}
                  data-cursor-card="true"
                  className={`cursor-reactive flex min-h-[390px] flex-col justify-between rounded-[2rem] p-6 shadow-sm sm:p-7 lg:min-h-[440px] ${
                    index === 0 ? "card-blue" : index === 1 ? "card-mint" : "card-black text-white"
                  }`}
                  data-reveal={index === 0 ? "fan-left" : index === 1 ? "center" : "fan-right"}
                  style={{ transitionDelay: `${index * 110}ms` }}
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
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="trust" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1fr_0.86fr]">
        <div
          data-cursor-card="true"
          className="cursor-reactive card-black relative overflow-hidden rounded-[2.4rem] p-8 text-white"
          data-reveal="left"
        >
          <AnimatedSpark className="absolute right-10 top-10 h-20 w-20 text-[#87dcfb]" />
          <p className="text-sm font-black uppercase text-white/42">Trust layer</p>
          <h2 className="font-display display-kern text-balance mt-4 max-w-2xl text-6xl font-black leading-none max-sm:text-4xl">
            Playful interface. Serious money boundaries.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/64">
            The product feels light because the rules are strict: connect intentionally, review before saving, export
            when needed, and keep sensitive credentials away from the browser.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trustSignals.map((signal) => (
              <div key={signal} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4 font-bold">
                {signal}
              </div>
            ))}
          </div>
        </div>

        <div data-cursor-card="true" className="cursor-reactive glass-panel rounded-[2.4rem] p-8" data-reveal="right">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#c8e9ca]">
            <Fingerprint size={26} />
          </div>
          <h3 className="font-display display-kern text-balance mt-10 text-5xl font-black leading-none max-sm:text-4xl">A money app that respects trust.</h3>
          <p className="mt-5 text-base leading-7 text-ink/62">
            Google sign-in is wired for production, app access is immediate, and Float keeps the money story
            consistent across mobile and desktop.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              [ShieldCheck, "Protected app shell"],
              [Mail, "Email import path"],
              [Mic, "Voice-first money questions"],
            ].map(([Icon, label]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-[1.25rem] bg-white/70 p-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
                  <Icon size={17} />
                </span>
                <span className="font-black">{label as string}</span>
              </div>
            ))}
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
        className="cursor-reactive mx-auto overflow-hidden rounded-[2.8rem] bg-[#87dcfb] p-6 shadow-[0_34px_110px_rgba(23,23,23,0.18)] sm:p-10"
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
              See what is safe, what changed, what needs review, and what can wait. That is the whole product.
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
      <div className="absolute right-[-9rem] top-10 h-[30rem] w-[30rem] rounded-full bg-[#87dcfb]/55 blur-3xl" />
      <div className="absolute bottom-[-14rem] left-[30%] h-[30rem] w-[30rem] rounded-full bg-[#ffcf6e]/25 blur-3xl" />
      <AnimatedSpark className="absolute right-[8%] top-[12%] hidden h-24 w-24 text-[#87dcfb] lg:block" />
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
      <div className="absolute left-1/2 top-0 h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-[#87dcfb]/30 blur-3xl" />

      <div className="float-soft absolute inset-x-0 top-6 overflow-hidden rounded-[2.6rem] border border-white/75 bg-white/76 p-5 text-left shadow-[0_38px_120px_rgba(23,23,23,0.18)] backdrop-blur-2xl">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white">
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
                <div key={label} className="rounded-[1rem] bg-white/9 p-3">
                  <span className="block h-1.5 w-8 rounded-full" style={{ background: color }} />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/38">{label}</p>
                  <p className="money-figures mt-1 font-mono text-lg font-black">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <div className="rounded-[2rem] bg-[#ffcf6e] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-ink/45">What changed</p>
              <h3 className="font-display display-kern mt-3 text-4xl font-black leading-none">Spotify rose $2.</h3>
              <p className="mt-3 text-sm leading-6 text-ink/58">
                The renewal is flagged before it hits next month&apos;s float.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.7rem] bg-[#c8e9ca] p-5">
                <p className="text-xs font-black uppercase tracking-widest text-ink/42">Recovered</p>
                <p className="money-figures mt-8 font-mono text-4xl font-black">$42</p>
                <p className="mt-1 text-sm font-bold text-ink/52">this week</p>
              </div>
              <div className="rounded-[1.7rem] bg-[#87dcfb] p-5">
                <p className="text-xs font-black uppercase tracking-widest text-ink/42">Time spent</p>
                <p className="money-figures mt-8 font-mono text-4xl font-black">&lt; 5m</p>
                <p className="mt-1 text-sm font-bold text-ink/52">daily check</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 grid gap-3 rounded-[2rem] bg-white/72 p-4 shadow-sm">
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
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#87dcfb] text-ink">
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

function AnimatedCardWave() {
  return (
    <svg className="h-24 w-56 text-ink" viewBox="0 0 260 110" fill="none" aria-hidden="true">
      <rect className="card-wiggle" x="10" y="24" width="92" height="58" rx="16" fill="#87DCFB" stroke="#171717" strokeWidth="2" />
      <rect className="card-wiggle-delay" x="84" y="14" width="92" height="58" rx="16" fill="#C8E9CA" stroke="#171717" strokeWidth="2" />
      <rect className="card-wiggle" x="158" y="34" width="92" height="58" rx="16" fill="#171717" stroke="#171717" strokeWidth="2" />
      <path className="draw-line" d="M22 96C76 76 116 108 164 78C198 57 218 68 246 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
