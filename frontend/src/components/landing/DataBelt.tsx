"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function DataBelt() {
  const items = [
    { num: "10,000+", label: "日均处理" },
    { num: "99.9%", label: "准时投递" },
    { num: "5 分钟", label: "完成接入" },
  ];

  return (
    <motion.section
      {...fadeInUp}
      className="bg-ink py-8 md:py-5"
    >
      <div className="max-w-[1080px] mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center">
            <div className="text-center px-6 md:px-16">
              <span className="font-mono text-[20px] md:text-[24px] text-vermilion font-bold">
                {item.num}
              </span>
              <span className="block font-sans text-[11px] md:text-[12px] text-white/70 mt-1">
                {item.label}
              </span>
            </div>
            {i < items.length - 1 && (
              <span className="text-white/20 font-mono text-[16px] select-none hidden md:inline">
                |
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
