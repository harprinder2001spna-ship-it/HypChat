import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, AtSign, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { HypChatLogo } from '../Common/HypChatLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const { login, signup } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('creator');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (loginMode: boolean) => {
    setIsLoginView(loginMode);
    setIsForgotPassword(false);
    resetForm();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email/username and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(typeof err === 'string' ? err : err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
        avatarSeed || username
      )}`;
      await signup({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        avatar: avatarUrl
      });
    } catch (err: any) {
      setErrorMessage(typeof err === 'string' ? err : err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid registered email.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.forgotPassword(email.trim());
      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(typeof err === 'string' ? err : err.message || 'Account not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoUser: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await login(demoUser, 'password123');
    } catch (err: any) {
      setErrorMessage(typeof err === 'string' ? err : err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-auto">
        {/* HypChat Original Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <HypChatLogo size="lg" className="mb-2" />
          <p className="text-xs text-neutral-400 mt-1">
            Social networking, genuine connection & Friendship Stars ⭐
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {!isForgotPassword && (
          <div className="flex bg-neutral-900 p-1 rounded-2xl mb-6 border border-neutral-800">
            <button
              type="button"
              onClick={() => handleSwitchMode(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all min-h-[40px] ${
                isLoginView ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all min-h-[40px] ${
                !isLoginView ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ff1e42] mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Success notification banner */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* Forgot Password View */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="text-left mb-2">
              <h3 className="text-sm font-bold text-white">Reset your password</h3>
              <p className="text-xs text-neutral-400">Enter your email and we will send you a reset link.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff1e42] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#7c3aed] hover:bg-violet-600 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-950/50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-xs text-neutral-400 hover:text-white py-2"
            >
              Back to Login
            </button>
          </form>
        ) : isLoginView ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Email or Username</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username or user@example.com"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[11px] text-violet-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#7c3aed] hover:bg-violet-600 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to HypChat</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Vance"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Unique Username</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="jordan_hyp"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat pass"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#7c3aed] hover:bg-violet-600 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create HypChat Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-neutral-800">
          <p className="text-[11px] text-neutral-400 text-center mb-2.5">
            Or test instantly with preloaded accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('kai_motion')}
              disabled={isLoading}
              className="flex items-center gap-2 p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors"
            >
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=kai"
                alt="Kai"
                className="w-7 h-7 rounded-full bg-neutral-800"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">Kai Parker</div>
                <div className="text-[10px] text-neutral-400">@kai_motion</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('maya_synth')}
              disabled={isLoading}
              className="flex items-center gap-2 p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors"
            >
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=maya"
                alt="Maya"
                className="w-7 h-7 rounded-full bg-neutral-800"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">Maya Chen</div>
                <div className="text-[10px] text-neutral-400">@maya_synth</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
