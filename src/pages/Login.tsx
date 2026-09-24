import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store';
import { Button, Input, Card } from '../components/ui';
import { Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [signupMode, setSignupMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const login = useStore((state) => state.login);
  const signup = useStore((state) => state.signup);
  const resetPassword = useStore((state) => state.resetPassword);
  const updatePassword = useStore((state) => state.updatePassword);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');

    try {
      if (resetMode) {
        await resetPassword(email);

        setMessage(
          'Password reset email sent. Check your email for the reset link.'
        );

        return;
      }

      if (signupMode) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }

      const authenticated = useStore.getState().isAuthenticated;

      if (!authenticated) {
        setError('Invalid email or password.');
        return;
      }

      navigate('/onboarding');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');

    try {
      await updatePassword(newPassword);

      setMessage('Password updated successfully.');

      setResetMode(false);
      setNewPassword('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not update password.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'rgb(0, 35, 102)' }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6 text-white">
          <Shield size={64} />
        </div>

        <h2 className="text-center text-4xl font-bold text-white">
          MEHS OL Training
        </h2>
      </div>

      <Card className="mt-8 px-10 py-8 sm:mx-auto sm:w-full sm:max-w-md">

        {resetMode ? (
          <form onSubmit={handleUpdatePassword} className="space-y-6">

            <h3 className="text-xl font-bold text-center">
              Reset Password
            </h3>

            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            {message && (
              <p className="text-green-600 text-sm">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full h-12">
              Update Password
            </Button>

            <button
              type="button"
              className="w-full underline"
              onClick={() => {
                setResetMode(false);
                setError('');
                setMessage('');
              }}
            >
              Back to Login
            </button>

          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {signupMode && (
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            {message && (
              <p className="text-green-600 text-sm">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full h-12">
              {signupMode ? 'Create Account' : 'Login'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {!signupMode && (
              <button
                type="button"
                className="w-full underline text-sm"
                onClick={() => {
                  setResetMode(true);
                  setError('');
                  setMessage('');
                }}
              >
                Forgot Password?
              </button>
            )}

          </form>
        )}

        {!resetMode && (
          <button
            className="mt-4 w-full underline"
            onClick={() => {
              setSignupMode(!signupMode);
              setError('');
              setMessage('');
            }}
          >
            {signupMode
              ? 'Already have an account?'
              : 'Create an account'}
          </button>
        )}

      </Card>
    </div>
  );
}