"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLogs as apiGetLogs } from "@/lib/api";
import type { MailLog } from "@/types";

export default function LogsPage() {
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    date_from: "",
    date_to: "",
  });

  const pageSize = 20;

  const loadLogs = useCallback(async () => {
    try {
      const apiFilters: Record<string, string> = {};
      if (filters.status) apiFilters.status = filters.status;
      if (filters.search) apiFilters.from_addr = filters.search;
      if (filters.date_from) apiFilters.date_from = filters.date_from;
      if (filters.date_to) apiFilters.date_to = filters.date_to;
      const res = await apiGetLogs(page, pageSize, apiFilters);
      if (res.code === 0 && res.data) {
        setLogs(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch { /* ignore */ }
  }, [page, filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-0">
      {/* 筛选栏 */}
      <div className="border-t border-b border-scroll bg-paper-light px-6 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-serif text-[12px] text-brush">按日期</span>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => { setFilters({ ...filters, date_from: e.target.value }); setPage(1); }}
            className="h-[34px] border border-scroll bg-paper px-3 font-sans text-[13px] text-ink rounded-sm focus:border-vermilion focus:outline-none"
          />
          <span className="font-sans text-[12px] text-brush">至</span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => { setFilters({ ...filters, date_to: e.target.value }); setPage(1); }}
            className="h-[34px] border border-scroll bg-paper px-3 font-sans text-[13px] text-ink rounded-sm focus:border-vermilion focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-[12px] text-brush">按状态</span>
          <select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
            className="h-[34px] border border-scroll bg-paper px-3 font-sans text-[13px] text-ink rounded-sm focus:border-vermilion focus:outline-none"
          >
            <option value="">全部</option>
            <option value="success">已达</option>
            <option value="fail">误投</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索发件人…"
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
            className="h-[34px] border border-scroll bg-paper px-3 font-sans text-[13px] text-ink rounded-sm w-56 focus:border-vermilion focus:outline-none"
          />
        </div>
      </div>

      {/* 表格 */}
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
            <AnimatePresence>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 font-sans text-[13px] text-brush">
                    暂无记录
                  </td>
                </tr>
              )}
              {logs.map((log, i) => (
                <LogsRow
                  key={log.id}
                  log={log}
                  index={i}
                  expanded={expandedId === log.id}
                  onToggle={() =>
                    setExpandedId(expandedId === log.id ? null : log.id)
                  }
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 border border-scroll rounded-sm font-sans text-[13px] transition-colors ${
                p === page
                  ? "bg-vermilion text-white border-vermilion"
                  : "bg-paper-light text-ink hover:border-vermilion"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LogsRow({
  log,
  index,
  expanded,
  onToggle,
}: {
  log: MailLog;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b border-scroll cursor-pointer transition-colors ${
          index % 2 === 0 ? "bg-paper-light" : "bg-paper"
        } hover:bg-paper-light/80`}
      >
        <td className="font-mono text-[13px] text-brush px-4 py-3">
          {log.received_at?.slice(5, 16)}
        </td>
        <td className="font-sans text-[13px] text-brush px-4 py-3">
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
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={7} className="bg-paper border-t border-b border-scroll">
              <div className="px-6 py-4 space-y-3">
                <p className="font-sans text-[13px] text-brush italic leading-relaxed">
                  {log.body_preview}
                </p>
                <div className="font-sans text-[12px] text-ink">
                  <span className="text-brush">匹配规则：</span>
                  {log.matched_rule || "无"}
                </div>
                <div className="font-sans text-[12px] text-ink">
                  <span className="text-brush">投递结果：</span>
                  {log.targets?.map((t) => (
                    <span key={t} className="mr-3">
                      {t} —{" "}
                      <span
                        className={
                          log.status === "success"
                            ? "text-ink-green"
                            : "text-vermilion"
                        }
                      >
                        {log.status === "success" ? "达" : "误"}
                      </span>
                    </span>
                  )) || "未投递"}
                </div>
                {log.error_msg && (
                  <div className="font-sans text-[12px] text-vermilion">
                    错误信息：{log.error_msg}
                  </div>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
