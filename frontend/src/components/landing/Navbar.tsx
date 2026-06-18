"use client";

import { useState, useEffect } from "react";
import SealLogo from "@/components/SealLogo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-scroll transition-all duration-200 ${
        scrolled
          ? "bg-paper/[0.92] backdrop-blur-sm"
          : "bg-paper"
      }`}
    >
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* 左 */}
        <div className="flex items-center gap-2 md:gap-3">
          <SealLogo variant="dark" size={32} />
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[16px] md:text-[18px] text-ink font-bold">
              信驿
            </span>
            <span className="font-sans text-[12px] text-brush hidden sm:inline">MailHub</span>
          </div>
        </div>

        {/* 中 */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "功能", href: "#features" },
            { label: "接入指南", href: "#how-it-works" },
            { label: "更新日志", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-sans text-[14px] text-brush hover:text-vermilion transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* 右 */}
        <div className="flex items-center">
          <a
            href="/login"
            className="font-sans text-[13px] md:text-[14px] text-white bg-vermilion px-4 md:px-5 py-1.5 md:py-2 rounded hover:bg-vermilion-dark transition-colors duration-200"
          >
            立即部署
          </a>
        </div>
      </div>
    </nav>
  );
}
