import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  Lesson,
  BankAccount,
  PromoCode,
  MarketingCampaign,
  ZoomClass,
  OnlineExam,
  SiteConfig,
  SlideBanner,
  NavMenuItem,
  Announcement,
  CoursePaymentSubmission,
  Assignment,
  StudentReview,
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_PROMO_CODES,
  INITIAL_MARKETING_CAMPAIGNS,
  INITIAL_ZOOM_CLASSES,
  INITIAL_ONLINE_EXAMS,
  INITIAL_SITE_CONFIG,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_PAYMENT_SUBMISSIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_STUDENT_REVIEWS,
} from '../data/mockData';

interface InAppNotification {
  id: string;
  targetUserId?: string; // If undefined, applies to all
  title: string;
  message: string;
  type: 'payment_reminder' | 'zoom_alert' | 'general' | 'exam';
  createdAt: string;
  isRead: boolean;
}

interface LmsDataContextType {
  // Courses
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updated: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addLessonToCourse: (courseId: string, lesson: Lesson) => void;
  updateLessonInCourse: (courseId: string, lessonId: string, updated: Partial<Lesson>) => void;
  deleteLessonFromCourse: (courseId: string, lessonId: string) => void;

  // Bank Accounts
  bankAccounts: BankAccount[];
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (id: string, updated: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;

  // Promo Codes
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  updatePromoCode: (id: string, updated: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  validatePromoCode: (code: string, originalAmount: number) => {
    isValid: boolean;
    discountAmount: number;
    finalAmount: number;
    promo?: PromoCode;
    messageSi: string;
    messageEn: string;
  };

  // Marketing & QR Codes
  campaigns: MarketingCampaign[];
  addCampaign: (campaign: MarketingCampaign) => void;
  deleteCampaign: (id: string) => void;

  // Zoom Classes
  zoomClasses: ZoomClass[];
  addZoomClass: (zClass: ZoomClass) => void;
  updateZoomClass: (id: string, updated: Partial<ZoomClass>) => void;
  deleteZoomClass: (id: string) => void;
  startZoomClass: (id: string) => void;
  endZoomClass: (id: string) => void;

  // Online Exams & Study Papers
  onlineExams: OnlineExam[];
  addOnlineExam: (exam: OnlineExam) => void;
  pushLiveExam: (examData: Omit<OnlineExam, 'id' | 'results'>) => OnlineExam;
  updateOnlineExam: (id: string, updated: Partial<OnlineExam>) => void;
  deleteOnlineExam: (id: string) => void;
  recordExamResult: (
    examId: string,
    result: { studentId: string; studentName: string; score: number; maxScore: number; grade: string; answers?: Record<number, number>; autoSubmitted?: boolean; studentPhone?: string }
  ) => void;
  submitExamAnswers: (
    examId: string,
    studentInfo: { studentId: string; studentName: string; studentPhone?: string },
    answers: Record<number, number>,
    autoSubmitted?: boolean
  ) => { score: number; maxScore: number; grade: string };

  // Student Progress & Lesson Completion Reporting
  completedLessons: Record<string, boolean>;
  markLessonCompleted: (
    courseId: string,
    lessonId: string,
    isCompleted: boolean,
    studentInfo?: { studentId: string; studentName: string; instructorPhone?: string; courseTitleSi?: string; lessonTitleSi?: string }
  ) => void;

  // CMS & Branding
  siteConfig: SiteConfig;
  updateSiteConfig: (updated: Partial<SiteConfig>) => void;
  updateCustomLogo: (logoUrl: string | null) => void;
  updateCustomEmblem: (emblemUrl: string | null) => void;
  updateCustomBanner: (bannerUrl: string | null) => void;
  addSlideBanner: (slide: SlideBanner) => void;
  deleteSlideBanner: (id: string) => void;
  addNavMenuItem: (item: NavMenuItem) => void;
  deleteNavMenuItem: (id: string) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (ann: Announcement) => void;
  deleteAnnouncement: (id: string) => void;

  // In-app Notifications
  notifications: InAppNotification[];
  sendNotification: (notif: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;

  // Course Payments & Bank Slip Approvals
  paymentSubmissions: CoursePaymentSubmission[];
  submitCoursePayment: (data: Omit<CoursePaymentSubmission, 'id' | 'submittedAt' | 'status'>) => CoursePaymentSubmission;
  approvePaymentSubmission: (id: string, reviewedBy: string, customExpiresAt?: string) => CoursePaymentSubmission | undefined;
  rejectPaymentSubmission: (id: string, reason: string, reviewedBy: string) => CoursePaymentSubmission | undefined;

  // Assignments & Grading
  assignments: Assignment[];
  addAssignment: (assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>) => Assignment;
  deleteAssignment: (id: string) => void;
  recordAssignmentMark: (
    assignmentId: string,
    studentName: string,
    studentId?: string,
    marksPercent?: number,
    grade?: string,
    feedback?: string
  ) => void;

  // Exam Push / Re-Push
  rePushExamToStudent: (
    examId: string,
    studentName: string,
    courseTitle: string,
    studentPhoneOrId?: string
  ) => void;

  // Student Reviews on Homepage
  studentReviews: StudentReview[];
  addStudentReview: (review: Omit<StudentReview, 'id'>) => StudentReview;
  updateStudentReview: (id: string, updated: Partial<StudentReview>) => void;
  deleteStudentReview: (id: string) => void;
}

const LmsDataContext = createContext<LmsDataContextType | undefined>(undefined);

export const LmsDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Courses
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('monarch_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  // 2. Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('monarch_bank_accounts');
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  // 3. Promo Codes
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('monarch_promo_codes');
    return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
  });

  // 4. Marketing Campaigns
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const saved = localStorage.getItem('monarch_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_MARKETING_CAMPAIGNS;
  });

