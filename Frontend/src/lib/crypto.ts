/**
 * 前端密码加密工具
 * 注意：前端加密只是增加一层保护，真正的安全需要HTTPS
 */

import bcrypt from 'bcryptjs';

/**
 * 生成随机盐
 */
export function generateSalt(): string {
  return bcrypt.genSaltSync(10);
}

/**
 * 使用bcrypt加密密码
 * @param password 明文密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  return bcrypt.hash(password, salt);
}

/**
 * 验证密码（如果需要在前端验证）
 * @param password 明文密码
 * @param hashedPassword 加密后的密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 简单的SHA256哈希（用于不需要bcrypt的场景）
 * @param message 要哈希的字符串
 * @returns SHA256哈希值
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
