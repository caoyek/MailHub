"""
scheduler.py - APScheduler 定时任务
配置 IMAP 轮询的定时调度。
"""

import os
import logging
import asyncio
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.receiver import IMAPReceiver
from src.router import match_rules
from src.parser import ParsedMessage
from src import store
from src.channels.base import send_to_targets

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


def _process_message(message: ParsedMessage, account_id: str = "", smtp_config: dict = None, account_name: str = "") -> dict:
    """
    处理一封邮件：路由匹配 → 渠道分发 → 写日志 → 更新统计。
    返回日志记录 dict。
    """
    import time
    start = time.time()

    targets, matched_rule = match_rules(message, account_id=account_id)

    target_names = [t.get("type", "unknown") for t in targets]
    status = "success"
    error_msg = None

    if targets:
        success, errors = send_to_targets(message, targets, smtp_config=smtp_config)
        if not success:
            status = "fail"
            error_msg = "; ".join(errors)
    else:
        status = "success"
        logger.debug(f"邮件 [{message.subject[:30]}] 无匹配规则，未分发")

    duration_ms = int((time.time() - start) * 1000)

    log_entry = {
        "id": message.id,
        "received_at": message.received_at.isoformat(),
        "from_addr": message.from_addr,
        "subject": message.subject,
        "body_preview": message.body_preview[:200],
        "matched_rule": matched_rule,
        "targets": target_names,
        "status": status,
        "error_msg": error_msg,
        "duration_ms": duration_ms,
        "account_id": account_id,
        "account_name": account_name,
    }

    # 写日志
    store.append_log(log_entry)

    # 更新统计
    today = datetime.now().strftime("%Y-%m-%d")
    for ch in target_names:
        store.increment_stats(today, ch, status == "success", duration_ms)

    logger.info(
        f"邮件处理完成: {message.subject[:30]} | 状态: {status} | 耗时: {duration_ms}ms"
    )

    return log_entry


def _poll_job():
    """定时任务：遍历所有启用的收发邮箱账户，逐一轮询 IMAP"""
    accounts = store.get_mail_accounts()
    enabled_accounts = [a for a in accounts if a.get("enabled", True)]

    if not enabled_accounts:
        logger.debug("无启用的邮箱账户，跳过轮询")
        return

    # 广播回调（用于 WebSocket 推送）
    broadcast_fn = None
    try:
        from src.api.routes import broadcast_event
        broadcast_fn = broadcast_event
    except ImportError:
        pass

    for account in enabled_accounts:
        host = account.get("imap_host", "")
        port = account.get("imap_port", 993)
        user = account.get("email", "")
        password = account.get("password", "")
        folder = account.get("folder", "INBOX")
        account_id = account.get("id", "")

        if not host or not user or not password:
            logger.warning(f"邮箱账户 [{account.get('name', '')}] 配置不完整，跳过")
            continue

        # 构建该账户的 SMTP 凭证，供转发使用
        smtp_config = {
            "smtp_host": account.get("smtp_host", ""),
            "smtp_port": account.get("smtp_port", 465),
            "smtp_user": user,
            "smtp_pass": password,
        }

        receiver = IMAPReceiver(host, port, user, password, folder)

        def on_message(msg: ParsedMessage, _aid=account_id, _smtp=smtp_config, _name=account.get("name", "")):
            log_entry = _process_message(msg, account_id=_aid, smtp_config=_smtp, account_name=_name)
            if broadcast_fn:
                try:
                    loop = asyncio.get_event_loop()
                    asyncio.run_coroutine_threadsafe(
                        broadcast_fn(log_entry), loop
                    )
                except Exception as e:
                    logger.warning(f"WebSocket 广播失败: {e}")

        try:
            receiver.poll(on_message)
        except Exception as e:
            logger.error(f"账户 [{account.get('name', '')}] 轮询失败: {e}")


def init_scheduler() -> AsyncIOScheduler:
    """初始化并启动 APScheduler"""
    global _scheduler

    interval = int(os.getenv("POLL_INTERVAL_SECONDS", "60"))
    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(
        _poll_job,
        "interval",
        seconds=interval,
        id="imap_poll",
        name="IMAP 邮件轮询",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info(f"APScheduler 已启动，轮询间隔: {interval}s")
    return _scheduler


def get_scheduler() -> AsyncIOScheduler | None:
    return _scheduler
