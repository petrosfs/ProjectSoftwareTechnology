import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Star, Edit, Calendar, Award, BookOpen, Clock,
  MessageSquare, Mail, Plus, Trash2, X, Save, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  level: 'Expert' | 'Intermediate' | 'Beginner';
  yearsOfExperience: number;
}

interface Session {
  id: string;
  skillTitle: string;
  otherUser: string;
  otherUserAvatar: string;
  date: string;
  time: string;
  status: string;
  type: 'teaching' | 'learning';
}

interface Review {
  id: string;
  fromUser: string;
  fromUserAvatar: string;
  rating: number;
  comment: string;
  date: string;
  skillTitle: string;
}

const LEVELS = ['Beginner', 'Intermediate', 'Expert'] as const;

// ─── Small shared components ──────────────────────────────────────────────────

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        {children}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const needsCurrentPassword = newPassword.length > 0 || email !== user?.email;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (needsCurrentPassword && !currentPassword) {
      setError('Απαιτείται ο τρέχων κωδικός για να αλλάξετε email ή κωδικό');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
      return;
    }

    setLoading(true);
    const body: Record<string, string> = { fullName, bio };
    if (email !== user?.email) body.email = email;
    if (newPassword) body.newPassword = newPassword;
    if (currentPassword) body.currentPassword = currentPassword;

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Αποτυχία αποθήκευσης');
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Επεξεργασία Προφίλ</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            placeholder="Γράψε κάτι για σένα..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Νέος κωδικός <span className="text-gray-400 font-normal">(προαιρετικό)</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="••••••••"
          />
        </div>

        {needsCurrentPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Τρέχων κωδικός <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="••••••••"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Άκυρο
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Αποθήκευση
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Skill Modal (Add / Edit) ─────────────────────────────────────────────────

function SkillModal({
  existing,
  onClose,
  onSaved,
}: {
  existing?: Skill;
  onClose: () => void;
  onSaved: (skill: Skill) => void;
}) {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name ?? '');
  const [level, setLevel] = useState<string>(existing?.level ?? 'Beginner');
  const [years, setYears] = useState<number>(existing?.yearsOfExperience ?? 0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Το όνομα είναι υποχρεωτικό'); return; }

    setLoading(true);
    const body = { name: name.trim(), level, yearsOfExperience: years };

    const res = await fetch(isEdit ? `/api/myskills/${existing!.id}` : '/api/myskills', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? 'Αποτυχία αποθήκευσης'); return; }
    onSaved(data);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Επεξεργασία Skill' : 'Προσθήκη Skill'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Όνομα Skill</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="π.χ. JavaScript, Photography..."
          />
          <FieldError msg={error && error.includes('όνομα') ? error : ''} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Επίπεδο</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Χρόνια εμπειρίας</label>
          <input
            type="number"
            min={0}
            max={50}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {error && !error.includes('όνομα') && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Άκυρο
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Αποθήκευση' : 'Προσθήκη'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  skillName,
  onConfirm,
  onClose,
}: {
  skillName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Αφαίρεση Skill</h2>
        <p className="text-gray-600">
          Είσαι σίγουρος ότι θέλεις να αφαιρέσεις το skill <strong>"{skillName}"</strong>;
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Άκυρο
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            Αφαίρεση
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Main Profile Component ───────────────────────────────────────────────────

export function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);

  // Modal state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);

  const fetchSkills = () => {
    if (!user) return;
    fetch('/api/myskills', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSkills(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    if (!user) return;

    fetchSkills();

    fetch(`/api/users/${user.id}/reviews`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setReviews(Array.isArray(data) ? data : []));

    fetch('/api/sessions/mine', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const all: Session[] = Array.isArray(data) ? data : [];
        setUpcomingSessions(all.filter((s) => s.status === 'upcoming' || s.status === 'confirmed'));
      });
  }, [user]);

  if (!user) return null;

  const avatarUrl =
    user.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff&size=128`;

  const handleSkillSaved = (saved: Skill) => {
    setSkills((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSkill) return;
    await fetch(`/api/myskills/${deletingSkill.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setSkills((prev) => prev.filter((s) => s.id !== deletingSkill.id));
    setDeletingSkill(null);
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      {editProfileOpen && (
        <EditProfileModal
          onClose={() => setEditProfileOpen(false)}
          onSaved={refreshUser}
        />
      )}
      {(addSkillOpen || editingSkill) && (
        <SkillModal
          existing={editingSkill ?? undefined}
          onClose={() => { setAddSkillOpen(false); setEditingSkill(null); }}
          onSaved={handleSkillSaved}
        />
      )}
      {deletingSkill && (
        <DeleteConfirmModal
          skillName={deletingSkill.name}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingSkill(null)}
        />
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={avatarUrl}
              alt={user.name}
              className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl"
            />

            <div className="flex-1 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{(user.rating ?? 0).toFixed(1)}</span>
                      <span className="text-white/80">({user.reviewsCount ?? 0} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-5 h-5" />
                      <span>{skills.length} Skills</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:scale-105 transition-transform font-semibold shadow-lg"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              </div>
              {user.bio && <p className="text-lg text-white/90">{user.bio}</p>}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{skills.length}</div>
              <div className="text-sm text-white/80">Skills</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{upcomingSessions.length}</div>
              <div className="text-sm text-white/80">Upcoming Sessions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{user.reviewsCount ?? 0}</div>
              <div className="text-sm text-white/80">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Skills */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Skills</h2>
              <button
                onClick={() => setAddSkillOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>

            {skills.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Δεν έχεις προσθέσει δεξιότητες ακόμα.</p>
            ) : (
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{skill.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          skill.level === 'Expert'
                            ? 'bg-green-100 text-green-700'
                            : skill.level === 'Intermediate'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {skill.level}
                        </span>
                        <span className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{skill.yearsOfExperience}+ years</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => setEditingSkill(skill)}
                        className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Επεξεργασία"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingSkill(skill)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Αφαίρεση"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Δεν υπάρχουν αξιολογήσεις ακόμα.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={review.fromUserAvatar}
                          alt={review.fromUser}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{review.fromUser}</p>
                          <p className="text-sm text-gray-600">{review.skillTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/sessions')}
                className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-transform"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Schedule Session</span>
              </button>
              <button
                onClick={() => navigate('/messages')}
                className="w-full flex items-center space-x-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold">View Messages</span>
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full flex items-center space-x-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <Award className="w-5 h-5" />
                <span className="font-semibold">Browse Marketplace</span>
              </button>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>

            {upcomingSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Δεν υπάρχουν προγραμματισμένες συνεδρίες.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={session.otherUserAvatar}
                        alt={session.otherUser}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{session.skillTitle}</p>
                        <p className="text-sm text-gray-600">{session.otherUser}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-purple-600">
                        <Calendar className="w-4 h-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{session.time}</span>
                      </div>
                    </div>
                    <span className={`inline-block mt-3 px-3 py-1 rounded-lg text-xs font-medium ${
                      session.type === 'teaching' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {session.type === 'teaching' ? 'Teaching' : 'Learning'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <Mail className="w-5 h-5 text-purple-600" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>Available for messages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
