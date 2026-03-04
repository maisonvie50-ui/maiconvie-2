import React, { useState } from 'react';
import { User, Lock, ArrowRight, ChefHat } from 'lucide-react';

interface LoginProps {
  onLogin: (role?: 'admin' | 'manager' | 'receptionist' | 'kitchen' | 'server') => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (username === 'admin' && password === '123') {
        onLogin('admin');
      } else if (username === 'quanly' && password === '123') {
        onLogin('manager');
      } else if (username === 'letan' && password === '123') {
        onLogin('receptionist');
      } else if (username === 'bep' && password === '123') {
        onLogin('kitchen');
      } else if (username === 'phucvu' && password === '123') {
        onLogin('server');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetting(true);

    // Simulate API call
    setTimeout(() => {
      setIsResetting(false);
      setResetSent(true);
    }, 1200);
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
          <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
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
                placeholder="admin"
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

          <div className="text-xs text-slate-400 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 mt-4">
            <p className="font-semibold text-slate-300 mb-1">Tài khoản thử nghiệm (Mật khẩu: 123)</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li><span className="text-teal-400">admin</span>: Quản trị viên (Toàn quyền)</li>
              <li><span className="text-teal-400">quanly</span>: Quản lý</li>
              <li><span className="text-teal-400">letan</span>: Lễ tân</li>
              <li><span className="text-teal-400">bep</span>: Bếp trưởng</li>
              <li><span className="text-teal-400">phucvu</span>: Phục vụ</li>
            </ul>
          </div>

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
                Vui lòng nhập email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu (có hiệu lực trong 24h).
              </p>

              {resetSent ? (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-teal-400 font-bold mb-1">Đã gửi email khôi phục!</h4>
                  <p className="text-teal-200/70 text-sm">Vui lòng kiểm tra hộp thư đến của bạn.</p>
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Địa chỉ Email</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="email@example.com"
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
