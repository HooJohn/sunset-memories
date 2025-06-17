import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile } from '../../services/api';
import type { User } from '../../services/api';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
        setName(profile.name || '');
        setNickname(profile.nickname || '');
        setAvatarUrl(profile.avatar_url || '');
      } catch (err) {
        console.error('加载资料失败:', err);
        setError('加载资料失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      await updateUserProfile({ name, nickname, avatar_url: avatarUrl });
      setSuccess('资料更新成功！');
    } catch (err) {
      console.error('更新失败:', err);
      setError('更新失败，请检查网络或稍后重试');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (isLoading) {
    return <div className="p-6 text-center text-xl">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-senior-friendly-background p-4">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold text-senior-friendly-primary">个人资料</h1>
        <button 
          onClick={handleLogout}
          className="text-senior-friendly-secondary hover:text-senior-friendly-secondary-hover text-lg"
        >
          退出
        </button>
      </header>

      <main className="mt-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center mb-6">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="头像" 
                className="w-24 h-24 rounded-full object-cover border-4 border-senior-friendly-primary"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-senior-friendly-primary flex items-center justify-center text-4xl text-white">
                {(name || nickname || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg mb-2">手机号</label>
              <input
                type="tel"
                value={user?.phone || ''}
                readOnly
                className="w-full p-3 border border-senior-friendly-border rounded-lg bg-gray-100 text-lg"
              />
            </div>

            <div>
              <label className="block text-lg mb-2">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-3 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="输入您的昵称"
                disabled={isUpdating}
              />
            </div>

            <div>
              <label className="block text-lg mb-2">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="输入您的姓名"
                disabled={isUpdating}
              />
            </div>

            <div>
              <label className="block text-lg mb-2">头像链接</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full p-3 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="https://example.com/avatar.jpg"
                disabled={isUpdating}
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full p-4 bg-senior-friendly-primary text-white rounded-lg text-xl font-bold hover:bg-senior-friendly-primary-hover disabled:bg-gray-400"
            >
              {isUpdating ? '保存中...' : '保存更改'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
