/**
 * lib/api.ts - 所有 fetch 请求封装
 */

import type {
  ApiResponse,
  MailLog,
  Rule,
  Channel,
  DayStats,
  PaginatedResponse,
  LogFilters,
  MailAccount,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** 从 JWT token 中提取用户信息 */
export function getCurrentUser(): { email: string } | null {
  if (typeof window === "undefined") return null;
  const email = localStorage.getItem("mailhub_email");
  if (email) return { email };
  // 回退：从 JWT payload 解码
  const token = localStorage.getItem("mailhub_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { email: payload.sub || "admin" };
  } catch {
    return { email: "admin" };
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("mailhub_token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mailhub_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return { code: 401, data: null, msg: "登录已过期，请重新登录" } as ApiResponse<any>;
  }

  if (!res.ok) {
    return { code: res.status, data: null, msg: `请求失败 (${res.status})` } as ApiResponse<any>;
  }

  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  return request<{ token: string; email: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Stats
export async function getStats() {
  return request<DayStats>("/api/stats");
}

export async function getStatsRange(days: number = 7) {
  return request<Record<string, DayStats>>(`/api/stats/range?days=${days}`);
}

// Logs
export async function getLogs(
  page: number = 1,
  pageSize: number = 20,
  filters?: LogFilters
) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (filters?.status) params.set("status", filters.status);
  if (filters?.from_addr) params.set("from_addr", filters.from_addr);
  if (filters?.matched_rule) params.set("matched_rule", filters.matched_rule);
  if (filters?.date_from) params.set("date_from", filters.date_from);
  if (filters?.date_to) params.set("date_to", filters.date_to);
  return request<PaginatedResponse<MailLog>>(`/api/logs?${params.toString()}`);
}

// Rules
export async function getRules() {
  return request<Rule[]>("/api/rules");
}

export async function addRule(rule: Partial<Rule>) {
  return request<Rule>("/api/rules", {
    method: "POST",
    body: JSON.stringify(rule),
  });
}

export async function updateRule(id: string, data: Partial<Rule>) {
  return request<Rule>(`/api/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRule(id: string) {
  return request<null>(`/api/rules/${id}`, { method: "DELETE" });
}

// Channels
export async function getChannels() {
  return request<Channel[]>("/api/channels");
}

export async function updateChannel(id: string, data: Partial<Channel>) {
  return request<Channel>(`/api/channels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function testChannel(id: string) {
  return request<{ result: string }>(`/api/channels/${id}/test`, {
    method: "POST",
  });
}

export async function addChannel(channel: Partial<Channel>) {
  return request<Channel>("/api/channels", {
    method: "POST",
    body: JSON.stringify(channel),
  });
}

export async function deleteChannel(id: string) {
  return request<null>(`/api/channels/${id}`, { method: "DELETE" });
}

// Mail Accounts
export async function getMailAccounts() {
  return request<MailAccount[]>("/api/mail-accounts");
}

export async function addMailAccount(account: Partial<MailAccount>) {
  return request<MailAccount>("/api/mail-accounts", {
    method: "POST",
    body: JSON.stringify(account),
  });
}

export async function updateMailAccount(id: string, data: Partial<MailAccount>) {
  return request<MailAccount>(`/api/mail-accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMailAccount(id: string) {
  return request<null>(`/api/mail-accounts/${id}`, { method: "DELETE" });
}
