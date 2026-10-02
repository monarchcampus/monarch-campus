import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  KeyRound,
  Trash2,
  Clock,
  GraduationCap,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, UserStatus } from '../../types';

export const AdminUsersTab: React.FC = () => {
  const { users, currentUser, createUser, activateUser, suspendUser, reactivateUser, resetUserPassword, deleteUser } = useAuth();
  const { t } = useLanguage();

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isManager = currentUser?.role === 'manager';

  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetModalUserId, setResetModalUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [grade, setGrade] = useState('2028 A/L');

  // Hierarchy enforcement: Manager can ONLY view & manage Lecturers and Students.
  // Super Admin can view & manage Managers, Lecturers, and Students.
  const baseUsers = isManager
    ? users.filter((u) => u.role !== 'superadmin')
    : users;

  const filteredUsers = baseUsers.filter((u) => {
    const isLecturerMatch =
      roleFilter === 'lecturer' || roleFilter === 'instructor'
        ? u.role === 'lecturer' || u.role === 'instructor'
        : u.role === roleFilter;

    const matchesRole = roleFilter === 'all' || isLecturerMatch;
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      (u.grade && u.grade.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !password.trim()) return;

    const isExecOrLecturer = role === 'superadmin' || role === 'manager' || role === 'lecturer' || role === 'instructor';

    createUser({
      fullName: fullName.trim(),
      phone: phone.trim(),
      password: password.trim(),
      role,
      grade: role === 'student' ? grade : undefined,
      status: 'active',
      paymentStatus: 'paid',
      // Executives and Lecturers are never given default student course enrollments
      enrolledCourseIds: isExecOrLecturer ? [] : ['course-maths-2028'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    setShowAddModal(false);
    setFullName('');
    setPhone('');
    setPassword('');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUserId || !newPassword.trim()) return;
    resetUserPassword(resetModalUserId, newPassword.trim());
    setResetModalUserId(null);
    setNewPassword('');
  };

  return (
    <div className="space-y-6">


      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('නම හෝ දුරකථන අංකයෙන් සොයන්න...', 'Search by name or phone...')}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Role Filters */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {isSuperAdmin ? (
              <>
                <option value="all">{t('සියලු කාණ්ඩ (All Roles)', 'All Roles')}</option>
                <option value="superadmin">👑 Super Admin (විධායක)</option>
                <option value="manager">💼 Manager (කළමනාකරු)</option>
                <option value="lecturer">🎓 Lecturer (ආචාර්ය)</option>
                <option value="student">🎒 Student (සිසුන්)</option>
              </>
            ) : (
              <>
                <option value="all">{t('සියලු පාලන කාණ්ඩ (Lecturers & Students)', 'All (Lecturers & Students)')}</option>
                <option value="lecturer">🎓 Lecturer (ආචාර්ය)</option>
                <option value="student">🎒 Student (සිසුන්)</option>
              </>
            )}
          </select>
        </div>

        <button
          onClick={() => {
            setRole(isManager ? 'lecturer' : 'manager');
            setShowAddModal(true);
          }}
          className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>
            {isSuperAdmin
              ? t('+ නව පරිශීලකයෙක් එක් කරන්න (Manager / Lecturer / Student)', '+ Add User (Manager / Lecturer / Student)')
              : t('+ නව පරිශීලකයෙක් එක් කරන්න (Lecturer / Student)', '+ Add User (Lecturer / Student)')}
          </span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">User & Contact</th>
              <th className="px-4 py-3">Role (කාණ්ඩය)</th>
              <th className="px-4 py-3">Status / Payment</th>
              <th className="px-4 py-3 text-right">Actions (ක්‍රියා)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{u.fullName}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{u.phone}</span>
                      {u.grade && <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-semibold dark:bg-amber-950/40">{u.grade}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                      u.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : u.role === 'manager'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : u.role === 'instructor'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : u.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {u.status === 'active' ? '✓ Active' : u.status === 'pending' ? '⏳ Pending Slip' : '✕ Suspended'}
                    </span>
                    {u.slipTransactionId && (
                      <span className="block font-mono text-[10px] text-slate-500">
                        Ref: {u.slipTransactionId}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {u.status === 'pending' && (
                      <button
                        onClick={() => activateUser(u.id)}
                        className="cursor-pointer px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        title={t('ගිණුම සක්‍රිය කරන්න', 'Verify & Activate Slip')}
                      >
                        Approve Slip
                      </button>
                    )}
                    {u.status === 'active' && u.role !== 'superadmin' && (
                      <button
                        onClick={() => suspendUser(u.id)}
                        className="cursor-pointer p-1 text-slate-400 hover:text-amber-600"
                        title={t('අත්හිටුවන්න', 'Suspend')}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {u.status === 'suspended' && (
                      <button
                        onClick={() => reactivateUser(u.id)}
                        className="cursor-pointer p-1 text-slate-400 hover:text-emerald-600"
                        title={t('නැවත සක්‍රිය කරන්න', 'Reactivate')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setResetModalUserId(u.id)}
                      className="cursor-pointer p-1 text-slate-400 hover:text-blue-600"
                      title={t('මුරපදය Reset කරන්න', 'Reset Password')}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    {u.role !== 'superadmin' && (
                      <button
                        onClick={() => {
                          if (confirm(t('මෙම පරිශීලකයා මකා දැමීමට අවශ්‍යද?', 'Delete this user?'))) {
                            deleteUser(u.id);
                          }
                        }}
                        className="cursor-pointer p-1 text-slate-400 hover:text-red-600"
                        title={t('මකා දමන්න', 'Delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('නව පරිශීලකයෙක් ඇතුළත් කිරීම', 'Add New User to Monarch Campus')}
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name (සම්පූර්ණ නම)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kasun Silva"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number (දුරකථන අංකය / Username)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Role (ප්‍රවේශ කාණ්ඩය)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold"
                >
                  <option value="student">Student (ශිෂ්‍ය)</option>
                  <option value="lecturer">Lecturer (ආචාර්ය)</option>
                  {isSuperAdmin && (
                    <>
                      <option value="manager">Manager (කළමනාකරු)</option>
                      <option value="superadmin">Super Admin (ප්‍රධාන පරිපාලක)</option>
                    </>
                  )}
                </select>
              </div>
              {role === 'student' && (
                <div>
                  <label className="block font-semibold mb-1">Grade / Class</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  >
                    <option value="2028 A/L">2028 A/L</option>
                    <option value="2027 A/L">2027 A/L</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Professional ICT">Professional ICT & AI</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1">Password (මුරපදය)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('නව මුරපදයක් ලබා දෙන්න', 'Reset User Password')}
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (e.g. Pass@2026)"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUserId(null)}
                  className="cursor-pointer flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
