"""
base.py - BaseChannel 抽象基类
所有渠道实现必须继承此类，提供统一的 send 接口。
"""

from abc import ABC, abstractmethod
import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.parser import ParsedMessage

logger = logging.getLogger(__name__)


class BaseChannel(ABC):
    """渠道抽象基类"""

    @abstractmethod
    def send(self, message: "ParsedMessage", config: dict) -> bool:
        """
        发送消息到目标渠道。
        成功返回 True，失败返回 False（不抛出异常）。
        """
        ...


def send_to_targets(message: "ParsedMessage", targets: list[dict], smtp_config: dict = None) -> tuple[bool, list[str]]:
    """
    将消息发送到所有目标渠道。
    smtp_config: 可选的 SMTP 凭证（来自收发邮箱账户），供 email 渠道使用。
    返回 (all_success, error_messages)。
    """
    from src.channels.email import EmailChannel
    from src.channels.wecom import WeComChannel

    channel_map = {
        "email": EmailChannel(),
        "wecom": WeComChannel(),
    }

    all_success = True
    errors = []

    for target in targets:
        ch_type = target.get("type", "")
        channel = channel_map.get(ch_type)

        if not channel:
            msg = f"未知渠道类型: {ch_type}"
            logger.error(msg)
            errors.append(msg)
            all_success = False
            continue

        # 对 email 渠道注入 SMTP 凭证
        config = dict(target)
        if ch_type == "email" and smtp_config:
            config.update(smtp_config)

        try:
            success = channel.send(message, config)
            if not success:
                all_success = False
                errors.append(f"渠道 {ch_type} 发送失败")
        except Exception as e:
            msg = f"渠道 {ch_type} 异常: {e}"
            logger.error(msg)
            errors.append(msg)
            all_success = False

    return all_success, errors
