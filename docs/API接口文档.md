# 博客系统 API 接口文档

## 一、接口规范概述

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `http://localhost:8000/api/v1` |
| 接口协议 | HTTP/HTTPS |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 接口版本 | v1 |

### 1.2 认证方式

使用 JWT Bearer Token 认证：

```
Authorization: Bearer <access_token>
```

---

## 二、统一响应格式

### 2.1 成功响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 2.2 错误响应格式

```json
{
  "code": 400,
  "message": "错误描述信息",
  "data": null
}
```

### 2.3 分页响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [ ... ],
    "pagination": {
      "total": 100,
      "page": 1,
      "page_size": 10,
      "total_pages": 10
    }
  }
}
```

### 2.4 无数据响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 三、响应状态码分类

### 3.1 HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功（无返回内容） |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或 Token 失效 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable Entity | 参数验证失败 |
| 429 | Too Many Requests | 请求频率超限 |
| 500 | Internal Server Error | 服务器内部错误 |

### 3.2 业务状态码

业务状态码放在响应体的 `code` 字段中：

| 状态码范围 | 分类 | 说明 |
|------------|------|------|
| 200 | 成功 | 操作成功 |
| 400-499 | 客户端错误 | 参数错误、权限不足等 |
| 500-599 | 服务端错误 | 服务器内部错误 |

#### 详细业务状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 失效 |
| 402 | Token 已过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源已存在（冲突） |
| 422 | 数据验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 501 | 服务暂不可用 |
| 502 | 数据库错误 |
| 503 | 第三方服务错误 |

---

## 四、请求方法规范

### 4.1 HTTP 方法

| 方法 | 说明 | 是否幂等 | 使用场景 |
|------|------|----------|----------|
| GET | 获取资源 | 是 | 查询、列表 |
| POST | 创建资源 | 否 | 新增、登录 |
| PUT | 全量更新 | 是 | 整体替换 |
| PATCH | 部分更新 | 是 | 部分修改 |
| DELETE | 删除资源 | 是 | 删除 |

### 4.2 请求参数位置

| 参数位置 | 说明 | 使用场景 |
|----------|------|----------|
| Path | URL 路径参数 | 资源 ID：`/users/{id}` |
| Query | URL 查询参数 | 分页、筛选：`?page=1&size=10` |
| Body | 请求体参数 | 创建、更新数据 |
| Header | 请求头参数 | 认证、语言设置 |

### 4.3 请求头规范

| Header | 必填 | 说明 |
|--------|------|------|
| Content-Type | 是 | `application/json` |
| Authorization | 条件 | `Bearer <token>`（需认证接口） |
| Accept | 否 | `application/json` |
| X-Request-ID | 否 | 请求追踪 ID |

---

## 五、通用参数格式

### 5.1 分页参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | int | 否 | 1 | 当前页码 |
| page_size | int | 否 | 10 | 每页数量（最大 100） |

**示例：**
```
GET /api/v1/articles?page=1&page_size=10
```

### 5.2 排序参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sort_by | string | 否 | created_at | 排序字段 |
| sort_order | string | 否 | desc | 排序方向：asc/desc |

**示例：**
```
GET /api/v1/articles?sort_by=published_at&sort_order=desc
```

### 5.3 搜索参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| start_date | string | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 结束日期（YYYY-MM-DD） |

**示例：**
```
GET /api/v1/articles?keyword=Next.js&start_date=2024-01-01&end_date=2024-12-31
```

### 5.4 ID 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 资源唯一标识 |

**示例：**
```
GET /api/v1/articles/123
```

---

## 六、模块接口详情

### 6.1 认证模块 (Auth)

#### 6.1.1 用户注册

**接口：** `POST /api/v1/auth/register`

**权限：** 公开

**请求参数：**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "nickname": "用户昵称",
  "captcha": "123456"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码（6-20位，含字母和数字） |
| nickname | string | 是 | 用户昵称（2-20字符） |
| captcha | string | 否 | 验证码 |

**响应数据：**
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "用户昵称",
      "avatar": null,
      "role": "user",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "bearer",
      "expires_in": 3600
    }
  }
}
```

