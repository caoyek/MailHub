"""
store.py - JSON 文件读写封装（唯一的数据层）
所有数据持久化操作通过此模块完成，使用 threading.Lock 保证并发安全。
"""

import json
import os
import threading
import uuid
import logging
from datetime import datetime
from typing import Any, Optional

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

_lock = threading.Lock()


def _ensure_data_dir():
    """确保 data 目录存在"""
    os.makedirs(DATA_DIR, exist_ok=True)


def _read_json(filename: str, default: Any = None) -> Any:
    """安全读取 JSON 文件，文件不存在时返回默认值"""
    _ensure_data_dir()
    filepath = os.path.join(DATA_DIR, filename)
    try:
        if not os.path.exists(filepath):
            _write_json(filename, default if default is not None else [])
            return default if default is not None else []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"读取 {filename} 失败: {e}")
        return default if default is not None else []


def _write_json(filename: str, data: Any) -> None:
    """安全写入 JSON 文件"""
    _ensure_data_dir()
    filepath = os.path.join(DATA_DIR, filename)
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    except IOError as e:
        logger.error(f"写入 {filename} 失败: {e}")
        raise


# ==================== logs.json ====================

def append_log(entry: dict) -> None:
    """追加一条邮件处理日志"""
    with _lock:
        logs = _read_json("logs.json", [])
        if "id" not in entry:
            entry["id"] = str(uuid.uuid4())
        if "received_at" not in entry:
            entry["received_at"] = datetime.now().isoformat()
        logs.append(entry)
        _write_json("logs.json", logs)
        logger.info(f"日志已写入: {entry.get('id')} - {entry.get('subject', '')}")


