"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════
   功能致理 — 水墨风格（居中版）
   
   展示信驿的核心功能特性
   ═══════════════════════════════════════════════ */

const features = [
  { 
    char: "收", 
    title: "收件统一", 
    en: "Unified Inbox",
    desc: "支持 QQ、163、Gmail、企业邮箱等主流 IMAP 协议，多账户统一接入，一封不漏。" 
  },
  { 
    char: "规", 
    title: "规则路由", 
    en: "Smart Rules",
    desc: "按发件人、主题关键词、正则表达式精准匹配，支持优先级排序与多条件组合。" 
  },
  { 
    char: "达", 
    title: "企微直达", 
    en: "WeChat Direct",
    desc: "企业微信群机器人 Webhook 一键接入，重要邮件秒达群聊，运维告警零延迟。" 
  },
  { 
    char: "渠", 
    title: "渠道扩展", 
    en: "Multi-Channel",
    desc: "支持企微、飞书、邮箱 SMTP 多渠道并行投递，一封多投，信息无死角覆盖。" 
  },
  { 
    char: "账", 
    title: "实时台账", 
    en: "Real-time Logs",
    desc: "WebSocket 实时推送收发记录，Dashboard 图表可视化，每一封信的轨迹清晰可查。" 
  },
  { 
    char: "重", 
    title: "故障重投", 
    en: "Auto Retry",
    desc: "投递失败自动重试，错误日志完整记录，支持手动重发，确保每封信必达。" 
  },
];

export default function Features() {
  return (
    <section id="features" className="relative min-h-screen py-20 md:py-32 px-6 bg-[#FFFFF0]">
      {/* 章节标题 - 居中 */}
      <motion.div
        className="mb-16 md:mb-24 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="font-calligraphy-xing text-4xl md:text-6xl text-[#1a1a1a] mb-4">
          功能致理
        </h2>
        <p className="text-sm font-serif tracking-[0.6em] text-[#D4AF37] uppercase mb-4">
          Core Features
        </p>
        <div className="h-[2px] bg-[#1a1a1a]/20 w-16 mx-auto mb-6" />
        <p className="font-body-kai text-lg md:text-xl text-[#666] italic">
          「工欲善其事，必先利其器。」
        </p>
      </motion.div>

      {/* 功能网格 - 居中 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {features.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            className="group relative bg-white/50 border border-[#1a1a1a]/10 p-6 md:p-8 text-center hover:border-[#1a1a1a]/30 transition-all duration-500"
          >
            {/* 大字装饰 */}
            <div className="relative mb-4">
              <span className="text-[100px] md:text-[120px] font-calligraphy-cao text-[#1a1a1a] opacity-[0.06] group-hover:opacity-10 transition-all duration-700 leading-none select-none">
                {item.char}
              </span>
            </div>

            {/* 标题 */}
            <h3 className="font-calligraphy-xing text-2xl md:text-3xl text-[#333] mb-2">
              {item.title}
            </h3>
            <span className="font-serif text-[10px] tracking-widest text-[#999] uppercase block mb-4">
              {item.en}
            </span>

            {/* 描述 */}
            <p className="font-body-kai text-sm md:text-base text-[#666] leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
