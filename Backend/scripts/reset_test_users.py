#!/usr/bin/env python3
"""
重新创建测试用户（使用新的密码加密方式）
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
from sqlalchemy import select, delete

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

async def reset_test_users():
    """重新创建测试用户"""
    async with AsyncSessionLocal() as db:
        # 删除现有测试用户
        test_emails = ["test@example.com", "admin@example.com"]
        for email in test_emails:
            await db.execute(delete(User).where(User.email == email))
        await db.commit()
        print("✓ 已删除旧测试用户")
        
        # 测试用户列表（使用SHA256加密后的密码）
        import hashlib
        
        test_users = [
            {
                "email": "test@example.com",
                "password": hashlib.sha256("123456".encode()).hexdigest(),  # 前端发送的SHA256格式
                "nickname": "测试用户",
                "role": UserRole.user,
                "description": "普通测试用户"
            },
            {
                "email": "admin@example.com",
                "password": hashlib.sha256("admin123".encode()).hexdigest(),  # 前端发送的SHA256格式
                "nickname": "管理员",
                "role": UserRole.admin,
                "description": "管理员用户"
            }
        ]
        
        for user_info in test_users:
            try:
                # 创建用户（密码已经是SHA256格式，会再经过bcrypt）
                password_hash = get_password_hash(user_info["password"])
                new_user = User(
                    email=user_info["email"],
                    nickname=user_info["nickname"],
                    password_hash=password_hash,
                    role=user_info["role"],
                    status=UserStatus.active,
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
        print("测试账号信息（密码已更新为SHA256+BCrypt双重加密）：")
        print("="*50)
        print("\n【普通用户】")
        print("  邮箱: test@example.com")
        print("  密码: 123456")
        print("\n【管理员用户】")
        print("  邮箱: admin@example.com")
        print("  密码: admin123")
        print("\n" + "="*50)

if __name__ == "__main__":
    asyncio.run(reset_test_users())