def get_logs(
    filters: Optional[dict] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """
    分页查询邮件日志，支持按 status / from_addr / matched_rule / 日期范围筛选。
    返回 {"items": [...], "total": N, "page": P, "page_size": S}
    """
    with _lock:
        logs = _read_json("logs.json", [])

    if filters:
        if filters.get("status"):
            logs = [l for l in logs if l.get("status") == filters["status"]]
        if filters.get("from_addr"):
            logs = [l for l in logs if filters["from_addr"].lower() in l.get("from_addr", "").lower()]
        if filters.get("matched_rule"):
            logs = [l for l in logs if filters["matched_rule"].lower() in (l.get("matched_rule") or "").lower()]
        if filters.get("date_from"):
            logs = [l for l in logs if l.get("received_at", "") >= filters["date_from"]]
        if filters.get("date_to"):
            date_to_end = filters["date_to"] + "T23:59:59"
            logs = [l for l in logs if l.get("received_at", "") <= date_to_end]

    # 按时间倒序
    logs.sort(key=lambda x: x.get("received_at", ""), reverse=True)

    total = len(logs)
    start = (page - 1) * page_size
    end = start + page_size
    items = logs[start:end]

    return {"items": items, "total": total, "page": page, "page_size": page_size}


# ==================== rules.json ====================

def get_rules() -> list:
    """获取所有路由规则"""
    with _lock:
        return _read_json("rules.json", [])


def add_rule(rule: dict) -> dict:
    """新增路由规则"""
    with _lock:
        rules = _read_json("rules.json", [])
        if "id" not in rule:
            rule["id"] = str(uuid.uuid4())
        if "created_at" not in rule:
            rule["created_at"] = datetime.now().isoformat()
        if "enabled" not in rule:
            rule["enabled"] = True
        rules.append(rule)
        _write_json("rules.json", rules)
        logger.info(f"规则已添加: {rule.get('id')} - {rule.get('name', '')}")
        return rule


def update_rule(rule_id: str, data: dict) -> Optional[dict]:
    """更新指定规则"""
    with _lock:
        rules = _read_json("rules.json", [])
        for i, r in enumerate(rules):
            if r.get("id") == rule_id:
                rules[i].update(data)
                rules[i]["id"] = rule_id
                _write_json("rules.json", rules)
                logger.info(f"规则已更新: {rule_id}")
                return rules[i]
        logger.warning(f"规则未找到: {rule_id}")
        return None


def delete_rule(rule_id: str) -> bool:
    """删除指定规则"""
    with _lock:
        rules = _read_json("rules.json", [])
        new_rules = [r for r in rules if r.get("id") != rule_id]
        if len(new_rules) == len(rules):
            logger.warning(f"规则未找到，无法删除: {rule_id}")
            return False
        _write_json("rules.json", new_rules)
        logger.info(f"规则已删除: {rule_id}")
        return True


# ==================== channels.json ====================

def get_channels() -> list:
    """获取所有渠道配置"""
    with _lock:
        return _read_json("channels.json", [])


def update_channel(channel_id: str, data: dict) -> Optional[dict]:
    """更新指定渠道配置"""
    with _lock:
        channels = _read_json("channels.json", [])
        for i, c in enumerate(channels):
            if c.get("id") == channel_id:
                channels[i].update(data)
                channels[i]["id"] = channel_id
                _write_json("channels.json", channels)
                logger.info(f"渠道已更新: {channel_id}")
                return channels[i]
        logger.warning(f"渠道未找到: {channel_id}")
        return None


def add_channel(channel: dict) -> dict:
    """新增渠道"""
    with _lock:
        channels = _read_json("channels.json", [])
        if "id" not in channel:
            channel["id"] = str(uuid.uuid4())
        if "enabled" not in channel:
            channel["enabled"] = True
        if "last_tested_at" not in channel:
            channel["last_tested_at"] = None
        if "last_test_result" not in channel:
            channel["last_test_result"] = None
        channels.append(channel)
        _write_json("channels.json", channels)
        logger.info(f"渠道已添加: {channel.get('id')} - {channel.get('name', '')}")
        return channel


def delete_channel(channel_id: str) -> bool:
    """删除指定渠道"""
    with _lock:
        channels = _read_json("channels.json", [])
        new_channels = [c for c in channels if c.get("id") != channel_id]
        if len(new_channels) == len(channels):
            logger.warning(f"渠道未找到，无法删除: {channel_id}")
            return False
        _write_json("channels.json", new_channels)
        logger.info(f"渠道已删除: {channel_id}")
        return True


# ==================== stats.json ====================

def get_stats(date: str) -> dict:
    """获取指定日期的统计数据"""
    with _lock:
        stats = _read_json("stats.json", {})
        return stats.get(date, {
            "total": 0,
            "success": 0,
            "failed": 0,
            "by_channel": {},
            "avg_duration_ms": 0,
        })


def increment_stats(date: str, channel: str, success: bool, duration_ms: int = 0) -> None:
    """更新指定日期的统计数据"""
    with _lock:
        stats = _read_json("stats.json", {})
        if date not in stats:
            stats[date] = {
                "total": 0,
                "success": 0,
                "failed": 0,
                "by_channel": {},
                "avg_duration_ms": 0,
            }
        day = stats[date]
        day["total"] += 1
        if success:
            day["success"] += 1
        else:
            day["failed"] += 1
        # 渠道计数
        if channel:
            day["by_channel"][channel] = day["by_channel"].get(channel, 0) + 1
        # 平均耗时（简单滑动均值）
        prev_total = day["total"] - 1
        if prev_total > 0:
            day["avg_duration_ms"] = round(
                (day["avg_duration_ms"] * prev_total + duration_ms) / day["total"]
            )
        else:
            day["avg_duration_ms"] = duration_ms
        _write_json("stats.json", stats)


# ==================== accounts.json ====================

def get_mail_accounts() -> list:
    """获取所有收发邮箱账户"""
    with _lock:
        return _read_json("accounts.json", [])


def add_mail_account(account: dict) -> dict:
    """新增收发邮箱账户"""
    with _lock:
        accounts = _read_json("accounts.json", [])
        if "id" not in account:
            account["id"] = str(uuid.uuid4())
        if "enabled" not in account:
            account["enabled"] = True
        if "folder" not in account:
            account["folder"] = "INBOX"
        if "poll_interval" not in account:
            account["poll_interval"] = 60
        accounts.append(account)
        _write_json("accounts.json", accounts)
        logger.info(f"邮箱账户已添加: {account.get('id')} - {account.get('email', '')}")
        return account


def update_mail_account(account_id: str, data: dict) -> Optional[dict]:
    """更新指定邮箱账户"""
    with _lock:
        accounts = _read_json("accounts.json", [])
        for i, a in enumerate(accounts):
            if a.get("id") == account_id:
                # 密码字段为空时保留原密码
                if "password" in data and not data["password"]:
                    del data["password"]
                accounts[i].update(data)
                accounts[i]["id"] = account_id
                _write_json("accounts.json", accounts)
                logger.info(f"邮箱账户已更新: {account_id}")
                return accounts[i]
        logger.warning(f"邮箱账户未找到: {account_id}")
        return None


def delete_mail_account(account_id: str) -> bool:
    """删除指定邮箱账户"""
    with _lock:
        accounts = _read_json("accounts.json", [])
        new_accounts = [a for a in accounts if a.get("id") != account_id]
        if len(new_accounts) == len(accounts):
            logger.warning(f"邮箱账户未找到，无法删除: {account_id}")
            return False
        _write_json("accounts.json", new_accounts)
        logger.info(f"邮箱账户已删除: {account_id}")
        return True
