import { PersonalDashboard } from "@/components/personal-dashboard";
import { getUserFinance } from "@/lib/finance-queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Server wrapper shared by every /app page: auth check, scoped data load, render.
export async function AppScreen({ view }: { view: "overview" | "activity" | "budgets" | "cards" }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { transactions, budgets } = await getUserFinance(userId);

  return <PersonalDashboard view={view} transactions={transactions} budgets={budgets} today={new Date().toISOString().slice(0, 10)} />;
}
