import { useState, useEffect, type Dispatch, type SetStateAction, type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import yuLogoWhite from "./assets/yu-logo-white.png"
import {
  GraduationCap, Crown, ShieldCheck, Landmark,
  LayoutGrid, CalendarDays, QrCode, Users, Sparkles, Bell,
  LayoutDashboard, SquarePen, ScanLine,
  ClipboardCheck, BarChart3,
  CalendarRange, Star, BadgeCheck,
  LogOut, ArrowRight, MapPin, Clock,
  CheckCircle2, Check, X,
  Award, TrendingUp, Rocket,
  UserPlus, UserCheck,
  ImagePlus, Camera, Ticket,
  ChevronLeft, ChevronRight,
  AlertTriangle, Wallet, Medal,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = "student" | "president" | "advisor" | "committee"

type StudentView =
  | "feed"
  | "events"
  | "qr-pass"
  | "clubs"
  | "notifications"
  | "rewards"

type PresidentView =
  | "command"
  | "create-event"
  | "scanner"
  | "members"
  | "notifications"

type AdvisorView = "approvals" | "analytics" | "notifications"

type CommitteeView =
  | "calendar"
  | "evaluation"
  | "certifications"
  | "analytics"
  | "notifications"

type View = StudentView | PresidentView | AdvisorView | CommitteeView

// ─── Date / time helpers ──────────────────────────────────────────────────────
function formatEventDate(date: Date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function timeToMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()
  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0
  return hours * 60 + minutes
}

function parseEventStart(dateStr: string, timeStr: string) {
  const parsed = new Date(`${dateStr} ${timeStr}`)
  if (!Number.isNaN(parsed.getTime())) return parsed

  // Fallback if locale parsing fails
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }
  const parts = dateStr.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/)
  if (!parts) return new Date()
  const month = months[parts[1]]
  const day = Number(parts[2])
  const year = Number(parts[3])
  const mins = timeToMinutes(timeStr)
  return new Date(year, month ?? 0, day, Math.floor(mins / 60), mins % 60)
}

const TODAY_LABEL = formatEventDate()

// ─── Shared color system (mirrors CSS custom properties in index.css) ───────
const CATEGORY_COLORS: Record<string, string> = {
  Tech: "#3D7DD8",
  Academic: "#8A63D6",
  Cultural: "#D9A404",
  Sports: "#E14B4B",
}

const ROLE_ICONS: Record<Role, LucideIcon> = {
  student: GraduationCap,
  president: Crown,
  advisor: ShieldCheck,
  committee: Landmark,
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: 1,
    title: "Google Developer Summit",
    club: "Google Developer Student Club",
    date: TODAY_LABEL,
    time: "1:00 PM",
    location: "Tuwaiq Auditorium",
    category: "Tech",
    capacity: 250,
    registered: 187,
    vision2030: "Innovation",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop&auto=format",
    color: CATEGORY_COLORS.Tech,
  },
  {
    id: 2,
    title: "Sustainability Design Hackathon",
    club: "Environmental Society",
    date: TODAY_LABEL,
    time: "9:00 AM",
    location: "Innovation Hub, B2",
    category: "Academic",
    capacity: 80,
    registered: 54,
    vision2030: "Sustainability",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=300&fit=crop&auto=format",
    color: CATEGORY_COLORS.Academic,
  },
  {
    id: 3,
    title: "YU Cultural Festival 2026",
    club: "Student Affairs",
    date: TODAY_LABEL,
    time: "5:30 PM",
    location: "Main Campus Grounds",
    category: "Cultural",
    capacity: 1200,
    registered: 876,
    vision2030: "Community Development",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=300&fit=crop&auto=format",
    color: CATEGORY_COLORS.Cultural,
  },
  {
    id: 4,
    title: "Entrepreneurship Bootcamp",
    club: "YU Entrepreneurship Club",
    date: "Aug 15, 2026",
    time: "11:00 AM",
    location: "Business School, Room 201",
    category: "Academic",
    capacity: 60,
    registered: 41,
    vision2030: "Innovation",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=300&fit=crop&auto=format",
    color: CATEGORY_COLORS.Academic,
  },
  {
    id: 5,
    title: "Inter-University Basketball Championship",
    club: "Sports Federation",
    date: "Aug 20, 2026",
    time: "5:00 PM",
    location: "Sports Arena",
    category: "Sports",
    capacity: 500,
    registered: 320,
    vision2030: "Community Development",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=300&fit=crop&auto=format",
    color: CATEGORY_COLORS.Sports,
  },
  {
    id: 6,
    title: "AI & Machine Learning Workshop",
    club: "Google Developer Student Club",
    date: "Aug 12, 2026",
    time: "2:00 PM",
    location: "Innovation Lab",
    category: "Tech",
    capacity: 100,
    registered: 72,
    vision2030: "Innovation",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop&auto=format",
    color: CATEGORY_COLORS.Tech,
  },
]

/** Default RSVPs so Home Feed can show today's schedule out of the box. */
const INITIAL_REGISTERED_EVENT_IDS = [1, 2, 3]

const CLUBS = [
  { id: 1, name: "Google Developer Student Club", members: 142, meetings: "Every Monday 4PM", category: "Tech", joined: true, joinedDate: "Sep 2025" },
  { id: 2, name: "YU Debate Society", members: 67, meetings: "Wednesday 5PM", category: "Academic", joined: true, joinedDate: "Sep 2025" },
  { id: 3, name: "Environmental Society", members: 89, meetings: "Thursday 3PM", category: "Cultural", joined: false },
  { id: 4, name: "YU Entrepreneurship Club", members: 211, meetings: "Tuesday 6PM", category: "Academic", joined: false },
  { id: 5, name: "Sports Federation", members: 430, meetings: "Daily", category: "Sports", joined: true, joinedDate: "Oct 2025" },
]

/** Student fields already shown elsewhere in the app (QR Pass program, club memberships). */
const STUDENT_MAJOR = "Business Administration"
const STUDENT_JOINED_CLUB_IDS = CLUBS.filter((c) => c.joined).map((c) => c.id)

const MEMBERS = [
  { id: 1, name: "Reem Al-Qahtani", id_num: "202210045", attendance: 8, status: "active", joined: "Sep 2025" },
  { id: 2, name: "Faisal Al-Harbi", id_num: "202210112", attendance: 5, status: "active", joined: "Sep 2025" },
  { id: 3, name: "Noura Bint Abdullah", id_num: "202210234", attendance: 9, status: "active", joined: "Oct 2025" },
  { id: 4, name: "Omar Al-Dosari", id_num: "202210089", attendance: 2, status: "inactive", joined: "Jan 2026" },
  { id: 5, name: "Sarah Al-Mutairi", id_num: "202210301", attendance: 7, status: "active", joined: "Sep 2025" },
  { id: 6, name: "Khalid Al-Rashidi", id_num: "202210167", attendance: 0, status: "pending", joined: "Jul 2026" },
]

const PENDING_APPROVALS = [
  {
    id: 1,
    title: "AI & Machine Learning Workshop",
    club: "Google Developer Student Club",
    date: "Aug 12, 2026",
    type: "Event",
    submittedBy: "Ahmed Al-Zahrani",
    vision2030: "Innovation",
    status: "pending",
  },
  {
    id: 2,
    title: "Environmental Clean-Up Drive Budget",
    club: "Environmental Society",
    date: "Aug 8, 2026",
    type: "Budget",
    submittedBy: "Lina Al-Ghamdi",
    vision2030: "Sustainability",
    status: "pending",
  },
  {
    id: 3,
    title: "Debate Championship Trip",
    club: "YU Debate Society",
    date: "Aug 25, 2026",
    type: "Event",
    submittedBy: "Turki Al-Anzi",
    vision2030: "Community Development",
    status: "pending",
  },
]

const COMPLETED_EVENTS = [
  {
    id: 1,
    title: "Startup Pitch Competition",
    club: "YU Entrepreneurship Club",
    date: "Jul 10, 2026",
    attendance: 187,
    capacity: 200,
    scores: { organization: 0, turnout: 0, impact: 0, creativity: 0 },
    evaluated: false,
  },
  {
    id: 2,
    title: "Ramadan Volunteer Program",
    club: "Environmental Society",
    date: "Jun 18, 2026",
    attendance: 94,
    capacity: 100,
    scores: { organization: 4.5, turnout: 5, impact: 4, creativity: 3.5 },
    evaluated: true,
  },
  {
    id: 3,
    title: "Tech Talk: Web3 & Saudi Vision",
    club: "Google Developer Student Club",
    date: "Jun 28, 2026",
    attendance: 210,
    capacity: 250,
    scores: { organization: 0, turnout: 0, impact: 0, creativity: 0 },
    evaluated: false,
  },
]

type EventItem = (typeof EVENTS)[number]
type RecommendedEvent = EventItem & { reason: string }

const EVENT_DURATION_MS = 4 * 60 * 60 * 1000

function getFeaturedEvent(events: EventItem[], now = Date.now()) {
  const timed = events
    .map((ev) => ({ ev, start: parseEventStart(ev.date, ev.time).getTime() }))
    .sort((a, b) => a.start - b.start)

  const happening = timed.find((item) => now >= item.start && now < item.start + EVENT_DURATION_MS)
  if (happening) return happening

  const upcoming = timed.find((item) => item.start > now)
  return upcoming ?? null
}

