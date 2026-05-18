import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { DogLogo } from '../components/DogLogo';

type Mode = 'login' | 'signup';

// Printable ASCII only (space through tilde) — excludes Greek, Cyrillic, etc.
const PRINTABLE_ASCII = /[^\x20-\x7E]/g;
// For name: letters, spaces, hyphens, apostrophes only
const NAME_ALLOWED = /[^a-zA-Z\s\-'.]/g;

function hasNonLatin(value: string): boolean {
  return PRINTABLE_ASCII.test(value);
}

export function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setNameError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Strip non-Latin characters from name and warn inline
  const handleNameChange = (val: string) => {
    const filtered = val.replace(NAME_ALLOWED, '');
    setName(filtered);
    if (val !== filtered) {
      setNameError('Επιτρέπονται μόνο λατινικοί χαρακτήρες (a–z, A–Z)');
    } else {
      setNameError('');
    }
  };

  // Strip non-ASCII from email as the user types
  const handleEmailChange = (val: string) => {
    setEmail(val.replace(PRINTABLE_ASCII, ''));
  };

  // Strip non-printable-ASCII from password fields
  const handlePasswordChange = (val: string) => {
    setPassword(val.replace(PRINTABLE_ASCII, ''));
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val.replace(PRINTABLE_ASCII, ''));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      // Latin-only validation (final guard in case something slipped through)
      if (hasNonLatin(name)) {
        setError('Το ονοματεπώνυμο πρέπει να περιέχει μόνο λατινικούς χαρακτήρες');
        return;
      }
      if (hasNonLatin(email)) {
        setError('Το email πρέπει να περιέχει μόνο λατινικούς χαρακτήρες');
        return;
      }
      if (hasNonLatin(password)) {
        setError('Ο κωδικός πρέπει να περιέχει μόνο λατινικούς χαρακτήρες');
        return;
      }
      if (password !== confirmPassword) {
        setError('Οι κωδικοί δεν ταιριάζουν');
        return;
      }
      if (password.length < 6) {
        setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
        return;
      }
    }

    setLoading(true);

    const result =
      mode === 'login'
        ? await login(email, password)
        : await signup(name, email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">

      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-purple-600 opacity-25 blur-[120px]" />
        <div className="absolute -top-20 -right-20 w-[360px] h-[360px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-600 opacity-15 blur-[130px]" />
        <div className="absolute -bottom-20 right-1/4 w-[320px] h-[320px] rounded-full bg-indigo-500 opacity-20 blur-[100px]" />
      </div>

      {/* Subtle dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating brand tagline */}
      <div className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 text-white/20 text-sm font-medium tracking-widest uppercase select-none">
        Share Skills · Grow Together
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 ring-1 ring-white/20">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <DogLogo className="w-12 h-12" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillUs
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {mode === 'login'
              ? 'Συνδεθείτε στον λογαριασμό σας'
              : 'Δημιουργήστε νέο λογαριασμό'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Σύνδεση
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Εγγραφή
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ονοματεπώνυμο
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoComplete="name"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  nameError
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-purple-400'
                }`}
                placeholder="George Papadopoulos"
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-500">{nameError}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              placeholder="you@skillus.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Κωδικός
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Επιβεβαίωση κωδικού
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <p className="text-xs text-gray-400">
              Όλα τα πεδία δέχονται μόνο λατινικούς χαρακτήρες (a–z, A–Z).
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === 'login'
                ? 'Σύνδεση...'
                : 'Εγγραφή...'
              : mode === 'login'
              ? 'Σύνδεση'
              : 'Δημιουργία λογαριασμού'}
          </button>
        </form>
      </div>
    </div>
  );
}
