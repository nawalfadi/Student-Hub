import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

export type Lang = "en" | "ar"

const LANG_KEY = "yu-lang"

type Dict = Record<string, string>

const en: Dict = {
  // Shared chrome
  "lang.switch": "العربية",
  "lang.switchTitle": "Switch to Arabic",
  "theme.light": "Light mode",
  "theme.dark": "Dark mode",

  // Pitch — hero
  "pitch.wordmark": "Student Hub",
  "pitch.heroLine1": "Clubs run on chaos.",
  "pitch.heroLine2": "We built the fix.",
  "pitch.heroSub":
    "One platform replaces scattered WhatsApp groups, paper sign-in sheets, and spreadsheet leaderboards — with a transparent system every role can trust.",
  "pitch.scroll": "Scroll to explore",
  "pitch.credits": "Nawal Fadi · Ahmed Ghanoum · Raghad Alsultan · Nawal Khattab · Ahmed Abudiab",

  // Pitch — problem
  "pitch.problem.eyebrow": "The Problem",
  "pitch.problem.title1": "Campus life shouldn't",
  "pitch.problem.title2": "run on group chats.",
  "pitch.problem.sub": "Three gaps keep clubs opaque and unfair. Student Hub closes all three.",
  "pitch.problem.1.label": "No visibility",
  "pitch.problem.1.body":
    "Events live in WhatsApp threads. Students miss what's happening; clubs can't reach their members.",
  "pitch.problem.2.label": "No proof",
  "pitch.problem.2.body":
    "Paper sign-ins get lost. Attendance gets padded. Nobody can verify who actually showed up.",
  "pitch.problem.3.label": "No accountability",
  "pitch.problem.3.body":
    "Approvals are informal and inconsistent — slow between presidents, advisors, and Student Affairs.",

  // Pitch — roles
  "pitch.solution.eyebrow": "The Solution",
  "pitch.solution.title": "Meet the roles.",
  "pitch.solution.sub": "Four stakeholders. One shared system — each sees exactly what they need.",
  "pitch.role.student.identity": "Discovers & joins",
  "pitch.role.student.summary": "Student",
  "pitch.role.student.detail":
    "Home feed of events, personal QR pass, and a rewards trail that proves real participation.",
  "pitch.role.president.identity": "Runs the club",
  "pitch.role.president.summary": "Club President",
  "pitch.role.president.detail":
    "Command center to create events, manage members, and scan check-ins — evidence attached every time.",
  "pitch.role.advisor.identity": "Protects integrity",
  "pitch.role.advisor.summary": "Faculty Advisor",
  "pitch.role.advisor.detail":
    "Approve or send back event submissions. Spot fraud early with evidence and analytics side by side.",
  "pitch.role.committee.identity": "Sets the rules",
  "pitch.role.committee.summary": "Student Affairs",
  "pitch.role.committee.detail":
    "Master calendar, final evaluations, certifications, and the leaderboard everyone can trust.",

  // Pitch — features
  "pitch.features.eyebrow": "What we built",
  "pitch.features.title": "The tools that make it real.",
  "pitch.feature.1.name": "QR Check-In & Passes",
  "pitch.feature.1.blurb": "Scan once. Attendance sticks — no paper sheets.",
  "pitch.feature.2.name": "Event Approval Workflow",
  "pitch.feature.2.blurb": "President → Advisor → Student Affairs. Same chain every time.",
  "pitch.feature.3.name": "Live Notifications",
  "pitch.feature.3.blurb": "Approvals, reminders, and alerts land where people already work.",
  "pitch.feature.4.name": "Rewards & Leaderboard",
  "pitch.feature.4.blurb": "Points only after proof. Club of the Year, earned in public.",
  "pitch.feature.5.name": "Analytics Dashboard",
  "pitch.feature.5.blurb": "Turnout, pending reviews, and impact — visible by role.",

  // Pitch — flow
  "pitch.flow.eyebrow": "How it works",
  "pitch.flow.title": "The approval journey.",
  "pitch.flow.sub": "From submission to scored attendance — the same chain of custody, every time.",
  "pitch.flow.1.label": "Event submitted",
  "pitch.flow.1.desc": "President creates the event",
  "pitch.flow.2.label": "Advisor review",
  "pitch.flow.2.desc": "Faculty verifies the plan",
  "pitch.flow.3.label": "Student Affairs",
  "pitch.flow.3.desc": "Final green light when stakes are high",
  "pitch.flow.4.label": "Published",
  "pitch.flow.4.desc": "Live on feeds and the calendar",
  "pitch.flow.5.label": "Attendance scanned",
  "pitch.flow.5.desc": "QR check-in at the door",
  "pitch.flow.6.label": "Points logged",
  "pitch.flow.6.desc": "Evidence filed. Scoreboard updates.",
  "pitch.flow.note1": "Advisors can send events back for fixes",
  "pitch.flow.note2": "Student Affairs can override or reject",

  // Pitch — trust
  "pitch.trust.eyebrow": "Why it's trustworthy",
  "pitch.trust.title": "Built so no one can game it.",
  "pitch.trust.1.title": "Proof required",
  "pitch.trust.1.body":
    "Photos, sign-in scanning, certificates — every claim needs documentation before it counts.",
  "pitch.trust.2.title": "Caps per category",
  "pitch.trust.2.body": "Category caps stop clubs from gaming one activity type into Club of the Year.",
  "pitch.trust.3.title": "Approval scales with stakes",
  "pitch.trust.3.body":
    "Routine events clear with an Advisor. Major events get a second look from Student Affairs.",

  // Pitch — audit
  "pitch.audit.eyebrow": "Live audit trail",
  "pitch.audit.title": "Nothing happens quietly.",
  "pitch.audit.sub": "Every submission, approval, and score change is logged — who did what, and when.",
  "pitch.audit.badge": "Full audit trail",
  "pitch.audit.1.role": "President",
  "pitch.audit.1.action": "submitted AI & Machine Learning Workshop",
  "pitch.audit.1.time": "2m ago",
  "pitch.audit.2.role": "Advisor",
  "pitch.audit.2.action": "approved Sustainability Design Hackathon",
  "pitch.audit.2.time": "1h ago",
  "pitch.audit.3.role": "Student Affairs",
  "pitch.audit.3.action": "confirmed points for Tech Talk: Web3",
  "pitch.audit.3.time": "3h ago",
  "pitch.audit.4.role": "Audit",
  "pitch.audit.4.action": "flagged a duplicate check-in for review",
  "pitch.audit.4.time": "Yesterday",

  // Pitch — CTA
  "pitch.cta.title": "This isn't a mockup. It's live.",
  "pitch.cta.sub": "Transparent scoring. Real evidence. A campus system you can demo right now.",
  "pitch.cta.button": "Open Student Hub",

  // App — roles
  "role.student": "Student",
  "role.president": "Club President",
  "role.advisor": "Club Advisor",
  "role.committee": "Student Affairs",

  // App — nav / views
  "nav.feed": "Home Feed",
  "nav.events": "Events Hub",
  "nav.qr-pass": "My QR Pass",
  "nav.clubs": "My Clubs",
  "nav.rewards": "Rewards",
  "nav.framework": "Club Framework",
  "nav.notifications": "Notifications",
  "nav.command": "Command Center",
  "nav.create-event": "Create Event",
  "nav.scanner": "QR Scanner",
  "nav.members": "Members",
  "nav.approvals": "Approvals",
  "nav.analytics": "Analytics",
  "nav.event-approvals": "Event Approvals",
  "nav.calendar": "Master Calendar",
  "nav.evaluation": "Event Evaluation",
  "nav.certifications": "Certifications",

  "view.feed": "Home Feed",
  "view.events": "Events Discovery Hub",
  "view.qr-pass": "My QR Pass",
  "view.clubs": "My Clubs",
  "view.rewards": "YU Rewards",
  "view.notifications": "Notifications",
  "view.command": "Command Center",
  "view.create-event": "Create Event",
  "view.scanner": "QR Scanner",
  "view.members": "Members",
  "view.approvals": "Approvals",
  "view.analytics": "Analytics",
  "view.calendar": "Master Calendar",
  "view.event-approvals": "Event Confirmations",
  "view.evaluation": "Event Evaluation",
  "view.certifications": "Certifications",
  "view.framework": "Club Framework",

  // App — login
  "login.brand": "Student Hub",
  "login.headline1": "Your campus,",
  "login.headline2": "elevated.",
  "login.sub": "One hub for events, clubs, attendance, and every moment of your journey at YU.",
  "login.stat.events": "1,400+ events",
  "login.stat.clubs": "42 active clubs",
  "login.stat.vision": "Vision 2030 aligned",
  "login.title": "Sign in",
  "login.hint": "Use your YU university credentials",
  "login.email": "University email",
  "login.password": "Password",
  "login.role": "Role",
  "login.continue": "Continue",
  "login.footer": "Authorized users only · Al Yamamah University",
  "login.signOut": "Sign out",
}

