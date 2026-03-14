import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Layout } from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validation: only letters and numbers for username
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError('用户名只能包含英文字母和数字');
      setLoading(false);
      return;
    }

    // Validation for nickname: Chinese, English, or numbers
    if (!isLogin && !/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(nickname)) {
      setError('昵称只能包含中文、英文字母和数字');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      setError('密码只能包含英文字母和数字');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Custom login: check users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (error || !data) {
          throw new Error('用户名或密码错误');
        }

        // Store user in local storage for simple session management
        localStorage.setItem('sf6guess_user', JSON.stringify(data));
        // Force reload to update context or use a better state management approach
        // Ideally useTournament should listen to this, but reload is simplest for now.
        window.location.href = '/';
      } else {
        // Custom signup: insert into users table
        const { data, error } = await supabase
          .from('users')
          .insert([
            { username, nickname, password }
          ])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') { // Unique violation
            throw new Error('用户名已存在');
          }
          throw error;
        }

        localStorage.setItem('sf6guess_user', JSON.stringify(data));
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            {isLogin ? '登录' : '注册'}
          </h2>
          
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                用户名 (仅英文和数字)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="例如: player1"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  昵称 (中文、英文、数字)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="例如: 街霸高手"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 hover:text-emerald-300 text-sm"
            >
              {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
