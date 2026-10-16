import React, { useState } from 'react';
import { 
  Building2, 
  LogIn, 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginWithCredentials: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleSignIn: () => void;
  isFullScreen?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginWithCredentials,
  onGoogleSignIn,
  isFullScreen = false,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedIdentifier = usernameOrEmail.trim();
    if (!trimmedIdentifier) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onLoginWithCredentials(trimmedIdentifier, password);
      if (result.success) {
        setSuccessMessage('Authentication successful. Redirecting...');
        setTimeout(() => {
          setIsLoading(false);
          if (onClose) onClose();
        }, 500);
      } else {
        setIsLoading(false);
        setErrorMessage(result.error || 'Invalid username or password. Please verify your credentials.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred during sign-in. Please try again.');
    }
  };

  const containerClasses = isFullScreen
    ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-950 flex items-center justify-center p-4 min-h-screen'
    : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-scale-up">
        {/* Top Header Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-7 text-white text-center">
          {onClose && !isFullScreen && (
            <button
              onClick={onClose}
              type="button"
              aria-label="Close Login Modal"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-3.5 ring-4 ring-white/10">
            <Building2 className="w-7 h-7 text-white" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Maldives MIRA Secure Gateway</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">Sign In to TaxFlow Pro</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
            Enter your assigned corporate credentials to access ledgers, GST filings, and business administration.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-5">
          {/* Status Notifications */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* User Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username or Email Input */}
            <div>
              <label htmlFor="login-username" className="block font-semibold text-slate-700 mb-1.5 text-xs">
                Username or Corporate Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. admin or username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block font-semibold text-slate-700 text-xs">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center space-x-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Need help?</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all font-mono tracking-tight"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Help Callout */}
            {showHelp && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1 animate-fade-in">
                <p className="font-semibold text-slate-800">Account Access Support:</p>
                <p>User accounts and access passwords are provisioned by your system administrator in the Admin Center.</p>
                <p className="text-slate-500">Contact your Lead Financial Controller or IT administrator to reset your credentials.</p>
              </div>
            )}

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 border-slate-300"
                />
                <span className="text-slate-600 font-medium text-[11px]">Keep me signed in on this device</span>
              </label>
            </div>

            {/* Submit Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[11px] text-slate-400 uppercase font-medium">Or</span>
          </div>

          {/* Alternative Google Sign In */}
          <button
            type="button"
            onClick={() => {
              onGoogleSignIn();
              if (onClose) onClose();
            }}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 hover:border-slate-400 shadow-xs transition-all flex items-center justify-center space-x-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Single Sign-On</span>
          </button>

          {/* Security & Compliance Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>TLS 1.3 / AES-256</span>
            </span>
            <span>Republic of Maldives Law No. 10/2011</span>
          </div>
        </div>
      </div>
    </div>
  );
};
