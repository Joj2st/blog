from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_user import crud_user
from app.schemas.user import (
    UserCreate, UserUpdate, UserUpdatePassword, UserUpdateByAdmin
)
from app.models.user import User, UserRole, UserStatus
from app.core.security import (
    verify_password, get_password_hash, create_tokens, decode_token,
    create_password_reset_token, verify_password_reset_token
)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, user_in: UserCreate) -> dict:
        existing_user = await crud_user.get_by_email(self.db, email=user_in.email)
        if existing_user:
            raise HTTPException(status_code=409, detail="邮箱已被注册")

        password_hash = get_password_hash(user_in.password)
        user = await crud_user.create(
            self.db, obj_in=user_in, password_hash=password_hash
        )
        await self.db.commit()
        await self.db.refresh(user)

        token = create_tokens(user.id)
        return {"user": user, "token": token}

    async def login(self, email: str, password: str) -> dict:
        user = await crud_user.get_by_email(self.db, email=email)
        if not user:
            raise HTTPException(status_code=401, detail="邮箱或密码错误")

        if not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="邮箱或密码错误")

        if user.status == UserStatus.banned:
            raise HTTPException(status_code=403, detail="账号已被禁用")

        await crud_user.update_last_login(self.db, user=user)
        await self.db.commit()

        token = create_tokens(user.id)
        return {"user": user, "token": token}

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="无效的刷新令牌")

        user_id = int(payload.get("sub"))
        user = await crud_user.get_by_id(self.db, id=user_id)
        if not user:
            raise HTTPException(status_code=401, detail="用户不存在")

        return create_tokens(user.id)

    async def get_current_user(self, user_id: int) -> User:
        user = await crud_user.get_by_id(self.db, id=user_id)
        if not user:
            raise HTTPException(status_code=401, detail="用户不存在")
        if user.status == UserStatus.banned:
            raise HTTPException(status_code=403, detail="账号已被禁用")
        return user

    async def get_user_profile(self, user_id: int) -> User:
        return await self.get_current_user(user_id)

    async def update_profile(self, user_id: int, user_in: UserUpdate) -> User:
        user = await self.get_current_user(user_id)
        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def change_password(
        self, user_id: int, old_password: str, new_password: str
    ) -> None:
        user = await self.get_current_user(user_id)
        if not verify_password(old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="原密码错误")

        password_hash = get_password_hash(new_password)
        await crud_user.update_password(self.db, user=user, password_hash=password_hash)
        await self.db.commit()

    async def get_user_list(
        self,
        page: int = 1,
        page_size: int = 10,
        keyword: Optional[str] = None,
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[List[User], int]:
        return await crud_user.get_multi_filtered(
            self.db,
            page=page,
            page_size=page_size,
            keyword=keyword,
            role=role,
            status=status,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_user_by_id(self, user_id: int) -> User:
        user = await crud_user.get_by_id(self.db, id=user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        return user

    async def update_user_by_admin(
        self, user_id: int, user_in: UserUpdateByAdmin
    ) -> User:
        user = await self.get_user_by_id(user_id)
        user = await crud_user.update_by_admin(self.db, db_obj=user, obj_in=user_in)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete_user(self, user_id: int) -> None:
        user = await self.get_user_by_id(user_id)
        await self.db.delete(user)
        await self.db.commit()

    async def batch_delete_users(self, ids: List[int]) -> int:
        count = await crud_user.delete_multi(self.db, ids=ids)
        await self.db.commit()
        return count

    async def forgot_password(self, email: str) -> str:
        user = await crud_user.get_by_email(self.db, email=email)
        if not user:
            return None
        
        token = create_password_reset_token(email)
        return token

    async def reset_password(self, token: str, new_password: str) -> bool:
        email = verify_password_reset_token(token)
        if not email:
            raise HTTPException(status_code=400, detail="无效或过期的重置令牌")
        
        user = await crud_user.get_by_email(self.db, email=email)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        password_hash = get_password_hash(new_password)
        await crud_user.update_password(self.db, user=user, password_hash=password_hash)
        await self.db.commit()
        return True
