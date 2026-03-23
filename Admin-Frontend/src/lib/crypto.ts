/**
 * 前端密码加密工具
 * 注意：前端加密只是增加一层保护，真正的安全需要HTTPS
 */

/**
 * 简单的SHA256哈希
 * @param message 要哈希的字符串
 * @returns SHA256哈希值
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
