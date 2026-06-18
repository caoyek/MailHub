"use client";

import { motion } from "framer-motion";
import SealLogo from "@/components/SealLogo";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function Footer() {
  return (
    <>
      {/* 尾部 CTA */}
      <motion.section
        {...fadeInUp}
        className="py-14 md:py-20 px-4 md:px-6"
      >
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="mb-8 md:mb-10 flex items-center justify-center gap-3">
            <span className="text-[8px] text-scroll">◆</span>
            <div className="w-24 h-px bg-scroll" />
            <span className="text-[8px] text-scroll">◆</span>
          </div>
          <h2 className="font-serif text-[24px] md:text-[32px] text-ink font-bold">
            准备好了吗？
          </h2>
          <p className="font-sans text-[14px] text-brush mt-3">
            自建部署，数据不离境，永久免费。
          </p>
          <a
            href="/login"
            className="inline-block mt-6 md:mt-8 font-sans text-[14px] md:text-[15px] text-white bg-vermilion px-8 md:px-10 py-3 md:py-3.5 rounded hover:bg-vermilion-dark transition-colors duration-200"
          >
            立即部署，开设驿站
          </a>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-scroll py-6 px-4 md:px-6">
        <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SealLogo variant="dark" size={28} />
            <span className="font-serif text-[14px] text-ink">
              信驿 MailHub
            </span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "功能", href: "#features" },
              { label: "文档", href: "https://github.com/caoyek/MailHub" },
              { label: "GitHub", href: "https://github.com/caoyek/MailHub" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="font-sans text-[13px] text-brush hover:text-vermilion transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="text-center mt-6">
          <span className="font-sans text-[13px] text-brush">
            © 2025 MailHub · 一封信，必达。
          </span>
        </div>
      </footer>
    </>
  );
}
