import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, getErrorMessage } from '../../services/api';

const RegisterPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!phone.trim()) {
      setError('请输入手机号码');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }

    setLoading(true);
    try {
      const response = await register({ phone, password, nickname });
      console.log('Registration successful:', response);
      setSuccessMessage('注册成功！正在跳转到登录页面...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err) || '注册失败，请稍后重试');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-senior-friendly-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-senior-friendly-text">创建账户</h2>
          {error && <p className="text-red-600 mb-4 p-3 bg-red-100 rounded-lg text-center">{error}</p>}
          {successMessage && <p className="text-green-600 mb-4 p-3 bg-green-100 rounded-lg text-center">{successMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-lg mb-2 text-senior-friendly-text">
                手机号码
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="请输入您的手机号码"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="nickname" className="block text-lg mb-2 text-senior-friendly-text">
                昵称
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-4 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="请输入您的昵称"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-lg mb-2 text-senior-friendly-text">
                密码
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="请设置您的密码"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full p-4 bg-senior-friendly-primary text-white rounded-lg text-xl font-bold hover:bg-senior-friendly-primary-hover disabled:bg-gray-400"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-lg">
              已有账号? <Link to="/login" className="text-senior-friendly-primary hover:underline">立即登录</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
