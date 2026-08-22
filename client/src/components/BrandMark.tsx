import { Cross } from "lucide-react";
import { Link } from "wouter";

export default function BrandMark({ dark = false }: { dark?: boolean }) {
  return <Link href="/" className={`flex items-center gap-2 no-underline ${dark ? "text-white" : "text-[#102832]"}`}><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#16b9aa] text-white shadow-sm"><Cross size={16} strokeWidth={2.5} /></span><span className="text-[14px] font-bold tracking-[-.045em]">Global Medicine Match</span></Link>;
}
