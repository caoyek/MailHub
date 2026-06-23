"use client";

import { InkSplashSVG, BrushStroke } from "./VisualEffects";

/* ═══════════════════════════════════════════════
   Hero 首屏 — 水墨风格（居中版）
   
   「鸿雁传书，一驿通达」
   ═══════════════════════════════════════════════ */

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* 背景墨迹装饰 */}
      <div className="absolute left-[-5%] bottom-0 opacity-10 scale-150 pointer-events-none">
        <InkSplashSVG className="w-[600px] h-[600px] text-[#1a1a1a]" />
      </div>
      <div className="absolute right-[-5%] top-0 opacity-5 scale-125 pointer-events-none rotate-180">
        <InkSplashSVG className="w-[500px] h-[500px] text-[#1a1a1a]" />
      </div>

      {/* 雾气效果 */}
      <div className="absolute inset-0 opacity-15 mist-drift pointer-events-none" />

      {/* 主内容 - 居中 */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        {/* 顶部标语 */}
        <div className="mb-6 flex items-center justify-center gap-4 opacity-0 animate-fade-in">
          <span className="text-[#D4AF37] tracking-[0.6em] font-serif text-xs uppercase">
            岁在乙巳 · 鸿雁传书
          </span>
        </div>
        <div className="flex justify-center mb-8">
          <BrushStroke width={100} height={4} className="text-[#D4AF37]/40" />
        </div>

        {/* 主标题 */}
        <h1 className="font-calligraphy-xing text-[14vw] md:text-[10vw] lg:text-[8rem] leading-[0.9] text-[#1a1a1a] mb-4 select-none animate-ink-bleed">
          信驿
        </h1>
        <p className="font-serif text-lg md:text-xl text-[#666] tracking-[0.3em] mb-8">
          M A I L H U B
        </p>

        {/* 副标题 */}
        <div className="max-w-lg mx-auto mb-10">
          <p className="font-body-kai text-xl md:text-2xl text-[#333] leading-relaxed mb-6">
            「一驿通达，万邮归一」
          </p>
          <p className="font-body-kai text-base md:text-lg text-[#666] leading-relaxed">
            聚合多邮箱，智能转发，尽在掌握。
          </p>
        </div>

        {/* CTA 按钮组 */}
        <div className="flex flex-wrap justify-center gap-6 items-center">
          <a
            href="/login"
            className="px-8 py-3 border-2 border-[#1a1a1a] font-calligraphy-xing text-lg md:text-xl hover:bg-[#1a1a1a] hover:text-white transition-all duration-500"
          >
            开启信驿
          </a>
          <a
            href="https://github.com/caoyek/MailHub"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border-2 border-[#1a1a1a] font-calligraphy-xing text-lg md:text-xl hover:bg-[#1a1a1a] hover:text-white transition-all duration-500"
          >
            源码部署
          </a>
        </div>
      </div>

      {/* 滚动引导 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30 animate-pulse">
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-[#333]" />
        <span className="font-calligraphy-xing text-xs tracking-widest text-[#666]">
          下 寻
        </span>
      </div>
    </section>
  );
}
