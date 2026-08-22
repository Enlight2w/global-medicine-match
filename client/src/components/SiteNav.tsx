import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import BrandMark from "./BrandMark";

export default function SiteNav() {
  const [open, setOpen] = useState(false); const [location] = useLocation();
  const links = [{ href: "/coverage", label: "Coverage map" }, { href: "/find-medicine", label: "Find medicine" }, { href: "/ai-compliance", label: "AI compliance" }, { href: "/inventory-feeds", label: "Inventory feeds" }, { href: "/admin-approvals", label: "Admin queue" }];
  return <header className="site-width relative z-20 pt-5"><nav className="nav-glass flex min-h-14 items-center justify-between rounded-2xl px-4 sm:px-5"><BrandMark /><div className="hidden items-center gap-3 xl:flex">{links.map(link => <Link key={link.href} href={link.href} className={`text-[11px] font-medium no-underline transition-colors ${location === link.href ? "text-[#102832]" : "text-[#587076] hover:text-[#102832]"}`}>{link.label}</Link>)}</div><Link href="/workspace" className="button-primary hidden no-underline md:inline-flex">Start onboarding</Link><button type="button" onClick={() => setOpen(value => !value)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#d9e8e7] bg-white xl:hidden" aria-label="Toggle navigation">{open ? <X size={18} /> : <Menu size={18} />}</button></nav>{open && <div className="nav-glass mt-2 grid rounded-2xl p-3 xl:hidden">{links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-[#28464e] no-underline hover:bg-[#eaf8f6]">{link.label}</Link>)}<Link href="/patients" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-[#28464e] no-underline hover:bg-[#eaf8f6]">For patients</Link><Link href="/workspace" onClick={() => setOpen(false)} className="button-primary mt-2 no-underline">Start onboarding</Link></div>}</header>;
}

