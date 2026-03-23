-- 初始化数据库
CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS 'blog'@'%' IDENTIFIED BY 'blog123456';

-- 授权
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog'@'%';
FLUSH PRIVILEGES;

USE blog_db;
