/**
 * types/index.ts - 所有 TypeScript 类型定义
 */

export interface MailLog {
  id: string;
  received_at: string;
  from_addr: string;
  subject: string;
  body_preview: string;
  matched_rule: string | null;
  targets: string[];
  status: "success" | "fail";
  error_msg: string | null;
  duration_ms: number;
  account_id?: string;
  account_name?: string;
}

export interface MailAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  folder: string;
  poll_interval: number;
  enabled: boolean;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  source_account_id?: string;
  match: {
    from_contains: string;
    subject_contains: string;
    subject_regex: string | null;
  };
  targets: RuleTarget[];
  created_at: string;
}

export interface RuleTarget {
  type: "wecom" | "email";
  webhook_url?: string;
  to?: string[];
}

export interface Channel {
  id: string;
  type: "wecom" | "email";
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  last_tested_at: string | null;
  last_test_result: string | null;
}

export interface DayStats {
  total: number;
  success: number;
  failed: number;
  by_channel: Record<string, number>;
  avg_duration_ms: number;
}

export interface LogFilters {
  status?: string;
  from_addr?: string;
  matched_rule?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}
