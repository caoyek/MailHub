"""
deps.py - 公共依赖（JWT Token 校验）
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

JWT_SECRET = os.getenv("NEXTAUTH_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7


def create_token(email: str) -> str:
    """创建 JWT Token"""
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[str]:
    """验证 JWT Token，返回 email 或 None"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email and datetime.fromtimestamp(payload["exp"], tz=timezone.utc) > datetime.now(timezone.utc):
            return email
        return None
    except JWTError as e:
        logger.warning(f"Token 验证失败: {e}")
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """FastAPI 依赖：校验 Bearer Token"""
    if credentials is None:
        raise HTTPException(status_code=401, detail="未提供认证凭证")
    email = verify_token(credentials.credentials)
    if email is None:
        raise HTTPException(status_code=401, detail="认证无效或已过期")
    return email
