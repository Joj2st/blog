from fastapi import APIRouter, Depends
from app.schemas.user import (
    UserCreate, UserResponse, LoginRequest, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.user_service import UserService
from app.core.dependencies import get_user_service
from app.utils.response import ApiResponse
from app.exceptions import ConflictException, UnauthorizedException

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", summary="用户注册")
async def register(
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service),
):
    try:
        result = await user_service.register(user_in)
        return ApiResponse.created(
            data={
                "user": UserResponse.model_validate(result["user"]),
                "token": result["token"],
            },
            message="注册成功"
        )
    except Exception as e:
        if "已被注册" in str(e):
            raise ConflictException(detail="邮箱已被注册")
        raise


@router.post("/login", summary="用户登录")
async def login(
    login_in: LoginRequest,
    user_service: UserService = Depends(get_user_service),
):
    try:
        result = await user_service.login(login_in.email, login_in.password)
        return ApiResponse.success(
            data={
                "user": UserResponse.model_validate(result["user"]),
                "token": result["token"],
            },
            message="登录成功"
        )
    except Exception as e:
        if "邮箱或密码错误" in str(e) or "账号已被禁用" in str(e):
            raise UnauthorizedException(detail=str(e))
        raise


@router.post("/logout", summary="退出登录")
async def logout():
    return ApiResponse.success(message="退出成功")


@router.post("/refresh", summary="刷新Token")
async def refresh_token(
    refresh_in: RefreshTokenRequest,
    user_service: UserService = Depends(get_user_service),
):
    token = await user_service.refresh_token(refresh_in.refresh_token)
    return ApiResponse.success(data=token, message="刷新成功")


@router.post("/forgot-password", summary="忘记密码")
async def forgot_password(
    request: ForgotPasswordRequest,
    user_service: UserService = Depends(get_user_service),
):
    token = await user_service.forgot_password(request.email)
    if token:
        print(f"[DEV] Password reset token for {request.email}: {token}")
    return ApiResponse.success(message="重置邮件已发送")


@router.post("/reset-password", summary="重置密码")
async def reset_password(
    request: ResetPasswordRequest,
    user_service: UserService = Depends(get_user_service),
):
    await user_service.reset_password(request.token, request.password)
    return ApiResponse.success(message="密码重置成功")
