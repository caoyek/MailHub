"use client";

import { motion } from "framer-motion";
import { InkSplashSVG } from "./VisualEffects";

/* ═══════════════════════════════════════════════
   传驿之道 — 水墨风格（居中版）
   
   展示信驿的工作流程
   ═══════════════════════════════════════════════ */

const steps = [
  {
    num: "壹",
    title: "收信",
    en: "Receive",
    poem: "鸿雁传书，千里不绝",
    desc: "IMAP 协议接入，自动轮询各平台邮箱，统一汇聚至信驿总台。",
  },
  {
    num: "贰",
    title: "拆封",
    en: "Process",
    poem: "抽丝剥茧，明察秋毫",
    desc: "按发件人、主题、正则表达式，精准匹配投递规则，自动分拣归类。",
  },
  {
    num: "叁",
    title: "投递",
    en: "Deliver",
    poem: "使命必达，分秒必争",
    desc: "多渠道即时转发——企微群机器人、飞书 Webhook、邮箱 SMTP，一封多投。",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative min-h-screen py-20 md:py-32 px-6">
      {/* 章节标题 - 居中 */}
      <motion.div
        className="mb-16 md:mb-24 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="font-calligraphy-xing text-4xl md:text-6xl text-[#1a1a1a] mb-4">
          传驿之道
        </h2>
        <p className="text-sm font-serif tracking-[0.6em] text-[#D4AF37] uppercase mb-4">
          How It Works
        </p>
        <div className="h-[2px] bg-[#1a1a1a]/20 w-16 mx-auto mb-6" />
        <p className="font-body-kai text-lg md:text-xl text-[#666] italic">
          「三道传驿，书信必达。」
        </p>
      </motion.div>

      {/* 三步骤卡片 - 居中排列 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.2, ease: "easeOut" }}
            className="group relative aspect-[3/4] overflow-hidden bg-white shadow-lg transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
          >
            {/* 背景墨迹 */}
            <div className="absolute inset-0 z-10 opacity-10 group-hover:opacity-25 transition-opacity duration-700">
              <InkSplashSVG className="w-full h-full text-[#333] scale-150 rotate-45" />
            </div>

            {/* 内容层 */}
            <div className="absolute inset-0 p-6 md:p-8 z-20 flex flex-col items-center justify-between h-full bg-[#FAF0E6]/85 transition-all duration-500 group-hover:bg-[#FAF0E6]/40 text-center">
              {/* 顶部：序号 */}
              <div className="pt-4">
                <span className="font-calligraphy-cao text-3xl text-[#1a1a1a]/50">
                  {step.num}
                </span>
              </div>

              {/* 中间：竖排诗句 */}
              <div className="flex-1 flex items-center">
                <p className="font-calligraphy-xingcao text-lg md:text-xl text-[#333]/60 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {step.poem}
                </p>
              </div>

              {/* 底部：标题 + 描述 */}
              <div className="pb-4">
                <h3 className="font-calligraphy-xing text-3xl md:text-4xl text-[#1a1a1a] group-hover:text-[#333] transition-colors mb-2">
                  {step.title}
                </h3>
                <span className="font-serif text-[10px] tracking-widest text-[#999] uppercase block mb-3">
                  {step.en}
                </span>
                <p className="font-body-kai text-sm text-[#666] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {step.desc}
                </p>
              </div>
            </div>

            {/* 纸张纹理 */}
            <div className="absolute inset-0 bg-repeat opacity-[0.03] pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")'}} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
