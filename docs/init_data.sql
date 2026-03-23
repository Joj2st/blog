-- 博客系统初始化数据
-- 数据库: blog_db
-- 创建时间: 2024-01-01

USE `blog_db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 初始化系统设置 (settings)
-- ----------------------------
INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('site_name', '我的博客', 'string', '博客名称'),
('site_description', '一个技术博客，分享编程知识和技术见解', 'string', '博客描述'),
('site_keywords', '技术,博客,编程,Java,Python,前端,后端', 'string', 'SEO关键词'),
('site_logo', 'https://api.dicebear.com/7.x/identicon/svg?seed=blog', 'string', '博客Logo'),
('site_favicon', 'https://api.dicebear.com/7.x/identicon/svg?seed=favicon', 'string', '网站图标'),
('site_icp', '', 'string', 'ICP备案号'),
('comment_enabled', '1', 'bool', '是否开启评论'),
('comment_audit', '1', 'bool', '评论是否需要审核'),
('register_enabled', '1', 'bool', '是否开放注册'),
('email_notify', '0', 'bool', '邮件通知'),
('footer_text', 'Copyright © 2024 My Blog. All rights reserved.', 'string', '页脚文字'),
('social_github', 'https://github.com', 'string', 'GitHub链接'),
('social_twitter', '', 'string', 'Twitter链接'),
('social_weibo', '', 'string', '微博链接');

-- ----------------------------
-- 初始化分类 (categories)
-- ----------------------------
INSERT INTO `categories` (`name`, `slug`, `description`, `parent_id`, `sort_order`, `article_count`) VALUES
('技术', 'tech', '技术相关文章', NULL, 1, 0),
('生活', 'life', '生活随笔', NULL, 2, 0),
('前端开发', 'frontend', '前端开发技术', 1, 1, 0),
('后端开发', 'backend', '后端开发技术', 1, 2, 0),
('移动开发', 'mobile', '移动开发技术', 1, 3, 0),
('数据库', 'database', '数据库技术', 1, 4, 0),
('DevOps', 'devops', 'DevOps与运维', 1, 5, 0);

-- ----------------------------
-- 初始化标签 (tags)
-- ----------------------------
INSERT INTO `tags` (`name`, `slug`, `color`, `article_count`) VALUES
('JavaScript', 'javascript', '#F7DF1E', 0),
('TypeScript', 'typescript', '#3178C6', 0),
('React', 'react', '#61DAFB', 0),
('Vue.js', 'vuejs', '#4FC08D', 0),
('Next.js', 'nextjs', '#000000', 0),
('Node.js', 'nodejs', '#339933', 0),
('Python', 'python', '#3776AB', 0),
('Java', 'java', '#007396', 0),
('Go', 'golang', '#00ADD8', 0),
('MySQL', 'mysql', '#4479A1', 0),
('Docker', 'docker', '#2496ED', 0),
('Git', 'git', '#F05032', 0);

-- ----------------------------
-- 初始化管理员用户 (users)
-- 密码: Admin123!
-- ----------------------------
INSERT INTO `users` (`email`, `password_hash`, `nickname`, `avatar`, `bio`, `role`, `status`, `last_login_at`) VALUES
('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyWx1W1W5W5', '管理员', 'https://api.dicebear.com/7.x/identicon/svg?seed=admin', '系统管理员', 'admin', 'active', NOW()),
('author@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyWx1W1W5W5', '作者', 'https://api.dicebear.com/7.x/identicon/svg?seed=author', '博客作者', 'author', 'active', NOW()),
('user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyWx1W1W5W5', '普通用户', 'https://api.dicebear.com/7.x/identicon/svg?seed=user', '普通用户', 'user', 'active', NOW());

-- ----------------------------
-- 初始化示例文章 (articles)
-- ----------------------------
INSERT INTO `articles` (`title`, `slug`, `summary`, `content`, `cover_image`, `category_id`, `author_id`, `status`, `is_top`, `is_featured`, `view_count`, `like_count`, `comment_count`, `published_at`) VALUES
('Next.js 15 新特性全面解析', 'nextjs-15-features', '本文将深入解析 Next.js 15 带来的新特性，包括 React Compiler 集成、RSC 优化等内容，帮助你快速上手新版本。', '# Next.js 15 新特性\n\n## 前言\n\nNext.js 15 已经正式发布了，带来了许多令人兴奋的新特性。\n\n## React Compiler 集成\n\nNext.js 15 现在默认集成了 React Compiler，可以提供更好的性能优化。', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 3, 2, 'published', 1, 1, 1250, 85, 12, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('FastAPI 最佳实践指南', 'fastapi-best-practices', '从零开始学习 FastAPI，包括项目结构设计、依赖注入、数据库操作等最佳实践。', '# FastAPI 最佳实践\n\n## 项目结构\n\n```\napp/\n├── api/\n├── core/\n├── models/\n├── schemas/\n├── crud/\n└── services/\n```', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 4, 2, 'published', 0, 1, 890, 56, 8, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('TypeScript 高级类型技巧', 'typescript-advanced-types', '掌握 TypeScript 高级类型系统，包括条件类型、映射类型、infer 关键字等进阶用法。', '# TypeScript 高级类型\n\n## 条件类型\n\n```typescript\ntype IsString<T> = T extends string ? true : false;\n```', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800', 3, 2, 'published', 0, 0, 678, 34, 5, DATE_SUB(NOW(), INTERVAL 7 DAY)),
('Docker 容器化入门教程', 'docker-tutorial', 'Docker 入门到精通，包括镜像构建、容器编排、Docker Compose 等内容。', '# Docker 教程\n\n## 什么是 Docker\n\nDocker 是一个开源的容器化平台。', 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800', 7, 2, 'published', 0, 0, 456, 23, 3, DATE_SUB(NOW(), INTERVAL 14 DAY)),
('我的 2024 年度总结', '2024-year-summary', '回顾 2024 年的学习和成长，展望 2025 年的新目标。', '# 2024 年度总结\n\n这一年，我学习了很多新技术...', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 2, 2, 'published', 0, 0, 345, 45, 20, DATE_SUB(NOW(), INTERVAL 30 DAY));

-- ----------------------------
-- 初始化文章-标签关联 (article_tags)
-- ----------------------------
INSERT INTO `article_tags` (`article_id`, `tag_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 5),
(2, 7),
(3, 1), (3, 2),
(4, 11),
(5, 12);

