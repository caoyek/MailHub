/**
 * lib/mock.ts - 开发用 mock 数据（初始为空，由用户通过界面添加）
 */

import type { MailLog, Rule, Channel, DayStats, MailAccount } from "@/types";

export const mockLogs: MailLog[] = [];

export const mockRules: Rule[] = [];

export const mockChannels: Channel[] = [];

export const mockStats: DayStats = {
  total: 0,
  success: 0,
  failed: 0,
  by_channel: {},
  avg_duration_ms: 0,
};

export const mockWeekStats: Record<string, DayStats> = {};

export const mockMailAccounts: MailAccount[] = [];