---

#### 6.1.2 用户登录

**接口：** `POST /api/v1/auth/login`

**权限：** 公开

**请求参数：**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**响应数据：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "用户昵称",
      "avatar": "https://example.com/avatar.jpg",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "bearer",
      "expires_in": 3600
    }
  }
}
```

---

#### 6.1.3 退出登录

**接口：** `POST /api/v1/auth/logout`

**权限：** 需登录

**请求参数：** 无

**响应数据：**
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

---

#### 6.1.4 刷新 Token

**接口：** `POST /api/v1/auth/refresh`

**权限：** 需登录

**请求参数：**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refresh_token | string | 是 | 刷新令牌 |

**响应数据：**
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

#### 6.1.5 忘记密码

**接口：** `POST /api/v1/auth/forgot-password`

**权限：** 公开

**请求参数：**
```json
{
  "email": "user@example.com"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 邮箱地址 |

**响应数据：**
```json
{
  "code": 200,
  "message": "重置邮件已发送",
  "data": null
}
```

---

#### 6.1.6 重置密码

**接口：** `POST /api/v1/auth/reset-password`

**权限：** 公开

**请求参数：**
```json
{
  "token": "reset_token_string",
  "password": "NewPassword123!"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 是 | 重置令牌（邮件中获取） |
| password | string | 是 | 新密码 |

**响应数据：**
```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

---

### 6.2 用户模块 (User)

#### 6.2.1 获取当前用户信息

**接口：** `GET /api/v1/users/me`

**权限：** 需登录

**请求参数：** 无

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "用户昵称",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "个人简介",
    "role": "admin",
    "status": "active",
    "article_count": 10,
    "comment_count": 50,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.2.2 更新当前用户信息

**接口：** `PUT /api/v1/users/me`

**权限：** 需登录

**请求参数：**
```json
{
  "nickname": "新昵称",
  "bio": "新的个人简介",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 用户昵称 |
| bio | string | 否 | 个人简介 |
| avatar | string | 否 | 头像 URL |

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "新昵称",
    "avatar": "https://example.com/new-avatar.jpg",
    "bio": "新的个人简介",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.2.3 修改密码

**接口：** `PUT /api/v1/users/me/password`

**权限：** 需登录

**请求参数：**
```json
{
  "old_password": "OldPassword123!",
  "new_password": "NewPassword456!"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| old_password | string | 是 | 原密码 |
| new_password | string | 是 | 新密码 |

**响应数据：**
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

---

#### 6.2.4 获取用户列表（管理端）

**接口：** `GET /api/v1/users`

**权限：** 管理员

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词（昵称/邮箱） |
| role | string | 否 | 角色筛选：user/author/admin |
| status | string | 否 | 状态筛选：active/inactive/banned |
| sort_by | string | 否 | 排序字段 |
| sort_order | string | 否 | 排序方向：asc/desc |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "email": "user@example.com",
        "nickname": "用户昵称",
        "avatar": "https://example.com/avatar.jpg",
        "role": "admin",
        "status": "active",
        "article_count": 10,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "page_size": 10,
      "total_pages": 10
    }
  }
}
```

---

#### 6.2.5 获取用户详情（管理端）

**接口：** `GET /api/v1/users/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 用户 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "用户昵称",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "个人简介",
    "role": "admin",
    "status": "active",
    "article_count": 10,
    "comment_count": 50,
    "last_login_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.2.6 更新用户信息（管理端）