const ar: Dict = {
  "lang.switch": "English",
  "lang.switchTitle": "التبديل إلى الإنجليزية",
  "theme.light": "الوضع الفاتح",
  "theme.dark": "الوضع الداكن",

  "pitch.wordmark": "مركز الطلاب",
  "pitch.heroLine1": "الأندية تعمل في فوضى.",
  "pitch.heroLine2": "بنينا الحل.",
  "pitch.heroSub":
    "منصة واحدة تحل محل مجموعات واتساب المتفرقة، وأوراق الحضور، وجداول المتصدرين — بنظام شفاف يثق به الجميع.",
  "pitch.scroll": "مرّر للاستكشاف",
  "pitch.credits": "نوال فادي · أحمد غنوم · رغد السلطان · نوال خطاب · أحمد أبو دياب",

  "pitch.problem.eyebrow": "المشكلة",
  "pitch.problem.title1": "حياة الحرم الجامعي",
  "pitch.problem.title2": "لا يجب أن تعتمد على المحادثات الجماعية.",
  "pitch.problem.sub": "ثلاث فجوات تبقي الأندية مبهمة وغير عادلة. مركز الطلاب يغلقها جميعًا.",
  "pitch.problem.1.label": "لا رؤية",
  "pitch.problem.1.body":
    "الفعاليات تُعلن في واتساب. الطلاب يفوتون ما يحدث؛ والأندية لا تصل لأعضائها.",
  "pitch.problem.2.label": "لا إثبات",
  "pitch.problem.2.body":
    "أوراق الحضور تضيع. الحضور يُزوَّر. لا أحد يتحقق ممن حضر فعلًا.",
  "pitch.problem.3.label": "لا مساءلة",
  "pitch.problem.3.body":
    "الموافقات غير رسمية ومتفاوتة — بطيئة بين الرؤساء والمستشارين وشؤون الطلاب.",

  "pitch.solution.eyebrow": "الحل",
  "pitch.solution.title": "تعرّف على الأدوار.",
  "pitch.solution.sub": "أربعة أصحاب مصلحة. نظام واحد مشترك — كل دور يرى ما يحتاجه.",
  "pitch.role.student.identity": "يكتشف وينضم",
  "pitch.role.student.summary": "الطالب",
  "pitch.role.student.detail":
    "تغذية رئيسية للفعاليات، بطاقة QR شخصية، ومسار مكافآت يثبت المشاركة الحقيقية.",
  "pitch.role.president.identity": "يدير النادي",
  "pitch.role.president.summary": "رئيس النادي",
  "pitch.role.president.detail":
    "مركز قيادة لإنشاء الفعاليات وإدارة الأعضاء ومسح الحضور — مع إرفاق الأدلة دائمًا.",
  "pitch.role.advisor.identity": "يحمي النزاهة",
  "pitch.role.advisor.summary": "المستشار الأكاديمي",
  "pitch.role.advisor.detail":
    "اعتماد أو إعادة طلبات الفعاليات. اكتشاف الاحتيال مبكرًا عبر الأدلة والتحليلات معًا.",
  "pitch.role.committee.identity": "يضع القواعد",
  "pitch.role.committee.summary": "شؤون الطلاب",
  "pitch.role.committee.detail":
    "التقويم الرئيسي، التقييم النهائي، الشهادات، ولوحة المتصدرين التي يثق بها الجميع.",

  "pitch.features.eyebrow": "ما بنيناه",
  "pitch.features.title": "الأدوات التي تجعلها حقيقة.",
  "pitch.feature.1.name": "تسجيل الحضور بـ QR",
  "pitch.feature.1.blurb": "امسح مرة واحدة. الحضور يُسجَّل — بلا أوراق.",
  "pitch.feature.2.name": "سير اعتماد الفعاليات",
  "pitch.feature.2.blurb": "الرئيس ← المستشار ← شؤون الطلاب. نفس السلسلة دائمًا.",
  "pitch.feature.3.name": "إشعارات مباشرة",
  "pitch.feature.3.blurb": "الاعتمادات والتذكيرات والتنبيهات تصل حيث يعمل الجميع.",
  "pitch.feature.4.name": "المكافآت والمتصدرون",
  "pitch.feature.4.blurb": "نقاط بعد الإثبات فقط. نادي العام — مكتسب علنًا.",
  "pitch.feature.5.name": "لوحة التحليلات",
  "pitch.feature.5.blurb": "الحضور والمراجعات والأثر — مرئية حسب الدور.",

  "pitch.flow.eyebrow": "كيف يعمل",
  "pitch.flow.title": "رحلة الاعتماد.",
  "pitch.flow.sub": "من التقديم إلى تسجيل الحضور — نفس سلسلة الحفظ في كل مرة.",
  "pitch.flow.1.label": "تقديم الفعالية",
  "pitch.flow.1.desc": "الرئيس ينشئ الفعالية",
  "pitch.flow.2.label": "مراجعة المستشار",
  "pitch.flow.2.desc": "الكلية تتحقق من الخطة",
  "pitch.flow.3.label": "شؤون الطلاب",
  "pitch.flow.3.desc": "الموافقة النهائية عند ارتفاع المخاطر",
  "pitch.flow.4.label": "النشر",
  "pitch.flow.4.desc": "مباشر على التغذية والتقويم",
  "pitch.flow.5.label": "مسح الحضور",
  "pitch.flow.5.desc": "تسجيل QR عند الباب",
  "pitch.flow.6.label": "تسجيل النقاط",
  "pitch.flow.6.desc": "الأدلة محفوظة. لوحة النتائج تتحدث.",
  "pitch.flow.note1": "المستشار يمكنه إعادة الفعالية للتعديل",
  "pitch.flow.note2": "شؤون الطلاب يمكنها التجاوز أو الرفض",

  "pitch.trust.eyebrow": "لماذا يمكن الوثوق به",
  "pitch.trust.title": "مبني بحيث لا يمكن التلاعب به.",
  "pitch.trust.1.title": "الإثبات مطلوب",
  "pitch.trust.1.body":
    "صور، مسح الحضور، شهادات — كل ادعاء يحتاج توثيقًا قبل أن يُحتسب.",
  "pitch.trust.2.title": "حدود لكل فئة",
  "pitch.trust.2.body": "الحدود تمنع الأندية من التلاعب بنشاط واحد للفوز بنادي العام.",
  "pitch.trust.3.title": "الاعتماد يتناسب مع الأهمية",
  "pitch.trust.3.body":
    "الفعاليات الروتينية تمر عبر المستشار. الفعاليات الكبرى تحصل على نظرة ثانية من شؤون الطلاب.",

  "pitch.audit.eyebrow": "سجل تدقيق مباشر",
  "pitch.audit.title": "لا شيء يحدث في الخفاء.",
  "pitch.audit.sub": "كل تقديم واعتماد وتغيير نقاط يُسجَّل — من فعل ماذا ومتى.",
  "pitch.audit.badge": "سجل تدقيق كامل",
  "pitch.audit.1.role": "رئيس",
  "pitch.audit.1.action": "قدّم ورشة الذكاء الاصطناعي وتعلم الآلة",
  "pitch.audit.1.time": "منذ دقيقتين",
  "pitch.audit.2.role": "مستشار",
  "pitch.audit.2.action": "اعتمد هاكاثون التصميم المستدام",
  "pitch.audit.2.time": "منذ ساعة",
  "pitch.audit.3.role": "شؤون الطلاب",
  "pitch.audit.3.action": "أكّد نقاط جلسة تقنية: ويب٣",
  "pitch.audit.3.time": "منذ ٣ ساعات",
  "pitch.audit.4.role": "تدقيق",
  "pitch.audit.4.action": "أشار إلى تسجيل حضور مكرر للمراجعة",
  "pitch.audit.4.time": "أمس",

  "pitch.cta.title": "هذا ليس نموذجًا. إنه مباشر.",
  "pitch.cta.sub": "تسجيل شفاف. أدلة حقيقية. نظام جامعي يمكنك عرضه الآن.",
  "pitch.cta.button": "افتح مركز الطلاب",

  "role.student": "الطالب",
  "role.president": "رئيس النادي",
  "role.advisor": "مستشار النادي",
  "role.committee": "شؤون الطلاب",

  "nav.feed": "التغذية الرئيسية",
  "nav.events": "مركز الفعاليات",
  "nav.qr-pass": "بطاقة QR",
  "nav.clubs": "أنديتي",
  "nav.rewards": "المكافآت",
  "nav.framework": "إطار الأندية",
  "nav.notifications": "الإشعارات",
  "nav.command": "مركز القيادة",
  "nav.create-event": "إنشاء فعالية",
  "nav.scanner": "ماسح QR",
  "nav.members": "الأعضاء",
  "nav.approvals": "الاعتمادات",
  "nav.analytics": "التحليلات",
  "nav.event-approvals": "اعتماد الفعاليات",
  "nav.calendar": "التقويم الرئيسي",
  "nav.evaluation": "تقييم الفعاليات",
  "nav.certifications": "الشهادات",

  "view.feed": "التغذية الرئيسية",
  "view.events": "اكتشاف الفعاليات",
  "view.qr-pass": "بطاقة QR",
  "view.clubs": "أنديتي",
  "view.rewards": "مكافآت الجامعة",
  "view.notifications": "الإشعارات",
  "view.command": "مركز القيادة",
  "view.create-event": "إنشاء فعالية",
  "view.scanner": "ماسح QR",
  "view.members": "الأعضاء",
  "view.approvals": "الاعتمادات",
  "view.analytics": "التحليلات",
  "view.calendar": "التقويم الرئيسي",
  "view.event-approvals": "تأكيدات الفعاليات",
  "view.evaluation": "تقييم الفعاليات",
  "view.certifications": "الشهادات",
  "view.framework": "إطار الأندية",

  "login.brand": "مركز الطلاب",
  "login.headline1": "حرمك الجامعي،",
  "login.headline2": "بمستوى أعلى.",
  "login.sub": "مركز واحد للفعاليات والأندية والحضور وكل لحظة من رحلتك في الجامعة.",
  "login.stat.events": "+١٬٤٠٠ فعالية",
  "login.stat.clubs": "٤٢ ناديًا نشطًا",
  "login.stat.vision": "متوافق مع رؤية ٢٠٣٠",
  "login.title": "تسجيل الدخول",
  "login.hint": "استخدم بيانات جامعة اليمامة",
  "login.email": "البريد الجامعي",
  "login.password": "كلمة المرور",
  "login.role": "الدور",
  "login.continue": "متابعة",
  "login.footer": "للمستخدمين المصرّح لهم فقط · جامعة اليمامة",
  "login.signOut": "تسجيل الخروج",
}

