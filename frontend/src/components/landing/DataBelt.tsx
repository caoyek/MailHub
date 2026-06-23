"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "10,000+", label: "日均处理", icon: "封" },
  { value: "99.9%", label: "准时投递", icon: "达" },
  { value: "5 分钟", label: "完成接入", icon: "速" },
];

export default function DataBelt() {
  return (
    <section className="relative bg-[#FDF8F0] py-14 md:py-16 overflow-hidden border-y border-[#D4C9B5]">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`flex items-center gap-6 ${
                i < stats.length - 1 ? "md:pr-12 md:border-r md:border-[#D4C9B5]" : ""
              } ${i > 0 ? "md:pl-12" : ""}`}
            >
              {/* 中式字符标 */}
              <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                <span className="font-serif text-[#1a1a1a] text-[22px] md:text-[26px] font-bold">
                  {stat.icon}
                </span>
              </div>
              <div>
                <div className="font-mono text-[28px] md:text-[34px] text-[#1A1714] font-bold leading-none tracking-tight">
                  {stat.value}
                </div>
                <div className="font-sans text-[12px] text-[#6B5A45] mt-1.5 tracking-wider">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