**接口：** `PUT /api/v1/users/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 用户 ID |

**请求参数：**
```json
{
  "nickname": "新昵称",
  "role": "author",
  "status": "active"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 用户昵称 |
| role | string | 否 | 角色：user/author/admin |
| status | string | 否 | 状态：active/inactive/banned |

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "新昵称",
    "role": "author",
    "status": "active",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.2.7 删除用户（管理端）

**接口：** `DELETE /api/v1/users/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 用户 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

#### 6.2.8 批量删除用户（管理端）

**接口：** `POST /api/v1/users/batch-delete`

**权限：** 管理员

**请求参数：**
```json
{
  "ids": [1, 2, 3]
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 用户 ID 数组 |

**响应数据：**
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "success_count": 3,
    "failed_count": 0
  }
}
```

---

### 6.3 文章模块 (Article)

#### 6.3.1 获取文章列表

**接口：** `GET /api/v1/articles`

**权限：** 公开

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词 |
| category_id | int | 否 | 分类 ID |
| tag_id | int | 否 | 标签 ID |
| status | string | 否 | 状态：published/draft/archived（管理端可用） |
| author_id | int | 否 | 作者 ID |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |
| sort_by | string | 否 | 排序字段：published_at/view_count/created_at |
| sort_order | string | 否 | 排序方向：asc/desc |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "文章标题",
        "slug": "article-slug",
        "summary": "文章摘要内容...",
        "cover_image": "https://example.com/cover.jpg",
        "category": {
          "id": 1,
          "name": "技术"
        },
        "tags": [
          {"id": 1, "name": "Next.js"},
          {"id": 2, "name": "React"}
        ],
        "author": {
          "id": 1,
          "nickname": "作者昵称",
          "avatar": "https://example.com/avatar.jpg"
        },
        "status": "published",
        "is_top": false,
        "is_featured": true,
        "view_count": 1000,
        "like_count": 50,
        "comment_count": 10,
        "published_at": "2024-01-01T00:00:00Z",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "page_size": 10,
      "total_pages": 10
    }
  }
}
```

---

#### 6.3.2 获取文章详情

**接口：** `GET /api/v1/articles/{id}`

**权限：** 公开（草稿需作者或管理员）

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 文章 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "文章标题",
    "slug": "article-slug",
    "summary": "文章摘要内容...",
    "content": "# 文章正文\n\nMarkdown 内容...",
    "cover_image": "https://example.com/cover.jpg",
    "category": {
      "id": 1,
      "name": "技术",
      "slug": "tech"
    },
    "tags": [
      {"id": 1, "name": "Next.js", "slug": "nextjs"},
      {"id": 2, "name": "React", "slug": "react"}
    ],
    "author": {
      "id": 1,
      "nickname": "作者昵称",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "作者简介"
    },
    "status": "published",
    "is_top": false,
    "is_featured": true,
    "view_count": 1000,
    "like_count": 50,
    "comment_count": 10,
    "prev_article": {
      "id": 2,
      "title": "上一篇"
    },
    "next_article": {
      "id": 3,
      "title": "下一篇"
    },
    "related_articles": [
      {"id": 4, "title": "相关文章1", "cover_image": "..."},
      {"id": 5, "title": "相关文章2", "cover_image": "..."}
    ],
    "published_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.3.3 创建文章

**接口：** `POST /api/v1/articles`

**权限：** 作者/管理员