const dictionaries: Record<Lang, Dict> = { en, ar }

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === "en" || stored === "ar") return stored
  } catch {
    /* ignore */
  }
  return "en"
}

function applyLang(lang: Lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* ignore */
  }
}

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (key: string) => string
  isAr: boolean
}

const LangContext = createContext<LangContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.lang === "ar" ? "ar" : readStoredLang()
    }
    return "en"
  })

  useEffect(() => {
    applyLang(lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggleLang = useCallback(() => setLangState((l) => (l === "en" ? "ar" : "en")), [])
  const t = useCallback(
    (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key,
    [lang],
  )

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, isAr: lang === "ar" }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used within LanguageProvider")
  return ctx
}

export function LangToggle({
  className = "",
  style,
  variant = "default",
}: {
  className?: string
  style?: CSSProperties
  /** "hero" = high-contrast glass control for dark pitch/login surfaces */
  variant?: "default" | "hero"
}) {
  const { lang, setLang, t } = useLang()
  const isHero = variant === "hero"

  return (
    <div
      role="group"
      aria-label={t("lang.switchTitle")}
      className={`h-9 inline-flex items-center rounded-xl border p-0.5 ${className}`}
      style={{
        borderColor: isHero ? "rgba(255,255,255,0.18)" : "var(--border)",
        background: isHero ? "rgba(255,255,255,0.1)" : "var(--card)",
        boxShadow: isHero ? "none" : "var(--shadow-md)",
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className="h-8 min-w-[2.5rem] px-2.5 rounded-[10px] text-[11px] font-bold tracking-wide transition-all duration-200"
        style={{
          background: lang === "en" ? (isHero ? "rgba(255,255,255,0.22)" : "var(--surface-sunken)") : "transparent",
          color: lang === "en"
            ? (isHero ? "#fff" : "var(--text-primary)")
            : (isHero ? "rgba(255,255,255,0.55)" : "var(--text-muted)"),
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        className="h-8 min-w-[2.5rem] px-2.5 rounded-[10px] text-[11px] font-bold tracking-wide transition-all duration-200"
        style={{
          background: lang === "ar" ? (isHero ? "rgba(255,255,255,0.22)" : "var(--surface-sunken)") : "transparent",
          color: lang === "ar"
            ? (isHero ? "#fff" : "var(--text-primary)")
            : (isHero ? "rgba(255,255,255,0.55)" : "var(--text-muted)"),
          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        }}
      >
        عربي
      </button>
    </div>
  )
}

/** Apply language ASAP before React paints (call from index.html or main). */
export function bootLang() {
  applyLang(readStoredLang())
}
