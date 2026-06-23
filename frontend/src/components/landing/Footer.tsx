"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════
   问道 / Footer — 水墨风格（居中版）
   
   CTA + 页脚
   ═══════════════════════════════════════════════ */

export default function Footer() {
  return (
    <>
      {/* CTA 区域 */}
      <section id="contact" className="relative min-h-screen bg-[#F5F0E8] py-20 md:py-32 px-6 text-[#1a1a1a] flex flex-col items-center justify-center">
        {/* 背景大字 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="text-[40vw] font-calligraphy-cao leading-none text-[#1a1a1a]">
            缘
          </span>
        </div>

        {/* 主内容 - 居中 */}
        <motion.div
          className="relative z-10 max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <h2 className="font-calligraphy-xing text-[16vw] md:text-[10rem] mb-6">
            问道
          </h2>
          <div className="h-[2px] w-20 bg-[#1a1a1a]/20 mx-auto mb-8" />
          
          <p className="font-body-kai text-xl md:text-2xl leading-loose text-[#333] mb-6">
            「墨香引知己，笔端叙平生。」
          </p>
          <p className="font-body-kai text-base md:text-lg text-[#666] mb-10">
            自建部署，数据不离境，永久免费。
          </p>

          {/* CTA 按钮 */}
          <a
            href="/login"
            className="inline-block w-full max-w-md py-5 md:py-6 bg-transparent border-2 border-[#1a1a1a] font-calligraphy-xing text-2xl md:text-3xl tracking-[0.5em] hover:bg-[#1a1a1a] hover:text-white transition-all duration-500 mb-8"
          >
            开设驿站
          </a>

          {/* 链接 */}
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="https://github.com/caoyek/MailHub"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wider"
            >
              GitHub 源码
            </a>
            <span className="text-[#999]">·</span>
            <a
              href="https://github.com/caoyek/MailHub"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wider"
            >
              部署文档
            </a>
          </div>
        </motion.div>

        {/* 页脚 */}
        <footer className="absolute bottom-8 left-6 right-6 text-center opacity-30 text-[11px] font-serif tracking-[0.4em] border-t border-[#1a1a1a]/10 pt-6">
          <p>© 2025 信驿 MailHub · 一封信，必达</p>
        </footer>
      </section>
    </>
  );
}
