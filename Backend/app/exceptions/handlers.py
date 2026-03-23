import logging
from typing import Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.exceptions.base import AppException
from app.exceptions.error_codes import ErrorCode
from app.utils.response import ApiResponse


logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.warning(
            f"AppException: {exc.error_code.code} - {exc.detail} | "
            f"Path: {request.url.path} | Method: {request.method}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict()
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            errors.append({
                "field": field,
                "message": error["msg"],
                "type": error["type"]
            })
        
        logger.warning(
            f"ValidationError: {errors} | "
            f"Path: {request.url.path} | Method: {request.method}"
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "code": int(ErrorCode.VALIDATION_ERROR.code),
                "message": "数据验证失败",
                "data": {"errors": errors}
            }
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error(
            f"DatabaseError: {str(exc)} | "
            f"Path: {request.url.path} | Method: {request.method}",
            exc_info=True
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ApiResponse.error(
                code=500,
                message="数据库操作失败，请稍后重试"
            )
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(
            f"UnhandledException: {type(exc).__name__} - {str(exc)} | "
            f"Path: {request.url.path} | Method: {request.method}",
            exc_info=True
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ApiResponse.error(
                code=500,
                message="服务器内部错误，请稍后重试"
            )
        )
