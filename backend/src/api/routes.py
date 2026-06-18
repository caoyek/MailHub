"""
routes.py - 所有 REST API + WebSocket 端点
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from fastapi.responses import JSONResponse

from src import store
from src.api.deps import create_token, get_current_user, security
from src.channels.email import EmailChannel
from src.channels.wecom import WeComChannel
from src.parser import ParsedMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


# ==================== 统一响应 ====================

def ok(data=None, msg="ok"):
    return JSONResponse({"code": 0, "data": data, "msg": msg})


def fail(msg="error", code=1):
    return JSONResponse({"code": code, "data": None, "msg": msg})


# ==================== WebSocket ====================

class ConnectionManager:
    """WebSocket 连接管理器"""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket 客户端已连接，当前连接数: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
        except ValueError:
            pass
        logger.info(f"WebSocket 客户端已断开，当前连接数: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for conn in self.active_connections[:]:
            try:
                await conn.send_json(message)
            except Exception as e:
                logger.warning(f"WebSocket 广播失败: {e}")
                self.disconnect(conn)


manager = ConnectionManager()


async def broadcast_event(event: dict):
    """全局广播函数，供 scheduler 调用"""
    await manager.broadcast(event)


@router.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """实时推送 WebSocket 端点"""
    await manager.connect(websocket)
    try:
        while True:
            # 保持连接，接收客户端心跳
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ==================== Auth ====================

@router.post("/auth/login")
async def login(body: dict):
    """登录验证"""
    email = body.get("email", "")
    password = body.get("password", "")

    admin_email = os.getenv("ADMIN_EMAIL", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin")

    if email == admin_email and password == admin_password:
        token = create_token(email)
        return ok({"token": token, "email": email})
    return fail("账号或密码错误")


# ==================== Stats ====================

@router.get("/stats")
async def get_stats(user: str = Depends(get_current_user)):
    """获取今日统计"""
    today = datetime.now().strftime("%Y-%m-%d")
    data = store.get_stats(today)
    return ok(data)


@router.get("/stats/range")
async def get_stats_range(
    days: int = Query(7, ge=1, le=30),
    user: str = Depends(get_current_user),
):
    """获取近 N 天统计"""
    result = {}
    for i in range(days):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        result[date] = store.get_stats(date)
    return ok(result)


# ==================== Logs ====================

@router.get("/logs")
async def get_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    from_addr: Optional[str] = None,
    matched_rule: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: str = Depends(get_current_user),
):
    """分页查询处理日志"""
    filters = {}
    if status:
        filters["status"] = status
    if from_addr:
        filters["from_addr"] = from_addr
    if matched_rule:
        filters["matched_rule"] = matched_rule
    if date_from:
        filters["date_from"] = date_from
    if date_to:
        filters["date_to"] = date_to

    data = store.get_logs(filters, page, page_size)
    return ok(data)


# ==================== Rules ====================

@router.get("/rules")
async def get_rules(user: str = Depends(get_current_user)):
    """获取所有路由规则"""
    data = store.get_rules()
    return ok(data)


@router.post("/rules")
async def add_rule(body: dict, user: str = Depends(get_current_user)):
    """新增路由规则"""
    try:
        rule = store.add_rule(body)
        return ok(rule, "规则已创建")
    except Exception as e:
        return fail(f"创建规则失败: {e}")


@router.put("/rules/{rule_id}")
async def update_rule(rule_id: str, body: dict, user: str = Depends(get_current_user)):
    """更新路由规则"""
    result = store.update_rule(rule_id, body)
    if result is None:
        return fail("规则不存在")
    return ok(result, "规则已更新")


@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str, user: str = Depends(get_current_user)):
    """删除路由规则"""
    success = store.delete_rule(rule_id)
    if not success:
        return fail("规则不存在")
    return ok(msg="规则已删除")


# ==================== Channels ====================

@router.get("/channels")
async def get_channels(user: str = Depends(get_current_user)):
    """获取所有渠道配置"""
    data = store.get_channels()
    return ok(data)


@router.put("/channels/{channel_id}")
async def update_channel(channel_id: str, body: dict, user: str = Depends(get_current_user)):
    """更新渠道配置"""
    result = store.update_channel(channel_id, body)
    if result is None:
        return fail("渠道不存在")
    return ok(result, "渠道已更新")


@router.post("/channels/{channel_id}/test")
async def test_channel(channel_id: str, user: str = Depends(get_current_user)):
    """测试渠道连通性"""
    channels = store.get_channels()
    channel_conf = None
    for ch in channels:
        if ch.get("id") == channel_id:
            channel_conf = ch
            break

    if not channel_conf:
        return fail("渠道不存在")

    # 查找第一个启用的收发邮箱账户，用于设置测试消息的发件人
    accounts = store.get_mail_accounts()
    first_account = next((a for a in accounts if a.get("enabled", True)), None)
    sender_email = first_account.get("email", "noreply@mailhub.local") if first_account else "noreply@mailhub.local"

    # 构建测试消息
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    test_msg = ParsedMessage(
        id="test-" + channel_id,
        received_at=datetime.now(),
        from_addr=f"信驿 MailHub <{sender_email}>",
        subject="[验路] 渠道连通性测试",
        body_preview=(
            f"驿路验通于 {now}。\n\n"
            "此消息由信驿 MailHub 自动发出，用于确认转发渠道是否畅通。"
            "若您在目标端收到本消息，说明该驿路配置正确、投递正常，可投入使用。"
        ),
        attachments=[],
        raw_message=None,
    )

    ch_type = channel_conf.get("type", "")
    config = channel_conf.get("config", {})

    if ch_type == "wecom":
        channel = WeComChannel()
        target_config = {"webhook_url": config.get("webhook_url", "")}
    elif ch_type == "email":
        channel = EmailChannel()
        target_config = {"to": config.get("to", [])}
        # 从收发邮箱账户中查找第一个启用账户的 SMTP 凭证
        accounts = store.get_mail_accounts()
        sender = next((a for a in accounts if a.get("enabled", True) and a.get("password")), None)
        if sender:
            target_config["smtp_host"] = sender.get("smtp_host", "")
            target_config["smtp_port"] = sender.get("smtp_port", 465)
            target_config["smtp_user"] = sender.get("email", "")
            target_config["smtp_pass"] = sender.get("password", "")
        else:
            return fail("未找到已配置密码的收发邮箱账户，请先在「收发邮箱」中编辑账户并填写密码")
    else:
        return fail(f"未知渠道类型: {ch_type}")

    try:
        success = await asyncio.to_thread(channel.send, test_msg, target_config)
    except Exception as e:
        logger.error(f"渠道测试异常: {e}")
        store.update_channel(channel_id, {
            "last_tested_at": datetime.now().isoformat(),
            "last_test_result": "fail",
        })
        return fail(f"渠道连通测试失败: {e}")

    # 更新测试状态
    store.update_channel(channel_id, {
        "last_tested_at": datetime.now().isoformat(),
        "last_test_result": "success" if success else "fail",
    })

    if success:
        return ok({"result": "success"}, "渠道连通正常")
    return fail("渠道连通测试失败")


@router.post("/channels")
async def add_channel(body: dict, user: str = Depends(get_current_user)):
    """新增渠道"""
    try:
        channel = store.add_channel(body)
        return ok(channel, "渠道已创建")
    except Exception as e:
        return fail(f"创建渠道失败: {e}")


@router.delete("/channels/{channel_id}")
async def delete_channel(channel_id: str, user: str = Depends(get_current_user)):
    """删除渠道"""
    success = store.delete_channel(channel_id)
    if not success:
        return fail("渠道不存在")
    return ok(msg="渠道已删除")


# ==================== Mail Accounts ====================

@router.get("/mail-accounts")
async def get_mail_accounts(user: str = Depends(get_current_user)):
    """获取所有收发邮箱账户"""
    data = store.get_mail_accounts()
    return ok(data)


@router.post("/mail-accounts")
async def add_mail_account(body: dict, user: str = Depends(get_current_user)):
    """新增收发邮箱账户"""
    try:
        account = store.add_mail_account(body)
        return ok(account, "邮箱账户已创建")
    except Exception as e:
        return fail(f"创建邮箱账户失败: {e}")


@router.put("/mail-accounts/{account_id}")
async def update_mail_account(account_id: str, body: dict, user: str = Depends(get_current_user)):
    """更新收发邮箱账户"""
    result = store.update_mail_account(account_id, body)
    if result is None:
        return fail("邮箱账户不存在")
    return ok(result, "邮箱账户已更新")


@router.delete("/mail-accounts/{account_id}")
async def delete_mail_account(account_id: str, user: str = Depends(get_current_user)):
    """删除收发邮箱账户"""
    success = store.delete_mail_account(account_id)
    if not success:
        return fail("邮箱账户不存在")
    return ok(msg="邮箱账户已删除")
