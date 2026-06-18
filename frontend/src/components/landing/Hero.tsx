"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function Hero() {
  return (
    <section className="pt-24 md:pt-28 pb-12 md:pb-16 px-4 md:px-6">
      <div className="max-w-[1080px] mx-auto text-center">
        {/* Badge */}
        <motion.div {...fadeInUp} className="mb-8 md:mb-10">
          <span className="inline-block border border-scroll bg-paper-light px-3 py-1 rounded-sm font-sans text-[12px] md:text-[13px] text-brush">
            <span className="text-vermilion mr-1">✦</span>
            现已支持企业微信群机器人
          </span>
        </motion.div>

        {/* 主标题 */}
        <motion.h1
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
          className="font-serif font-bold text-ink leading-tight tracking-wide"
          style={{ fontSize: "clamp(32px, 6vw, 72px)" }}
        >
          书信千里，
          <br />
          <span className="text-vermilion">一驿</span>转达。
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
          className="mt-6 md:mt-8 mx-auto font-sans text-[15px] md:text-[17px] text-brush leading-[2] max-w-[520px] md:whitespace-nowrap"
        >
          汇聚各平台邮件，按规则自动转达至企微、飞书、邮箱。
        </motion.p>

        {/* CTA */}
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.3 }}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6"
        >
          <a
            href="/login"
            className="font-sans text-[15px] text-white bg-vermilion px-8 py-3 rounded hover:bg-vermilion-dark transition-colors duration-200 w-full sm:w-auto text-center"
          >
            开始部署
          </a>
          <a
            href="https://github.com/caoyek/MailHub"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[15px] text-brush hover:text-vermilion transition-colors duration-200"
          >
            阅读文档 →
          </a>
        </motion.div>

        {/* Mockup */}
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.4 }}
          className="mt-16 border border-scroll rounded overflow-hidden bg-paper-light shadow-paper-lg hidden md:block"
        >
          <div className="w-full h-[380px] flex">
            {/* 台头 */}
            <div className="w-full flex flex-col">
              {/* 顶部深色条 */}
              <div className="bg-ink px-6 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-vermilion" />
                <span className="font-serif text-[12px] text-white/80 tracking-wider">
                  信驿 · 管理台账
                </span>
              </div>
              {/* 内容区 */}
              <div className="flex flex-1">
                {/* 左侧菜单 */}
                <div className="w-[160px] bg-paper border-r border-scroll py-4 px-3">
                  {["总台", "信件记录", "投递规则", "驿路渠道"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`py-2 px-3 mb-1 font-serif text-[12px] rounded-sm ${
                          i === 0
                            ? "text-white bg-vermilion/20 border-l-[3px] border-vermilion"
                            : "text-brush/60"
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
                {/* 右侧内容 */}
                <div className="flex-1 p-5">
                  {/* 统计格 */}
                  <div className="flex flex-nowrap border border-scroll mb-4">
                    {[
                      { label: "今日来信", value: "42" },
                      { label: "准时投达", value: "40" },
                      { label: "在用驿路", value: "3" },
                      { label: "平均耗时", value: "138ms" },
                    ].map((item, i, arr) => (
                      <div
                        key={item.label}
                        className={`flex-1 px-4 py-3 ${
                          i < arr.length - 1
                            ? "border-r border-scroll"
                            : ""
                        }`}
                      >
                        <div className="font-serif text-[10px] text-brush tracking-wider">
                          {item.label}
                        </div>
                        <div className="font-serif text-[20px] text-vermilion font-bold mt-1">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* 模拟表格 */}
                  <div className="border border-scroll">
                    <div className="bg-ink px-4 py-2 flex items-center">
                      <span className="font-serif text-[10px] text-white/70 tracking-wider w-[60px]">收信时间</span>
                      <span className="font-serif text-[10px] text-white/70 tracking-wider w-[130px]">发件方</span>
                      <span className="font-serif text-[10px] text-white/70 tracking-wider flex-1">信件主题</span>
                      <span className="font-serif text-[10px] text-white/70 tracking-wider w-[36px] text-right">状态</span>
                    </div>
                    {[
                      {
                        time: "09:32",
                        from: "alert@monitoring",
                        subject: "CPU 使用率超过 90%",
                        status: "达",
                      },
                      {
                        time: "09:15",
                        from: "report@analytics",
                        subject: "日报：数据汇总",
                        status: "达",
                      },
                      {
                        time: "08:45",
                        from: "alert@monitoring",
                        subject: "磁盘空间不足",
                        status: "误",
                      },
                      {
                        time: "08:30",
                        from: "team@company",
                        subject: "周报：工作总结",
                        status: "达",
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2.5 flex items-center border-b border-scroll ${
                          i % 2 === 0 ? "bg-paper-light" : "bg-paper"
                        }`}
                      >
                        <span className="font-serif text-[11px] text-brush w-[60px]">
                          {row.time}
                        </span>
                        <span className="font-serif text-[11px] text-ink w-[130px] truncate">
                          {row.from}
                        </span>
                        <span className="font-serif text-[11px] text-ink flex-1 truncate">
                          {row.subject}
                        </span>
                        <span
                          className={`font-serif text-[11px] font-medium w-[36px] text-right ${
                            row.status === "达"
                              ? "text-ink-green"
                              : "text-vermilion"
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
