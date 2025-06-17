import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/api';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone) {
      setError('请输入手机号码');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    try {
      await login({ phone, password });
      navigate('/profile');
    } catch (err) {
      setError('登录失败，请检查您的手机号和密码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-senior-friendly-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-senior-friendly-text">登录</h2>
          
          {error && <div className="text-red-600 mb-4 p-3 bg-red-100 rounded-lg text-center">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg mb-2 text-senior-friendly-text">手机号码</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="请输入您的手机号"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-lg mb-2 text-senior-friendly-text">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-senior-friendly-border rounded-lg text-lg"
                placeholder="请输入您的密码"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 bg-senior-friendly-primary text-white rounded-lg text-xl font-bold hover:bg-senior-friendly-primary-hover disabled:bg-gray-400"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-lg">
              还没有账号? <Link to="/register" className="text-senior-friendly-primary hover:underline">立即注册</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
