from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ResponseModel(BaseModel, Generic[T]):
    code: int
    message: str
    data: Optional[T] = None


class ApiResponse:
    SUCCESS_CODE = 200
    CREATED_CODE = 201
    BAD_REQUEST_CODE = 400
    UNAUTHORIZED_CODE = 401
    FORBIDDEN_CODE = 403
    NOT_FOUND_CODE = 404
    CONFLICT_CODE = 409
    SERVER_ERROR_CODE = 500

    @staticmethod
    def success(data: Any = None, message: str = "success") -> dict:
        return {
            "code": ApiResponse.SUCCESS_CODE,
            "message": message,
            "data": data
        }

    @staticmethod
    def created(data: Any = None, message: str = "创建成功") -> dict:
        return {
            "code": ApiResponse.CREATED_CODE,
            "message": message,
            "data": data
        }

    @staticmethod
    def error(code: int = 500, message: str = "服务器错误", data: Any = None) -> dict:
        return {
            "code": code,
            "message": message,
            "data": data
        }

    @staticmethod
    def bad_request(message: str = "请求参数错误", data: Any = None) -> dict:
        return ApiResponse.error(
            code=ApiResponse.BAD_REQUEST_CODE,
            message=message,
            data=data
        )

    @staticmethod
    def unauthorized(message: str = "未授权访问", data: Any = None) -> dict:
        return ApiResponse.error(
            code=ApiResponse.UNAUTHORIZED_CODE,
            message=message,
            data=data
        )

    @staticmethod
    def forbidden(message: str = "禁止访问", data: Any = None) -> dict:
        return ApiResponse.error(
            code=ApiResponse.FORBIDDEN_CODE,
            message=message,
            data=data
        )

    @staticmethod
    def not_found(message: str = "资源不存在", data: Any = None) -> dict:
        return ApiResponse.error(
            code=ApiResponse.NOT_FOUND_CODE,
            message=message,
            data=data
        )

    @staticmethod
    def conflict(message: str = "资源冲突", data: Any = None) -> dict:
        return ApiResponse.error(
            code=ApiResponse.CONFLICT_CODE,
            message=message,
            data=data
        )

    @staticmethod
    def paginated(
        items: list,
        total: int,
        page: int,
        page_size: int,
        message: str = "success"
    ) -> dict:
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
        return ApiResponse.success(
            data={
                "list": items,
                "pagination": {
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": total_pages
                }
            },
            message=message
        )
