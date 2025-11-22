import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      setMessage(response.data.message);
      setShowOtpInput(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', email);

      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Inventory Management System
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            {showOtpInput ? 'Verify OTP' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#fee', color: '#c33' }}>
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#efe', color: '#3c3' }}>
            {message}
          </div>
        )}

        {!showOtpInput ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Login'}
            </Button>

            <div className="text-center mt-4">
              <p style={{ color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-medium"
                  style={{ color: 'var(--accent-green)' }}
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                Enter OTP
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                OTP sent to {email}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowOtpInput(false);
                setOtp('');
                setError('');
                setMessage('');
              }}
            >
              Back to Login
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Login;
