export const ar = {
  appName: "طبيبي",
  tagline: "نظام إدارة العيادة الذكي",

  nav: {
    dashboard: "الرئيسية",
    appointments: "المواعيد",
    patients: "المرضى",
    logout: "تسجيل الخروج",
    quickAdd: "موعد جديد",
  },

  auth: {
    login: "تسجيل الدخول",
    signup: "إنشاء حساب جديد",
    welcome: "أهلاً بعودتك",
    welcomeSubtitle: "سجّل دخولك للوصول إلى لوحة تحكّم عيادتك",
    createAccount: "ابدأ مع طبيبي",
    createAccountSubtitle: "أنشئ حسابك في أقل من دقيقة وابدأ بإدارة عيادتك",
    name: "اسمك الكامل",
    namePlaceholder: "د. أحمد محمد",
    clinicName: "اسم العيادة",
    clinicNamePlaceholder: "عيادة الشفاء",
    email: "البريد الإلكتروني",
    emailPlaceholder: "you@clinic.com",
    password: "كلمة المرور",
    passwordPlaceholder: "٦ أحرف على الأقل",
    signIn: "دخول",
    signingIn: "جاري الدخول...",
    register: "إنشاء الحساب",
    registering: "جاري الإنشاء...",
    noAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",
    invalidCreds: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    emailInUse: "هذا البريد مستخدم بالفعل",
    welcomeBack: "أهلاً بك مجدداً",
    accountCreated: "تم إنشاء الحساب بنجاح، أهلاً بك!",
    demoNote: "حساب تجريبي: doctor@clinic.com / demo1234",
  },

  dashboard: {
    greetingMorning: "صباح الخير",
    greetingAfternoon: "مساء الخير",
    greetingEvening: "مساء الخير",
    todaySummary: "هذه نظرة سريعة على يومك",
    todayAppointments: "مواعيد اليوم",
    patientsSeen: "مرضى تمت مراجعتهم",
    confirmed: "مؤكدة",
    pending: "بانتظار التأكيد",
    upcomingTitle: "المواعيد القادمة",
    recentTitle: "أحدث المرضى",
    viewAll: "عرض الكل",
    noUpcoming: "لا توجد مواعيد قادمة",
    noRecent: "لا يوجد مرضى بعد",
    newPatient: "مريض جديد",
    yearsOld: "سنة",
    lastVisit: "آخر زيارة",
    noContact: "لا تتوفر بيانات اتصال",
  },

  appointments: {
    title: "المواعيد",
    subtitle: "نظّم جدولك وزياراتك اليومية",
    new: "موعد جديد",
    calendar: "التقويم",
    forDate: "مواعيد يوم",
    allAppointments: "جميع المواعيد",
    loading: "جاري تحميل الجدول...",
    empty: "لا توجد مواعيد في هذا اليوم",
    statusConfirmed: "مؤكد",
    statusPending: "بالانتظار",
    statusCancelled: "ملغي",
    create: "إنشاء موعد",
    creating: "جاري الإنشاء...",
    update: "حفظ التغييرات",
    updating: "جاري الحفظ...",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    deleteConfirm: "هل أنت متأكد من حذف هذا الموعد؟",
    deleted: "تم حذف الموعد",
    updated: "تم تحديث الموعد",
    created: "تم إنشاء الموعد",
    deleteFailed: "تعذّر الحذف",
    updateFailed: "تعذّر التحديث",
    createFailed: "تعذّر إنشاء الموعد",
    pickPatient: "الرجاء اختيار مريض",
    patient: "المريض",
    selectPatient: "اختر مريضاً",
    date: "التاريخ",
    time: "الوقت",
    reason: "سبب الزيارة",
    reasonPlaceholder: "مثال: فحص دوري، أعراض إنفلونزا",
    status: "الحالة",
    notes: "ملاحظات (اختيارية)",
    notesPlaceholder: "أضف أي ملاحظات داخلية...",
    backToList: "الرجوع للمواعيد",
    details: "تفاصيل الموعد",
    detailsSub: "إدارة بيانات الزيارة",
    notFound: "الموعد غير موجود",
    loadingDetails: "جاري تحميل التفاصيل...",
    patientCard: "المريض",
    patientId: "رقم المريض",
    viewProfile: "عرض ملف المريض",
    noNotes: "لا توجد ملاحظات إضافية",
  },

  patients: {
    title: "المرضى",
    subtitle: "إدارة سجلات المرضى والتاريخ المرضي",
    new: "مريض جديد",
    search: "ابحث عن مريض بالاسم، البريد، أو الهاتف...",
    loading: "جاري تحميل المرضى...",
    emptyTitle: "لا يوجد مرضى",
    emptySearch: "حاول تعديل كلمات البحث",
    emptyHint: "أضف أول مريض للبدء",
    addPatient: "إضافة مريض",
    yearsOld: "سنة",
    noEmail: "لا يوجد بريد",
    noPhone: "لا يوجد هاتف",
    noAddress: "لم يتم تحديد العنوان",
    lastVisit: "آخر زيارة",
    never: "لم تتم بعد",
    fullName: "الاسم الكامل",
    namePlaceholder: "محمد أحمد",
    age: "العمر",
    email: "البريد الإلكتروني",
    emailPlaceholder: "name@example.com",
    phone: "رقم الهاتف",
    phonePlaceholder: "05xxxxxxxx",
    address: "العنوان",
    addressPlaceholder: "الرياض، المملكة العربية السعودية",
    bloodType: "فصيلة الدم",
    selectBlood: "اختر فصيلة الدم",
    medicalNotes: "ملاحظات طبية",
    notesPlaceholder: "حساسيات، أمراض مزمنة، أدوية...",
    create: "إنشاء سجل المريض",
    creating: "جاري الإنشاء...",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    edit: "تعديل الملف",
    delete: "حذف",
    deleteConfirm: "هل أنت متأكد من حذف هذا المريض؟ سيتم حذف جميع مواعيده أيضاً.",
    created: "تم إنشاء المريض بنجاح",
    updated: "تم تحديث الملف",
    deleted: "تم حذف المريض",
    bloodLabel: "فصيلة الدم:",
    unknown: "غير معروفة",
    notFound: "المريض غير موجود",
    loadingProfile: "جاري تحميل الملف...",
    profileTitle: "ملف المريض",
    appointmentHistory: "سجل المواعيد",
    noAppointments: "لا توجد مواعيد مسجلة بعد",
    backToList: "الرجوع للقائمة",
  },

  notFound: {
    title: "الصفحة غير موجودة",
    subtitle: "ربما الرابط غير صحيح أو تم نقل الصفحة",
    home: "العودة للرئيسية",
  },

  loading: "جاري التحميل...",
};

export type Dict = typeof ar;
export const t = ar;

const months = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
];
const weekdays = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

export function formatDateAr(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "";
  return `${weekdays[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShortAr(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthShortAr(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return months[d.getMonth()].slice(0, 3);
}