**请求参数：**
```json
{
  "title": "文章标题",
  "slug": "article-slug",
  "summary": "文章摘要",
  "content": "# 正文内容\n\nMarkdown...",
  "cover_image": "https://example.com/cover.jpg",
  "category_id": 1,
  "tag_ids": [1, 2, 3],
  "status": "draft",
  "is_top": false,
  "is_featured": false,
  "published_at": "2024-01-01T00:00:00Z"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 文章标题（1-200字符） |
| slug | string | 否 | URL 别名（自动生成） |
| summary | string | 否 | 摘要（自动从正文提取） |
| content | string | 是 | 正文内容（Markdown） |
| cover_image | string | 否 | 封面图片 URL |
| category_id | int | 是 | 分类 ID |
| tag_ids | array | 否 | 标签 ID 数组 |
| status | string | 否 | 状态：draft/published，默认 draft |
| is_top | bool | 否 | 是否置顶，默认 false |
| is_featured | bool | 否 | 是否推荐，默认 false |
| published_at | string | 否 | 发布时间（定时发布） |

**响应数据：**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 1,
    "title": "文章标题",
    "slug": "article-slug",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.3.4 更新文章

**接口：** `PUT /api/v1/articles/{id}`

**权限：** 作者（自己的文章）/管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 文章 ID |

**请求参数：**
```json
{
  "title": "新标题",
  "slug": "new-slug",
  "summary": "新摘要",
  "content": "新内容",
  "cover_image": "https://example.com/new-cover.jpg",
  "category_id": 2,
  "tag_ids": [1, 2],
  "status": "published",
  "is_top": true,
  "is_featured": true
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "title": "新标题",
    "slug": "new-slug",
    "status": "published",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.3.5 删除文章

**接口：** `DELETE /api/v1/articles/{id}`

**权限：** 作者（自己的文章）/管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 文章 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

#### 6.3.6 批量操作文章

**接口：** `POST /api/v1/articles/batch`

**权限：** 管理员

**请求参数：**
```json
{
  "ids": [1, 2, 3],
  "action": "publish",
  "category_id": 1
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 文章 ID 数组 |
| action | string | 是 | 操作：publish/draft/archive/delete/move |
| category_id | int | 否 | 分类 ID（move 操作必填） |

**响应数据：**
```json
{
  "code": 200,
  "message": "批量操作成功",
  "data": {
    "success_count": 3,
    "failed_count": 0
  }
}
```

---

#### 6.3.7 文章点赞

**接口：** `POST /api/v1/articles/{id}/like`

**权限：** 需登录

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 文章 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "like_count": 51,
    "is_liked": true
  }
}
```

---

#### 6.3.8 取消点赞

**接口：** `DELETE /api/v1/articles/{id}/like`

**权限：** 需登录

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 文章 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "取消点赞",
  "data": {
    "like_count": 50,
    "is_liked": false
  }
}
```

---

### 6.4 分类模块 (Category)

#### 6.4.1 获取分类列表

**接口：** `GET /api/v1/categories`

**权限：** 公开

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |
| parent_id | int | 否 | 父分类 ID（获取子分类） |
| sort_by | string | 否 | 排序字段 |
| sort_order | string | 否 | 排序方向 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "技术",
        "slug": "tech",
        "description": "技术相关文章",
        "parent_id": null,
        "sort_order": 1,
        "article_count": 50,
        "children": [
          {
            "id": 2,
            "name": "前端开发",
            "slug": "frontend",
            "parent_id": 1,
            "article_count": 30
          }
        ],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "page_size": 10,
      "total_pages": 1
    }
  }
}
```

---

#### 6.4.2 获取分类详情

**接口：** `GET /api/v1/categories/{id}`

**权限：** 公开

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 分类 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "技术",
    "slug": "tech",
    "description": "技术相关文章",
    "parent_id": null,
    "sort_order": 1,
    "article_count": 50,
    "children": [...],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.4.3 创建分类

**接口：** `POST /api/v1/categories`

**权限：** 管理员

**请求参数：**
```json
{
  "name": "前端开发",
  "slug": "frontend",
  "description": "前端开发相关文章",
  "parent_id": 1,
  "sort_order": 1
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 分类名称 |
| slug | string | 否 | URL 别名 |
| description | string | 否 | 分类描述 |
| parent_id | int | 否 | 父分类 ID |
| sort_order | int | 否 | 排序值，默认 0 |

**响应数据：**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 2,
    "name": "前端开发",
    "slug": "frontend",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.4.4 更新分类

**接口：** `PUT /api/v1/categories/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 分类 ID |

**请求参数：**
```json
{
  "name": "新分类名",
  "description": "新描述",
  "parent_id": null,
  "sort_order": 2
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 2,
    "name": "新分类名",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.4.5 删除分类

**接口：** `DELETE /api/v1/categories/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 分类 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 6.5 标签模块 (Tag)

#### 6.5.1 获取标签列表

**接口：** `GET /api/v1/tags`

