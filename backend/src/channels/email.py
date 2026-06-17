"""
email.py - 邮箱转发渠道
直接转发原始邮件对象，保留所有头部字段、MIME 结构和附件。
"""

import os
import smtplib
import logging

from src.channels.base import BaseChannel
from src.parser import ParsedMessage

logger = logging.getLogger(__name__)


class EmailChannel(BaseChannel):
    """邮箱转发渠道"""

    def send(self, message: ParsedMessage, config: dict) -> bool:
        """
        原封不动转发邮件：
        - 直接使用 raw_message 对象，不重新构建内容
        - 仅替换 To 字段为目标收件人
        - 保留所有其他头部字段、MIME 结构、附件
        - 不添加任何额外文字
        SMTP 连接/登录异常会向上抛出，由调用方统一处理。
        """
        to_addrs = config.get("to", [])
        if not to_addrs:
            logger.error("邮件转发目标为空")
            return False

        if isinstance(to_addrs, str):
            to_addrs = [to_addrs]

        raw_msg = message.raw_message
        if raw_msg is None:
            # 没有原始邮件对象时（如验路测试消息），从字段构建一封简单邮件
            from email.mime.text import MIMEText

            raw_msg = MIMEText(message.body_preview or "", "plain", "utf-8")
            raw_msg["Subject"] = message.subject or "(无主题)"
            raw_msg["From"] = message.from_addr or "信驿 MailHub"
            raw_msg["Date"] = message.received_at.strftime("%a, %d %b %Y %H:%M:%S %z") if message.received_at else ""

        # 替换 To 字段，其余头部一律不改动
        if "To" in raw_msg:
            del raw_msg["To"]
        raw_msg["To"] = ", ".join(to_addrs)

        # SMTP 配置：优先从 config 传入（UI 配置的邮箱账户），回退到环境变量
        smtp_host = config.get("smtp_host", "")
        smtp_port = int(config.get("smtp_port", 0))
        smtp_user = config.get("smtp_user", "")
        smtp_pass = config.get("smtp_pass", "")

        if not smtp_host:
            env_host = os.getenv("IMAP_HOST", "smtp.qq.com")
            smtp_host = env_host.replace("imap.", "smtp.")
        if not smtp_user:
            smtp_user = os.getenv("IMAP_USER", "")
        if not smtp_pass:
            smtp_pass = os.getenv("IMAP_PASS", "")
        if not smtp_port:
            smtp_port = int(os.getenv("SMTP_PORT", "465"))

        if not smtp_user or not smtp_pass:
            raise RuntimeError("SMTP 凭据未配置（请在收发邮箱中添加账户并填写密码）")

        logger.info(f"开始转发邮件到: {to_addrs}")

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=30) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to_addrs, raw_msg.as_bytes())
        elif smtp_port == 587:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to_addrs, raw_msg.as_bytes())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to_addrs, raw_msg.as_bytes())

        logger.info(f"邮件转发成功: {message.subject[:30]} -> {to_addrs}")
        return True