function categoriesForMajor(major: string): string[] {
  const m = major.toLowerCase()
  if (
    m.includes("computer") ||
    m.includes("cyber") ||
    m.includes("information") ||
    m.includes("software")
  ) {
    return ["Tech", "Academic"]
  }
  if (m.includes("business") || m.includes("entrepreneur") || m.includes("finance")) {
    return ["Academic"]
  }
  if (m.includes("design") || m.includes("art") || m.includes("media")) {
    return ["Cultural"]
  }
  return []
}

function clubCategoryByName(clubName: string) {
  return CLUBS.find((c) => c.name === clubName)?.category
}

function getRecommendedEvents(registeredIds: number[], limit = 3): RecommendedEvent[] {
  const joinedClubs = CLUBS.filter((c) => STUDENT_JOINED_CLUB_IDS.includes(c.id))
  const joinedCategories = new Set(joinedClubs.map((c) => c.category))
  const majorCategories = new Set(categoriesForMajor(STUDENT_MAJOR))
  const attendedTitles = new Set(COMPLETED_EVENTS.map((e) => e.title))
  const attendedCategories = new Set(
    COMPLETED_EVENTS.map((e) => clubCategoryByName(e.club)).filter(Boolean) as string[]
  )
  const hasPersonalSignal =
    joinedCategories.size > 0 || majorCategories.size > 0 || attendedCategories.size > 0

  const candidates = EVENTS.filter(
    (ev) => !registeredIds.includes(ev.id) && !attendedTitles.has(ev.title)
  )

  const scored = candidates.map((ev) => {
    let score = 0
    let reason = "Popular this week"

    const matchingClub = joinedClubs.find((c) => c.category === ev.category)
    if (matchingClub) {
      score += 50
      reason = `Because you joined ${matchingClub.name}`
    }

    if (majorCategories.has(ev.category)) {
      score += 30
      if (!matchingClub) {
        reason = `Matches your ${STUDENT_MAJOR} major`
      }
    }

    if (attendedCategories.has(ev.category)) {
      score += 20
      if (!matchingClub && !majorCategories.has(ev.category)) {
        reason = "Similar to events you've attended"
      }
    }

    const fillRate = ev.capacity > 0 ? ev.registered / ev.capacity : 0
    score += Math.round(fillRate * 15)

    if (!hasPersonalSignal || (score < 20 && !matchingClub && !majorCategories.has(ev.category) && !attendedCategories.has(ev.category))) {
      reason = "Popular this week"
    }

    return { ...ev, score, reason }
  })

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.registered / b.capacity - a.registered / a.capacity
  })

  return scored.slice(0, limit).map(({ score: _score, ...rest }) => rest)
}

type JourneyEntry = {
  id: string
  label: string
  sortAt: number
}

type JourneyMonth = {
  key: string
  label: string
  sortAt: number
  entries: JourneyEntry[]
}

