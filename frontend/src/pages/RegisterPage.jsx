import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDistricts } from '../hooks/useDistricts';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { strings } from '../lib/strings';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { data: districts = [] } = useDistricts();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [districtId, setDistrictId] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = strings.auth.nameRequired;
    if (!email.trim()) {
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
      await register({
        name,
        email,
        password,
        role,
        district_id: Number(districtId),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const districtOptions = districts.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.region})`,
  }));

  const roleOptions = [
    { value: 'citizen', label: strings.auth.citizenRole },
    { value: 'admin', label: strings.auth.adminRole },
  ];

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader
            title={strings.auth.registerTitle}
            subtitle={strings.auth.registerSubtitle}
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
                label={strings.auth.nameLabel}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={errors.name}
                placeholder="Pradnya Deshmukh"
                required
              />

              <Input
                label={strings.auth.emailLabel}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                placeholder="user@floodwatch.test"
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
                autoComplete="new-password"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label={strings.auth.roleLabel}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={roleOptions}
                />

                <Select
                  label={strings.auth.districtLabel}
                  value={districtId}
                  onChange={(e) => setDistrictId(Number(e.target.value))}
                  options={districtOptions}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? 'Creating account...' : strings.auth.submitRegister}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-line text-center text-xs text-ink-500">
              {strings.auth.haveAccount}{' '}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                {strings.auth.loginTitle}
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
