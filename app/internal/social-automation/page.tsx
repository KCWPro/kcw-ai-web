import SocialAutomationWorkbench from "@/app/internal/social-automation/SocialAutomationWorkbench";
import { readSocialAutomationState } from "@/lib/socialAutomation/store";

export const dynamic = "force-dynamic";

export default function SocialAutomationPage() {
  const snapshot = readSocialAutomationState();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">KCW Internal · Social Automation V1.5 Controlled Utility</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Auto Topic → Script → Draft Package → Controlled Queue → Human-safe Reply → Analytics Review</h1>
          <p className="mt-2 text-sm text-slate-600">Official OAuth contracts only. Unconfigured or unapproved platforms stay restricted/manual and never pretend public auto publishing.</p>
        </header>
        <SocialAutomationWorkbench defaultSnapshot={snapshot} />
      </div>
    </main>
  );
}
