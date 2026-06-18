"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "总台", sub: "今日台账" },
  "/dashboard/logs": { title: "信件记录", sub: "往来信函" },
  "/dashboard/rules": { title: "投递规则", sub: "分拣规则" },
  "/dashboard/channels": { title: "驿路渠道", sub: "渠道管理" },
};

export default function Topbar() {
  const pathname = usePathname();
  const info = pageTitles[pathname] || { title: "信驿", sub: "" };
  const [initial, setInitial] = useState("A");

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.email) {
      setInitial(user.email.charAt(0).toUpperCase());
    }
  }, []);

  return (
    <header className="h-12 bg-paper-light border-b border-scroll flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="font-serif text-[15px] text-ink font-bold">
          {info.title}
        </span>
        {info.sub && (
          <>
            <span className="text-brush/40 text-[13px]">/</span>
            <span className="font-sans text-[13px] text-brush">
              {info.sub}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-green inline-block" />
          <span className="font-sans text-[12px] text-brush">
            驿站运转中
          </span>
        </div>
        <span className="text-scroll">|</span>
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
          <span className="font-serif text-[12px] text-white">{initial}</span>
        </div>
      </div>
    </header>
  );
}
