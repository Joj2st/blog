from typing import List, Optional
from sqlalchemy import select, func, delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserCreate, UserUpdate, UserUpdateByAdmin
from datetime import datetime


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        query = select(User).filter(User.email == email)
        result = await db.execute(query)
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate, password_hash: str) -> User:
        db_obj = User(
            email=obj_in.email,
            password_hash=password_hash,
            nickname=obj_in.nickname,
            role=UserRole.user,
            status=UserStatus.active,
        )
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def update_password(self, db: AsyncSession, *, user: User, password_hash: str) -> User:
        user.password_hash = password_hash
        user.updated_at = datetime.utcnow()
        db.add(user)
        await db.flush()
        return user

    async def update_last_login(self, db: AsyncSession, *, user: User) -> User:
        user.last_login_at = datetime.utcnow()
        db.add(user)
        await db.flush()
        return user

    async def update_by_admin(
        self, db: AsyncSession, *, db_obj: User, obj_in: UserUpdateByAdmin
    ) -> User:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db_obj.updated_at = datetime.utcnow()
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def get_multi_filtered(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 10,
        keyword: Optional[str] = None,
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[List[User], int]:
        query = select(User)
        count_query = select(func.count(User.id))

        if keyword:
            keyword_filter = or_(
                User.email.ilike(f"%{keyword}%"),
                User.nickname.ilike(f"%{keyword}%"),
            )
            query = query.filter(keyword_filter)
            count_query = count_query.filter(keyword_filter)

        if role:
            query = query.filter(User.role == role)
            count_query = count_query.filter(User.role == role)

        if status:
            query = query.filter(User.status == status)
            count_query = count_query.filter(User.status == status)

        sort_column = getattr(User, sort_by, User.created_at)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        users = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return users, total

    async def delete_multi(self, db: AsyncSession, *, ids: List[int]) -> int:
        query = delete(User).filter(User.id.in_(ids))
        result = await db.execute(query)
        return result.rowcount


crud_user = CRUDUser(User)
