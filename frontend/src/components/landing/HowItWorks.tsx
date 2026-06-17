"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function HowItWorks() {
  const steps = [
    {
      label: "驿一",
      title: "收信",
      desc: "接入邮箱 IMAP，汇聚各平台来信",
    },
    {
      label: "驿二",
      title: "拆封",
      desc: "按规则解析标题、发件人、正文",
    },
    {
      label: "驿三",
      title: "投递",
      desc: "分发到企微、飞书、邮箱等渠道",
    },
  ];

  return (
    <motion.section
      {...fadeInUp}
      className="py-14 md:py-20 px-4 md:px-6 border-y border-scroll"
    >
      <div className="max-w-[1080px] mx-auto">
        {/* 标题 */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-serif text-[22px] md:text-[28px] text-ink font-bold">
            三道传驿，书信必达
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[8px] text-scroll">◆</span>
            <div className="w-16 h-px bg-scroll" />
            <span className="text-[8px] text-scroll">◆</span>
          </div>
        </div>

        {/* 三步骤 */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className={`px-8 py-6 text-center ${
                i < steps.length - 1
                  ? "md:border-r border-scroll"
                  : ""
              } ${i < steps.length - 1 ? "border-b md:border-b-0 border-scroll" : ""}`}
            >
              <div className="font-serif text-[12px] text-vermilion tracking-widest">
                {step.label}
              </div>
              <div className="font-serif text-[20px] text-ink font-bold mt-2">
                {step.title}
              </div>
              <div className="font-sans text-[14px] text-brush leading-[2] mt-3">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
