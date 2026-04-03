import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../api/auth';
import { saveAuth } from '../utils/auth';

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await signIn(form.username, form.password);
      if (res.success && res.data) { saveAuth(res.data.tokens, res.data.user); navigate('/lobby'); }
      else setError(res.error || 'Sign in failed');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>TicTacToe</h1>
          <p>Sign in to play</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input type="text" placeholder="Enter username" required
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">No account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}
