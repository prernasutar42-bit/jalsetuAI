import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { strings } from '../lib/strings';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = strings.auth.invalidEmail;
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = strings.auth.passwordLength;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    setAuthError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader
            title={strings.auth.loginTitle}
            subtitle={strings.auth.loginSubtitle}
          />
          <CardBody>
            {authError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-btn bg-[#FFEBEE] border border-risk-severe/30 text-risk-severe text-xs flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={strings.auth.emailLabel}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                placeholder="citizen@floodwatch.test"
                required
                autoComplete="email"
              />

              <Input
                label={strings.auth.passwordLabel}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={errors.password}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-ink-500 hover:text-ink-900 rounded-btn transition-colors"
                    aria-label={showPassword ? strings.auth.hidePassword : strings.auth.showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? 'Signing in...' : strings.auth.submitLogin}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-line text-center text-xs text-ink-500">
              {strings.auth.noAccount}{' '}
              <Link to="/register" className="font-semibold text-accent hover:underline">
                {strings.auth.registerTitle}
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Demo credentials helper */}
        <div className="bg-white border border-line rounded-card p-3.5 space-y-2 text-xs">
          <p className="font-semibold text-ink-700 uppercase tracking-wider text-[11px]">
            {strings.auth.demoCredentials}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@floodwatch.test', 'Admin@123')}
              className="flex-1 p-2 text-left bg-canvas hover:bg-line rounded-btn border border-line transition-colors"
            >
              <div className="font-bold text-ink-900 flex items-center gap-1.5">
                <Shield size={13} className="text-accent" />
                <span>Admin Official</span>
              </div>
              <p className="font-mono text-[11px] text-ink-500 mt-0.5">admin@floodwatch.test</p>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('citizen@floodwatch.test', 'Citizen@123')}
              className="flex-1 p-2 text-left bg-canvas hover:bg-line rounded-btn border border-line transition-colors"
            >
              <div className="font-bold text-ink-900">Citizen User</div>
              <p className="font-mono text-[11px] text-ink-500 mt-0.5">citizen@floodwatch.test</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
