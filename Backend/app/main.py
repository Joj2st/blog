import uvicorn
from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.utils.logger import setup_logging
from app.utils.response import ApiResponse
from app.middlewares import RequestLoggingMiddleware, TokenValidationMiddleware, setup_cors
from app.exceptions.handlers import register_exception_handlers
from app.api.v1.router import api_router


def create_application() -> FastAPI:
    setup_logging()
    
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        description=settings.PROJECT_DESCRIPTION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    
    setup_cors(application)
    application.add_middleware(TokenValidationMiddleware)
    application.add_middleware(RequestLoggingMiddleware)
    register_exception_handlers(application)
    
    application.include_router(api_router, prefix=settings.API_V1_STR)
    
    return application


app = create_application()


@app.get("/", summary="根路径")
async def root():
    return ApiResponse.success(
        data={
            "name": settings.PROJECT_NAME,
            "version": settings.PROJECT_VERSION,
            "docs": "/docs",
            "redoc": "/redoc"
        },
        message="Welcome to Blog API"
    )


@app.get("/health", summary="健康检查")
async def health_check():
    return ApiResponse.success(
        data={
            "status": "healthy",
            "environment": settings.ENVIRONMENT
        }
    )


@app.get("/test-db", summary="数据库连接测试")
async def test_database():
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            
            result2 = await session.execute(text("SELECT DATABASE() as db_name"))
            db_name = result2.fetchone()
            
            result3 = await session.execute(text("SELECT COUNT(*) as count FROM users"))
            user_count = result3.fetchone()
            
            return ApiResponse.success(
                data={
                    "test_query": row.test if row else None,
                    "database": db_name.db_name if db_name else None,
                    "users_count": user_count.count if user_count else 0
                },
                message="数据库连接成功"
            )
    except Exception as e:
        return ApiResponse.error(
            code=500,
            message=f"数据库连接失败: {str(e)}"
        )


if __name__ == '__main__':
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=settings.DEBUG
    )
