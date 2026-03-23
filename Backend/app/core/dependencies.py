from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.services.user_service import UserService
from app.services.article_service import ArticleService
from app.services.category_service import CategoryService, TagService
from app.services.comment_service import CommentService
from app.services.media_service import MediaService
from app.services.stats_service import StatsService
from app.services.setting_service import SettingService
from app.services.popup_service import PopupService
from app.models.user import User, UserRole
from app.core.security import decode_token
from app.core.config import settings

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


async def get_article_service(db: AsyncSession = Depends(get_db)) -> ArticleService:
    return ArticleService(db)


async def get_category_service(db: AsyncSession = Depends(get_db)) -> CategoryService:
    return CategoryService(db)


async def get_tag_service(db: AsyncSession = Depends(get_db)) -> TagService:
    return TagService(db)


async def get_comment_service(db: AsyncSession = Depends(get_db)) -> CommentService:
    return CommentService(db)


async def get_media_service(db: AsyncSession = Depends(get_db)) -> MediaService:
    return MediaService(db)


async def get_stats_service(db: AsyncSession = Depends(get_db)) -> StatsService:
    return StatsService(db)


async def get_setting_service(db: AsyncSession = Depends(get_db)) -> SettingService:
    return SettingService(db)


async def get_popup_service(db: AsyncSession = Depends(get_db)) -> PopupService:
    return PopupService(db)


async def get_dev_user(db: AsyncSession = Depends(get_db)) -> User:
    result = await db.execute(select(User).where(User.role == UserRole.admin).limit(1))
    user = result.scalars().first()
    if user:
        return user
    raise HTTPException(status_code=500, detail="开发环境需要至少一个管理员用户")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_service: UserService = Depends(get_user_service),
    db: AsyncSession = Depends(get_db),
) -> User:
    if settings.DEBUG or settings.ENVIRONMENT == "development":
        return await get_dev_user(db)
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的访问令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = int(payload.get("sub"))
    user = await user_service.get_current_user(user_id)
    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    user_service: UserService = Depends(get_user_service),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if settings.DEBUG or settings.ENVIRONMENT == "development":
        return await get_dev_user(db)
    
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        return None
    
    try:
        user_id = int(payload.get("sub"))
        user = await user_service.get_current_user(user_id)
        return user
    except Exception:
        return None


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )
    return current_user


async def get_current_author_or_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in [UserRole.author, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要作者或管理员权限",
        )
    return current_user
