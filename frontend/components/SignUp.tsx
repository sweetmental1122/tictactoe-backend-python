import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../api/auth';
import { saveAuth } from '../utils/auth';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await signUp(form.username, form.email, form.password);
      if (res.success && res.data) { saveAuth(res.data.tokens, res.data.user); navigate('/lobby'); }
      else setError(res.error || 'Sign up failed');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>TicTacToe</h1>
          <p>Create your account</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input type="text" placeholder="Choose a username" required
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/signin">Sign In</Link></p>
      </div>
    </div>
  );
}
