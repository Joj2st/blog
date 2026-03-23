/**
 * 前端数据校验工具
 * 根据后端校验规则实现
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
}

/**
 * 校验邮箱格式
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, message: '邮箱不能为空' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' };
  }
  
  if (email.length > 255) {
    return { valid: false, message: '邮箱长度不能超过255个字符' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验昵称
 * min_length=2, max_length=50
 */
export function validateNickname(nickname: string): ValidationResult {
  if (!nickname || nickname.trim() === '') {
    return { valid: false, message: '昵称不能为空' };
  }
  
  const trimmed = nickname.trim();
  if (trimmed.length < 2) {
    return { valid: false, message: '昵称至少需要2个字符' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, message: '昵称不能超过50个字符' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验密码
 * min_length=6, max_length=128
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password === '') {
    return { valid: false, message: '密码不能为空' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: '密码至少需要6个字符' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: '密码不能超过128个字符' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验个人简介
 * max_length=500
 */
export function validateBio(bio: string): ValidationResult {
  if (bio && bio.length > 500) {
    return { valid: false, message: '个人简介不能超过500个字符' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验头像URL
 * max_length=500
 */
export function validateAvatar(avatar: string): ValidationResult {
  if (avatar && avatar.length > 500) {
    return { valid: false, message: '头像URL不能超过500个字符' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验登录表单
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  const emailResult = validateEmail(email);
  if (!emailResult.valid) return emailResult;
  
  if (!password || password === '') {
    return { valid: false, message: '密码不能为空' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验注册表单
 */
export function validateRegisterForm(
  email: string,
  nickname: string,
  password: string,
  confirmPassword: string
): ValidationResult {
  const emailResult = validateEmail(email);
  if (!emailResult.valid) return emailResult;
  
  const nicknameResult = validateNickname(nickname);
  if (!nicknameResult.valid) return nicknameResult;
  
  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) return passwordResult;
  
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验修改密码表单
 */
export function validateChangePasswordForm(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): ValidationResult {
  const oldPasswordResult = validatePassword(oldPassword);
  if (!oldPasswordResult.valid) {
    return { valid: false, message: '当前密码：' + oldPasswordResult.message };
  }
  
  const newPasswordResult = validatePassword(newPassword);
  if (!newPasswordResult.valid) {
    return { valid: false, message: '新密码：' + newPasswordResult.message };
  }
  
  if (oldPassword === newPassword) {
    return { valid: false, message: '新密码不能与当前密码相同' };
  }
  
  if (newPassword !== confirmPassword) {
    return { valid: false, message: '两次输入的新密码不一致' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 校验用户信息更新表单
 */
export function validateUserUpdateForm(nickname: string, bio: string): ValidationResult {
  const nicknameResult = validateNickname(nickname);
  if (!nicknameResult.valid) return nicknameResult;
  
  const bioResult = validateBio(bio);
  if (!bioResult.valid) return bioResult;
  
  return { valid: true, message: '' };
}
