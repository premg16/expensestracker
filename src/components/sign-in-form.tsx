"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { LoaderCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const DESTINATION = "/app";
const inputClass =
  "h-14 w-full rounded-[1.3rem] border border-ink/10 bg-white/72 px-5 text-base font-bold text-ink shadow-sm outline-none transition placeholder:font-semibold placeholder:text-ink/36 focus:border-ink disabled:opacity-60";

type Failure = { message: string; longMessage?: string } | null;

function messageOf(error: Failure) {
  return error?.longMessage ?? error?.message ?? "Something went wrong. Try again.";
}

export function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState<"google" | "email" | "code" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const disabled = busy !== null || fetchStatus === "fetching";

  const navigate = ({ session, decorateUrl }: { session: { currentTask?: unknown } | null; decorateUrl: (url: string) => string }) => {
    if (session?.currentTask) {
      setError("Your account needs one more setup step. Finish it in the Clerk dashboard settings, then sign in again.");
      return;
    }

    const url = decorateUrl(DESTINATION);
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  async function continueWithGoogle() {
    setError(null);
    setBusy("google");
    const { error: failure } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: DESTINATION,
      redirectCallbackUrl: "/sign-in/sso-callback",
    });

    if (failure) {
      setError(messageOf(failure));
      setBusy(null);
    }
  }

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    const address = email.trim();

    if (!address) {
      setError("Enter your email to get a code.");
      return;
    }

    setError(null);
    setBusy("email");
    // signUpIfMissing: new emails get an account after the code is verified.
    const created = await signIn.create({ identifier: address, signUpIfMissing: true });
    const sent = created.error ? created : await signIn.emailCode.sendCode();
    setBusy(null);

    if (sent.error) {
      setError(messageOf(sent.error));
      return;
    }

    setCode("");
    setStep("code");
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();

    if (code.trim().length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setError(null);
    setBusy("code");

    const { error: failure } = await signIn.emailCode.verifyCode({ code: code.trim() });

    if (failure) {
      if (isClerkAPIResponseError(failure) && failure.errors[0]?.code === "sign_up_if_missing_transfer") {
        const transferred = await signUp.create({ transfer: true });

        if (transferred.error) {
          setError(messageOf(transferred.error));
        } else if (signUp.status === "complete") {
          const finalized = await signUp.finalize({ navigate });
          if (finalized.error) setError(messageOf(finalized.error));
        } else {
          // Usually means Clerk still requires another field (for example a password) at sign-up.
          console.error("Sign-up incomplete:", signUp.status, signUp.missingFields);
          setError("We could not finish creating your account with email. Try Google instead.");
        }
      } else {
        setError(messageOf(failure));
      }

      setBusy(null);
      return;
    }

    if (signIn.status === "complete") {
      const finalized = await signIn.finalize({ navigate });
      if (finalized.error) setError(messageOf(finalized.error));
    } else {
      setError("This account needs an extra verification step that Float does not support yet.");
    }

    setBusy(null);
  }

  return (
    <div className="mt-10 grid gap-3">
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={disabled}
        className="black-button haptic flex h-14 items-center justify-center gap-3 rounded-[1.3rem] text-base font-black disabled:opacity-60"
      >
        {busy === "google" ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-black text-ink">G</span>
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-3 py-1" aria-hidden="true">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-xs font-black uppercase text-ink/36">or email</span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      {step === "email" ? (
        <form onSubmit={sendCode} className="grid gap-3">
          <label className="sr-only" htmlFor="sign-in-email">
            Email address
          </label>
          <input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={disabled}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={disabled}
            className="haptic flex h-14 items-center justify-center gap-3 rounded-[1.3rem] bg-sky text-base font-black shadow-sm disabled:opacity-60"
          >
            {busy === "email" ? <LoaderCircle size={20} className="animate-spin" /> : <Mail size={20} />}
            Send code
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="animate-in grid gap-3">
          <p className="text-sm font-bold text-ink/62">
            We sent a 6-digit code to <span className="text-ink">{email.trim()}</span>.
          </p>
          <label className="sr-only" htmlFor="sign-in-code">
            6-digit code
          </label>
          <input
            id="sign-in-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            disabled={disabled}
            autoFocus
            className={`${inputClass} text-center font-mono text-2xl tracking-[0.4em]`}
          />
          <button
            type="submit"
            disabled={disabled}
            className="black-button haptic flex h-14 items-center justify-center gap-3 rounded-[1.3rem] text-base font-black disabled:opacity-60"
          >
            {busy === "code" && <LoaderCircle size={20} className="animate-spin" />}
            Verify and continue
          </button>
          <div className="flex items-center justify-between gap-3 text-sm font-black text-ink/56">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              Use a different email
            </button>
            <button type="button" disabled={disabled} onClick={() => sendCode()} className="underline-offset-4 hover:text-ink hover:underline">
              Resend code
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="animate-in rounded-[1.25rem] bg-[#ff9a76]/45 px-4 py-3 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      {/* Clerk renders its bot-protection challenge here when it needs one. */}
      <div id="clerk-captcha" />
    </div>
  );
}