**权限：** 公开

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |
| keyword | string | 否 | 搜索关键词 |
| sort_by | string | 否 | 排序字段：name/article_count |
| sort_order | string | 否 | 排序方向 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "Next.js",
        "slug": "nextjs",
        "color": "#3B82F6",
        "article_count": 25,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "page_size": 10,
      "total_pages": 5
    }
  }
}
```

---

#### 6.5.2 创建标签

**接口：** `POST /api/v1/tags`

**权限：** 作者/管理员

**请求参数：**
```json
{
  "name": "Vue.js",
  "slug": "vuejs",
  "color": "#42B883"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 标签名称 |
| slug | string | 否 | URL 别名 |
| color | string | 否 | 标签颜色（十六进制） |

**响应数据：**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 3,
    "name": "Vue.js",
    "slug": "vuejs",
    "color": "#42B883",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.5.3 更新标签

**接口：** `PUT /api/v1/tags/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 标签 ID |

**请求参数：**
```json
{
  "name": "Vue 3",
  "color": "#42B883"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 3,
    "name": "Vue 3",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.5.4 删除标签

**接口：** `DELETE /api/v1/tags/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 标签 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 6.6 评论模块 (Comment)

#### 6.6.1 获取评论列表

**接口：** `GET /api/v1/articles/{article_id}/comments`

**权限：** 公开

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| article_id | int | 是 | 文章 ID |

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |
| sort_by | string | 否 | 排序字段：created_at/like_count |
| sort_order | string | 否 | 排序方向 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "content": "这是一条评论",
        "user": {
          "id": 2,
          "nickname": "评论者",
          "avatar": "https://example.com/avatar.jpg"
        },
        "parent_id": null,
        "reply_to": null,
        "like_count": 5,
        "replies": [
          {
            "id": 2,
            "content": "回复内容",
            "user": {...},
            "parent_id": 1,
            "reply_to": {
              "id": 2,
              "nickname": "原评论者"
            },
            "like_count": 2,
            "created_at": "2024-01-01T00:00:00Z"
          }
        ],
        "is_liked": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "page_size": 10,
      "total_pages": 5
    }
  }
}
```

---

#### 6.6.2 发表评论

**接口：** `POST /api/v1/articles/{article_id}/comments`

**权限：** 需登录

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| article_id | int | 是 | 文章 ID |

**请求参数：**
```json
{
  "content": "这是一条评论",
  "parent_id": 1,
  "reply_to_id": 2
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| content | string | 是 | 评论内容（1-1000字符） |
| parent_id | int | 否 | 父评论 ID（回复评论时） |
| reply_to_id | int | 否 | 被回复用户 ID |

**响应数据：**
```json
{
  "code": 201,
  "message": "评论成功",
  "data": {
    "id": 3,
    "content": "这是一条评论",
    "user": {...},
    "parent_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.6.3 删除评论

**接口：** `DELETE /api/v1/comments/{id}`

**权限：** 评论者（自己的评论）/管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 评论 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

#### 6.6.4 评论点赞

**接口：** `POST /api/v1/comments/{id}/like`

**权限：** 需登录

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 评论 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "like_count": 6,
    "is_liked": true
  }
}
```

---

#### 6.6.5 获取评论列表（管理端）

**接口：** `GET /api/v1/comments`

**权限：** 管理员

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |
| article_id | int | 否 | 文章 ID |
| user_id | int | 否 | 用户 ID |
| status | string | 否 | 状态：pending/approved/spam/trash |
| keyword | string | 否 | 搜索关键词 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "content": "评论内容",
        "article": {
          "id": 1,
          "title": "文章标题"
        },
        "user": {
          "id": 2,
          "nickname": "评论者",
          "email": "user@example.com"
        },
        "status": "approved",
        "ip_address": "127.0.0.1",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

#### 6.6.6 审核评论（管理端）

**接口：** `PUT /api/v1/comments/{id}/status`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 评论 ID |

**请求参数：**
```json
{
  "status": "approved"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 是 | 状态：approved/spam/trash |

**响应数据：**
```json
{
  "code": 200,
  "message": "审核成功",
  "data": {
    "id": 1,
    "status": "approved"
  }
}
```

---

### 6.7 媒体模块 (Media)

#### 6.7.1 上传文件

**接口：** `POST /api/v1/media/upload`

**权限：** 作者/管理员

**请求格式：** `multipart/form-data`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 文件（最大 10MB） |
| type | string | 否 | 类型：image/document，默认 image |

**响应数据：**
```json
{
  "code": 201,
  "message": "上传成功",
  "data": {
    "id": 1,
    "filename": "image_20240101.jpg",
    "original_name": "my-image.jpg",
    "path": "/uploads/2024/01/image_20240101.jpg",
    "url": "https://example.com/uploads/2024/01/image_20240101.jpg",
    "mime_type": "image/jpeg",
    "size": 102400,
    "width": 1920,
    "height": 1080,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.7.2 获取文件列表

**接口：** `GET /api/v1/media`

**权限：** 作者/管理员

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |
| type | string | 否 | 类型：image/document |
| keyword | string | 否 | 文件名搜索 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "filename": "image_20240101.jpg",
        "original_name": "my-image.jpg",
        "url": "https://example.com/uploads/2024/01/image_20240101.jpg",
        "mime_type": "image/jpeg",
        "size": 102400,
        "width": 1920,
        "height": 1080,
        "uploader": {
          "id": 1,
          "nickname": "上传者"
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

#### 6.7.3 删除文件

**接口：** `DELETE /api/v1/media/{id}`

**权限：** 上传者/管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 文件 ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

#### 6.7.4 批量删除文件

**接口：** `POST /api/v1/media/batch-delete`

**权限：** 管理员

**请求参数：**
```json
{
  "ids": [1, 2, 3]
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 文件 ID 数组 |

**响应数据：**
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "success_count": 3,
    "failed_count": 0
  }
}
```

---

### 6.8 统计模块 (Statistics)

#### 6.8.1 获取仪表盘统计

**接口：** `GET /api/v1/stats/dashboard`

**权限：** 管理员

**请求参数：** 无

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "articles": {
      "total": 100,
      "published": 80,
      "draft": 15,
      "archived": 5,
      "this_month": 10
    },
    "users": {
      "total": 500,
      "active": 450,
      "this_month": 50
    },
    "comments": {
      "total": 1000,
      "pending": 20,
      "this_month": 100
    },
    "views": {
      "today": 5000,
      "this_week": 35000,
      "this_month": 150000
    }
  }
}
```

---

#### 6.8.2 获取访问趋势

**接口：** `GET /api/v1/stats/traffic`

**权限：** 管理员

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| start_date | string | 是 | 开始日期 |
| end_date | string | 是 | 结束日期 |
| type | string | 否 | 类型：day/week/month，默认 day |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "date": "2024-01-01",
        "pv": 5000,
        "uv": 2000,
        "ip": 1800
      },
      {
        "date": "2024-01-02",
        "pv": 5500,
        "uv": 2200,
        "ip": 2000
      }
    ],
    "summary": {
      "total_pv": 100000,
      "total_uv": 40000,
      "avg_pv": 3333,
      "avg_uv": 1333
    }
  }
}
```

---

#### 6.8.3 获取热门文章

**接口：** `GET /api/v1/stats/hot-articles`

**权限：** 管理员

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | int | 否 | 数量，默认 10 |
| type | string | 否 | 类型：view/like/comment，默认 view |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "热门文章标题",
        "view_count": 10000,
        "like_count": 500,
        "comment_count": 100
      }
    ]
  }
}
```

