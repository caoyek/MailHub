"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SealLogo from "@/components/SealLogo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "功能", href: "#features" },
    { label: "接入指南", href: "#how-it-works" },
    { label: "GitHub", href: "https://github.com/caoyek/MailHub" },
  ];

  return (
    <motion.nav
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#F5F0E8]/90 backdrop-blur-md border-b border-[#D4C9B5]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* 左：品牌 */}
        <a href="#" className="flex items-center gap-3 group">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <SealLogo variant="dark" size={34} />
          </motion.div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[18px] text-[#1A1714] font-bold tracking-wider">
              信驿
            </span>
            <span className="font-mono text-[11px] text-[#6B5A45] tracking-widest hidden sm:inline">
              MAILHUB
            </span>
          </div>
        </a>

        {/* 中：导航 */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              className="font-sans text-[14px] text-[#6B5A45] hover:text-[#1A1714] transition-colors duration-300 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C0392B] transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </div>

        {/* 右：CTA */}
        <div className="flex items-center gap-4">
          <motion.a
            href="/login"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="hidden sm:inline-block font-sans text-[13px] text-white bg-[#C0392B] px-5 py-1.5 rounded-sm hover:bg-[#A93226] transition-colors duration-300 tracking-wider"
          >
            开设驿站
          </motion.a>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label="菜单"
          >
            <span className={`block w-5 h-px bg-[#1A1714] transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
            <span className={`block w-5 h-px bg-[#1A1714] transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#F5F0E8]/95 backdrop-blur-md border-t border-[#D4C9B5] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="block font-sans text-[14px] text-[#6B5A45] hover:text-[#1A1714] py-2 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/login"
                className="block font-sans text-[13px] text-[#C0392B] py-2 tracking-wider"
              >
                开设驿站 →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
