import { Link } from "wouter";

export default function BrandMark({ dark = false }: { dark?: boolean }) {
  return <Link href="/" className={`flex items-center gap-2 no-underline ${dark ? "text-white" : "text-[#102832]"}`} aria-label="KindRoute home"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#e7fbf8] shadow-sm"><img src="/manus-storage/kindroute-mark-selected_d681c890.png" alt="" className="h-full w-full object-contain" /></span><span className="text-[14px] font-bold tracking-[-.045em]">KindRoute</span></Link>;
}
