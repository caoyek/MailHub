"""
receiver.py - IMAP 轮询拉取邮件
使用 imap-tools 库连接 IMAP 邮箱，拉取未读邮件并标记已读。
"""

import logging
from typing import Callable, Optional

from imap_tools import MailBox, AND

from src.parser import parse_message, ParsedMessage

logger = logging.getLogger(__name__)


class IMAPReceiver:
    """IMAP 邮件接收器"""

    def __init__(
        self,
        host: str,
        port: int,
        user: str,
        password: str,
        folder: str = "INBOX",
    ):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.folder = folder

    def connect(self) -> MailBox:
        """建立 IMAP 连接"""
        try:
            mailbox = MailBox(self.host, self.port)
            mailbox.login(self.user, self.password)
            mailbox.folder.set(self.folder)
            logger.info(f"IMAP 连接成功: {self.user}@{self.host}:{self.port}")
            return mailbox
        except Exception as e:
            logger.error(f"IMAP 连接失败: {e}")
            raise

    def poll(self, on_message: Callable[[ParsedMessage], None]) -> int:
        """
        拉取所有未读邮件，对每封邮件调用 on_message 回调。
        拉取后标记为已读。
        返回本次拉取的邮件数量。
        """
        count = 0
        try:
            with self.connect() as mailbox:
                for msg in mailbox.fetch(AND(seen=False), mark_seen=True):
                    try:
                        parsed = parse_message(msg.obj)
                        logger.info(
                            f"拉取邮件: {parsed.subject[:30]}... from {parsed.from_addr}"
                        )
                        on_message(parsed)
                        count += 1
                    except Exception as e:
                        logger.error(f"处理邮件失败: {e}")
                        continue
        except Exception as e:
            logger.error(f"IMAP 轮询失败: {e}")

        if count > 0:
            logger.info(f"本次轮询拉取 {count} 封邮件")
        else:
            logger.debug("本次轮询无新邮件")

        return count
