from enum import Enum


class ErrorCode(Enum):
    SUCCESS = ("200", "操作成功")
    CREATED = ("201", "创建成功")

    BAD_REQUEST = ("400", "请求参数错误")
    VALIDATION_ERROR = ("400001", "数据验证失败")
    PARAM_MISSING = ("400002", "缺少必要参数")
    PARAM_FORMAT_ERROR = ("400003", "参数格式错误")

    UNAUTHORIZED = ("401", "未授权访问")
    TOKEN_INVALID = ("401001", "无效的访问令牌")
    TOKEN_EXPIRED = ("401002", "访问令牌已过期")
    LOGIN_REQUIRED = ("401003", "请先登录")
    LOGIN_FAILED = ("401004", "邮箱或密码错误")

    FORBIDDEN = ("403", "禁止访问")
    PERMISSION_DENIED = ("403001", "权限不足")
    ACCOUNT_BANNED = ("403002", "账号已被禁用")
    ACCOUNT_INACTIVE = ("403003", "账号未激活")

    NOT_FOUND = ("404", "资源不存在")
    USER_NOT_FOUND = ("404001", "用户不存在")
    ARTICLE_NOT_FOUND = ("404002", "文章不存在")
    CATEGORY_NOT_FOUND = ("404003", "分类不存在")
    TAG_NOT_FOUND = ("404004", "标签不存在")

    CONFLICT = ("409", "资源冲突")
    EMAIL_EXISTS = ("409001", "邮箱已被注册")
    NICKNAME_EXISTS = ("409002", "昵称已被使用")
    ARTICLE_SLUG_EXISTS = ("409003", "文章别名已存在")

    SERVER_ERROR = ("500", "服务器内部错误")
    DATABASE_ERROR = ("500001", "数据库操作失败")
    FILE_UPLOAD_ERROR = ("500002", "文件上传失败")
    EMAIL_SEND_ERROR = ("500003", "邮件发送失败")

    def __init__(self, code: str, message: str):
        self._code = code
        self._message = message

    @property
    def code(self) -> str:
        return self._code

    @property
    def message(self) -> str:
        return self._message
    
    def __str__(self) -> str:
        return self._code
