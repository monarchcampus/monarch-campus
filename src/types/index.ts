export type UserRole = 'student' | 'instructor' | 'lecturer' | 'manager' | 'superadmin';

export type UserStatus = 'active' | 'pending' | 'suspended';

export type StudyMedium = 'si' | 'en';

export type PaymentPlan = 'full' | 'installments' | 'monthly';

export interface User {
  id: string;
  fullName: string;
  phone: string; // Used as primary login identifier/username
  parentPhone?: string;
  password?: string;
  role: UserRole;
  grade?: string;
  avatar?: string;
  enrolledCourseIds: string[];
  status: UserStatus;
  medium?: StudyMedium;
  selectedCourseId?: string;
  paymentPlan?: PaymentPlan;
  slipTransactionId?: string;
  slipImageUrl?: string;
  registeredAt?: string;
  paidAmount?: number;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  lastPaymentDate?: string;
  courseAccessList?: StudentCourseAccess[];
}

export interface Lesson {
  id: string;
  courseId?: string;
  titleEn: string;
  titleSi: string;
  duration: string;
  videoUrl: string;
  isCompleted?: boolean;
  tutePdfUrl?: string;
  summarySi: string;
  summaryEn: string;
  month?: string;
  lessonNumber?: number;
  thumbnailUrl?: string;
  videoPlatform?: 'youtube_unlisted' | 'direct';
}

export interface AssignmentSubmission {
  studentId: string;
  studentName: string; // ONLY student name - privacy rule: no contact info
  submittedAt?: string;
  marksPercent?: number; // e.g. 85
  grade?: string; // e.g. 'A', 'B', 'C', 'S', 'F'
  gradedAt?: string;
  feedback?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  month?: string;
  pdfUrl: string;
  dueDate?: string;
  createdAt: string;
  lecturerName?: string;
  lecturerPhone?: string;
  submissions: AssignmentSubmission[];
}

export interface Course {
  id: string;
  titleEn: string;
  titleSi: string;
  grade: string;
  subjectEn: string;
  subjectSi: string;
  instructorNameEn: string;
  instructorNameSi: string;
  instructorAvatar: string;
  instructorPhone?: string;
  thumbnailGradient: string;
  thumbnailUrl?: string;
  accentColor: string;
  duration?: string; // e.g. "6 Months", "1 Year", "3 Months"
  priceLKR: number; // Full payment price
  installmentPriceLKR?: number; // 2 installments price per installment
  monthlyFeeLKR: number; // Monthly price
  rating: number;
  totalStudents: number;
  progressPercent?: number;
  nextLiveClass?: string;
  descriptionSi: string;
  descriptionEn: string;
  lessons: Lesson[];
  featuresEn: string[];
  featuresSi: string[];
  availableMediums?: StudyMedium[];
  category?: 'al2028' | 'al2027' | 'ol' | 'pro_ict' | 'diploma' | string;
}

export interface CoursePaymentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  courseId: string;
  courseTitleSi: string;
  courseTitleEn: string;
  courseDuration?: string;
  plan: 'full' | 'monthly' | 'installments';
  amount: number;
  promoCode?: string;
  discountAmount?: number;
  bankId?: string;
  bankName?: string;
  slipReference: string;
  slipImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  accessExpiresAt?: string;
}

export interface StudentCourseAccess {
  courseId: string;
  courseTitleSi: string;
  courseTitleEn: string;
  enrolledAt: string;
  plan: 'full' | 'monthly' | 'installments';
  duration?: string;
  expiresAt: string; // ISO date YYYY-MM-DD
  status: 'active' | 'expired';
  slipReference?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountName: string;
  instructionsSi: string;
  instructionsEn: string;
  isActive: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  descriptionSi: string;
  descriptionEn: string;
  expiryDate: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  slug: string;
  descriptionSi: string;
  descriptionEn: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
  whatsappUrl: string;
  createdAt: string;
}

export interface ZoomClass {
  id: string;
  courseId: string;
  courseTitle: string;
  topic: string;
  date: string;
  time: string;
  meetingId: string;
  passcode: string;
  joinUrl: string;
  hostUrl: string;
  instructorPhone: string;
  instructorName: string;
  status: 'scheduled' | 'live' | 'ended';
  whatsAppGroupLink?: string;
  category?: 'Theory' | 'Revision' | 'Paper Class' | 'Special Class';
  lessonNumber?: number;
  description?: string;
}

export interface OnlineExam {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  questionsCount: number;
  pdfUrl?: string;
  paperType: 'online_exam' | 'paper_download' | 'notes_pdf';
  scheduledTime?: string;
  status?: 'active' | 'scheduled' | 'closed';
  pushedByInstructor?: string;
  optionsPerQuestion?: number;
  results: {
    studentId: string;
    studentName: string;
    studentPhone?: string;
    score: number;
    maxScore: number;
    grade: string;
    answers?: Record<number, number>;
    submittedAt: string;
    autoSubmitted?: boolean;
  }[];
}

export interface SlideBanner {
  id: string;
  titleEn: string;
  titleSi: string;
  subtitleEn: string;
  subtitleSi: string;
  badgeEn?: string;
  badgeSi?: string;
  imageUrl?: string;
  ctaTextEn: string;
  ctaTextSi: string;
  ctaLink: string;
  bgGradient: string;
}

export interface NavMenuItem {
  id: string;
  labelEn: string;
  labelSi: string;
  path: string;
  isExternal?: boolean;
}

export interface SiteConfig {
  heroTitleEn: string;
  heroTitleSi: string;
  heroSubtitleEn: string;
  heroSubtitleSi: string;
  heroSloganEn: string;
  heroSloganSi: string;
  customLogoUrl: string | null;
  customEmblemUrl: string | null;
  customBannerUrl: string | null;
  slideBanners: SlideBanner[];
  navMenuItems: NavMenuItem[];
}

export interface Announcement {
  id: string;
  titleEn: string;
  titleSi: string;
  contentEn: string;
  contentSi: string;
  date: string;
  isUrgent?: boolean;
  categoryEn: string;
  categorySi: string;
}

export interface MCQQuestion {
  id: string;
  subjectEn: string;
  subjectSi: string;
  questionEn: string;
  questionSi: string;
  optionsEn: string[];
  optionsSi: string[];
  correctOptionIndex: number;
  explanationEn: string;
  explanationSi: string;
}

export interface Seminar {
  id: string;
  titleEn: string;
  titleSi: string;
  speakerEn: string;
  speakerSi: string;
  date: string;
  time: string;
  isFree: boolean;
  platform: string;
  tagEn: string;
  tagSi: string;
  registeredCount: number;
}

export interface StudentReview {
  id: string;
  studentName: string;
  rating: number; // 1 to 5 stars
  descriptionSi: string;
  descriptionEn?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 10:30 AM
  tag?: string; // e.g. 2028 A/L Combined Maths, Grade 6 Maths, ICT Pro
  avatar?: string;
  isFeatured?: boolean;
}
