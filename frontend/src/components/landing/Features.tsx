"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function Features() {
  const features = [
    {
      name: "收件统一",
      desc: "所有平台来信，统一投入一个信箱",
    },
    {
      name: "规则路由",
      desc: "按发件人、主题自动分拣，投送指定渠道",
    },
    {
      name: "企微直达",
      desc: "群机器人 Webhook，消息即时送达",
    },
    {
      name: "渠道扩展",
      desc: "新增渠道如同开辟新驿路，一个类继承",
    },
    {
      name: "实时台账",
      desc: "每封信的去向，逐条记录在案",
    },
    {
      name: "故障重投",
      desc: "投递失败，自动补寄，最多三次",
    },
  ];

  return (
    <motion.section
      id="features"
      {...fadeInUp}
      className="py-14 md:py-20 px-4 md:px-6"
    >
      <div className="max-w-[1080px] mx-auto">
        {/* 标题 */}
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-serif text-[22px] text-ink font-bold whitespace-nowrap">
            功能细则
          </h2>
          <div className="flex-1 border-t border-scroll" />
        </div>

        {/* 两列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {features.map((feat) => (
            <div
              key={feat.name}
              className="border-b border-scroll py-3.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-vermilion text-[12px]">◆</span>
                <span className="font-serif text-[14px] text-ink font-bold">
                  {feat.name}
                </span>
              </div>
              <p className="font-sans text-[13px] text-brush leading-[1.8] mt-1 pl-5">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
