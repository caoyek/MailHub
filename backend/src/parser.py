"""
parser.py - 邮件内容解析
将原始邮件对象解析为 ParsedMessage 数据模型。
"""

import email
import uuid
import logging
import re
from datetime import datetime
from email.message import Message
from typing import Optional

from pydantic import BaseModel, ConfigDict

logger = logging.getLogger(__name__)

_HTML_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(html: str) -> str:
    """移除 HTML 标签，保留纯文本"""
    text = _HTML_TAG_RE.sub("", html)
    # 合并多余空白
    text = re.sub(r"\s+", " ", text).strip()
    return text


class ParsedMessage(BaseModel):
    """解析后的邮件消息"""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    received_at: datetime
    from_addr: str
    subject: str
    body_preview: str
    attachments: list[str]
    raw_message: Optional[Message] = None


def parse_message(raw: Message) -> ParsedMessage:
    """
    将 email.message.Message 解析为 ParsedMessage。
    提取发件人、主题、纯文本正文（前500字）、附件名列表。
    保留原始 raw_message 供 EmailChannel 直接转发。
    """
    msg_id = str(uuid.uuid4())
    received_at = datetime.now()

    # 发件人
    from_addr = ""
    from_header = raw.get("From", "")
    if from_header:
        from_addr = str(from_header)

    # 主题
    subject = ""
    subject_header = raw.get("Subject", "")
    if subject_header:
        subject = str(subject_header)

    # 正文提取
    body_text = ""
    attachments = []

    if raw.is_multipart():
        for part in raw.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))

            if "attachment" in content_disposition:
                filename = part.get_filename()
                if filename:
                    attachments.append(filename)
            elif content_type == "text/plain" and not body_text:
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or "utf-8"
                        body_text = payload.decode(charset, errors="replace")
                except Exception as e:
                    logger.warning(f"解析邮件正文失败: {e}")
            elif content_type == "text/html" and not body_text:
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or "utf-8"
                        body_text = _strip_html(payload.decode(charset, errors="replace"))
                except Exception as e:
                    logger.warning(f"解析 HTML 正文失败: {e}")
    else:
        try:
            payload = raw.get_payload(decode=True)
            if payload:
                charset = raw.get_content_charset() or "utf-8"
                decoded = payload.decode(charset, errors="replace")
                if raw.get_content_type() == "text/html":
                    body_text = _strip_html(decoded)
                else:
                    body_text = decoded
        except Exception as e:
            logger.warning(f"解析单部分邮件正文失败: {e}")

    # 截取前 500 字
    body_preview = body_text[:500] if body_text else ""

    return ParsedMessage(
        id=msg_id,
        received_at=received_at,
        from_addr=from_addr,
        subject=subject,
        body_preview=body_preview,
        attachments=attachments,
        raw_message=raw,
    )