---

### 6.9 系统设置模块 (Settings)

#### 6.9.1 获取系统设置

**接口：** `GET /api/v1/settings`

**权限：** 公开（部分字段）

**请求参数：** 无

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "site_name": "我的博客",
    "site_description": "一个技术博客",
    "site_keywords": "技术,博客,编程",
    "site_logo": "https://example.com/logo.png",
    "site_favicon": "https://example.com/favicon.ico",
    "site_icp": "京ICP备xxxxx号",
    "comment_enabled": true,
    "comment_audit": true,
    "register_enabled": true,
    "email_notify": false,
    "footer_text": "Copyright © 2024",
    "social_links": {
      "github": "https://github.com/xxx",
      "twitter": "https://twitter.com/xxx"
    }
  }
}
```

---

#### 6.9.2 更新系统设置

**接口：** `PUT /api/v1/settings`

**权限：** 管理员

**请求参数：**
```json
{
  "site_name": "新博客名称",
  "site_description": "新的博客描述",
  "site_keywords": "新关键词",
  "site_logo": "https://example.com/new-logo.png",
  "comment_enabled": true,
  "comment_audit": false,
  "register_enabled": true
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "site_name": "新博客名称",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 6.10 搜索模块 (Search)

#### 6.10.1 全局搜索

**接口：** `GET /api/v1/search`

**权限：** 公开

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| type | string | 否 | 类型：article/user/tag，默认 article |
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |
| category_id | int | 否 | 分类 ID |
| tag_id | int | 否 | 标签 ID |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |
| sort_by | string | 否 | 排序字段 |
| sort_order | string | 否 | 排序方向 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "keyword": "Next.js",
    "total": 50,
    "list": [
      {
        "id": 1,
        "type": "article",
        "title": "Next.js 入门教程",
        "summary": "...",
        "highlight": "Next.js 是一个 <em>React</em> 框架...",
        "url": "/articles/1"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 6.11 弹窗通知模块 (Popups)

#### 6.11.1 获取弹窗列表

**接口：** `GET /api/v1/popups`

**权限：** 管理员

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态：active/inactive/expired |
| type | string | 否 | 类型：notification/advertisement |
| keyword | string | 否 | 标题关键词搜索 |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "系统维护通知",
        "content": "系统将于今晚22:00进行维护...",
        "type": "notification",
        "status": "active",
        "image_url": "https://example.com/popup.jpg",
        "link_url": "https://example.com/notice/1",
        "start_time": "2024-01-01T00:00:00Z",
        "end_time": "2024-01-31T23:59:59Z",
        "show_frequency": "once",
        "max_show_count": 1000,
        "current_show_count": 150,
        "max_click_count": null,
        "current_click_count": 50,
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "page_size": 10,
      "total_pages": 1
    }
  }
}
```

---

#### 6.11.2 获取活跃弹窗（前台）

**接口：** `GET /api/v1/popups/active`

**权限：** 公开

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 类型：notification/advertisement |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "系统维护通知",
      "content": "系统将于今晚22:00进行维护...",
      "type": "notification",
      "image_url": "https://example.com/popup.jpg",
      "link_url": "https://example.com/notice/1",
      "show_frequency": "once"
    }
  ]
}
```

