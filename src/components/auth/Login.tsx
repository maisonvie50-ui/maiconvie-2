import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import { supabase } from '../../lib/supabase';

interface LoginProps {
  onLogin: (role?: 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server', email?: string, password?: string) => Promise<void> | void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let loginUsername = username.trim().toLowerCase();
      await onLogin(undefined, loginUsername, password);
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetting(true);

    try {
      // Vì đã bỏ Supabase Auth nên tính năng gửi link qua email cần làm qua Backend hoặc Mailer riêng.
      // Hiện tại sẽ chuyển thành popup thông báo liên hệ quản lý.
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      setResetSent(true);
    } catch (err: any) {
      console.error('Lỗi reset mật khẩu:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <img
            src={logoImg}
            alt="Maison Vie"
            className="w-24 h-24 object-contain mx-auto mb-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Maison Vie</h1>
          <p className="text-slate-300 text-sm">Hệ thống quản lý nhà hàng cao cấp</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Nhập tên đăng nhập (VD: admin, letan1...)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="•••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
              {error}
            </div>
          )}



          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-teal-500 focus:ring-teal-500" />
              <span className="ml-2 text-sm text-slate-300">Ghi nhớ đăng nhập</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Đăng nhập hệ thống
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-xs">
            © 2023 Maison Vie Restaurant Management System
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Quên mật khẩu?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Vui lòng nhập tên đăng nhập của bạn. Chúng tôi sẽ kiểm tra và hỗ trợ cấp lại mật khẩu.
              </p>

              {resetSent ? (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-teal-400 font-bold mb-1">Liên hệ Quản lý</h4>
                  <p className="text-teal-200/70 text-sm">Do hệ thống sử dụng đăng nhập nội bộ, vui lòng liên hệ Quản lý để được cấp lại mật khẩu.</p>
                  <button
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
                    className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tên đăng nhập</label>
                    <input
                      type="text"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="Nhập tên đăng nhập..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting || !resetEmail}
                      className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isResetting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        'Gửi liên kết'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
