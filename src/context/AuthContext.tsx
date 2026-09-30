import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus, StudyMedium, PaymentPlan } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (phone: string, password?: string) => {
    success: boolean;
    role?: UserRole;
    user?: User;
    status?: UserStatus;
    messageEn: string;
    messageSi: string;
  };
  registerStudent: (data: {
    fullName: string;
    phone: string;
    parentPhone: string;
    password: string;
    courseId: string;
    medium: StudyMedium;
    paymentPlan: PaymentPlan;
    paidAmount: number;
    slipTransactionId: string;
  }) => {
    success: boolean;
    user?: User;
    messageEn: string;
    messageSi: string;
  };
  register: (data: {
    fullName: string;
    phone: string;
    parentPhone?: string;
    grade?: string;
    password: string;
  }) => {
    success: boolean;
    user?: User;
    messageEn: string;
    messageSi: string;
  };
  switchRole: (role: UserRole) => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  activateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  suspendUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  createUser: (userData: Omit<User, 'id' | 'registeredAt'>) => User;
  enrollInCourse: (courseId: string, plan?: 'full' | 'monthly' | 'installments', duration?: string, expiresAt?: string) => void;
  activateStudentEnrollment: (studentId: string, courseId: string, plan: 'full' | 'monthly' | 'installments', duration?: string, expiresAt?: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getCourseAccessInfo: (courseId: string) => {
    isEnrolled: boolean;
    plan?: string;
    duration?: string;
    expiresAt?: string;
    daysRemaining?: number;
    isExpired: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('monarch_users_v3');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure Super Admin and Manager are executives, never linked to student course lists
        return parsed.map((u) => {
          if (u.role === 'superadmin' || u.role === 'manager') {
            return { ...u, enrolledCourseIds: [] };
          }
          return u;
        });
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('monarch_current_user_v3');
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        if (parsed.role === 'superadmin' || parsed.role === 'manager') {
          return { ...parsed, enrolledCourseIds: [] };
        }
        return parsed;
      } catch {
        return null;
      }
    }
    // Default null so login page or public home shows naturally,
    // or if previously logged in, recovers session
    return null;
  });

  useEffect(() => {
    localStorage.setItem('monarch_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('monarch_current_user_v3', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('monarch_current_user_v3');
    }
  }, [currentUser]);

  /**
   * Unified Direct Authentication:
   * System automatically detects user role from username (phone) and password.
   * NO "Select Portal" input required!
   */
  const login = (phoneInput: string, passwordInput?: string) => {
    const cleanPhone = phoneInput.trim().replace(/\s+/g, '');
    const cleanPass = passwordInput ? passwordInput.trim() : '';

    // Search matching user by phone
    const matched = users.find((u) => u.phone === cleanPhone);

    if (!matched) {
      return {
        success: false,
        messageEn: 'No account found with this phone number. Please check or register.',
        messageSi: 'මෙම දුරකථන අංකයට අදාළ ගිණුමක් හමු නොවීය. කරුණාකර අංකය පරීක්ෂා කරන්න හෝ ලියාපදිංචි වන්න.',
      };
    }

    // Verify password if user has password configured
    if (matched.password && matched.password !== cleanPass) {
      return {
        success: false,
        messageEn: 'Incorrect password. Please try again.',
        messageSi: 'මුරපදය වැරදියි. කරුණාකර නිවැරදි මුරපදය ඇතුළත් කරන්න.',
      };
    }

    // Check account status
    if (matched.status === 'pending') {
      return {
        success: false,
        status: 'pending' as UserStatus,
        messageEn: 'Your account and bank slip payment are currently pending verification by Super Admin / Manager. Please wait for approval.',
        messageSi: 'ඔබගේ ලියාපදිංචිය සහ බැංකු ගෙවීම් පරීක්ෂාව තවමත් සිදුවෙමින් පවතී. කරුණාකර Super Admin හෝ Manager විසින් ගිණුම සක්‍රිය (Activate) කරන තෙක් රැඳී සිටින්න.',
      };
    }

    if (matched.status === 'suspended') {
      return {
        success: false,
        status: 'suspended' as UserStatus,
        messageEn: 'Your account has been temporarily suspended. Please contact Monarch Campus administration.',
        messageSi: 'ඔබගේ ගිණුම තාවකාලිකව අත්හිටුවා ඇත. කරුණාකර පරිපාලක අංශය අමතන්න.',
      };
    }

    // Success! Log the user in and return their auto-detected role
    setCurrentUser(matched);
    return {
      success: true,
      role: matched.role,
      user: matched,
      status: matched.status,
      messageEn: `Logged in successfully as ${matched.fullName} (${matched.role.toUpperCase()})!`,
      messageSi: `${matched.fullName} (${matched.role.toUpperCase()}) ලෙස සාර්ථකව පිවිසුණි!`,
    };
  };

  /**
   * Direct Student Registration
   * With Course selection, Medium (Sinhala or English), Cart payment option, and Slip Transaction ID
   */
  const registerStudent = (data: {
    fullName: string;
    phone: string;
    parentPhone: string;
    password: string;
    courseId: string;
    medium: StudyMedium;
    paymentPlan: PaymentPlan;
    paidAmount: number;
    slipTransactionId: string;
  }) => {
    const cleanPhone = data.phone.trim().replace(/\s+/g, '');
    const cleanParent = data.parentPhone.trim().replace(/\s+/g, '');

    const existing = users.find((u) => u.phone === cleanPhone);
    if (existing) {
      return {
        success: false,
        messageEn: 'An account with this phone number already exists. Please log in.',
        messageSi: 'මෙම දුරකථන අංකයෙන් ලියාපදිංචි වූ ගිණුමක් දැනටමත් පවතී. කරුණාකර ලොග් වන්න.',
      };
    }

    const newStudent: User = {
      id: `student-${Date.now()}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      parentPhone: cleanParent,
      password: data.password.trim(),
      role: 'student',
      status: 'pending', // Pending approval by Admin/Manager
      selectedCourseId: data.courseId,
      enrolledCourseIds: [data.courseId],
      medium: data.medium,
      paymentPlan: data.paymentPlan,
      paidAmount: data.paidAmount,
      paymentStatus: 'pending',
      slipTransactionId: data.slipTransactionId.trim(),
      registeredAt: new Date().toISOString().substring(0, 10),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    setUsers((prev) => [newStudent, ...prev]);

    return {
      success: true,
      user: newStudent,
      messageEn: 'Registration and Bank Slip submitted successfully! Your account will be activated once verified by Super Admin or Manager.',
      messageSi: 'ලියාපදිංචිය සහ බැංකු ගෙවීම් විස්තර සාර්ථකව යොමු විය! Super Admin හෝ Manager විසින් පරීක්ෂා කර ගිණුම සක්‍රිය කළ පසු ඔබට ලොග් විය හැක.',
    };
  };

  /**
   * Fast register for students (used by RegistrationPage)
   */
  const register = (data: {
    fullName: string;
    phone: string;
    parentPhone?: string;
    grade?: string;
    password: string;
  }) => {
    const cleanPhone = data.phone.trim().replace(/\s+/g, '');
    const cleanParent = (data.parentPhone || '').trim().replace(/\s+/g, '');

    const existing = users.find((u) => u.phone === cleanPhone);
    if (existing) {
      return {
        success: false,
        messageEn: 'An account with this phone number already exists. Please log in.',
        messageSi: 'මෙම දුරකථන අංකයෙන් ලියාපදිංචි වූ ගිණුමක් දැනටමත් පවතී. කරුණාකර ලොග් වන්න.',
      };
    }

    const newStudent: User = {
      id: `student-${Date.now()}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      parentPhone: cleanParent,
      password: data.password.trim(),
      role: 'student',
      grade: data.grade || '2028 A/L',
      status: 'active',
      paymentStatus: 'paid',
      enrolledCourseIds: ['course-maths-2028'],
      registeredAt: new Date().toISOString().substring(0, 10),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    setUsers((prev) => [newStudent, ...prev]);
    setCurrentUser(newStudent);

    return {
      success: true,
      user: newStudent,
      messageEn: 'Registration successful! Welcome to Monarch Campus.',
      messageSi: 'ලියාපදිංචිය සාර්ථකයි! Monarch Campus වෙත සාදරයෙන් පිළිගනිමු.',
    };
  };

  const switchRole = (newRole: UserRole) => {
    let target = users.find((u) => u.role === newRole);
    if (!target) {
      target = INITIAL_USERS.find((u) => u.role === newRole);
    }
    if (target) {
      setCurrentUser(target);
    } else if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  };

  const loginAsRole = (role: UserRole) => {
    switchRole(role);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const activateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'active', paymentStatus: 'paid', lastPaymentDate: new Date().toISOString().substring(0, 10) }
          : u
      )
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const suspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u))
    );
  };

  const reactivateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
  };

  const resetUserPassword = (userId: string, newPassword: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPassword.trim() } : u))
    );
  };

  const createUser = (userData: Omit<User, 'id' | 'registeredAt'>): User => {
    const isExecutive = userData.role === 'superadmin' || userData.role === 'manager';
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      enrolledCourseIds: isExecutive ? [] : userData.enrolledCourseIds,
      registeredAt: new Date().toISOString().substring(0, 10),
    };
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const enrollInCourse = (
    courseId: string,
    plan: 'full' | 'monthly' | 'installments' = 'full',
    duration: string = '6 Months',
    customExpiresAt?: string
  ) => {
    if (!currentUser) return;
    // Executives (Super Admin & Manager) are never enrolled in student courses
    if (currentUser.role === 'superadmin' || currentUser.role === 'manager') {
      return;
    }

    let expiresAt = customExpiresAt;
    if (!expiresAt) {
      const d = new Date();
      if (plan === 'full') {
        if (duration.toLowerCase().includes('year') || duration.toLowerCase().includes('වසර')) {
          d.setDate(d.getDate() + 365);
        } else {
          d.setDate(d.getDate() + 180);
        }
      } else if (plan === 'monthly') {
        d.setDate(d.getDate() + 30);
      } else {
        d.setDate(d.getDate() + 90);
      }
      expiresAt = d.toISOString().substring(0, 10);
    }

    const newAccess: any = {
      courseId,
      courseTitleSi: '',
      courseTitleEn: '',
      enrolledAt: new Date().toISOString().substring(0, 10),
      plan,
      duration,
      expiresAt,
      status: 'active',
    };

    const updatedUser: User = {
      ...currentUser,
      enrolledCourseIds: Array.from(new Set([...currentUser.enrolledCourseIds, courseId])),
      courseAccessList: [
        ...(currentUser.courseAccessList || []).filter((a) => a.courseId !== courseId),
        newAccess,
      ],
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const activateStudentEnrollment = (
    studentId: string,
    courseId: string,
    plan: 'full' | 'monthly' | 'installments' = 'full',
    duration: string = '6 Months',
    customExpiresAt?: string
  ) => {
    let expiresAt = customExpiresAt;
    if (!expiresAt) {
      const d = new Date();
      if (plan === 'full') {
        if (duration.toLowerCase().includes('year') || duration.toLowerCase().includes('වසර')) {
          d.setDate(d.getDate() + 365);
        } else {
          d.setDate(d.getDate() + 180);
        }
      } else if (plan === 'monthly') {
        d.setDate(d.getDate() + 30);
      } else {
        d.setDate(d.getDate() + 90);
      }
      expiresAt = d.toISOString().substring(0, 10);
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === studentId) {
          const newAccessList = [
            ...(u.courseAccessList || []).filter((a) => a.courseId !== courseId),
            {
              courseId,
              courseTitleSi: '',
              courseTitleEn: '',
              enrolledAt: new Date().toISOString().substring(0, 10),
              plan,
              duration,
              expiresAt,
              status: 'active' as const,
            },
          ];

          const updated: User = {
            ...u,
            status: 'active',
            paymentStatus: 'paid',
            enrolledCourseIds: Array.from(new Set([...u.enrolledCourseIds, courseId])),
            courseAccessList: newAccessList,
            lastPaymentDate: new Date().toISOString().substring(0, 10),
          };

          if (currentUser?.id === studentId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const isEnrolled = (courseId: string) => {
    if (!currentUser) return false;
    // SuperAdmin has master access to all courses
    if (currentUser.role === 'superadmin') return true;
    return currentUser.enrolledCourseIds.includes(courseId);
  };

  const getCourseAccessInfo = (courseId: string) => {
    if (!currentUser) {
      return { isEnrolled: false, isExpired: false };
    }

    if (currentUser.role === 'superadmin') {
      return {
        isEnrolled: true,
        plan: 'full',
        duration: 'Lifetime Master Access',
        expiresAt: '2099-12-31',
        daysRemaining: 9999,
        isExpired: false,
      };
    }

    const enrolled = currentUser.enrolledCourseIds.includes(courseId);
    if (!enrolled) {
      return { isEnrolled: false, isExpired: false };
    }

    const access = (currentUser.courseAccessList || []).find((a) => a.courseId === courseId);
    if (!access || !access.expiresAt) {
      // Default: active with 180 days from enrollment
      return {
        isEnrolled: true,
        plan: currentUser.paymentPlan || 'full',
        duration: '6 Months',
        expiresAt: '2027-03-31',
        daysRemaining: 180,
        isExpired: false,
      };
    }

    const expTime = new Date(access.expiresAt).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
    const isExpired = diffDays <= 0;

    return {
      isEnrolled: true,
      plan: access.plan,
      duration: access.duration,
      expiresAt: access.expiresAt,
      daysRemaining: diffDays > 0 ? diffDays : 0,
      isExpired,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        registerStudent,
        switchRole,
        loginAsRole,
        logout,
        activateUser,
        deleteUser,
        suspendUser,
        reactivateUser,
        resetUserPassword,
        createUser,
        enrollInCourse,
        activateStudentEnrollment,
        isEnrolled,
        getCourseAccessInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
