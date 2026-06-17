"""
wecom.py - 企业微信群机器人渠道
通过 Webhook 发送 Markdown 格式消息。
"""

import logging
import threading

import httpx

from src.channels.base import BaseChannel
from src.parser import ParsedMessage

logger = logging.getLogger(__name__)


class WeComChannel(BaseChannel):
    """企业微信群机器人渠道"""

    MAX_RETRIES = 3
    BACKOFF_SECONDS = [1, 2, 4]

    def send(self, message: ParsedMessage, config: dict) -> bool:
        """
        发送 Markdown 格式消息到企微 Webhook。
        失败重试 3 次，退避 1/2/4 秒。
        """
        webhook_url = config.get("webhook_url", "")
        if not webhook_url:
            logger.error("企微 Webhook URL 未配置")
            return False

        # 构建 Markdown 内容
        body_preview = message.body_preview[:200].replace("\n", " ")
        md_content = (
            f"**发件人**: {message.from_addr}\n"
            f"**主题**: {message.subject}\n\n"
            f"{body_preview}"
        )

        payload = {
            "msgtype": "markdown",
            "markdown": {
                "content": md_content,
            },
        }

        for attempt in range(self.MAX_RETRIES):
            try:
                result = self._send_sync(webhook_url, payload)
                if result:
                    logger.info(
                        f"企微消息发送成功: {message.subject[:30]}"
                    )
                    return True
            except Exception as e:
                logger.error(
                    f"企微消息发送失败 (第{attempt + 1}次): {e}"
                )

            if attempt < self.MAX_RETRIES - 1:
                wait = self.BACKOFF_SECONDS[attempt]
                logger.info(f"等待 {wait}s 后重试...")
                threading.Event().wait(wait)

        logger.error(f"企微消息发送最终失败: {message.subject[:30]}")
        return False

    def _send_sync(self, url: str, payload: dict) -> bool:
        """同步 HTTP POST 发送"""
        with httpx.Client(timeout=10) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            if data.get("errcode") == 0:
                return True
            else:
                logger.error(f"企微 API 返回错误: {data}")
                return False
