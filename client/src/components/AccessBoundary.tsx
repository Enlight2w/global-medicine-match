import { ArrowLeft, ArrowUpRight, Loader2, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";

type Role = "user" | "partner" | "admin";

type AccessBoundaryProps = {
  loading: boolean;
  user: { role: Role } | null;
  allowedRoles: Role[];
  children: React.ReactNode;
};

export default function AccessBoundary({ loading, user, allowedRoles, children }: AccessBoundaryProps) {
  if (loading) {
    return <main className="grid min-h-screen place-items-center" aria-live="polite"><Loader2 className="animate-spin text-[#0f988c]" aria-label="Loading secure workspace" /></main>;
  }

  if (!user) {
    return <AccessMessage title="Sign in to continue" description="Operational records stay behind secure sign-in. Public visitors can explore verified coverage and the patient access pathway without accessing partner data." actionLabel="Sign in securely" onAction={() => startLogin()} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <AccessMessage title="Verified partner access required" description="This area is reserved for approved partner organizations and platform administrators. Ask an administrator to complete organization verification before accessing operational records." actionLabel="Back to public overview" href="/" />;
  }

  return <>{children}</>;
}

function AccessMessage({ title, description, actionLabel, onAction, href }: { title: string; description: string; actionLabel: string; onAction?: () => void; href?: string }) {
  return <div className="page-shell compliance-layout"><main className="site-width pt-24"><Link href="/" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#47666e] no-underline hover:text-[#102832]"><ArrowLeft size={14} /> Back to overview</Link><section className="rule-card mx-auto mt-12 max-w-2xl p-8 text-center sm:p-12"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#dff8f3] text-[#0f988c]"><LockKeyhole size={25} /></span><div className="eyebrow mt-6">Protected operational workspace</div><h1 className="mt-4 text-[44px] font-bold leading-[.94] tracking-[-.06em]">{title}</h1><p className="body-copy mx-auto mt-5 max-w-xl text-[15px]">{description}</p>{href ? <Link href={href} className="button-primary mt-8 no-underline">{actionLabel} <ArrowUpRight size={16} /></Link> : <button className="button-primary mt-8" onClick={onAction}>{actionLabel} <ArrowUpRight size={16} /></button>}</section></main></div>;
}
