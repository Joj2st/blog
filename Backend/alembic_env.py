import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ----------------------------------------------------------------------
# 1. 导入项目配置和模型
# ----------------------------------------------------------------------
# 确保项目根目录在 sys.path 中，否则可能找不到 app 模块
import sys
import os

sys.path.append(os.getcwd())

from app.core.config import settings
from app.db.base_class import Base
# [重要] 必须导入所有的 Models，否则 Alembic 无法自动生成表
from app.models import user  # noqa

# ----------------------------------------------------------------------
# 2. 初始化 Alembic Config
# ----------------------------------------------------------------------
config = context.config

# [关键步骤] 将 sqlalchemy.url 替换为 settings 中的异步连接字符串
# 这确保了 Alembic 使用代码中配置的数据库地址，而不是 alembic.ini 中的地址
config.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)

# 配置日志
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ----------------------------------------------------------------------
# 3. 设置元数据 (Target Metadata)
# ----------------------------------------------------------------------
# 将 Base.metadata 赋值给 target_metadata，这样 autogenerate 才能检测到模型变化
target_metadata = Base.metadata


# ----------------------------------------------------------------------
# 4. 定义迁移模式 (Offline / Online)
# ----------------------------------------------------------------------

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """实际执行迁移的同步函数，由 async 函数调用"""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode (Async)."""

    # 创建异步引擎
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # 桥接：在异步连接中运行同步的迁移逻辑
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


# ----------------------------------------------------------------------
# 5. 执行入口
# ----------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    # 使用 asyncio 运行异步迁移
    asyncio.run(run_migrations_online())