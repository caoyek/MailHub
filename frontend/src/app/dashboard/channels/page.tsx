"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getChannels as apiGetChannels,
  addChannel as apiAddChannel,
  updateChannel as apiUpdateChannel,
  deleteChannel as apiDeleteChannel,
  testChannel as apiTestChannel,
  getMailAccounts as apiGetMailAccounts,
  addMailAccount as apiAddMailAccount,
  updateMailAccount as apiUpdateMailAccount,
  deleteMailAccount as apiDeleteMailAccount,
} from "@/lib/api";
import type { Channel, MailAccount } from "@/types";
import { X, Mail } from "lucide-react";

const pendingChannels = [
  { name: "飞书", type: "feishu" },
  { name: "钉钉", type: "dingtalk" },
  { name: "Slack", type: "slack" },
  { name: "Telegram", type: "telegram" },
];

export default function ChannelsPage() {
  /* ── 转发渠道 ── */
  const [channels, setChannels] = useState<Channel[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editChannel, setEditChannel] = useState<Channel | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"wecom" | "email">("wecom");
  const [formWebhook, setFormWebhook] = useState("");
  const [formEmails, setFormEmails] = useState("");

  /* ── 收发邮箱 ── */
  const [mailAccounts, setMailAccounts] = useState<MailAccount[]>([]);
  const [mailSheetOpen, setMailSheetOpen] = useState(false);
  const [editMail, setEditMail] = useState<MailAccount | null>(null);
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mImapHost, setMImapHost] = useState("");
  const [mImapPort, setMImapPort] = useState("993");
  const [mSmtpHost, setMSmtpHost] = useState("");
  const [mSmtpPort, setMSmtpPort] = useState("465");
  const [mPassword, setMPassword] = useState("");
  const [mFolder, setMFolder] = useState("INBOX");
  const [mPollInterval, setMPollInterval] = useState("60");

  /* ── 数据加载 ── */
  const loadChannels = useCallback(async () => {
    try {
      const res = await apiGetChannels();
      if (res.code === 0) setChannels(res.data || []);
    } catch { /* ignore */ }
  }, []);

  const loadMailAccounts = useCallback(async () => {
    try {
      const res = await apiGetMailAccounts();
      if (res.code === 0) setMailAccounts(res.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadChannels();
    loadMailAccounts();
  }, [loadChannels, loadMailAccounts]);

  /* ── 渠道 CRUD ── */
  const openCreate = () => {
    setEditChannel(null);
    setFormName("");
    setFormType("wecom");
    setFormWebhook("");
    setFormEmails("");
    setSheetOpen(true);
  };

  const openEdit = (ch: Channel) => {
    setEditChannel(ch);
    setFormName(ch.name);
    setFormType(ch.type);
    if (ch.type === "wecom") {
      setFormWebhook(ch.config.webhook_url || "");
      setFormEmails("");
    } else {
      setFormWebhook("");
      setFormEmails(ch.config.to?.join(", ") || "");
    }
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    const config =
      formType === "wecom"
        ? { webhook_url: formWebhook }
        : { to: formEmails.split(",").map((s) => s.trim()).filter(Boolean) };

    try {
      if (editChannel) {
        await apiUpdateChannel(editChannel.id, { name: formName, type: formType, config });
      } else {
        await apiAddChannel({ name: formName, type: formType, config } as Partial<Channel>);
      }
      await loadChannels();
    } catch {
      alert("操作失败，请检查后端服务。");
    }
    setSheetOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteChannel(id);
      await loadChannels();
    } catch {
      alert("删除失败，请检查后端服务。");
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const res = await apiTestChannel(id);
      if (res.code !== 0) {
        alert(`验路失败: ${res.msg || "渠道连通测试失败"}`);
      }
      await loadChannels();
    } catch {
      alert("验路请求异常，请检查后端服务是否运行。");
    }
    setTesting(null);
  };

  /* ── 邮箱 CRUD ── */
  const resetMailForm = () => {
    setMName("");
    setMEmail("");
    setMImapHost("");
    setMImapPort("993");
    setMSmtpHost("");
    setMSmtpPort("465");
    setMPassword("");
    setMFolder("INBOX");
    setMPollInterval("60");
  };

  const openMailCreate = () => {
    setEditMail(null);
    resetMailForm();
    setMailSheetOpen(true);
  };

  const openMailEdit = (acc: MailAccount) => {
    setEditMail(acc);
    setMName(acc.name);
    setMEmail(acc.email);
    setMImapHost(acc.imap_host);
    setMImapPort(String(acc.imap_port));
    setMSmtpHost(acc.smtp_host);
    setMSmtpPort(String(acc.smtp_port));
    setMPassword("");
    setMFolder(acc.folder);
    setMPollInterval(String(acc.poll_interval));
    setMailSheetOpen(true);
  };

  const handleMailSave = async () => {
    if (!mName.trim() || !mEmail.trim()) return;

    const data: Record<string, any> = {
      name: mName.trim(),
      email: mEmail.trim(),
      imap_host: mImapHost.trim(),
      imap_port: Number(mImapPort) || 993,
      smtp_host: mSmtpHost.trim() || mImapHost.replace("imap", "smtp"),
      smtp_port: Number(mSmtpPort) || 465,
      folder: mFolder.trim() || "INBOX",
      poll_interval: Number(mPollInterval) || 60,
    };

    if (mPassword) {
      data.password = mPassword;
    }

    try {
      if (editMail) {
        await apiUpdateMailAccount(editMail.id, data);
      } else {
        await apiAddMailAccount(data);
      }
      await loadMailAccounts();
    } catch {
      alert("操作失败，请检查后端服务。");
    }
    setMailSheetOpen(false);
  };

  const handleMailDelete = async (id: string) => {
    try {
      await apiDeleteMailAccount(id);
      await loadMailAccounts();
    } catch {
      alert("删除失败，请检查后端服务。");
    }
  };

  const handleMailToggle = async (acc: MailAccount) => {
    try {
      await apiUpdateMailAccount(acc.id, { enabled: !acc.enabled });
      await loadMailAccounts();
    } catch {
      alert("操作失败，请检查后端服务。");
    }
  };

  /* ── 公共抽屉样式 ── */
  const drawerOverlay = (onClose: () => void) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 z-50"
      onClick={onClose}
    />
  );

  const inputCls =
    "w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors";
  const labelCls = "block font-serif text-[12px] text-brush mb-2";

  return (
    <div className="space-y-8">
      {/* ── 收发邮箱 ── */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-serif text-[18px] text-ink font-bold whitespace-nowrap">
            收发邮箱
          </h2>
          <div className="flex-1 border-t border-scroll" />
          <button
            onClick={openMailCreate}
            className="bg-vermilion text-white font-sans text-[13px] px-4 py-2 rounded-sm hover:bg-vermilion-dark transition-colors flex-shrink-0"
          >
            添加邮箱
          </button>
        </div>

        <div className="border border-scroll bg-paper-light">
          {mailAccounts.length === 0 && (
            <div className="px-5 py-8 text-center font-sans text-[13px] text-brush">
              暂无收发邮箱，点击上方「添加邮箱」配置
            </div>
          )}
          {mailAccounts.map((acc, i) => (
            <div
              key={acc.id}
              className={`flex flex-col md:flex-row md:items-center md:justify-between px-5 py-4 gap-3 ${
                i < mailAccounts.length - 1 ? "border-b border-scroll" : ""
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <Mail size={16} className="text-vermilion flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-serif text-[14px] text-ink font-bold">
                    {acc.name}
                  </span>
                  <span className="font-sans text-[12px] text-brush ml-3">
                    {acc.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5 flex-wrap">
                <div className="text-right">
                  <span className="block font-serif text-[11px] text-brush">IMAP</span>
                  <span className="font-sans text-[12px] text-ink">
                    {acc.imap_host}:{acc.imap_port}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-serif text-[11px] text-brush">SMTP</span>
                  <span className="font-sans text-[12px] text-ink">
                    {acc.smtp_host}:{acc.smtp_port}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-serif text-[11px] text-brush">文件夹</span>
                  <span className="font-sans text-[12px] text-ink">{acc.folder}</span>
                </div>
                <div className="text-right">
                  <span className="block font-serif text-[11px] text-brush">轮询</span>
                  <span className="font-sans text-[12px] text-ink">{acc.poll_interval}s</span>
                </div>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${
                      acc.enabled ? "bg-ink-green" : "bg-scroll"
                    }`}
                  />
                  <span
                    className={`font-sans text-[12px] ${
                      acc.enabled ? "text-ink-green" : "text-brush"
                    }`}
                  >
                    {acc.enabled ? "运行中" : "已停用"}
                  </span>
                </span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleMailToggle(acc)}
                    className="font-sans text-[12px] text-brush hover:text-vermilion transition-colors"
                  >
                    {acc.enabled ? "停用" : "启用"}
                  </button>
                  <button
                    onClick={() => openMailEdit(acc)}
                    className="font-sans text-[12px] text-brush hover:text-vermilion transition-colors"
                  >
                    改设
                  </button>
                  <button
                    onClick={() => handleMailDelete(acc.id)}
                    className="font-sans text-[12px] text-brush hover:text-vermilion transition-colors"
                  >
                    撤除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 px-1">
          <span className="font-sans text-[11px] text-brush">
            邮箱用于接收来信（IMAP）及转发投递（SMTP），密码仅存储在后端加密配置中。
          </span>
        </div>
      </div>

      {/* ── 转发渠道 ── */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-serif text-[18px] text-ink font-bold whitespace-nowrap">
            转发渠道
          </h2>
          <div className="flex-1 border-t border-scroll" />
          <button
            onClick={openCreate}
            className="bg-vermilion text-white font-sans text-[13px] px-4 py-2 rounded-sm hover:bg-vermilion-dark transition-colors flex-shrink-0"
          >
            开辟驿路
          </button>
        </div>

        <div className="border border-scroll bg-paper-light">
          {channels.length === 0 && (
            <div className="px-5 py-8 text-center font-sans text-[13px] text-brush">
              暂无已接入渠道，点击上方「开辟驿路」添加
            </div>
          )}
          {channels.map((ch, i) => (
            <div
              key={ch.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i < channels.length - 1 ? "border-b border-scroll" : ""
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-serif text-[14px] text-ink font-bold whitespace-nowrap">
                  {ch.name}
                </span>
                <span className="inline-block font-sans text-[11px] text-brush border border-scroll px-2 py-0.5 rounded-sm bg-transparent whitespace-nowrap">
                  {ch.type === "wecom" ? "企微" : "邮箱"}
                </span>
                <span className="font-sans text-[12px] text-brush truncate">
                  {ch.type === "wecom"
                    ? `Webhook: ...${ch.config.webhook_url?.slice(-12) || ""}`
                    : `收件: ${ch.config.to?.join(", ") || ""}`}
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${
                      ch.last_test_result === "success"
                        ? "bg-ink-green"
                        : ch.last_test_result === "fail"
                        ? "bg-vermilion"
                        : "bg-scroll"
                    }`}
                  />
                  <span
                    className={`font-sans text-[12px] ${
                      ch.last_test_result === "success"
                        ? "text-ink-green"
                        : ch.last_test_result === "fail"
                        ? "text-vermilion"
                        : "text-brush"
                    }`}
                  >
                    {ch.last_test_result === "success"
                      ? "畅通"
                      : ch.last_test_result === "fail"
                      ? "异常"
                      : "待验"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleTest(ch.id)}
                  disabled={testing === ch.id}
                  className="border border-ink text-ink font-sans text-[12px] px-3 py-1.5 rounded-sm hover:bg-ink hover:text-white transition-colors disabled:opacity-50"
                >
                  {testing === ch.id ? "验路中…" : "验路"}
                </button>
                <button
                  onClick={() => openEdit(ch)}
                  className="font-sans text-[12px] text-brush hover:text-vermilion transition-colors"
                >
                  改设
                </button>
                <button
                  onClick={() => handleDelete(ch.id)}
                  className="font-sans text-[12px] text-brush hover:text-vermilion transition-colors"
                >
                  撤除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 待辟驿路 ── */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-serif text-[18px] text-ink font-bold whitespace-nowrap">
            待辟驿路
          </h2>
          <div className="flex-1 border-t border-scroll" />
        </div>

        <div className="border border-scroll bg-paper-light">
          {pendingChannels.map((ch, i) => (
            <div
              key={ch.type}
              className={`flex items-center justify-between px-5 py-4 ${
                i < pendingChannels.length - 1 ? "border-b border-scroll" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="font-serif text-[14px] text-ink">{ch.name}</span>
                <span className="inline-block font-sans text-[11px] text-brush border border-scroll px-2 py-0.5 rounded-sm bg-transparent">
                  {ch.type}
                </span>
              </div>
              <span className="inline-block font-sans text-[12px] text-brush bg-scroll/30 px-3 py-1 rounded-sm">
                筹建中
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 渠道抽屉 ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {drawerOverlay(() => setSheetOpen(false))}
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
                    {editChannel ? "改设驿路" : "开辟驿路"}
                  </h2>
                  <button onClick={() => setSheetOpen(false)} className="text-brush hover:text-ink">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>渠道名称</label>
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={inputCls}
                      placeholder="如：运维告警群"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>渠道类型</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFormType("wecom")}
                        className={`flex-1 py-2.5 border font-sans text-[13px] rounded-sm transition-colors ${
                          formType === "wecom"
                            ? "border-vermilion text-vermilion bg-vermilion-light"
                            : "border-scroll text-brush hover:border-vermilion"
                        }`}
                      >
                        企业微信
                      </button>
                      <button
                        onClick={() => setFormType("email")}
                        className={`flex-1 py-2.5 border font-sans text-[13px] rounded-sm transition-colors ${
                          formType === "email"
                            ? "border-vermilion text-vermilion bg-vermilion-light"
                            : "border-scroll text-brush hover:border-vermilion"
                        }`}
                      >
                        邮箱转发
                      </button>
                    </div>
                  </div>
                  {formType === "wecom" && (
                    <div>
                      <label className={labelCls}>Webhook URL</label>
                      <input
                        value={formWebhook}
                        onChange={(e) => setFormWebhook(e.target.value)}
                        className={inputCls}
                        placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                      />
                    </div>
                  )}
                  {formType === "email" && (
                    <div>
                      <label className={labelCls}>收件邮箱（多个用逗号分隔）</label>
                      <input
                        value={formEmails}
                        onChange={(e) => setFormEmails(e.target.value)}
                        className={inputCls}
                        placeholder="ops@company.com, dev@company.com"
                      />
                    </div>
                  )}
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

      {/* ── 邮箱抽屉 ── */}
      <AnimatePresence>
        {mailSheetOpen && (
          <>
            {drawerOverlay(() => setMailSheetOpen(false))}
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
                    {editMail ? "改设邮箱" : "添加邮箱"}
                  </h2>
                  <button onClick={() => setMailSheetOpen(false)} className="text-brush hover:text-ink">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 名称 */}
                  <div>
                    <label className={labelCls}>显示名称</label>
                    <input
                      value={mName}
                      onChange={(e) => setMName(e.target.value)}
                      className={inputCls}
                      placeholder="如：QQ 主邮箱"
                    />
                  </div>

                  {/* 邮箱地址 */}
                  <div>
                    <label className={labelCls}>邮箱地址</label>
                    <input
                      value={mEmail}
                      onChange={(e) => setMEmail(e.target.value)}
                      className={inputCls}
                      placeholder="your@qq.com"
                    />
                  </div>

                  {/* 密码 */}
                  <div>
                    <label className={labelCls}>
                      密码 / 授权码{editMail ? "（留空则不修改）" : ""}
                    </label>
                    <input
                      type="password"
                      value={mPassword}
                      onChange={(e) => setMPassword(e.target.value)}
                      className={inputCls}
                      placeholder="IMAP/SMTP 授权码"
                    />
                  </div>

                  {/* IMAP */}
                  <div>
                    <label className={labelCls}>IMAP 服务器</label>
                    <div className="grid grid-cols-[1fr_80px] gap-3">
                      <input
                        value={mImapHost}
                        onChange={(e) => setMImapHost(e.target.value)}
                        className={inputCls}
                        placeholder="imap.qq.com"
                      />
                      <input
                        value={mImapPort}
                        onChange={(e) => setMImapPort(e.target.value)}
                        className={`${inputCls} text-center`}
                        placeholder="993"
                      />
                    </div>
                  </div>

                  {/* SMTP */}
                  <div>
                    <label className={labelCls}>SMTP 服务器</label>
                    <div className="grid grid-cols-[1fr_80px] gap-3">
                      <input
                        value={mSmtpHost}
                        onChange={(e) => setMSmtpHost(e.target.value)}
                        className={inputCls}
                        placeholder="smtp.qq.com（留空自动推断）"
                      />
                      <input
                        value={mSmtpPort}
                        onChange={(e) => setMSmtpPort(e.target.value)}
                        className={`${inputCls} text-center`}
                        placeholder="465"
                      />
                    </div>
                  </div>

                  {/* 文件夹 */}
                  <div>
                    <label className={labelCls}>监控文件夹</label>
                    <input
                      value={mFolder}
                      onChange={(e) => setMFolder(e.target.value)}
                      className={inputCls}
                      placeholder="INBOX"
                    />
                  </div>

                  {/* 轮询间隔 */}
                  <div>
                    <label className={labelCls}>轮询间隔（秒）</label>
                    <input
                      value={mPollInterval}
                      onChange={(e) => setMPollInterval(e.target.value)}
                      className={inputCls}
                      placeholder="60"
                    />
                  </div>

                  {/* 按钮 */}
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      onClick={handleMailSave}
                      className="bg-vermilion text-white font-sans text-[14px] px-6 py-2.5 rounded-sm hover:bg-vermilion-dark transition-colors"
                    >
                      存档
                    </button>
                    <button
                      onClick={() => setMailSheetOpen(false)}
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
