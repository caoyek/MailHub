"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SealLogo from "@/components/SealLogo";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.code === 0 && res.data?.token) {
        localStorage.setItem("mailhub_token", res.data.token);
        localStorage.setItem("mailhub_email", res.data.email || email);
        router.push("/dashboard");
      } else {
        setError(res.msg || "验证失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <SealLogo variant="dark" size={48} />
        <span className="font-serif text-[24px] text-ink font-bold">
          信驿
        </span>
      </div>

      {/* 卡片 */}
      <div className="w-full max-w-[360px] bg-paper-light border border-scroll p-10 shadow-paper">
        <h1 className="font-serif text-[20px] text-ink font-bold">
          请出示凭证
        </h1>
        <p className="font-sans text-[13px] text-brush mt-1 mb-8">
          仅授权用户可入
        </p>

        {error && (
          <div className="border-l-[3px] border-vermilion bg-vermilion-light px-4 py-2.5 mb-6">
            <span className="font-sans text-[13px] text-vermilion">
              {error}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block font-serif text-[12px] text-brush mb-2">
              账号
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
              placeholder="admin"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block font-serif text-[12px] text-brush mb-2">
              通行密令
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-scroll pb-2 font-sans text-[14px] text-ink focus:outline-none focus:border-vermilion transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white font-serif text-[15px] py-3 rounded-sm hover:bg-ink/90 transition-colors disabled:opacity-60"
          >
            {loading ? "核验中…" : "验证入内"}
          </button>
        </form>
      </div>
    </div>
  );
}
