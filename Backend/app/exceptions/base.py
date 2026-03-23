from typing import Any, Optional
from fastapi import HTTPException, status
from app.exceptions.error_codes import ErrorCode


class AppException(HTTPException):
    def __init__(
        self,
        error_code: ErrorCode,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: Optional[str] = None,
        data: Any = None,
        headers: Optional[dict] = None,
    ):
        self.error_code = error_code
        self.detail = detail or error_code.message
        self.data = data
        super().__init__(
            status_code=status_code,
            detail=self.detail,
            headers=headers
        )

    def to_dict(self) -> dict:
        return {
            "code": int(self.error_code.code),
            "message": self.detail,
            "data": self.data
        }


class BadRequestException(AppException):
    def __init__(self, detail: str = "请求参数错误", data: Any = None):
        super().__init__(
            error_code=ErrorCode.BAD_REQUEST,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            data=data
        )


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "未授权访问", data: Any = None):
        super().__init__(
            error_code=ErrorCode.UNAUTHORIZED,
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            data=data,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(AppException):
    def __init__(self, detail: str = "禁止访问", data: Any = None):
        super().__init__(
            error_code=ErrorCode.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            data=data
        )


class NotFoundException(AppException):
    def __init__(self, detail: str = "资源不存在", data: Any = None):
        super().__init__(
            error_code=ErrorCode.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            data=data
        )


class ConflictException(AppException):
    def __init__(self, detail: str = "资源冲突", data: Any = None):
        super().__init__(
            error_code=ErrorCode.CONFLICT,
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            data=data
        )


class ValidationException(AppException):
    def __init__(self, detail: str = "数据验证失败", data: Any = None):
        super().__init__(
            error_code=ErrorCode.VALIDATION_ERROR,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            data=data
        )


class DatabaseException(AppException):
    def __init__(self, detail: str = "数据库操作失败", data: Any = None):
        super().__init__(
            error_code=ErrorCode.DATABASE_ERROR,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            data=data
        )
