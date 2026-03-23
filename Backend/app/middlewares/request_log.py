import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        
        start_time = time.time()
        
        logger.info(
            f"[{request_id}] Request started | "
            f"Method: {request.method} | "
            f"Path: {request.url.path} | "
            f"Client: {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            logger.info(
                f"[{request_id}] Request completed | "
                f"Status: {response.status_code} | "
                f"Duration: {process_time:.2f}ms"
            )
            
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
            return response
            
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"[{request_id}] Request failed | "
                f"Error: {str(exc)} | "
                f"Duration: {process_time:.2f}ms"
            )
            raise


PUBLIC_PATHS = [
    "/",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/health",
    "/test-db",
]

PUBLIC_PREFIXES = [
    "/api/v1/auth/",
    "/api/v1/articles/public",
    "/api/v1/categories",
    "/api/v1/comments/public",
    "/api/v1/search",
    "/api/v1/media/public",
    "/api/v1/popups/active",
]


class TokenValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        
        if any(path.startswith(prefix) for prefix in PUBLIC_PREFIXES):
            return await call_next(request)
        
        if path in PUBLIC_PATHS:
            return await call_next(request)
        
        return await call_next(request)
