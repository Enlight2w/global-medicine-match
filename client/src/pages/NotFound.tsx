import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() { return <main className="grid min-h-screen place-items-center p-6"><div className="rule-card max-w-md p-8 text-center"><div className="eyebrow">404 / route unavailable</div><h1 className="mt-4 text-[48px] font-bold leading-none tracking-[-.07em]">Nothing to route here.</h1><p className="body-copy mt-4 text-[14px]">Return to the safe medicine-redistribution overview.</p><Link href="/" className="button-primary mt-6 no-underline"><ArrowLeft size={15} /> Back to overview</Link></div></main>; }