  // 5. Zoom Classes
  const [zoomClasses, setZoomClasses] = useState<ZoomClass[]>(() => {
    const saved = localStorage.getItem('monarch_zoom_classes');
    return saved ? JSON.parse(saved) : INITIAL_ZOOM_CLASSES;
  });

  // 6. Online Exams
  const [onlineExams, setOnlineExams] = useState<OnlineExam[]>(() => {
    const saved = localStorage.getItem('monarch_online_exams');
    return saved ? JSON.parse(saved) : INITIAL_ONLINE_EXAMS;
  });

  // 7. Site Config
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('monarch_site_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out removed pages: free-mcq and seminars
        if (Array.isArray(parsed.navMenuItems)) {
          parsed.navMenuItems = parsed.navMenuItems.filter(
            (m: any) => m.path !== 'free-mcq' && m.path !== 'freemcq' && m.path !== 'seminars'
          );
        }
        if (Array.isArray(parsed.slideBanners)) {
          parsed.slideBanners = parsed.slideBanners.filter(
            (s: any) => !s.ctaLink?.includes('seminars') && !s.ctaLink?.includes('mcq')
          );
          if (parsed.slideBanners.length === 0) {
            parsed.slideBanners = INITIAL_SITE_CONFIG.slideBanners;
          }
        }
        if (!parsed.navMenuItems || parsed.navMenuItems.length === 0) {
          parsed.navMenuItems = INITIAL_SITE_CONFIG.navMenuItems;
        }
        return parsed;
      } catch {
        return INITIAL_SITE_CONFIG;
      }
    }
    return INITIAL_SITE_CONFIG;
  });

  // 7.1 Student Reviews (Super Admin can manage; shown instantly on Home Page)
  const [studentReviews, setStudentReviews] = useState<StudentReview[]>(() => {
    const saved = localStorage.getItem('monarch_student_reviews_v1');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_REVIEWS;
  });

  // 8. Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('monarch_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // 9. In-app notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('monarch_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-1',
        title: 'Welcome to Monarch Campus',
        message: 'Your portal is fully active. Access all live lectures, recordings, and papers from your dashboard.',
        type: 'general',
        createdAt: '2026-09-26 10:00',
        isRead: false,
      }
    ];
  });

  // 10. Course Payment Submissions
  const [paymentSubmissions, setPaymentSubmissions] = useState<CoursePaymentSubmission[]>(() => {
    const saved = localStorage.getItem('monarch_payment_submissions_v2');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_SUBMISSIONS;
  });

  // 11. Student Completed Lessons Tracking
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('monarch_completed_lessons_v2');
    return saved ? JSON.parse(saved) : {
      'les-m-1': true,
      'les-m-2': true,
      'les-p-1': true,
      'les-ict-1': true,
    };
  });

  // 12. Assignments & Grading
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('monarch_assignments_v1');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('monarch_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('monarch_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('monarch_promo_codes', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('monarch_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('monarch_zoom_classes', JSON.stringify(zoomClasses));
  }, [zoomClasses]);

  useEffect(() => {
    localStorage.setItem('monarch_online_exams', JSON.stringify(onlineExams));
  }, [onlineExams]);

  useEffect(() => {
    localStorage.setItem('monarch_site_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('monarch_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('monarch_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('monarch_payment_submissions_v2', JSON.stringify(paymentSubmissions));
  }, [paymentSubmissions]);

  useEffect(() => {
    localStorage.setItem('monarch_completed_lessons_v2', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('monarch_assignments_v1', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('monarch_student_reviews_v1', JSON.stringify(studentReviews));
  }, [studentReviews]);

  // Student Review actions
  const addStudentReview = (reviewData: Omit<StudentReview, 'id'>): StudentReview => {
    const newRev: StudentReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
    };
    setStudentReviews((prev) => [newRev, ...prev]);
    return newRev;
  };

  const updateStudentReview = (id: string, updated: Partial<StudentReview>) => {
    setStudentReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const deleteStudentReview = (id: string) => {
    setStudentReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // Course actions
  const addCourse = (course: Course) => {
    setCourses((prev) => [course, ...prev]);
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addLessonToCourse = (courseId: string, lesson: Lesson) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            lessons: [...c.lessons, lesson],
          };
        }
        return c;
      })
    );
  };

  const updateLessonInCourse = (courseId: string, lessonId: string, updated: Partial<Lesson>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            lessons: c.lessons.map((l) => (l.id === lessonId ? { ...l, ...updated } : l)),
          };
        }
        return c;
      })
    );
  };

  const deleteLessonFromCourse = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            lessons: c.lessons.filter((l) => l.id !== lessonId),
          };
        }
        return c;
      })
    );
  };

  // Bank Account actions
  const addBankAccount = (account: BankAccount) => {
    setBankAccounts((prev) => [...prev, account]);
  };

  const updateBankAccount = (id: string, updated: Partial<BankAccount>) => {
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== id));
  };

  // Promo Code actions
  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes((prev) => [promo, ...prev]);
  };

  const updatePromoCode = (id: string, updated: Partial<PromoCode>) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
  };

  const validatePromoCode = (code: string, originalAmount: number) => {
    const cleanCode = code.trim().toUpperCase();
    const found = promoCodes.find(
      (p) => p.code.toUpperCase() === cleanCode && p.isActive
    );

    if (!found) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: originalAmount,
        messageSi: 'වලංගු නොවන ප්‍රොමෝ කෝඩ් එකකි. කරුණාකර නැවත උත්සාහ කරන්න.',
        messageEn: 'Invalid or expired promo code. Please verify and try again.',
      };
    }

    if (found.usageCount >= found.maxUsage) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: originalAmount,
        messageSi: 'මෙම ප්‍රොමෝ කෝඩ් එකෙහි උපරිම සීමාව ඉක්මවා ඇත.',
        messageEn: 'This promo code has reached its maximum usage limit.',
      };
    }

    let discountAmount = 0;
    if (found.discountType === 'percentage') {
      discountAmount = Math.round((originalAmount * found.discountValue) / 100);
    } else {
      discountAmount = Math.min(found.discountValue, originalAmount);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      isValid: true,
      discountAmount,
      finalAmount,
      promo: found,
      messageSi: `ප්‍රොමෝ කෝඩ් එක සාර්ථකයි! රු. ${discountAmount.toLocaleString()} ක වට්ටමක් ලැබුණි.`,
      messageEn: `Promo applied! You saved LKR ${discountAmount.toLocaleString()}.`,
    };
  };

  // Marketing actions
  const addCampaign = (campaign: MarketingCampaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  // Zoom actions
  const addZoomClass = (zClass: ZoomClass) => {
    setZoomClasses((prev) => [zClass, ...prev]);
  };

  const updateZoomClass = (id: string, updated: Partial<ZoomClass>) => {
    setZoomClasses((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...updated } : z))
    );
  };

  const deleteZoomClass = (id: string) => {
    setZoomClasses((prev) => prev.filter((z) => z.id !== id));
  };

  const startZoomClass = (id: string) => {
    setZoomClasses((prev) =>
      prev.map((z) => (z.id === id ? { ...z, status: 'live' } : z))
    );
  };

  const endZoomClass = (id: string) => {
    setZoomClasses((prev) =>
      prev.map((z) => (z.id === id ? { ...z, status: 'ended' } : z))
    );
  };

  // Exam actions
  const addOnlineExam = (exam: OnlineExam) => {
    setOnlineExams((prev) => [exam, ...prev]);
  };

  const pushLiveExam = (examData: Omit<OnlineExam, 'id' | 'results'>): OnlineExam => {
    const newExam: OnlineExam = {
      ...examData,
      id: `exam-${Date.now()}`,
      optionsPerQuestion: examData.optionsPerQuestion || 5,
      status: examData.scheduledTime ? 'scheduled' : 'active',
      results: [],
    };

    setOnlineExams((prev) => [newExam, ...prev]);

    // Send push notification to enrolled students
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setNotifications((prev) => [
      {
        id: `notif-exam-${Date.now()}`,
        title: `නව ඔන්ලයින් විභාගයක්: ${newExam.title}`,
        message: `${newExam.courseTitle} පාඨමාලාව සඳහා නියමිත විභාගය දැන් සක්‍රියයි. කාලය විනාඩි ${newExam.durationMinutes} කි. ප්‍රශ්න ගණන ${newExam.questionsCount} කි.`,
        type: 'exam',
        createdAt: nowStr,
        isRead: false,
      },
      ...prev,
    ]);

    return newExam;
  };

  const updateOnlineExam = (id: string, updated: Partial<OnlineExam>) => {
    setOnlineExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const deleteOnlineExam = (id: string) => {
    setOnlineExams((prev) => prev.filter((e) => e.id !== id));
  };

  const recordExamResult = (
    examId: string,
    result: { studentId: string; studentName: string; score: number; maxScore: number; grade: string; answers?: Record<number, number>; autoSubmitted?: boolean; studentPhone?: string }
  ) => {
    setOnlineExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
          const existingFiltered = e.results.filter((r) => r.studentId !== result.studentId);
          return {
            ...e,
            results: [
              ...existingFiltered,
              {
                ...result,
                submittedAt: nowStr,
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const submitExamAnswers = (
    examId: string,
    studentInfo: { studentId: string; studentName: string; studentPhone?: string },
    answers: Record<number, number>,
    autoSubmitted: boolean = false
  ) => {
    const exam = onlineExams.find((e) => e.id === examId);
    const totalQ = exam?.questionsCount || 25;

    // Calculate score deterministically
    let correct = 0;
    for (let q = 1; q <= totalQ; q++) {
      const chosen = answers[q];
      const answerKey = ((q * 3 + 1) % 5) + 1;
      if (chosen === answerKey) correct++;
    }

    const score = correct;
    const maxScore = totalQ;
    const percentage = Math.round((score / maxScore) * 100);
    let grade = 'F';
    if (percentage >= 75) grade = 'A';
    else if (percentage >= 65) grade = 'B';
    else if (percentage >= 55) grade = 'C';
    else if (percentage >= 35) grade = 'S';

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Save into exam results
    recordExamResult(examId, {
      studentId: studentInfo.studentId,
      studentName: studentInfo.studentName,
      studentPhone: studentInfo.studentPhone,
      score,
      maxScore,
      grade,
      answers,
      autoSubmitted,
    });

    // Notify instructor
    setNotifications((prev) => [
      {
        id: `notif-exam-sub-${Date.now()}`,
        title: `විභාග පිළිතුරු ලැබුණි: ${studentInfo.studentName}`,
        message: `${exam?.title || 'Online Exam'} ප්‍රශ්න පත්‍රය සඳහා ${studentInfo.studentName} විසින් පිළිතුරු සපයන ලදී. ලකුණු: ${score}/${maxScore} (${percentage}%, Grade ${grade}).${autoSubmitted ? ' (ස්වයංක්‍රීයව කාලය අවසන් වී Submit විය)' : ''}`,
        type: 'exam',
        createdAt: nowStr,
        isRead: false,
      },
      ...prev,
    ]);

    return { score, maxScore, grade };
  };

  // Student lesson completion tracking & reporting to instructor
  const markLessonCompleted = (
    courseId: string,
    lessonId: string,
    isCompleted: boolean,
    studentInfo?: { studentId: string; studentName: string; instructorPhone?: string; courseTitleSi?: string; lessonTitleSi?: string }
  ) => {
    const key = studentInfo?.studentId ? `${studentInfo.studentId}_${lessonId}` : lessonId;
    setCompletedLessons((prev) => ({
      ...prev,
      [key]: isCompleted,
      [lessonId]: isCompleted,
    }));

    if (isCompleted && studentInfo) {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setNotifications((prev) => [
        {
          id: `notif-lesson-${Date.now()}`,
          title: `පාඩම් සම්පූර්ණ කිරීම: ${studentInfo.studentName}`,
          message: `${studentInfo.studentName} විසින් ${studentInfo.courseTitleSi || 'පාඨමාලාවේ'} "${studentInfo.lessonTitleSi || 'පාඩම'}" නරඹා අවසන් බවට සලකුණු කරන ලදී.`,
          type: 'general',
          createdAt: nowStr,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  // Assignment actions & Student Marks Recording
  const addAssignment = (data: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>): Assignment => {
    const newAssignment: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      submissions: [],
    };
    setAssignments((prev) => [newAssignment, ...prev]);

    // Send notification to students about new assignment
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setNotifications((prev) => [
      {
        id: `notif-asg-${Date.now()}`,
        title: `නව පැවරුම (Assignment): ${newAssignment.title}`,
        message: `${newAssignment.courseTitle} සඳහා නව පැවරුම (PDF) එක් කරන ලදී. භාරදීමේ අවසන් දිනය: ${newAssignment.dueDate || 'ළඟදීම'}.`,
        type: 'general',
        createdAt: nowStr,
        isRead: false,
      },
      ...prev,
    ]);

    return newAssignment;
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const recordAssignmentMark = (
    assignmentId: string,
    studentName: string,
    studentId?: string,
    marksPercent?: number,
    grade?: string,
    feedback?: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === assignmentId) {
          const existingSubs = asg.submissions || [];
          const filtered = existingSubs.filter((s) => s.studentName !== studentName && (!studentId || s.studentId !== studentId));
          const updatedSub = {
            studentId: studentId || `stud-${Date.now()}`,
            studentName: studentName.trim(),
            submittedAt: nowStr,
            marksPercent,
            grade,
            gradedAt: nowStr,
            feedback,
          };
          return {
            ...asg,
            submissions: [...filtered, updatedSub],
          };
        }
        return asg;
      })
    );

    // Send push notification to student
    setNotifications((prev) => [
      {
        id: `notif-mark-${Date.now()}`,
        title: `පැවරුම් ලකුණු නිකුත් කෙරුණි (${studentName})`,
        message: `ඔබගේ පැවරුම සඳහා ආචාර්යවරයා විසින් ලකුණු සටහන් කරන ලදී. ${marksPercent ? 'ලකුණු: ' + marksPercent + '%' : ''} ${grade ? 'සාමාර්ථය: ' + grade : ''}`,
        type: 'general',
        createdAt: nowStr,
        isRead: false,
      },
      ...prev,
    ]);
  };

  const rePushExamToStudent = (
    examId: string,
    studentName: string,
    courseTitle: string,
    studentPhoneOrId?: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const exam = onlineExams.find((e) => e.id === examId);
    setNotifications((prev) => [
      {
        id: `notif-repush-${Date.now()}`,
        title: `⚠️ විභාගය සම්පූර්ණ කරන්න: ${studentName}`,
        message: `ආචාර්යවරයා විසින් ${courseTitle} හි "${exam?.title || 'Online Exam'}" විභාගය සඳහා පෙනී සිටින ලෙස ඔබට නැවත සිහිපත් කර ඇත. කරුණාකර හැකි ඉක්මනින් විභාගයට මුහුණ දෙන්න.`,
        type: 'exam',
        createdAt: nowStr,
        isRead: false,
      },
      ...prev,
    ]);
  };

  // CMS & Branding actions
  const updateSiteConfig = (updated: Partial<SiteConfig>) => {
    setSiteConfig((prev) => ({ ...prev, ...updated }));
  };

  const updateCustomLogo = (logoUrl: string | null) => {
    setSiteConfig((prev) => ({ ...prev, customLogoUrl: logoUrl }));
  };

  const updateCustomEmblem = (emblemUrl: string | null) => {
    setSiteConfig((prev) => ({ ...prev, customEmblemUrl: emblemUrl }));
  };

  const updateCustomBanner = (bannerUrl: string | null) => {
    setSiteConfig((prev) => ({ ...prev, customBannerUrl: bannerUrl }));
  };

  const addSlideBanner = (slide: SlideBanner) => {
    setSiteConfig((prev) => ({
      ...prev,
      slideBanners: [...prev.slideBanners, slide],
    }));
  };

  const deleteSlideBanner = (id: string) => {
    setSiteConfig((prev) => ({
      ...prev,
      slideBanners: prev.slideBanners.filter((s) => s.id !== id),
    }));
  };

  const addNavMenuItem = (item: NavMenuItem) => {
    setSiteConfig((prev) => ({
      ...prev,
      navMenuItems: [...prev.navMenuItems, item],
    }));
  };

  const deleteNavMenuItem = (id: string) => {
    setSiteConfig((prev) => ({
      ...prev,
      navMenuItems: prev.navMenuItems.filter((n) => n.id !== id),
    }));
  };

  // Announcements
  const addAnnouncement = (ann: Announcement) => {
    setAnnouncements((prev) => [ann, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Notifications
  const sendNotification = (notif: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Course Payment Submissions Management
  const submitCoursePayment = (data: Omit<CoursePaymentSubmission, 'id' | 'submittedAt' | 'status'>): CoursePaymentSubmission => {
    const newSubmission: CoursePaymentSubmission = {
      ...data,
      id: `pay-sub-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setPaymentSubmissions((prev) => [newSubmission, ...prev]);

    // Send instant confirmation notification to student
    sendNotification({
      targetUserId: data.studentId,
      title: 'ගෙවීම් රිසිට්පත යොමු විය (Payment Slip Submitted)',
      message: `ඔබගේ "${data.courseTitleSi}" පාඨමාලාව සඳහා වූ ගෙවීම් රිසිට්පත (${data.slipReference}) සාර්ථකව යොමු විය. Super Admin හෝ Manager විසින් තහවුරු කළ විගස සක්‍රිය වේ.`,
      type: 'general',
    });

    return newSubmission;
  };

  const approvePaymentSubmission = (id: string, reviewedBy: string, customExpiresAt?: string): CoursePaymentSubmission | undefined => {
    let approvedItem: CoursePaymentSubmission | undefined;

    setPaymentSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          // Calculate expiration date
          let expiresAt = customExpiresAt;
          if (!expiresAt) {
            const expDate = new Date();
            if (sub.plan === 'full') {
              // 6 months (180 days) or 1 year depending on duration
              if (sub.courseDuration?.toLowerCase().includes('year') || sub.courseDuration?.toLowerCase().includes('වසර')) {
                expDate.setDate(expDate.getDate() + 365);
              } else {
                expDate.setDate(expDate.getDate() + 180);
              }
            } else if (sub.plan === 'monthly') {
              expDate.setDate(expDate.getDate() + 30);
            } else {
              // installments
              expDate.setDate(expDate.getDate() + 90);
            }
            expiresAt = expDate.toISOString().substring(0, 10);
          }

          const updated: CoursePaymentSubmission = {
            ...sub,
            status: 'approved',
            reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            reviewedBy,
            accessExpiresAt: expiresAt,
          };
          approvedItem = updated;
          return updated;
        }
        return sub;
      })
    );

    if (approvedItem) {
      // Auto notify student
      sendNotification({
        targetUserId: approvedItem.studentId,
        title: 'ගෙවීම් අනුමත විය (Payment Approved) ✓',
        message: `සුබ පැතුම්! ඔබගේ "${approvedItem.courseTitleSi}" පාඨමාලා ගෙවීම අනුමත කර සක්‍රිය කරන ලදී. වලංගු කාලය: ${approvedItem.accessExpiresAt} දක්වා.`,
        type: 'general',
      });
    }

    return approvedItem;
  };

  const rejectPaymentSubmission = (id: string, reason: string, reviewedBy: string): CoursePaymentSubmission | undefined => {
    let rejectedItem: CoursePaymentSubmission | undefined;

    setPaymentSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const updated: CoursePaymentSubmission = {
            ...sub,
            status: 'rejected',
            rejectionReason: reason,
            reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            reviewedBy,
          };
          rejectedItem = updated;
          return updated;
        }
        return sub;
      })
    );

    if (rejectedItem) {
      // Auto notify student
      sendNotification({
        targetUserId: rejectedItem.studentId,
        title: 'ගෙවීම් ප්‍රතික්ෂේප විය (Payment Slip Rejected) ⚠️',
        message: `ඔබගේ "${rejectedItem.courseTitleSi}" පාඨමාලා රිසිට්පත ප්‍රතික්ෂේප විය. හේතුව: ${reason}. කරුණාකර නිවැරදි රිසිට්පත් විස්තර යළි ඉදිරිපත් කරන්න.`,
        type: 'payment_reminder',
      });
    }

    return rejectedItem;
  };

  return (
    <LmsDataContext.Provider
      value={{
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        addLessonToCourse,
        updateLessonInCourse,
        deleteLessonFromCourse,

        bankAccounts,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,

        promoCodes,
        addPromoCode,
        updatePromoCode,
        deletePromoCode,
        validatePromoCode,

        campaigns,
        addCampaign,
        deleteCampaign,

        zoomClasses,
        addZoomClass,
        updateZoomClass,
        deleteZoomClass,
        startZoomClass,
        endZoomClass,

        onlineExams,
        addOnlineExam,
        pushLiveExam,
        updateOnlineExam,
        deleteOnlineExam,
        recordExamResult,
        submitExamAnswers,

        completedLessons,
        markLessonCompleted,

        siteConfig,
        updateSiteConfig,
        updateCustomLogo,
        updateCustomEmblem,
        updateCustomBanner,
        addSlideBanner,
        deleteSlideBanner,
        addNavMenuItem,
        deleteNavMenuItem,

        announcements,
        addAnnouncement,
        deleteAnnouncement,

        notifications,
        sendNotification,
        markNotificationAsRead,

        paymentSubmissions,
        submitCoursePayment,
        approvePaymentSubmission,
        rejectPaymentSubmission,

        assignments,
        addAssignment,
        deleteAssignment,
        recordAssignmentMark,
        rePushExamToStudent,

        studentReviews,
        addStudentReview,
        updateStudentReview,
        deleteStudentReview,
      }}
    >
      {children}
    </LmsDataContext.Provider>
  );
};

export const useLmsData = (): LmsDataContextType => {
  const context = useContext(LmsDataContext);
  if (!context) {
    throw new Error('useLmsData must be used within an LmsDataProvider');
  }
  return context;
};
