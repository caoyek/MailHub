"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useLiveStream } from "@/hooks/useLiveStream";
import {
  getStats as apiGetStats,
  getStatsRange as apiGetStatsRange,
  getLogs as apiGetLogs,
} from "@/lib/api";
import type { DayStats, MailLog } from "@/types";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<DayStats>({ total: 0, success: 0, failed: 0, by_channel: {}, avg_duration_ms: 0 });
  const [weekData, setWeekData] = useState<Record<string, DayStats>>({});
  const { events } = useLiveStream(30);
  const [recentLogs, setRecentLogs] = useState<MailLog[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, rangeRes, logsRes] = await Promise.all([
          apiGetStats(),
          apiGetStatsRange(7),
          apiGetLogs(1, 6),
        ]);
        if (statsRes.code === 0) setStats(statsRes.data);
        if (rangeRes.code === 0) setWeekData(rangeRes.data || {});
        if (logsRes.code === 0 && logsRes.data) setRecentLogs(logsRes.data.items || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const slideDown = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  // 图表数据
  const chartData = Object.entries(weekData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, s]) => ({
      date: date.slice(5),
      来信: s.total,
    }));

  // 成功率
  const successRate =
    stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : "0";
  const channelCount = Object.keys(stats.by_channel).length;

  return (
    <div className="space-y-6">
      {/* 顶部统计 */}
      <div className="border border-scroll bg-paper-light flex">
        {[
          { label: "今日来信", value: stats.total },
          { label: "准时投达", value: `${successRate}%` },
          { label: "在用驿路", value: channelCount },
          { label: "平均耗时", value: `${stats.avg_duration_ms}ms` },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={`flex-1 px-6 py-5 ${
              i < arr.length - 1 ? "border-r border-scroll" : ""
            }`}
          >
            <div className="font-serif text-[11px] text-brush tracking-wider">
              {item.label}
            </div>
            <span className="block font-mono text-[32px] text-vermilion font-bold mt-1.5">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* 中部 6:4 */}
      <div className="grid grid-cols-1 lg:grid-cols-[6fr_4fr] gap-6">
        {/* 七日图表 */}
        <div className="border border-scroll bg-paper-light p-5">
          <h3 className="font-serif text-[14px] text-ink border-b border-scroll pb-3 mb-4">
            近七日来信统计
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD0B3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B5A45", fontSize: 12, fontFamily: "var(--font-sans)" }}
                axisLine={{ stroke: "#DDD0B3" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B5A45", fontSize: 12, fontFamily: "var(--font-sans)" }}
                axisLine={{ stroke: "#DDD0B3" }}
                tickLine={false}
              />
              <Bar dataKey="来信" fill="#C0392B" barSize={20} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 实时动态 */}
        <div className="border border-scroll bg-paper-light p-5">
          <h3 className="font-serif text-[14px] text-ink border-b border-scroll pb-3 mb-4">
            实时动态
          </h3>
          <div className="space-y-0 overflow-y-hidden" style={{ maxHeight: 220 }}>
            {(events.length > 0 ? events : recentLogs).map((log, i) => (
              <motion.div
                key={log.id + i}
                {...slideDown}
                className="py-2 border-b border-scroll/50 last:border-0"
              >
                <span className="font-mono text-[12px] text-brush">
                  {log.received_at?.slice(11, 16) || "--:--"}
                </span>
                <span className="font-sans text-[12px] text-ink ml-2">
                  {log.from_addr?.split("@")[0] || "unknown"}
                </span>
                <span className="text-brush/40 mx-1">→</span>
                <span className="font-sans text-[12px] text-ink">
                  {log.matched_rule || "—"}
                </span>
                <span className="text-brush/40 mx-1">→</span>
                <span className="font-sans text-[12px] text-brush">
                  {log.targets?.join(", ") || "—"}
                </span>
                <span
                  className={`ml-2 font-sans text-[12px] font-medium ${
                    log.status === "success" ? "text-ink-green" : "text-vermilion"
                  }`}
                >
                  {log.status === "success" ? "达" : "误"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部表格 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-[14px] text-ink">近期往来</h3>
          <Link
            href="/dashboard/logs"
            className="font-sans text-[13px] text-vermilion hover:underline"
          >
            查阅全部 →
          </Link>
        </div>
        <div className="border border-scroll overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-ink">
                {["收信时间", "收信邮箱", "发件方", "信件主题", "命中规则", "投递渠道", "状态"].map(
                  (h) => (
                    <th
                      key={h}
                      className="font-serif text-[12px] text-white/80 tracking-wider text-left px-4 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {recentLogs.slice(0, 5).map((log, i) => (
                <tr
                  key={log.id}
                  className={`border-b border-scroll ${
                    i % 2 === 0 ? "bg-paper-light" : "bg-paper"
                  }`}
                >
                  <td className="font-mono text-[13px] text-brush px-4 py-3">
                    {log.received_at?.slice(5, 16)}
                  </td>
                  <td className="font-sans text-[13px] text-ink px-4 py-3">
                    {log.account_name || "—"}
                  </td>
                  <td className="font-sans text-[13px] text-ink px-4 py-3">
                    {log.from_addr}
                  </td>
                  <td className="font-sans text-[13px] text-ink px-4 py-3 max-w-[200px] truncate">
                    {log.subject}
                  </td>
                  <td className="font-sans text-[13px] text-brush px-4 py-3">
                    {log.matched_rule || "—"}
                  </td>
                  <td className="font-sans text-[13px] text-brush px-4 py-3">
                    {log.targets?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block font-sans text-[12px] px-2 py-0.5 rounded-sm ${
                        log.status === "success"
                          ? "text-ink-green bg-ink-green-light"
                          : "text-vermilion bg-vermilion-light"
                      }`}
                    >
                      {log.status === "success" ? "已达" : "误投"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
