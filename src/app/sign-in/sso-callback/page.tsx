"use client";

import { HandleSSOCallback } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SsoCallbackPage() {
  const router = useRouter();

  return (
    <main className="grid min-h-dvh place-items-center px-4 text-ink">
      <div className="glass-panel flex items-center gap-3 rounded-full px-6 py-4 text-sm font-black">
        <LoaderCircle size={18} className="animate-spin" />
        Signing you in...
      </div>
      <HandleSSOCallback
        navigateToApp={({ session, decorateUrl }) => {
          if (session?.currentTask) {
            router.push("/sign-in");
            return;
          }

          const url = decorateUrl("/app");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        }}
        navigateToSignIn={() => router.push("/sign-in")}
        navigateToSignUp={() => router.push("/sign-in")}
      />
    </main>
  );
}
