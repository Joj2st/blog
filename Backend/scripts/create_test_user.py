#!/usr/bin/env python3
"""
创建测试用户的脚本
"""
import asyncio
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 先加载配置
from app.core.config import settings

# 然后导入其他模块
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.user import User, UserRole, UserStatus
from app.core.security import get_password_hash
from sqlalchemy import select

# 创建引擎和会话
engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def create_test_users():
    """创建测试用户"""
    async with AsyncSessionLocal() as db:
        # 测试用户列表
        test_users = [
            {
                "email": "test@example.com",
                "password": "123456",
                "nickname": "测试用户",
                "role": UserRole.user,
                "description": "普通测试用户"
            },
            {
                "email": "admin@example.com",
                "password": "admin123",
                "nickname": "管理员",
                "role": UserRole.admin,
                "description": "管理员用户"
            }
        ]
        
        for user_info in test_users:
            try:
                # 检查用户是否已存在
                result = await db.execute(
                    select(User).where(User.email == user_info["email"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    print(f"✓ {user_info['description']} ({user_info['email']}) 已存在")
                    continue
                
                # 创建用户
                password_hash = get_password_hash(user_info["password"])
                new_user = User(
                    email=user_info["email"],
                    nickname=user_info["nickname"],
                    password_hash=password_hash,
                    role=user_info["role"],
                    status=UserStatus.ACTIVE,
                    avatar=None,
                    bio=None
                )
                
                db.add(new_user)
                await db.commit()
                print(f"✓ {user_info['description']} ({user_info['email']}) 创建成功")
                
            except Exception as e:
                await db.rollback()
                print(f"✗ {user_info['description']} ({user_info['email']}) 创建失败: {e}")
        
        print("\n" + "="*50)
        print("测试账号信息：")
        print("="*50)
        print("\n【普通用户】")
        print("  邮箱: test@example.com")
        print("  密码: 123456")
        print("\n【管理员用户】")
        print("  邮箱: admin@example.com")
        print("  密码: admin123")
        print("\n" + "="*50)

if __name__ == "__main__":
    asyncio.run(create_test_users())