---

#### 6.11.3 获取弹窗详情

**接口：** `GET /api/v1/popups/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 弹窗ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "系统维护通知",
    "content": "系统将于今晚22:00进行维护...",
    "type": "notification",
    "status": "active",
    "image_url": "https://example.com/popup.jpg",
    "link_url": "https://example.com/notice/1",
    "start_time": "2024-01-01T00:00:00Z",
    "end_time": "2024-01-31T23:59:59Z",
    "show_frequency": "once",
    "max_show_count": 1000,
    "current_show_count": 150,
    "max_click_count": null,
    "current_click_count": 50,
    "sort_order": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.11.4 创建弹窗

**接口：** `POST /api/v1/popups`

**权限：** 管理员

**请求参数：**
```json
{
  "title": "系统维护通知",
  "content": "系统将于今晚22:00进行维护，届时将暂停服务约2小时，请提前保存您的工作。",
  "type": "notification",
  "status": "active",
  "image_url": "https://example.com/popup.jpg",
  "link_url": "https://example.com/notice/1",
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-01-31T23:59:59Z",
  "show_frequency": "once",
  "max_show_count": 1000,
  "max_click_count": null,
  "sort_order": 1
}
```

**参数说明：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 弹窗标题，最长100字符 |
| content | string | 是 | 弹窗内容，支持HTML |
| type | string | 是 | 类型：notification(通知)/advertisement(广告) |
| status | string | 否 | 状态：active(启用)/inactive(禁用)，默认 active |
| image_url | string | 否 | 图片URL |
| link_url | string | 否 | 点击跳转链接 |
| start_time | string | 否 | 开始展示时间 |
| end_time | string | 否 | 结束展示时间 |
| show_frequency | string | 否 | 展示频率：once(仅一次)/daily(每天)/always(每次)，默认 once |
| max_show_count | int | 否 | 最大展示次数，null表示不限制 |
| max_click_count | int | 否 | 最大点击次数，null表示不限制 |
| sort_order | int | 否 | 排序权重，越大越靠前，默认 0 |

**响应数据：**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 1,
    "title": "系统维护通知",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6.11.5 更新弹窗

**接口：** `PUT /api/v1/popups/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 弹窗ID |

