import { ArrowLeft, BadgeCheck, Fingerprint, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { HapticLink } from "@/components/haptic-link";

const trustItems = ["Google OAuth route", "Passkey-ready interface", "Preview-ready app access", "Server-side secrets"];

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute right-[-8rem] top-8 h-96 w-96 rounded-full bg-[#87dcfb]/55 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[35%] h-96 w-96 rounded-full bg-[#ffcf6e]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-[2.4rem] p-6 sm:p-8">
          <HapticLink href="/" className="inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-sm font-black">
            <ArrowLeft size={16} />
            Back home
          </HapticLink>

          <div className="mt-14">
            <p className="text-sm font-black uppercase text-ink/42">Welcome back</p>
            <h1 className="font-display display-kern mt-3 text-6xl font-black leading-none max-sm:text-4xl">Know your float.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-ink/62">
              Sign in with Google to get started, or open the app and check today&apos;s spendable number.
            </p>
          </div>

          <div className="mt-10 grid gap-3">
            <HapticLink
              href="/api/auth/signin/google"
              prefetch={false}
              className="black-button haptic flex h-14 items-center justify-center gap-3 rounded-[1.3rem] text-base font-black"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-black text-ink">G</span>
              Continue with Google
            </HapticLink>
            <HapticLink
              href="/app"
              className="haptic flex h-14 items-center justify-center gap-3 rounded-[1.3rem] bg-[#87dcfb] text-base font-black shadow-sm"
            >
              <Fingerprint size={20} />
              Open Float
            </HapticLink>
          </div>

          <div className="mt-8 grid gap-3">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[1.25rem] bg-white/70 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c8e9ca]">
                  <ShieldCheck size={16} />
                </span>
                <span className="text-sm font-black">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="relative hidden min-h-[650px] lg:block">
          <div className="phone-shell float-soft absolute left-8 top-4 w-[310px] rounded-[2.1rem] p-5">
            <div className="flex items-center justify-between">
              <p className="font-display display-kern text-2xl font-black leading-none">Float.</p>
              <BadgeCheck size={21} />
            </div>
            <div className="card-mint mt-12 rounded-[1.6rem] p-5">
              <p className="text-sm text-ink/55">Your float today</p>
              <p className="money-figures mt-2 font-mono text-5xl font-black">$186</p>
              <p className="mt-12 text-xs font-black">Maya Chen · •••• 9934</p>
            </div>
            <div className="mt-5 rounded-[1.6rem] bg-white p-4 shadow-sm">
              <p className="font-display display-kern text-lg font-black leading-tight">Spotify price changed</p>
              <p className="mt-1 text-xs text-ink/52">Review before the next renewal.</p>
            </div>
          </div>

          <div className="phone-shell float-delay absolute right-8 top-28 w-[330px] rounded-[2.1rem] p-6">
            <span className="grid h-13 w-13 place-items-center rounded-full bg-[#87dcfb]">
              <Sparkles size={23} />
            </span>
            <h2 className="font-display display-kern mt-10 text-5xl font-black leading-none">A login screen that feels launch-ready.</h2>
            <p className="mt-5 text-base leading-7 text-ink/62">
              Premium spacing, touch-friendly controls, social sign-in, direct app access, and the same visual language as the
              product.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-[1.4rem] bg-ink p-4 text-white">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ffcf6e] text-ink">
                <KeyRound size={19} />
              </span>
              <div>
                <p className="font-black">Passkey-ready</p>
                <p className="text-sm text-white/52">Prepared for the next auth layer.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