function parseMonthYearLabel(label: string) {
  const parsed = new Date(`1 ${label}`)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function monthGroupLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function shortClubLabel(name: string) {
  if (name.includes("Google Developer")) return "Google Club"
  if (name.includes("Debate")) return "Debate Society"
  if (name.includes("Sports")) return "Sports Federation"
  if (name.includes("Entrepreneurship")) return "Entrepreneurship Club"
  if (name.includes("Environmental")) return "Environmental Society"
  return name
}

/**
 * Builds the Semester Journey from existing club memberships, completed/
 * attended events, and evaluated-event certificates.
 * TODO: Rewards badges have no earned dates — skip until dates exist.
 */
function buildSemesterJourney(registeredIds: number[]): JourneyMonth[] {
  const entries: JourneyEntry[] = []

  for (const club of CLUBS) {
    if (!STUDENT_JOINED_CLUB_IDS.includes(club.id) || !("joinedDate" in club) || !club.joinedDate) continue
    const sortAt = parseMonthYearLabel(club.joinedDate).getTime()
    entries.push({
      id: `club-${club.id}`,
      label: `Joined ${shortClubLabel(club.name)}`,
      sortAt,
    })
  }

  for (const ev of COMPLETED_EVENTS) {
    const sortAt = parseEventStart(ev.date, "12:00 PM").getTime()
    entries.push({
      id: `attended-${ev.id}`,
      label: `Attended ${ev.title}`,
      sortAt,
    })
    if (ev.evaluated) {
      entries.push({
        id: `cert-${ev.id}`,
        label: `Earned Certificate — ${ev.title}`,
        sortAt: sortAt + 24 * 60 * 60 * 1000,
      })
    }
  }

  for (const ev of EVENTS) {
    if (!registeredIds.includes(ev.id)) continue
    const start = parseEventStart(ev.date, ev.time).getTime()
    if (start > Date.now()) {
      entries.push({
        id: `rsvp-${ev.id}`,
        label: `Registered for ${ev.title}`,
        sortAt: start,
      })
    } else if (!COMPLETED_EVENTS.some((c) => c.title === ev.title)) {
      entries.push({
        id: `attended-live-${ev.id}`,
        label: `Attended ${ev.title}`,
        sortAt: start,
      })
    }
  }

  entries.sort((a, b) => b.sortAt - a.sortAt)

  const groups = new Map<string, JourneyMonth>()
  for (const entry of entries) {
    const date = new Date(entry.sortAt)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const existing = groups.get(key)
    if (existing) {
      existing.entries.push(entry)
    } else {
      groups.set(key, {
        key,
        label: monthGroupLabel(date),
        sortAt: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        entries: [entry],
      })
    }
  }

  return [...groups.values()]
    .sort((a, b) => b.sortAt - a.sortAt)
    .map((month) => ({
      ...month,
      entries: [...month.entries].sort((a, b) => b.sortAt - a.sortAt),
    }))
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function tint(color: string, pct = 14, base = "white") {
  return `color-mix(in srgb, ${color} ${pct}%, ${base})`
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "quiet"
type ButtonSize = "sm" | "md" | "lg"

function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  style,
  ...rest
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconPosition?: "left" | "right"
  className?: string
  children?: ReactNode
  style?: CSSProperties
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes: Record<ButtonSize, string> = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-[13.5px] gap-2",
    lg: "px-7 py-3.5 text-[15px] gap-2.5",
  }
  const iconSize = size === "lg" ? 17 : size === "sm" ? 13 : 15

  const variants: Record<ButtonVariant, { cls: string; style: CSSProperties }> = {
    primary: {
      cls: "text-white hover:brightness-[1.05] hover:-translate-y-px",
      style: { background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" },
    },
    secondary: {
      cls: "bg-white border hover:-translate-y-px",
      style: { borderColor: "var(--border-strong)", color: "var(--text-primary)", boxShadow: "var(--shadow-xs)" },
    },
    ghost: {
      cls: "hover:bg-[var(--surface-sunken)]",
      style: { color: "var(--text-secondary)" },
    },
    quiet: {
      cls: "",
      style: { background: "var(--surface-sunken)", color: "var(--text-primary)" },
    },
    danger: {
      cls: "hover:brightness-95",
      style: { background: "var(--danger-pale)", color: "var(--danger)" },
    },
  }
  const v = variants[variant]

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none disabled:translate-y-0 ${sizes[size]} ${v.cls} ${className}`}
      style={{ ...v.style, ...style }}
      {...rest}
    >
      {Icon && iconPosition === "left" && <Icon size={iconSize} strokeWidth={2.25} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={iconSize} strokeWidth={2.25} />}
    </button>
  )
}

function Card({
  children,
  className = "",
  padding = "p-6",
  hover = false,
  style,
}: {
  children: ReactNode
  className?: string
  padding?: string
  hover?: boolean
  style?: CSSProperties
}) {
  return (
    <div
      className={`bg-white rounded-[var(--r-lg)] border ${padding} ${hover ? "lift-hover group" : ""} ${className}`}
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-xs)", ...style }}
    >
      {children}
    </div>
  )
}

function Badge({ label, color = "var(--info)", dot = false }: { label: string; color?: string; dot?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold mono uppercase tracking-wide"
      style={{ background: tint(color, 13), color }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />}
      {label}
    </span>
  )
}

function Avatar({ name, size = 36, tone = "ink" }: { name: string; size?: number; tone?: "ink" | "brand" }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  return (
    <div
      className="font-display flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: tone === "brand" ? "var(--gradient-brand)" : "var(--gradient-ink)",
        fontSize: size * 0.36,
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {initials}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "var(--brand)",
  delay = 0,
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: string
  delay?: number
}) {
  return (
    <div
      className="bg-white rounded-[var(--r-lg)] p-5 border flex items-start gap-4 lift-hover animate-fade-up"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-xs)", animationDelay: `${delay}ms` }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: tint(accent, 12), color: accent }}
      >
        <Icon size={19} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
        <p className="font-display text-[25px] font-bold mt-0.5 leading-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        {sub && <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
    </div>
  )
}

function ProgressBar({ value, max, color = "var(--brand)" }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-sunken)" }}>
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-dashed p-12 text-center" style={{ borderColor: "var(--border-strong)" }}>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "var(--surface-sunken)", color: "var(--text-muted)" }}
      >
        <Icon size={21} strokeWidth={1.75} />
      </div>
      <p className="font-bold text-[14px] font-display" style={{ color: "var(--text-primary)" }}>{title}</p>
      <p className="text-sm mt-1.5 max-w-sm mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>{body}</p>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        {eyebrow && (
          <p className="text-[10.5px] font-bold mono uppercase tracking-widest mb-1.5" style={{ color: "var(--brand)" }}>
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className="transition-transform duration-150 hover:scale-125"
          style={{ color: s <= value ? "var(--brand)" : "var(--border-strong)" }}
        >
          <Star size={19} strokeWidth={0} fill="currentColor" />
        </button>
      ))}
    </div>
  )
}

// ─── QR Code visual ───────────────────────────────────────────────────────────
function QRCode({ size = 160 }: { size?: number }) {
  const cells = 21
  const cell = size / cells
  const pattern = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      const inTopLeft = r < 8 && c < 8
      const inTopRight = r < 8 && c >= cells - 8
      const inBottomLeft = r >= cells - 8 && c < 8
      if (inTopLeft || inTopRight || inBottomLeft) {
        const isOuter =
          r === 0 || r === 7 || c === 0 || c === 7 || r === cells - 8 || r === cells - 1 || c === cells - 8 || c === cells - 1
        const isInner =
          (inTopLeft && r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (inTopRight && r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
          (inBottomLeft && r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4)
        return isOuter || isInner ? 1 : 0
      }
      return Math.random() > 0.55 ? 1 : 0
    })
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, r) =>
        row.map((val, c) =>
          val ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell + cell * 0.08}
              y={r * cell + cell * 0.08}
              width={cell * 0.84}
              height={cell * 0.84}
              rx={cell * 0.18}
              fill="var(--ink)"
            />
          ) : null
        )
      )}
    </svg>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: Record<Role, { icon: LucideIcon; label: string; view: View }[]> = {
  student: [
    { icon: LayoutGrid, label: "Home Feed", view: "feed" },
    { icon: CalendarDays, label: "Events Hub", view: "events" },
    { icon: QrCode, label: "My QR Pass", view: "qr-pass" },
    { icon: Users, label: "My Clubs", view: "clubs" },
    { icon: Sparkles, label: "Rewards", view: "rewards" },
    { icon: Bell, label: "Notifications", view: "notifications" },
  ],
  president: [
    { icon: LayoutDashboard, label: "Command Center", view: "command" },
    { icon: SquarePen, label: "Create Event", view: "create-event" },
    { icon: ScanLine, label: "QR Scanner", view: "scanner" },
    { icon: Users, label: "Members", view: "members" },
    { icon: Bell, label: "Notifications", view: "notifications" },
  ],
  advisor: [
    { icon: ClipboardCheck, label: "Approvals", view: "approvals" },
    { icon: BarChart3, label: "Analytics", view: "analytics" },
    { icon: Bell, label: "Notifications", view: "notifications" },
  ],
  committee: [
    { icon: CalendarRange, label: "Master Calendar", view: "calendar" },
    { icon: Star, label: "Event Evaluation", view: "evaluation" },
    { icon: BadgeCheck, label: "Certifications", view: "certifications" },
    { icon: BarChart3, label: "Analytics", view: "analytics" },
    { icon: Bell, label: "Notifications", view: "notifications" },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  president: "Club President",
  advisor: "Club Advisor",
  committee: "Student Affairs",
}

function Sidebar({
  role,
  currentView,
  onNavigate,
  onLogout,
  userName,
}: {
  role: Role
  currentView: View
  onNavigate: (v: View) => void
  onLogout: () => void
  userName: string
}) {
  const items = NAV_ITEMS[role]
  const RoleIcon = ROLE_ICONS[role]

  return (
    <aside
      className="noise flex flex-col h-full relative"
      style={{ background: "var(--obsidian)", width: 272, minWidth: 272, borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-7 relative z-10">
        <img src={yuLogoWhite} alt="Al Yamamah University" className="h-12 w-auto mb-2.5" />
        <p className="text-[10.5px] font-bold mono uppercase tracking-widest" style={{ color: "var(--brand)" }}>Student Hub</p>
      </div>

      {/* Role badge */}
      <div className="px-5 mb-6 relative z-10">
        <div
          className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border"
          style={{ background: "rgba(255,255,255,0.035)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <RoleIcon size={15} strokeWidth={2} color="var(--brand)" />
          <span className="text-[12.5px] font-semibold" style={{ color: "rgba(255,255,255,0.82)" }}>{ROLE_LABELS[role]}</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--brand)" }} />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 relative z-10">
        {items.map((item) => {
          const active = currentView === item.view
          const Icon = item.icon
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-left transition-colors duration-200"
              style={{ color: active ? "white" : "rgba(255,255,255,0.46)" }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(246,137,55,0.14)", border: "1px solid rgba(246,137,55,0.3)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={17} strokeWidth={2} className="relative z-10 shrink-0" color={active ? "var(--brand)" : undefined} />
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-5 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <Avatar name={userName} size={36} tone="brand" />
          <div className="min-w-0 flex-1">
            <p className="text-white text-[13.5px] font-semibold truncate">{userName}</p>
            <p className="text-[11px] mono truncate" style={{ color: "rgba(255,255,255,0.32)" }}>YU · {new Date().getFullYear()}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.3)" }}
            title="Sign out"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Login / Role selector ────────────────────────────────────────────────────
function FieldShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3 border transition-all duration-200 focus-within:border-[var(--brand)]"
      style={{ background: "rgba(255,255,255,0.035)", borderColor: "rgba(255,255,255,0.09)" }}
    >
      <label className="block text-[9.5px] font-bold mono uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [step, setStep] = useState<"login" | "onboarding">("login")

  const roles: { value: Role; label: string; icon: LucideIcon }[] = [
    { value: "student", label: "Student", icon: GraduationCap },
    { value: "president", label: "Club President", icon: Crown },
    { value: "advisor", label: "Club Advisor", icon: ShieldCheck },
    { value: "committee", label: "Student Affairs", icon: Landmark },
  ]

  const onboardingText: Record<Role, string[]> = {
    student: [
      "Discover and RSVP to campus events with your personal QR Pass",
      "Join clubs and track your activity in one place",
      "Earn YU Points by participating in campus life",
    ],
    president: [
      "Manage your club's events, members, and engagement metrics",
      "Create events and scan QR codes for instant attendance tracking",
      "Submit proposals to your advisor and track approvals",
    ],
    advisor: [
      "Review and approve club events and budget proposals",
      "Monitor club performance analytics across the semester",
      "Provide structured feedback to club leaders",
    ],
    committee: [
      "View the master calendar to prevent scheduling conflicts",
      "Evaluate completed events with a structured scoring rubric",
      "Issue certifications and generate university-wide reports",
    ],
  }

  if (step === "onboarding") {
    const R = roles.find((r) => r.value === role)!
    return (
      <div className="noise min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="animate-float absolute w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: "var(--brand)", opacity: 0.16, filter: "blur(120px)", top: "-12%", left: "-8%" }} />
        <div className="w-full max-w-md mx-auto px-6 relative z-10 animate-scale-in">
          <div className="rounded-[var(--r-2xl)] p-9 border" style={{ background: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.09)", backdropFilter: "blur(20px)" }}>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" }}>
                <R.icon size={24} strokeWidth={2} color="white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white">Welcome, {ROLE_LABELS[role]}</h2>
              <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Here's what you can do</p>
            </div>
            <div className="space-y-4 mb-8">
              {onboardingText[role].map((tip, i) => (
                <div key={i} className="flex gap-3.5 items-start animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
                  <div
                    className="font-display w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                    style={{ background: "var(--brand)", color: "var(--obsidian)" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{tip}</p>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" onClick={() => onLogin(role)} className="w-full">
              Enter Your Hub
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="noise min-h-screen flex relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="animate-float absolute w-[560px] h-[560px] rounded-full pointer-events-none" style={{ background: "var(--brand)", opacity: 0.14, filter: "blur(140px)", top: "-14%", left: "4%" }} />
      <div className="absolute w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: "#8A63D6", opacity: 0.08, filter: "blur(140px)", bottom: "-10%", right: "6%" }} />

      {/* Left: brand story */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        <div>
          <div className="mb-20 animate-fade-up">
            <img src={yuLogoWhite} alt="Al Yamamah University" className="h-20 w-auto mb-3" />
            <p className="text-[10.5px] font-bold mono uppercase tracking-widest" style={{ color: "var(--brand)" }}>Student Hub</p>
          </div>
          <h1 className="font-display text-[52px] font-extrabold text-white leading-[1.05] mb-5 animate-fade-up" style={{ animationDelay: "70ms" }}>
            Your campus,
            <br />
            <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              elevated.
            </span>
          </h1>
          <p className="text-[16px] leading-relaxed max-w-sm animate-fade-up" style={{ color: "rgba(255,255,255,0.45)", animationDelay: "140ms" }}>
            One hub for events, clubs, attendance, and every moment of your journey at YU.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap animate-fade-up" style={{ animationDelay: "210ms" }}>
          {[
            { icon: CalendarDays, label: "1,400+ events" },
            { icon: Users, label: "42 active clubs" },
            { icon: Sparkles, label: "Vision 2030 aligned" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] border"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              <item.icon size={13} strokeWidth={2} color="var(--brand)" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right: sign-in card */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div
          className="w-full max-w-[380px] rounded-[var(--r-2xl)] p-8 border animate-scale-in"
          style={{ background: "rgba(255,255,255,0.045)", borderColor: "rgba(255,255,255,0.09)", backdropFilter: "blur(24px)", boxShadow: "var(--shadow-lg)" }}
        >
          <h2 className="font-display text-[22px] font-bold text-white mb-1">Sign in</h2>
          <p className="text-[13px] mb-7" style={{ color: "rgba(255,255,255,0.4)" }}>Use your YU university credentials</p>

          <div className="space-y-3.5 mb-6">
            <FieldShell label="University email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s2022XXXXX@yu.edu.sa"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
              />
            </FieldShell>
            <FieldShell label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
              />
            </FieldShell>

            <div>
              <p className="text-[9.5px] font-bold mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Role</p>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => {
                  const selected = role === r.value
                  return (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className="flex flex-col items-start px-3.5 py-3 rounded-xl text-left transition-all duration-200 border"
                      style={{
                        background: selected ? "rgba(246,137,55,0.12)" : "rgba(255,255,255,0.03)",
                        borderColor: selected ? "var(--brand)" : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <r.icon size={16} strokeWidth={2} color={selected ? "var(--brand)" : "rgba(255,255,255,0.4)"} className="mb-1.5" />
                      <span className="text-[12.5px] font-semibold" style={{ color: selected ? "white" : "rgba(255,255,255,0.55)" }}>
                        {r.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" onClick={() => setStep("onboarding")} className="w-full mb-4">
            Continue
          </Button>
          <p className="text-center text-[11.5px]" style={{ color: "rgba(255,255,255,0.25)" }}>Authorized users only · Al Yamamah University</p>
        </div>
      </div>
    </div>
  )
}

// ─── Student views ─────────────────────────────────────────────────────────────
function EventPreviewCard({ event, reason }: { event: EventItem; reason?: string }) {
  return (
    <Card hover padding="p-0" className="overflow-hidden">
      <div className="relative h-36 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-3 left-3"><Badge label={event.category} color={event.color} /></div>
      </div>
      <div className="p-4">
        <p className="font-display font-bold text-[13.5px] mb-1" style={{ color: "var(--text-primary)" }}>{event.title}</p>
        <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <MapPin size={11} strokeWidth={2} /> {event.date} · {event.location}
        </p>
        {reason && (
          <p className="text-[11px] font-semibold mt-2 flex items-center gap-1" style={{ color: "var(--brand)" }}>
            <Sparkles size={11} strokeWidth={2} /> {reason}
          </p>
        )}
        <div className="mt-3">
          <ProgressBar value={event.registered} max={event.capacity} color={event.color} />
          <p className="text-[11px] mt-1.5 mono" style={{ color: "var(--text-muted)" }}>{event.registered}/{event.capacity} registered</p>
        </div>
      </div>
    </Card>
  )
}

function SemesterJourneyCard({ registered }: { registered: number[] }) {
  const months = buildSemesterJourney(registered)

  return (
    <Card>
      <SectionHeader eyebrow="Your story" title="Semester Journey" />
      <div className="mt-5">
        {months.length === 0 ? (
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Your journey starts here — join a club or attend an event to see it here.
          </p>
        ) : (
          <div className="space-y-7">
            {months.map((month) => (
              <div key={month.key}>
                <p className="font-display font-bold text-[13px] mb-3.5" style={{ color: "var(--text-primary)" }}>{month.label}</p>
                <div className="relative pl-7">
                  <div className="absolute left-[9px] top-1.5 bottom-1.5 w-px" style={{ background: "var(--border)" }} />
                  <div className="space-y-3.5">
                    {month.entries.map((entry) => (
                      <div key={entry.id} className="relative flex items-start gap-3">
                        <span
                          className="absolute -left-7 top-0 w-[19px] h-[19px] rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "var(--brand-100)", border: "1.5px solid var(--brand)" }}
                          aria-hidden
                        >
                          <Check size={10} strokeWidth={3} color="var(--brand-700)" />
                        </span>
                        <p className="text-sm leading-snug pt-0.5" style={{ color: "var(--text-secondary)" }}>{entry.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function FeaturedHeroBanner() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const msToNextMinute = 60_000 - (Date.now() % 60_000)
    let intervalId: number | undefined

    const timeoutId = window.setTimeout(() => {
      tick()
      intervalId = window.setInterval(tick, 60_000)
    }, msToNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [])

  const featured = getFeaturedEvent(EVENTS, now)

  if (!featured) {
    return (
      <div className="noise rounded-[var(--r-xl)] overflow-hidden relative" style={{ minHeight: 220, background: "var(--gradient-ink)" }}>
        <div className="relative z-10 p-9 flex items-end h-full min-h-[220px]">
          <div>
            <p className="text-[10.5px] font-bold mono uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>Campus highlights</p>
            <h2 className="font-display text-[26px] font-bold text-white">No upcoming featured events</h2>
            <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Check the Events Hub for new campus activities.</p>
          </div>
        </div>
      </div>
    )
  }

  const { ev, start } = featured
  const remaining = start - now
  const isHappening = remaining <= 0

  let countdown: { value: number; label: string }[] | null = null
  if (!isHappening) {
    const totalMinutes = Math.floor(remaining / 60_000)
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60
    countdown = [
      ...(days > 0 ? [{ value: days, label: "Days" }] : []),
      { value: hours, label: "Hours" },
      { value: minutes, label: "Minutes" },
    ]
  }

  return (
    <div className="noise rounded-[var(--r-xl)] overflow-hidden relative" style={{ minHeight: 240, background: "var(--gradient-ink)" }}>
      <img src={ev.image} alt={ev.title} className="absolute inset-0 w-full h-full object-cover opacity-[0.22]" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,10,8,0.94) 8%, rgba(11,10,8,0.4) 100%)" }} />
      <div className="relative z-10 p-9 flex items-end min-h-[240px]">
        <div className="animate-fade-up">
          <Badge label={ev.category} color="var(--brand)" />
          <h2 className="font-display text-[28px] font-bold text-white mt-3 mb-1 leading-tight">{ev.title}</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>{ev.date} · {ev.location} · {ev.capacity.toLocaleString()} capacity</p>
          {isHappening ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: tint("var(--success)", 16, "black"), border: "1px solid rgba(29,154,108,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--success)" }} />
              <span className="text-xs font-bold" style={{ color: "#4ADE95" }}>Happening now</span>
            </div>
          ) : (
            <div className="flex gap-6">
              {countdown!.map((unit) => (
                <div key={unit.label} className="min-w-[3.25rem]">
                  <p className="font-display mono text-[30px] font-bold text-white leading-none">{String(unit.value).padStart(2, "0")}</p>
                  <p className="text-[10.5px] mt-1.5 font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>{unit.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StudentFeed({ registered }: { registered: number[] }) {
  const todaySchedule = EVENTS
    .filter((ev) => registered.includes(ev.id) && ev.date === TODAY_LABEL)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

  const recommended = getRecommendedEvents(registered, 3)
  const upcoming = EVENTS.filter(
    (ev) => ev.date !== TODAY_LABEL && !registered.includes(ev.id) && !recommended.some((r) => r.id === ev.id)
  ).slice(0, 2)

  return (
    <div className="space-y-8">
      <FeaturedHeroBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Events Attended" value={12} sub="This semester" icon={CalendarDays} accent="var(--info)" delay={0} />
        <StatCard label="Club Memberships" value={3} sub="Active" icon={Users} accent="#8A63D6" delay={40} />
        <StatCard label="YU Points" value="1,840" sub="Rank #47" icon={Sparkles} accent="var(--brand)" delay={80} />
        <StatCard label="Certificates" value={5} sub="Earned" icon={Award} accent="var(--success)" delay={120} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-baseline justify-between mb-4 gap-3">
            <h3 className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>Today's Schedule</h3>
            <span className="text-[11px] font-semibold mono" style={{ color: "var(--text-muted)" }}>{TODAY_LABEL}</span>
          </div>
          {todaySchedule.length === 0 ? (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Nothing on today — check the Events Hub for what's happening this week.
            </p>
          ) : (
            <div className="space-y-2.5">
              {todaySchedule.map((ev) => (
                <div
                  key={ev.id}
                  className="flex gap-3 items-start p-3 rounded-xl transition-transform duration-200 hover:translate-x-0.5"
                  style={{ background: "var(--surface-sunken)" }}
                >
                  <span className="text-[11px] font-bold mono shrink-0 pt-0.5 w-[4.25rem]" style={{ color: "var(--brand)" }}>{ev.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <MapPin size={10} strokeWidth={2} /> {ev.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-bold text-[15px] mb-4" style={{ color: "var(--text-primary)" }}>Announcements</h3>
          <div className="space-y-2.5">
            {[
              { from: "Student Affairs", text: "Registration for Fall 2026 clubs opens August 1st.", time: "2h ago", urgent: true },
              { from: "Google Dev Club", text: "New workshop slots available for the AI Summit — check Events Hub.", time: "5h ago", urgent: false },
              { from: "Sports Federation", text: "Tryouts for the basketball team are next Monday at 4PM.", time: "1d ago", urgent: false },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: "var(--surface-sunken)" }}>
                {a.urgent && <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--danger)" }} />}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{a.from}</span>{" "}
                  <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{a.text}</span>
                </div>
                <span className="text-[11px] mono shrink-0" style={{ color: "var(--text-muted)" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader eyebrow="Curated for you" title="Recommended" />
        <div className="mt-4">
          {recommended.length === 0 ? (
            <EmptyState icon={Sparkles} title="You're all caught up" body="Check the Events Hub when new campus events are posted." />
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recommended.map((ev) => <EventPreviewCard key={ev.id} event={ev} reason={ev.reason} />)}
            </div>
          )}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <SectionHeader title="Upcoming Events" />
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {upcoming.map((ev) => <EventPreviewCard key={ev.id} event={ev} />)}
          </div>
        </div>
      )}

      <SemesterJourneyCard registered={registered} />
    </div>
  )
}

function EventsHub({
  registered,
  setRegistered,
}: {
  registered: number[]
  setRegistered: Dispatch<SetStateAction<number[]>>
}) {
  const [filter, setFilter] = useState("All")
  const categories = ["All", "Tech", "Academic", "Cultural", "Sports"]

  const filtered = filter === "All" ? EVENTS : EVENTS.filter((e) => e.category === filter)

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Discover" title="Events Hub" subtitle="Find and register for campus events — your QR pass is generated automatically." />

      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => {
          const active = filter === cat
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="relative px-4 py-2 rounded-full text-[13px] font-semibold transition-colors duration-200"
              style={{ color: active ? "white" : "var(--text-secondary)" }}
            >
              {active && (
                <motion.div
                  layoutId="event-filter-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--ink)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((ev, i) => {
          const isReg = registered.includes(ev.id)
          return (
            <Card key={ev.id} hover padding="p-0" className="overflow-hidden md:flex animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="relative w-full md:w-56 h-44 md:h-auto shrink-0 overflow-hidden">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <p className="font-display font-bold text-[16px]" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{ev.club}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      <Badge label={ev.category} color={ev.color} />
                      <Badge label={ev.vision2030} color="var(--success)" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                    <span className="flex items-center gap-1.5"><CalendarDays size={13} strokeWidth={2} /> {ev.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} strokeWidth={2} /> {ev.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={13} strokeWidth={2} /> {ev.location}</span>
                  </div>
                  <ProgressBar value={ev.registered} max={ev.capacity} color={ev.color} />
                  <p className="text-[11px] mt-1.5 mono" style={{ color: "var(--text-muted)" }}>{ev.registered} / {ev.capacity} spots filled</p>
                </div>
                <div className="mt-5">
                  <Button
                    variant={isReg ? "secondary" : "primary"}
                    icon={isReg ? CheckCircle2 : Ticket}
                    onClick={() => setRegistered((prev) => isReg ? prev.filter((id) => id !== ev.id) : [...prev, ev.id])}
                  >
                    {isReg ? "Registered" : "Register / RSVP"}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function QRPass() {
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setAnimating((a) => !a), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto space-y-6">
      <SectionHeader title="My QR Pass" subtitle="Show this at event check-in for instant attendance tracking" />

      <div className="noise w-full rounded-[var(--r-2xl)] overflow-hidden relative animate-scale-in" style={{ background: "var(--gradient-ink)", boxShadow: "var(--shadow-lg)" }}>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: "var(--brand)", opacity: 0.18, filter: "blur(60px)" }} />

        <div className="px-6 pt-6 pb-4 flex items-center justify-between relative z-10">
          <div>
            <p className="text-[9.5px] font-bold mono uppercase tracking-widest" style={{ color: "var(--brand)" }}>Al Yamamah University</p>
            <p className="font-display text-white text-[14px] font-semibold mt-0.5">Digital Student Pass</p>
          </div>
          <div className="font-display w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm" style={{ background: "var(--gradient-brand)" }}>YU</div>
        </div>

        <div className="qr-bg mx-6 mb-4 rounded-2xl p-6 flex flex-col items-center relative z-10" style={{ background: "white" }}>
          <div className="transition-all duration-1000" style={{ opacity: animating ? 0.85 : 1, transform: animating ? "scale(0.97)" : "scale(1)" }}>
            <QRCode size={160} />
          </div>
          <p className="mono text-xs mt-3" style={{ color: "var(--ink)" }}>S202210045-YU-2026</p>
        </div>

        <div className="px-6 pb-6 space-y-3 relative z-10">
          <div className="flex justify-between text-xs">
            <div>
              <p className="mono" style={{ color: "rgba(255,255,255,0.35)" }}>STUDENT</p>
              <p className="text-white font-semibold mt-0.5">Sarah Al-Mutairi</p>
            </div>
            <div className="text-right">
              <p className="mono" style={{ color: "rgba(255,255,255,0.35)" }}>ID NUMBER</p>
              <p className="text-white font-semibold mt-0.5 mono">202210045</p>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <p className="mono" style={{ color: "rgba(255,255,255,0.35)" }}>PROGRAM</p>
              <p className="text-white font-semibold mt-0.5">{STUDENT_MAJOR}</p>
            </div>
            <div className="text-right">
              <p className="mono" style={{ color: "rgba(255,255,255,0.35)" }}>VALID UNTIL</p>
              <p className="font-semibold mt-0.5 mono" style={{ color: "var(--brand)" }}>May 2027</p>
            </div>
          </div>

          <div className="rounded-xl p-3.5 mt-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[9.5px] mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.32)" }}>Registered Events</p>
            <div className="space-y-1.5">
              {EVENTS.slice(0, 3).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <p className="text-xs truncate flex-1 mr-2" style={{ color: "rgba(255,255,255,0.75)" }}>{ev.title}</p>
                  <span className="text-[11px] mono shrink-0" style={{ color: "var(--brand)" }}>{ev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center max-w-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
        QR code refreshes every 30 seconds for security. Attendance certificates are issued automatically after scanning.
      </p>
    </div>
  )
}

function MyClubs() {
  const [joined, setJoined] = useState([1, 2, 5])

  return (
    <div className="space-y-6">
      <SectionHeader title="My Clubs" subtitle="Manage your memberships and stay up to date with club activity." />

      <div className="space-y-3">
        {CLUBS.map((club, i) => {
          const isJoined = joined.includes(club.id)
          const color = CATEGORY_COLORS[club.category] ?? "var(--info)"
          return (
            <Card key={club.id} hover className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div
                className="font-display w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: color }}
              >
                {club.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-[14px]" style={{ color: "var(--text-primary)" }}>{club.name}</p>
                <div className="flex gap-2.5 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1"><Users size={11} strokeWidth={2} /> {club.members}</span>
                  <span>·</span>
                  <span>{club.meetings}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge label={club.category} color={color} />
                <Button
                  size="sm"
                  variant={isJoined ? "secondary" : "primary"}
                  icon={isJoined ? UserCheck : UserPlus}
                  onClick={() => setJoined((prev) => isJoined ? prev.filter((id) => id !== club.id) : [...prev, club.id])}
                >
                  {isJoined ? "Joined" : "Join"}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function RewardsView() {
  const badges = [
    { icon: "🏆", name: "Event Champion", desc: "Attended 10+ events", earned: true },
    { icon: "🌱", name: "Green Advocate", desc: "Joined sustainability events", earned: true },
    { icon: "💡", name: "Innovator", desc: "Participated in 3 hackathons", earned: false },
    { icon: "🤝", name: "Community Pillar", desc: "Volunteered 20+ hours", earned: true },
    { icon: "🎤", name: "Speaker", desc: "Presented at a campus event", earned: false },
    { icon: "⭐", name: "YU Star", desc: "Top 10% engagement this semester", earned: false },
  ]

  return (
    <div className="space-y-6">
      <SectionHeader title="YU Rewards & XP" subtitle="Earn points and unlock campus perks." />

      <div className="noise rounded-[var(--r-xl)] p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden" style={{ background: "var(--gradient-ink)" }}>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full pointer-events-none" style={{ background: "var(--brand)", opacity: 0.14, filter: "blur(80px)" }} />
        <div className="text-center relative z-10 shrink-0">
          <p className="text-[10.5px] font-bold mono uppercase tracking-widest mb-1.5" style={{ color: "var(--brand)" }}>Your YU Points</p>
          <p className="font-display text-[52px] font-extrabold text-white leading-none">1,840</p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Campus Rank #47</p>
        </div>
        <div className="flex-1 w-full relative z-10">
          <p className="text-xs mb-2.5" style={{ color: "rgba(255,255,255,0.55)" }}>Next reward at 2,000 pts</p>
          <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: "92%", background: "var(--gradient-brand)" }} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[{ label: "Events", pts: "+50 pts" }, { label: "Clubs", pts: "+100 pts" }, { label: "Volunteering", pts: "+200 pts" }].map((item) => (
              <div key={item.label} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-xs font-bold mono" style={{ color: "var(--brand)" }}>{item.pts}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Your Badges" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {badges.map((badge, i) => (
            <Card key={badge.name} hover className="text-center animate-fade-up" style={{ opacity: badge.earned ? 1 : 0.42, animationDelay: `${i * 40}ms` }}>
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="font-display font-bold text-[13.5px]" style={{ color: "var(--text-primary)" }}>{badge.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{badge.desc}</p>
              {badge.earned && (
                <span className="inline-block mt-2.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}>
                  Earned
                </span>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <h3 className="font-display font-bold text-[15px] mb-4" style={{ color: "var(--text-primary)" }}>Redeem Points</h3>
        <div className="space-y-2.5">
          {[
            { perk: "Cafeteria 15% Discount", cost: "500 pts", available: true },
            { perk: "Priority Course Registration", cost: "1,200 pts", available: true },
            { perk: "YU Branded Hoodie", cost: "2,500 pts", available: false },
            { perk: "Parking Priority Pass (1 month)", cost: "800 pts", available: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: "var(--surface-sunken)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.perk}</p>
                <p className="text-xs mono mt-0.5" style={{ color: "var(--brand)" }}>{item.cost}</p>
              </div>
              <Button size="sm" variant={item.available ? "primary" : "quiet"} disabled={!item.available}>Redeem</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── President views ──────────────────────────────────────────────────────────
function CommandCenter() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Google Developer Student Club" title="Command Center" subtitle="Spring 2026 semester overview" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Members" value={142} sub="+12 this month" icon={Users} accent="#8A63D6" />
        <StatCard label="Pending Requests" value={6} sub="Awaiting approval" icon={UserPlus} accent="var(--warning)" delay={40} />
        <StatCard label="Events This Sem." value={8} sub="3 upcoming" icon={Rocket} accent="var(--info)" delay={80} />
        <StatCard label="Avg. Attendance" value="78%" sub="Up from 65%" icon={TrendingUp} accent="var(--success)" delay={120} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>Pending Join Requests</h3>
          <Badge label="6 pending" color="var(--warning)" />
        </div>
        <div className="space-y-2.5">
          {[
            { name: "Mohammed Al-Rashid", major: "Computer Science", year: "2nd year", id: "202310089" },
            { name: "Hessa Al-Qahtani", major: "Information Systems", year: "3rd year", id: "202210201" },
            { name: "Yousuf Al-Anzi", major: "Cybersecurity", year: "1st year", id: "202410015" },
          ].map((req, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3.5 rounded-xl" style={{ background: "var(--surface-sunken)" }}>
              <Avatar name={req.name} size={38} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13.5px]" style={{ color: "var(--text-primary)" }}>{req.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{req.major} · {req.year} · <span className="mono">{req.id}</span></p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="primary" icon={Check}>Approve</Button>
                <Button size="sm" variant="ghost" icon={X}>Decline</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-[15px] mb-5" style={{ color: "var(--text-primary)" }}>Monthly Attendance</h3>
        <div className="flex items-end gap-3 h-36">
          {[
            { month: "Feb", val: 55 }, { month: "Mar", val: 72 }, { month: "Apr", val: 68 },
            { month: "May", val: 85 }, { month: "Jun", val: 79 }, { month: "Jul", val: 91 },
          ].map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <p className="text-xs font-bold mono" style={{ color: "var(--text-primary)" }}>{d.val}%</p>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ height: `${(d.val / 100) * 100}px`, background: d.month === "Jul" ? "var(--gradient-brand)" : "var(--surface-sunken)" }}
              />
              <p className="text-xs mono" style={{ color: "var(--text-muted)" }}>{d.month}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function CreateEvent() {
  const [form, setForm] = useState({
    name: "", desc: "", date: "", time: "", location: "", capacity: "",
    category: "Tech", vision2030: "Innovation",
  })
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-scale-in">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "var(--success-pale)" }}>
          <CheckCircle2 size={30} strokeWidth={2} color="var(--success)" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Event Submitted!</h2>
        <p className="text-sm mb-7 max-w-sm" style={{ color: "var(--text-secondary)" }}>
          Your event has been sent to your club advisor for approval.
        </p>
        <Button variant="secondary" onClick={() => setSubmitted(false)}>Create Another</Button>
      </div>
    )
  }

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:border-[var(--brand)]"
  const inputStyle: CSSProperties = { borderColor: "var(--border)", background: "var(--surface-sunken)", color: "var(--text-primary)" }
  const labelCls = "text-[10.5px] font-bold mono uppercase tracking-widest block mb-1.5"
  const labelStyle: CSSProperties = { color: "var(--text-secondary)" }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className={labelCls} style={labelStyle}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={inputCls}
        style={inputStyle}
      />
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl">
      <SectionHeader title="Create New Event" subtitle="Fill in the details and submit for advisor approval." />

      <Card className="space-y-4">
        {field("Event name", "name", "text", "e.g. AI Workshop Series")}
        <div>
          <label className={labelCls} style={labelStyle}>Description</label>
          <textarea
            rows={3}
            placeholder="Describe the event, its goals, and expected outcomes..."
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            className={`${inputCls} resize-none`}
            style={inputStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field("Date", "date", "date")}
          {field("Time", "time", "time")}
        </div>
        {field("Location", "location", "text", "e.g. Tuwaiq Auditorium")}
        {field("Capacity", "capacity", "number", "e.g. 150")}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            >
              {["Tech", "Academic", "Cultural", "Sports"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Vision 2030 Tag</label>
            <select
              value={form.vision2030}
              onChange={(e) => setForm((f) => ({ ...f, vision2030: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            >
              {["Innovation", "Sustainability", "Community Development"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          className="w-full rounded-xl p-5 border-2 border-dashed text-center transition-all duration-200 hover:border-[var(--brand)]"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <ImagePlus size={22} strokeWidth={1.75} className="mx-auto mb-1.5" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Upload event poster (JPG, PNG)</p>
        </button>
      </Card>

      <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" onClick={() => setSubmitted(true)}>
        Submit for Approval
      </Button>
    </div>
  )
}

function QRScanner() {
  const [scanned, setScanned] = useState<string[]>([])
  const [scanning, setScanning] = useState(false)

  const simulateScan = () => {
    setScanning(true)
    setTimeout(() => {
      const newMember = MEMBERS[Math.floor(Math.random() * MEMBERS.length)]
      setScanned((prev) => [newMember.id_num, ...prev.filter((id) => id !== newMember.id_num)])
      setScanning(false)
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <SectionHeader title="Live QR Check-In" subtitle="Scan member QR passes for instant attendance logging." />

      <div className="noise rounded-[var(--r-xl)] overflow-hidden flex flex-col items-center relative" style={{ background: "var(--obsidian)" }}>
        <div className="relative w-full" style={{ height: 280 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-52 h-52 rounded-2xl border-2 relative transition-all duration-300" style={{ borderColor: scanning ? "var(--brand)" : "rgba(255,255,255,0.15)" }}>
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: "var(--brand)" }} />
              ))}
              {scanning && (
                <div
                  className="absolute left-2 right-2 h-0.5 rounded-full"
                  style={{ background: "var(--brand)", top: "50%", boxShadow: "0 0 16px var(--brand)" }}
                />
              )}
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={26} strokeWidth={1.5} color="rgba(255,255,255,0.2)" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-5 left-0 right-0 text-center">
            <p className="text-[10.5px] mono font-bold uppercase tracking-widest" style={{ color: scanning ? "var(--brand)" : "rgba(255,255,255,0.3)" }}>
              {scanning ? "Scanning…" : "Ready to scan"}
            </p>
          </div>
        </div>
        <div className="w-full px-6 pb-6">
          <Button variant="primary" size="lg" className="w-full" onClick={simulateScan} disabled={scanning} icon={ScanLine}>
            {scanning ? "Scanning..." : "Simulate Scan"}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>Attendance Log</h3>
          <Badge label={`${scanned.length} checked in`} color="var(--success)" />
        </div>
        {scanned.length === 0 ? (
          <EmptyState icon={ScanLine} title="No scans yet" body="Scanned passes will appear here in real time." />
        ) : (
          <div className="space-y-2">
            {scanned.map((id) => {
              const member = MEMBERS.find((m) => m.id_num === id)
              return (
                <div key={id} className="flex items-center gap-3 p-3 rounded-xl animate-fade-up" style={{ background: "var(--success-pale)" }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--success)" }} />
                  <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>{member?.name ?? "Unknown"}</p>
                  <p className="text-xs mono" style={{ color: "var(--text-muted)" }}>{id}</p>
                  <Check size={14} strokeWidth={2.5} color="var(--success)" />
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

function MembersView() {
  const [members, setMembers] = useState(MEMBERS)

  return (
    <div className="space-y-6">
      <SectionHeader title="Member Management" subtitle="142 total members · Google Developer Student Club" />

      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border)" }}>
                {["Member", "ID", "Attendance", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[10.5px] font-bold mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b transition-colors duration-200 hover:bg-[var(--surface-sunken)]" style={{ borderColor: "var(--border)" }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size={32} />
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 mono text-xs" style={{ color: "var(--text-muted)" }}>{m.id_num}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5 max-w-[140px]">
                      <ProgressBar value={m.attendance} max={10} />
                      <span className="text-xs mono shrink-0" style={{ color: "var(--text-muted)" }}>{m.attendance}/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs" style={{ color: "var(--text-muted)" }}>{m.joined}</td>
                  <td className="px-6 py-4">
                    <Badge
                      label={m.status}
                      color={m.status === "active" ? "var(--success)" : m.status === "pending" ? "var(--warning)" : "var(--text-muted)"}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      {m.status === "pending" && (
                        <button
                          className="text-xs font-bold hover:underline"
                          style={{ color: "var(--success)" }}
                          onClick={() => setMembers((prev) => prev.map((mem) => mem.id === m.id ? { ...mem, status: "active" } : mem))}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="text-xs font-bold hover:underline"
                        style={{ color: "var(--danger)" }}
                        onClick={() => setMembers((prev) => prev.filter((mem) => mem.id !== m.id))}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Advisor views ────────────────────────────────────────────────────────────
function ApprovalsView() {
  const [approvals, setApprovals] = useState(PENDING_APPROVALS)
  const [feedback, setFeedback] = useState<Record<number, string>>({})

  const approve = (id: number) => setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)))
  const requestChanges = (id: number) => setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: "changes-requested" } : a)))

  return (
    <div className="space-y-6">
      <SectionHeader title="Oversight & Approvals" subtitle="Review club event and budget proposals." />

      <div className="space-y-4">
        {approvals.map((a, i) => {
          const statusColors: Record<string, string> = {
            pending: "var(--warning)",
            approved: "var(--success)",
            "changes-requested": "var(--danger)",
          }
          return (
            <Card key={a.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-4 mb-3.5">
                <div>
                  <p className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{a.club} · Submitted by {a.submittedBy} · {a.date}</p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <Badge label={a.type} color="var(--info)" />
                  <Badge label={a.vision2030} color="var(--success)" />
                  <Badge label={a.status} color={statusColors[a.status]} />
                </div>
              </div>

              {a.status === "pending" ? (
                <>
                  <textarea
                    rows={2}
                    placeholder="Add feedback notes (optional)..."
                    value={feedback[a.id] || ""}
                    onChange={(e) => setFeedback((f) => ({ ...f, [a.id]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none mb-3.5 transition-all duration-200 focus:border-[var(--brand)]"
                    style={{ borderColor: "var(--border)", background: "var(--surface-sunken)", color: "var(--text-primary)" }}
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" icon={Check} onClick={() => approve(a.id)}>Approve</Button>
                    <Button variant="danger" icon={X} onClick={() => requestChanges(a.id)}>Request Changes</Button>
                  </div>
                </>
              ) : (
                <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: statusColors[a.status] }}>
                  {a.status === "approved" ? <><CheckCircle2 size={15} strokeWidth={2.25} /> Approved</> : <><AlertTriangle size={15} strokeWidth={2.25} /> Changes Requested</>}
                </p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function AdvisorAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Club Performance Analytics" subtitle="Spring 2026 semester overview for supervised clubs." />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Supervised Clubs" value={3} icon={Users} accent="#8A63D6" />
        <StatCard label="Events Approved" value={14} sub="This semester" icon={ClipboardCheck} accent="var(--success)" delay={40} />
        <StatCard label="Students Reached" value="2,140" icon={GraduationCap} accent="var(--info)" delay={80} />
      </div>

      {CLUBS.slice(0, 3).map((club) => {
        const engagement = [78, 91, 65][club.id - 1] ?? 70
        return (
          <Card key={club.id}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>{club.name}</p>
              <span className="text-lg font-extrabold mono" style={{ color: engagement > 80 ? "var(--success)" : "var(--warning)" }}>{engagement}%</span>
            </div>
            <ProgressBar value={engagement} max={100} color={engagement > 80 ? "var(--success)" : "var(--warning)"} />
            <div className="flex gap-6 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>{club.members} members</span>
              <span>4 events this semester</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Committee views ──────────────────────────────────────────────────────────
function MasterCalendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const eventDays: Record<number, boolean> = { 10: true, 15: true, 20: true, 28: true, 3: true }

  return (
    <div className="space-y-6">
      <SectionHeader title="Master Event Calendar" subtitle="University-wide event overview — prevents scheduling conflicts." />

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>August 2026</h3>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-[var(--surface-sunken)]" style={{ color: "var(--text-secondary)" }}>
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-[var(--surface-sunken)]" style={{ color: "var(--text-secondary)" }}>
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-xs font-bold mono py-1" style={{ color: "var(--text-muted)" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(6).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((day) => {
            const hasEvent = eventDays[day]
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-[var(--surface-sunken)] relative"
                style={{ color: hasEvent ? "var(--brand-700)" : "var(--text-primary)", fontWeight: hasEvent ? 700 : 400, background: hasEvent ? "var(--brand-50)" : "transparent" }}
              >
                {day}
                {hasEvent && <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: "var(--brand)" }} />}
              </div>
            )
          })}
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>All Scheduled Events</h3>
        {EVENTS.map((ev) => (
          <Card key={ev.id} padding="p-4" className="flex items-center gap-4">
            <div className="font-display w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: ev.color }}>
              {ev.date.split(" ")[1]?.replace(",", "") ?? "—"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ev.club} · {ev.location}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge label={ev.category} color={ev.color} />
              <Badge label={ev.vision2030} color="var(--success)" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EventEvaluation() {
  const [events, setEvents] = useState(COMPLETED_EVENTS)
  const [activeEvent, setActiveEvent] = useState<number | null>(null)
  const [tempScores, setTempScores] = useState<Record<string, number>>({})

  const submitEval = (eventId: number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, scores: { ...tempScores } as typeof e.scores, evaluated: true } : e))
    )
    setActiveEvent(null)
    setTempScores({})
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Event Evaluation & Scoring" subtitle="Review and score completed events using the YU rubric." />

      <div className="space-y-4">
        {events.map((ev) => {
          const isActive = activeEvent === ev.id
          const attendPct = Math.round((ev.attendance / ev.capacity) * 100)

          return (
            <Card key={ev.id} padding="p-0" className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{ev.club} · {ev.date}</p>
                  </div>
                  <Badge label={ev.evaluated ? "Evaluated" : "Pending Review"} color={ev.evaluated ? "var(--success)" : "var(--warning)"} />
                </div>

                <div className="mb-3">
                  <p className="text-[10.5px] mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Attendance</p>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {ev.attendance} / {ev.capacity}
                    <span className="text-xs ml-1.5 font-normal" style={{ color: attendPct > 85 ? "var(--success)" : "var(--text-muted)" }}>({attendPct}%)</span>
                  </p>
                </div>

                {ev.evaluated && !isActive && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {Object.entries(ev.scores).map(([key, val]) => (
                      <div key={key} className="text-center p-2.5 rounded-xl" style={{ background: "var(--surface-sunken)" }}>
                        <p className="text-xs mono capitalize" style={{ color: "var(--text-muted)" }}>{key}</p>
                        <p className="font-bold text-lg" style={{ color: "var(--brand)" }}>{val}/5</p>
                      </div>
                    ))}
                  </div>
                )}

                {!ev.evaluated && !isActive && (
                  <Button
                    variant="primary"
                    onClick={() => { setActiveEvent(ev.id); setTempScores({ organization: 0, turnout: 0, impact: 0, creativity: 0 }) }}
                  >
                    Start Evaluation
                  </Button>
                )}
              </div>

              {isActive && (
                <div className="p-5 border-t" style={{ borderColor: "var(--border)", background: "var(--surface-sunken)" }}>
                  <p className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Scoring Rubric</p>
                  <div className="space-y-4">
                    {[
                      { key: "organization", label: "Organization & Logistics" },
                      { key: "turnout", label: "Attendance Turnout" },
                      { key: "impact", label: "Impact on Student Life (Vision 2030)" },
                      { key: "creativity", label: "Creativity & Innovation" },
                    ].map((criterion) => (
                      <div key={criterion.key} className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>{criterion.label}</p>
                        <StarRating value={tempScores[criterion.key] ?? 0} onChange={(v) => setTempScores((s) => ({ ...s, [criterion.key]: v }))} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-5">
                    <Button variant="primary" onClick={() => submitEval(ev.id)}>Submit Evaluation</Button>
                    <Button variant="ghost" onClick={() => setActiveEvent(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function CertificationsView() {
  const [issued, setIssued] = useState<number[]>([])
  const eligibleEvents = COMPLETED_EVENTS.filter((e) => e.evaluated)

  return (
    <div className="space-y-6">
      <SectionHeader title="Official Certification Generator" subtitle="Issue recognition certificates to clubs for high-scoring events." />

      {eligibleEvents.length === 0 ? (
        <EmptyState icon={Medal} title="No evaluated events yet" body="Complete evaluations to unlock certifications." />
      ) : (
        eligibleEvents.map((ev) => {
          const avg = Object.values(ev.scores).reduce((s, v) => s + v, 0) / 4
          const isIssued = issued.includes(ev.id)

          return (
            <Card key={ev.id} padding="p-0" className="overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}>
                  <Medal size={22} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ev.club}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} strokeWidth={0} fill="currentColor" style={{ color: s <= avg ? "var(--brand)" : "var(--border-strong)" }} />
                      ))}
                    </div>
                    <span className="text-xs mono" style={{ color: "var(--text-muted)" }}>{avg.toFixed(1)} avg</span>
                  </div>
                </div>
                <Button
                  variant={isIssued ? "secondary" : "primary"}
                  icon={isIssued ? CheckCircle2 : Medal}
                  onClick={() => setIssued((prev) => (isIssued ? prev : [...prev, ev.id]))}
                >
                  {isIssued ? "Certificate Issued" : "Issue Certificate"}
                </Button>
              </div>

              {isIssued && (
                <div className="noise mx-5 mb-5 rounded-2xl p-7 text-center relative" style={{ background: "var(--gradient-ink)", border: "2px solid var(--brand)" }}>
                  <p className="text-[10.5px] font-bold mono uppercase tracking-widest mb-1.5" style={{ color: "var(--brand)" }}>Certificate of Excellence</p>
                  <p className="font-display text-white text-lg font-bold">Al Yamamah University</p>
                  <p className="text-xs mt-1.5 mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>This certifies that</p>
                  <p className="font-display text-xl font-extrabold" style={{ color: "var(--brand)" }}>{ev.club}</p>
                  <p className="text-xs mt-1.5 mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>has successfully organized</p>
                  <p className="text-white font-semibold text-sm">{ev.title}</p>
                  <p className="text-xs mt-4 mono" style={{ color: "rgba(255,255,255,0.3)" }}>Issued by Student Affairs Committee · {new Date().toLocaleDateString()}</p>
                </div>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}

function CommitteeAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="University-Wide Analytics" subtitle="Student engagement and club activity across YU, Spring 2026." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={42} sub="This semester" icon={CalendarDays} accent="var(--info)" />
        <StatCard label="Student Engagement" value="73%" sub="+8% vs last sem." icon={Sparkles} accent="var(--brand)" delay={40} />
        <StatCard label="Active Clubs" value={18} sub="Out of 22 registered" icon={Users} accent="#8A63D6" delay={80} />
        <StatCard label="Attendance Rate" value="81%" sub="Avg. per event" icon={TrendingUp} accent="var(--success)" delay={120} />
      </div>

      <Card>
        <h3 className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Vision 2030 Event Alignment</h3>
        <div className="space-y-4">
          {[
            { pillar: "Innovation", count: 18, pct: 43, color: "var(--info)" },
            { pillar: "Community Development", count: 14, pct: 33, color: "#8A63D6" },
            { pillar: "Sustainability", count: 10, pct: 24, color: "var(--success)" },
          ].map((item) => (
            <div key={item.pillar}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.pillar}</span>
                <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>{item.count} events · {item.pct}%</span>
              </div>
              <ProgressBar value={item.pct} max={100} color={item.color} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Club Engagement Leaderboard</h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: "Google Developer Student Club", score: 94, members: 142 },
            { rank: 2, name: "Sports Federation", score: 88, members: 430 },
            { rank: 3, name: "YU Entrepreneurship Club", score: 82, members: 211 },
            { rank: 4, name: "Environmental Society", score: 76, members: 89 },
            { rank: 5, name: "YU Debate Society", score: 71, members: 67 },
          ].map((club) => (
            <div key={club.rank} className="flex items-center gap-4">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: club.rank <= 3 ? "var(--brand-100)" : "var(--surface-sunken)", color: club.rank <= 3 ? "var(--brand-700)" : "var(--text-muted)" }}
              >
                {club.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{club.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{club.members} members</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-sunken)" }}>
                  <div className="h-full rounded-full" style={{ width: `${club.score}%`, background: club.rank === 1 ? "var(--gradient-brand)" : "var(--ink)" }} />
                </div>
                <span className="mono text-xs font-bold" style={{ color: "var(--text-primary)" }}>{club.score}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Notifications (shared) ───────────────────────────────────────────────────
function NotificationsView({ role }: { role: Role }) {
  const notifsByRole: Record<Role, { icon: LucideIcon; title: string; body: string; time: string; urgent: boolean }[]> = {
    student: [
      { icon: CalendarDays, title: "Event Reminder", body: "Google Developer Summit starts in 2 days. You're registered!", time: "Just now", urgent: true },
      { icon: Sparkles, title: "YU Points Earned", body: "You earned 50 points for attending the Debate Workshop.", time: "3h ago", urgent: false },
      { icon: Users, title: "Club Update", body: "GDSC: New meeting scheduled for Monday 4PM at Lab B1.", time: "1d ago", urgent: false },
    ],
    president: [
      { icon: CheckCircle2, title: "Event Approved", body: "Your AI Workshop event was approved by Dr. Al-Harbi.", time: "1h ago", urgent: true },
      { icon: UserPlus, title: "New Join Request", body: "3 new members requested to join your club.", time: "4h ago", urgent: false },
      { icon: TrendingUp, title: "Attendance Milestone", body: "Your club hit 90% attendance this week!", time: "2d ago", urgent: false },
    ],
    advisor: [
      { icon: ClipboardCheck, title: "New Proposal", body: "GDSC submitted a new event for your review.", time: "30m ago", urgent: true },
      { icon: Wallet, title: "Budget Request", body: "Environmental Society submitted a SAR 2,400 budget request.", time: "2h ago", urgent: true },
      { icon: CheckCircle2, title: "Report Ready", body: "Semester engagement report for your clubs is ready.", time: "1d ago", urgent: false },
    ],
    committee: [
      { icon: AlertTriangle, title: "Scheduling Conflict", body: "Two events are overlapping on Aug 15 — review calendar.", time: "1h ago", urgent: true },
      { icon: Star, title: "Evaluation Due", body: "3 events from July are pending your score.", time: "3h ago", urgent: true },
      { icon: BadgeCheck, title: "Certification Issued", body: "Certificate issued to Environmental Society.", time: "2d ago", urgent: false },
    ],
  }

  const notifs = notifsByRole[role]

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" subtitle={`${notifs.filter((n) => n.urgent).length} urgent · ${notifs.length} total`} />

      <div className="space-y-3">
        {notifs.map((n, i) => (
          <Card key={i} className="flex gap-4 items-start animate-fade-up" style={{ borderColor: n.urgent ? "var(--brand)" : "var(--border)", animationDelay: `${i * 50}ms` }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: n.urgent ? "var(--brand-100)" : "var(--surface-sunken)", color: n.urgent ? "var(--brand-700)" : "var(--text-muted)" }}
            >
              <n.icon size={17} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                <span className="text-xs mono shrink-0" style={{ color: "var(--text-muted)" }}>{n.time}</span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{n.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Main app shell ───────────────────────────────────────────────────────────
const USER_NAMES: Record<Role, string> = {
  student: "Sarah Al-Mutairi",
  president: "Ahmed Al-Zahrani",
  advisor: "Dr. Khalid Al-Harbi",
  committee: "Eng. Noura Al-Dosari",
}

const DEFAULT_VIEWS: Record<Role, View> = {
  student: "feed",
  president: "command",
  advisor: "approvals",
  committee: "calendar",
}

const VIEW_TITLES: Record<string, string> = {
  feed: "Home Feed",
  events: "Events Discovery Hub",
  "qr-pass": "My QR Pass",
  clubs: "My Clubs",
  rewards: "YU Rewards",
  notifications: "Notifications",
  command: "Command Center",
  "create-event": "Create Event",
  scanner: "QR Scanner",
  members: "Members",
  approvals: "Approvals",
  analytics: "Analytics",
  calendar: "Master Calendar",
  evaluation: "Event Evaluation",
  certifications: "Certifications",
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [view, setView] = useState<View>("feed")
  const [registered, setRegistered] = useState<number[]>(INITIAL_REGISTERED_EVENT_IDS)

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole)
    setView(DEFAULT_VIEWS[selectedRole])
  }

  const handleLogout = () => {
    setRole(null)
    setView("feed")
  }

  if (!role) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const renderView = () => {
    // Student
    if (view === "feed") return <StudentFeed registered={registered} />
    if (view === "events") return <EventsHub registered={registered} setRegistered={setRegistered} />
    if (view === "qr-pass") return <QRPass />
    if (view === "clubs") return <MyClubs />
    if (view === "rewards") return <RewardsView />
    // President
    if (view === "command") return <CommandCenter />
    if (view === "create-event") return <CreateEvent />
    if (view === "scanner") return <QRScanner />
    if (view === "members") return <MembersView />
    // Advisor
    if (view === "approvals") return <ApprovalsView />
    if (view === "analytics" && role === "advisor") return <AdvisorAnalytics />
    // Committee
    if (view === "calendar") return <MasterCalendar />
    if (view === "evaluation") return <EventEvaluation />
    if (view === "certifications") return <CertificationsView />
    if (view === "analytics" && role === "committee") return <CommitteeAnalytics />
    // Shared
    if (view === "notifications") return <NotificationsView role={role} />
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
      <Sidebar role={role} currentView={view} onNavigate={(v) => setView(v)} onLogout={handleLogout} userName={USER_NAMES[role]} />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="glass sticky top-0 z-10 px-8 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <p className="text-[10.5px] font-bold mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {ROLE_LABELS[role].toUpperCase()}
            </p>
            <h1 className="font-display font-bold text-lg leading-tight" style={{ color: "var(--text-primary)" }}>
              {VIEW_TITLES[view] ?? view}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("notifications")}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-px relative bg-white border"
              style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-xs)" }}
            >
              <Bell size={16} strokeWidth={2} color="var(--text-secondary)" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2" style={{ background: "var(--danger)", borderColor: "white" }} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-xs)" }}>
              <Avatar name={USER_NAMES[role]} size={24} tone="brand" />
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{USER_NAMES[role].split(" ")[0]}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