**请求参数：**
```json
{
  "title": "系统维护通知（更新）",
  "content": "更新后的内容",
  "status": "inactive",
  "start_time": "2024-02-01T00:00:00Z",
  "end_time": "2024-02-28T23:59:59Z"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "title": "系统维护通知（更新）",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

---

#### 6.11.6 删除弹窗

**接口：** `DELETE /api/v1/popups/{id}`

**权限：** 管理员

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 弹窗ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

#### 6.11.7 批量删除弹窗

**接口：** `POST /api/v1/popups/batch-delete`

**权限：** 管理员

**请求参数：**
```json
{
  "ids": [1, 2, 3]
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "success_count": 3,
    "failed_count": 0
  }
}
```

---

#### 6.11.8 记录弹窗展示

**接口：** `POST /api/v1/popups/{id}/show`

**权限：** 公开

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 弹窗ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

#### 6.11.9 记录弹窗点击

**接口：** `POST /api/v1/popups/{id}/click`

**权限：** 公开

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 弹窗ID |

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

#### 6.11.10 更新弹窗排序

**接口：** `PUT /api/v1/popups/sort`

**权限：** 管理员

**请求参数：**
```json
{
  "items": [
    {"id": 1, "sort_order": 3},
    {"id": 2, "sort_order": 2},
    {"id": 3, "sort_order": 1}
  ]
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "排序更新成功",
  "data": null
}
```

---

## 七、错误码对照表

### 7.1 通用错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 失效 |
| 402 | Token 已过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源已存在 |
| 422 | 数据验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 7.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 用户不存在 |
| 1002 | 密码错误 |
| 1003 | 邮箱已被注册 |
| 1004 | 用户已被禁用 |
| 1005 | 验证码错误 |
| 2001 | 文章不存在 |
| 2002 | 文章已删除 |
| 2003 | 无权操作此文章 |
| 3001 | 分类不存在 |
| 3002 | 分类下存在文章 |
| 4001 | 标签不存在 |
| 5001 | 评论不存在 |
| 5002 | 评论已关闭 |
| 6001 | 文件上传失败 |
| 6002 | 文件类型不支持 |
| 6003 | 文件大小超限 |
| 7001 | 弹窗不存在 |
| 7002 | 弹窗已过期 |
| 7003 | 弹窗已禁用 |
| 7004 | 弹窗展示次数已达上限 |
| 7005 | 弹窗点击次数已达上限 |

---

## 八、接口调用示例

### 8.1 cURL 示例

```bash
# 登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# 获取文章列表
curl -X GET "http://localhost:8000/api/v1/articles?page=1&page_size=10" \
  -H "Authorization: Bearer <token>"

# 创建文章
curl -X POST http://localhost:8000/api/v1/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"新文章","content":"内容","category_id":1}'
```

### 8.2 JavaScript (Axios) 示例

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 登录
const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

// 获取文章列表
const getArticles = async (params) => {
  const res = await api.get('/articles', { params })
  return res.data
}

// 创建文章
const createArticle = async (data) => {
  const res = await api.post('/articles', data)
  return res.data
}
```

---

## 九、版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01-01 | 初始版本 |
