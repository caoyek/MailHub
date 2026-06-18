"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRules as apiGetRules,
  addRule as apiAddRule,
  updateRule as apiUpdateRule,
  deleteRule as apiDeleteRule,
  getMailAccounts as apiGetMailAccounts,
} from "@/lib/api";
import type { Rule, MailAccount } from "@/types";
import { X } from "lucide-react";

const cnNumbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [mailAccounts, setMailAccounts] = useState<MailAccount[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editRule, setEditRule] = useState<Rule | null>(null);

  // 表单状态
  const [formName, setFormName] = useState("");
  const [formSourceAccountId, setFormSourceAccountId] = useState("");
  const [formFromContains, setFormFromContains] = useState("");
  const [formSubjectContains, setFormSubjectContains] = useState("");
  const [formTargetType, setFormTargetType] = useState<"wecom" | "email">("wecom");
  const [formTargetValue, setFormTargetValue] = useState("");

  /* ── 数据加载 ── */
  const loadRules = useCallback(async () => {
    try {
      const res = await apiGetRules();
      if (res.code === 0) setRules(res.data || []);
    } catch { /* ignore */ }
  }, []);

  const loadMailAccounts = useCallback(async () => {
    try {
      const res = await apiGetMailAccounts();
      if (res.code === 0) setMailAccounts(res.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadRules();
    loadMailAccounts();
  }, [loadRules, loadMailAccounts]);

  const openCreate = () => {
    setEditRule(null);
    setFormName("");
    setFormSourceAccountId(mailAccounts[0]?.id || "");
    setFormFromContains("");
    setFormSubjectContains("");
    setFormTargetType("wecom");
    setFormTargetValue("");
    setSheetOpen(true);
  };

  const openEdit = (rule: Rule) => {
    setEditRule(rule);
    setFormName(rule.name);
    setFormSourceAccountId(rule.source_account_id || mailAccounts[0]?.id || "");
    setFormFromContains(rule.match.from_contains || "");
    setFormSubjectContains(rule.match.subject_contains || "");
    const t = rule.targets[0];
    if (t) {
      setFormTargetType(t.type);
      setFormTargetValue(t.type === "wecom" ? t.webhook_url || "" : (t.to?.join(", ") || ""));
    }
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;

    if (!formFromContains.trim() && !formSubjectContains.trim()) {
      alert("请至少填写一个匹配条件（发件人包含 或 主题包含）");
      return;
    }

    if (!formTargetValue.trim()) {
      alert(formTargetType === "wecom" ? "请填写 Webhook URL" : "请填写收件邮箱");
      return;
    }

    const target =
      formTargetType === "wecom"
        ? { type: "wecom" as const, webhook_url: formTargetValue }
        : { type: "email" as const, to: formTargetValue.split(",").map((s) => s.trim()) };

    const data = {
      name: formName,
      source_account_id: formSourceAccountId || undefined,
      match: {
        from_contains: formFromContains,
        subject_contains: formSubjectContains,
        subject_regex: null,
      },
      targets: [target],
    };

    try {
      if (editRule) {
        await apiUpdateRule(editRule.id, data);
      } else {
        await apiAddRule({ ...data, priority: rules.length + 1 });
      }
      await loadRules();
    } catch {
      alert("操作失败，请检查后端服务。");
    }
    setSheetOpen(false);
  };

  const toggleEnabled = async (rule: Rule) => {
    try {
      await apiUpdateRule(rule.id, { enabled: !rule.enabled });
      await loadRules();
    } catch {
      alert("操作失败，请检查后端服务。");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认撤除此规则？撤除后不可恢复。")) return;
    try {
      await apiDeleteRule(id);
      await loadRules();
    } catch {
      alert("删除失败，请检查后端服务。");
    }
  };

  const getAccountName = (accountId?: string): string => {
    if (!accountId) return "全部邮箱";
    const acc = mailAccounts.find((a) => a.id === accountId);
    return acc ? acc.name : "未知邮箱";
  };

  return (
    <div className="space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[20px] text-ink font-bold">投递规则</h1>
          <p className="font-sans text-[13px] text-brush mt-1">
            信件按此规则分拣投送
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-vermilion text-white font-sans text-[13px] px-4 py-2 rounded-sm hover:bg-vermilion-dark transition-colors"
        >
          新立规则
        </button>
      </div>

      {/* 规则列表 */}
      <div className="border border-scroll bg-paper-light">
        {rules.map((rule, i) => (
          <div
            key={rule.id}
            className={`flex items-center justify-between px-5 py-4 ${
              i < rules.length - 1 ? "border-b border-scroll" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-serif text-[14px] text-vermilion w-6 text-center">
                {cnNumbers[i] || i + 1}
              </span>
              <span className="font-serif text-[14px] text-ink font-bold">
                {rule.name}
              </span>
              {/* 来源邮箱 */}
              <span className="border border-scroll bg-transparent font-sans text-[11px] text-brush px-2 py-0.5 rounded-sm">
                来源: {getAccountName(rule.source_account_id)}
              </span>
              {/* 匹配条件标签 */}
              {rule.match.from_contains && (
                <span className="border border-scroll bg-transparent font-sans text-[11px] text-brush px-2 py-0.5 rounded-sm">
                  发件含 {rule.match.from_contains}
                </span>
              )}
              {rule.match.subject_contains && (
                <span className="border border-scroll bg-transparent font-sans text-[11px] text-brush px-2 py-0.5 rounded-sm">
                  主题含 {rule.match.subject_contains}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-sans text-[12px] text-brush">
                {rule.targets.map((t) => t.type).join(", ")}
              </span>
              {/* 开关 */}
              <button
                onClick={() => toggleEnabled(rule)}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  rule.enabled ? "bg-vermilion" : "bg-scroll"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    rule.enabled ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
              <button
                onClick={() => openEdit(rule)}
                className="font-sans text-[12px] text-brush hover:text-vermilion transition-colors"
              >
                编改
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                className="font-sans text-[12px] text-brush hover:text-vermilion transition-colors"
              >
                撤除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 右侧抽屉 */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => setSheetOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-[480px] bg-paper border-l border-scroll z-50 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-[18px] text-ink font-bold">
                    {editRule ? "编改投递规则" : "新立投递规则"}
                  </h2>
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="text-brush hover:text-ink"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 规则名 */}
                  <div>
                    <label className="block font-serif text-[12px] text-brush mb-2">
                      规则名
                    </label>
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
                      placeholder="如：监控告警"
                    />
                  </div>

                  {/* 来源邮箱 */}
                  <div>
                    <label className="block font-serif text-[12px] text-brush mb-2">
                      来源邮箱
                    </label>
                    <select
                      value={formSourceAccountId}
                      onChange={(e) => setFormSourceAccountId(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
                    >
                      <option value="">全部邮箱</option>
                      {mailAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.email})
                        </option>
                      ))}
                    </select>
                    <span className="block font-sans text-[11px] text-brush mt-2">
                      此规则监听哪个邮箱的来信，留空则监听全部
                    </span>
                  </div>

                  {/* 发件人包含 */}
                  <div>
                    <label className="block font-serif text-[12px] text-brush mb-2">
                      发件人包含
                    </label>
                    <input
                      value={formFromContains}
                      onChange={(e) => setFormFromContains(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
                      placeholder="如：alert@"
                    />
                  </div>

                  {/* 主题包含 */}
                  <div>
                    <label className="block font-serif text-[12px] text-brush mb-2">
                      主题包含
                    </label>
                    <input
                      value={formSubjectContains}
                      onChange={(e) => setFormSubjectContains(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
                      placeholder="如：[ALERT]"
                    />
                  </div>

                  {/* 目标渠道 */}
                  <div>
                    <label className="block font-serif text-[12px] text-brush mb-2">
                      投递渠道
                    </label>
                    <select
                      value={formTargetType}
                      onChange={(e) =>
                        setFormTargetType(e.target.value as "wecom" | "email")
                      }
                      className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
                    >
                      <option value="wecom">企业微信</option>
                      <option value="email">邮箱</option>
                    </select>
                  </div>

                  {/* 目标值 */}
                  <div>
                    <label className="block font-serif text-[12px] text-brush mb-2">
                      {formTargetType === "wecom" ? "Webhook URL" : "收件邮箱（多个用逗号分隔）"}
                    </label>
                    <input
                      value={formTargetValue}
                      onChange={(e) => setFormTargetValue(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
                      placeholder={
                        formTargetType === "wecom"
                          ? "https://qyapi.weixin.qq.com/..."
                          : "ops@company.com"
                      }
                    />
                  </div>

                  {/* 按钮 */}
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-vermilion text-white font-sans text-[14px] px-6 py-2.5 rounded-sm hover:bg-vermilion-dark transition-colors"
                    >
                      存档
                    </button>
                    <button
                      onClick={() => setSheetOpen(false)}
                      className="font-sans text-[14px] text-brush hover:text-ink transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
