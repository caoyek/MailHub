"""
router.py - 路由规则匹配引擎
从 rules.json（通过 store.get_rules()）读取规则，
对邮件进行匹配，返回所有命中的 target 列表。
"""

import re
import logging
from typing import Optional

from src.parser import ParsedMessage
from src import store

logger = logging.getLogger(__name__)


def match_rules(message: ParsedMessage, account_id: str = "") -> tuple[list[dict], Optional[str]]:
    """
    对一封邮件执行所有启用的路由规则（按 priority 升序）。
    返回 (targets, matched_rule_name)。
    匹配关系：规则内各条件为 AND，任一规则命中即返回。
    若规则设置了 source_account_id，仅当 account_id 匹配时才参与评估。
    """
    rules = store.get_rules()
    # 按 priority 排序（数字越小优先级越高）
    rules.sort(key=lambda r: r.get("priority", 999))

    for rule in rules:
        if not rule.get("enabled", False):
            continue

        # 来源邮箱过滤：规则指定了 source_account_id 且与当前账户不匹配则跳过
        rule_source = rule.get("source_account_id")
        if rule_source and account_id and rule_source != account_id:
            continue

        match_conf = rule.get("match", {})
        if _check_match(message, match_conf):
            targets = rule.get("targets", [])
            rule_name = rule.get("name", "未命名规则")
            logger.info(
                f"邮件 [{message.subject[:30]}] 命中规则 [{rule_name}]，"
                f"目标渠道: {[t.get('type') for t in targets]}"
            )
            return targets, rule_name

    logger.debug(f"邮件 [{message.subject[:30]}] 未命中任何规则")
    return [], None


def _check_match(message: ParsedMessage, match_conf: dict) -> bool:
    """
    检查一封邮件是否满足给定匹配条件。
    各条件为 AND 关系：全部满足才返回 True。
    空条件视为"不限制"（通过）。
    """
    from_contains = match_conf.get("from_contains")
    subject_contains = match_conf.get("subject_contains")
    subject_regex = match_conf.get("subject_regex")

    if from_contains and from_contains.strip():
        if from_contains.strip().lower() not in message.from_addr.lower():
            return False

    if subject_contains and subject_contains.strip():
        if subject_contains.strip().lower() not in message.subject.lower():
            return False

    if subject_regex and subject_regex.strip():
        try:
            if not re.search(subject_regex.strip(), message.subject):
                return False
        except re.error as e:
            logger.error(f"正则表达式错误 [{subject_regex}]: {e}")
            return False

    return True
