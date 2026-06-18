"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SealLogo from "@/components/SealLogo";
import { getCurrentUser } from "@/lib/api";
import {
  LayoutDashboard,
  Mail,
  GitBranch,
  Radio,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "总台", href: "/dashboard", icon: LayoutDashboard },
  { label: "信件记录", href: "/dashboard/logs", icon: Mail },
  { label: "投递规则", href: "/dashboard/rules", icon: GitBranch },
  { label: "驿路渠道", href: "/dashboard/channels", icon: Radio },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("admin");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setUserName(user.email);
  }, []);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[200px] bg-ink flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-white/10">
        <SealLogo variant="light" size={36} />
        <span className="font-serif text-[18px] text-white font-bold">
          信驿
        </span>
      </div>

      {/* 导航 */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-sm transition-colors duration-150 ${
                isActive
                  ? "bg-vermilion/25 border-l-[3px] border-vermilion text-white"
                  : "text-white/65 hover:bg-white/[0.06] border-l-[3px] border-transparent"
              }`}
            >
              <Icon
                size={15}
                className={isActive ? "text-white" : "text-white/50"}
              />
              <span className="font-sans text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部 */}
      <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
        <span className="font-sans text-[12px] text-white/50 truncate max-w-[120px]">
          {userName}
        </span>
        <button
          onClick={() => {
            localStorage.removeItem("mailhub_token");
            localStorage.removeItem("mailhub_email");
            router.push("/login");
          }}
          className="font-sans text-[12px] text-white/40 hover:text-white transition-opacity"
        >
          退出
        </button>
      </div>
    </aside>
  );
}
