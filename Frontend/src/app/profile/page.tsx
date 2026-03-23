'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { sha256 } from '@/lib/crypto';
import {
  validateUserUpdateForm,
  validateChangePasswordForm,
  validateNickname,
  validateBio,
  validatePassword
} from '@/lib/validation';

interface UserData {
  id: number;
  email: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    nickname?: string;
    bio?: string;
    old_password?: string;
    new_password?: string;
    confirm_password?: string;
  }>({});
  
  const [personalInfo, setPersonalInfo] = useState({
    nickname: '',
    email: '',
    bio: ''
  });
  
  const [passwordInfo, setPasswordInfo] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<UserData>>('/users/me');
      if (response.code === 200) {
        setPersonalInfo({
          nickname: response.data.nickname,
          email: response.data.email,
          bio: response.data.bio || ''
        });
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (err: any) {
      setError(err.message || '获取用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setError('');
    setSuccess('');
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordInfo(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setError('');
    setSuccess('');
  };

  const handleNicknameBlur = () => {
    const result = validateNickname(personalInfo.nickname);
    if (!result.valid) {
      setFieldErrors(prev => ({ ...prev, nickname: result.message }));
    } else {
      setFieldErrors(prev => ({ ...prev, nickname: undefined }));
    }
  };

  const handleBioBlur = () => {
    const result = validateBio(personalInfo.bio);
    if (!result.valid) {
      setFieldErrors(prev => ({ ...prev, bio: result.message }));
    } else {
      setFieldErrors(prev => ({ ...prev, bio: undefined }));
    }
  };

  const handleOldPasswordBlur = () => {
    const result = validatePassword(passwordInfo.old_password);
    if (!result.valid) {
      setFieldErrors(prev => ({ ...prev, old_password: result.message }));
    } else {
      setFieldErrors(prev => ({ ...prev, old_password: undefined }));
    }
  };

  const handleNewPasswordBlur = () => {
    const result = validatePassword(passwordInfo.new_password);
    if (!result.valid) {
      setFieldErrors(prev => ({ ...prev, new_password: result.message }));
    } else {
      setFieldErrors(prev => ({ ...prev, new_password: undefined }));
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (!passwordInfo.confirm_password) {
      setFieldErrors(prev => ({ ...prev, confirm_password: '请确认新密码' }));
    } else if (passwordInfo.new_password !== passwordInfo.confirm_password) {
      setFieldErrors(prev => ({ ...prev, confirm_password: '两次输入的新密码不一致' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirm_password: undefined }));
    }
  };

  const handleSavePersonalInfo = async () => {
    setError('');
    setSuccess('');

    const validation = validateUserUpdateForm(personalInfo.nickname, personalInfo.bio);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.put<ApiResponse<UserData>>('/users/me', {
        nickname: personalInfo.nickname,
        bio: personalInfo.bio
      });

      if (response.code === 200) {
        setSuccess('个人信息更新成功！');
        localStorage.setItem('user', JSON.stringify(response.data));
        window.dispatchEvent(new Event('storage'));
      } else {
        setError(response.message || '更新失败');
      }
    } catch (err: any) {
      setError(err.message || '更新失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');

    const validation = validateChangePasswordForm(
      passwordInfo.old_password,
      passwordInfo.new_password,
      passwordInfo.confirm_password
    );
    
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsSaving(true);

    try {
      const hashedOldPassword = await sha256(passwordInfo.old_password);
      const hashedNewPassword = await sha256(passwordInfo.new_password);

      const response = await api.put<ApiResponse<null>>('/users/me/password', {
        old_password: hashedOldPassword,
        new_password: hashedNewPassword
      });

      if (response.code === 200) {
        setSuccess('密码修改成功！');
        setPasswordInfo({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError(response.message || '密码修改失败');
      }
    } catch (err: any) {
      setError(err.message || '密码修改失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert('头像上传功能待实现');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">个人设置</h1>
              <p className="text-gray-600 dark:text-gray-400">管理您的账号信息和偏好设置</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'}`}
                  onClick={() => setActiveTab('personal')}
                >
                  个人信息
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'}`}
                  onClick={() => setActiveTab('security')}
                >
                  安全设置
                </button>
              </div>
            </div>

            {activeTab === 'personal' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">个人信息</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">更新您的个人资料和头像</p>
                
                <div className="flex items-center mb-8">
                  <div className="mr-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                          {personalInfo.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="mb-1">
                      上传头像
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG 或 GIF，最大 2MB</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      昵称 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="nickname"
                      value={personalInfo.nickname}
                      onChange={handlePersonalInfoChange}
                      onBlur={handleNicknameBlur}
                      className={`w-full ${fieldErrors.nickname ? 'border-red-500' : ''}`}
                      placeholder="请输入昵称（2-50个字符）"
                    />
                    {fieldErrors.nickname && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.nickname}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      邮箱
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={personalInfo.email}
                      disabled
                      className="w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">邮箱不可修改</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      个人简介
                    </label>
                    <Textarea
                      name="bio"
                      value={personalInfo.bio}
                      onChange={handlePersonalInfoChange}
                      onBlur={handleBioBlur}
                      rows={3}
                      className={`w-full ${fieldErrors.bio ? 'border-red-500' : ''}`}
                      placeholder="介绍一下自己...（最多500字）"
                    />
                    <div className="flex justify-between mt-1">
                      {fieldErrors.bio && (
                        <p className="text-sm text-red-500">{fieldErrors.bio}</p>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">{personalInfo.bio.length}/500</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button onClick={handleSavePersonalInfo} disabled={isSaving}>
                    {isSaving ? '保存中...' : '保存更改'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">定期更新密码以保护您的账号安全</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        当前密码 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        name="old_password"
                        value={passwordInfo.old_password}
                        onChange={handlePasswordChange}
                        onBlur={handleOldPasswordBlur}
                        className={`w-full ${fieldErrors.old_password ? 'border-red-500' : ''}`}
                        placeholder="请输入当前密码"
                      />
                      {fieldErrors.old_password && (
                        <p className="text-sm text-red-500 mt-1">{fieldErrors.old_password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        新密码 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        name="new_password"
                        value={passwordInfo.new_password}
                        onChange={handlePasswordChange}
                        onBlur={handleNewPasswordBlur}
                        className={`w-full ${fieldErrors.new_password ? 'border-red-500' : ''}`}
                        placeholder="请输入新密码（6-128个字符）"
                      />
                      {fieldErrors.new_password && (
                        <p className="text-sm text-red-500 mt-1">{fieldErrors.new_password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        确认新密码 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        name="confirm_password"
                        value={passwordInfo.confirm_password}
                        onChange={handlePasswordChange}
                        onBlur={handleConfirmPasswordBlur}
                        className={`w-full ${fieldErrors.confirm_password ? 'border-red-500' : ''}`}
                        placeholder="请再次输入新密码"
                      />
                      {fieldErrors.confirm_password && (
                        <p className="text-sm text-red-500 mt-1">{fieldErrors.confirm_password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleUpdatePassword} disabled={isSaving}>
                      {isSaving ? '更新中...' : '更新密码'}
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">其他安全选项</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">管理您的账号安全设置</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">两步验证</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">为您的账号添加额外的安全保护</p>
                      </div>
                      <Button variant="outline" size="sm">
                        启用
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">登录历史</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">查看最近的登录活动</p>
                      </div>
                      <Button variant="outline" size="sm">
                        查看
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="font-medium text-red-600 dark:text-red-400">删除账号</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">永久删除您的账号和所有数据</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