-- ----------------------------
-- 初始化示例评论 (comments)
-- ----------------------------
INSERT INTO `comments` (`article_id`, `user_id`, `parent_id`, `content`, `status`, `like_count`) VALUES
(1, 3, NULL, '写得太棒了！学到了很多新东西。', 'approved', 5),
(1, 1, NULL, '期待更多 Next.js 的文章！', 'approved', 3),
(1, 3, 1, '同意！作者辛苦了。', 'approved', 2),
(2, 3, NULL, 'FastAPI 真的很好用，这篇文章讲得很清楚。', 'approved', 4),
(3, 2, NULL, 'TypeScript 类型系统确实强大，这些技巧很实用。', 'approved', 2);

-- ----------------------------
-- 初始化文章点赞 (article_likes)
-- ----------------------------
INSERT INTO `article_likes` (`article_id`, `user_id`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 3),
(3, 1), (3, 2),
(4, 2),
(5, 1), (5, 2), (5, 3);

-- ----------------------------
-- 更新分类文章数量
-- ----------------------------
UPDATE `categories` SET `article_count` = (
  SELECT COUNT(*) FROM `articles` WHERE `articles`.`category_id` = `categories`.`id` AND `articles`.`status` = 'published'
);

-- ----------------------------
-- 更新标签文章数量
-- ----------------------------
UPDATE `tags` SET `article_count` = (
  SELECT COUNT(*) FROM `article_tags` WHERE `article_tags`.`tag_id` = `tags`.`id`
);

SET FOREIGN_KEY_CHECKS = 1;
