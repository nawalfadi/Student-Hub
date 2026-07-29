import { useState, useEffect, type Dispatch, type SetStateAction } from "react"

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
    color: "#3B7DD8",
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
    color: "#1AA06D",
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
    color: "#C9A84C",
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
    color: "#7C3AED",
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
    color: "#D94040",
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
    color: "#3B7DD8",
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

// ─── Utility components ───────────────────────────────────────────────────────
function Badge({
  label,
  color = "#3B7DD8",
}: {
  label: string
  color?: string
}) {
  const bg = `${color}18`
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mono"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}

function Avatar({
  name,
  size = 36,
  bg = "var(--yu-navy)",
}: {
  name: string
  size?: number
  bg?: string
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "var(--yu-navy)",
}: {
  label: string
  value: string | number
  sub?: string
  icon: string
  accent?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--border)] flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${accent}14`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[var(--text-secondary)] font-medium">{label}</p>
        <p
          className="text-2xl font-bold mt-0.5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ProgressBar({ value, max, color = "var(--yu-gold)" }: { value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function EventPreviewCard({
  event,
  reason,
}: {
  event: EventItem
  reason?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="relative h-32 bg-gray-100">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge label={event.category} color={event.color} />
        </div>
      </div>
      <div className="p-4">
        <p
          className="font-bold text-sm mb-1"
          style={{ color: "var(--yu-navy)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {event.title}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {event.date} · {event.location}
        </p>
        {reason && (
          <p className="text-[11px] font-semibold mt-2" style={{ color: "var(--yu-gold)" }}>
            {reason}
          </p>
        )}
        <ProgressBar value={event.registered} max={event.capacity} color={event.color} />
        <p className="text-xs text-[var(--text-muted)] mt-1 mono">
          {event.registered}/{event.capacity} registered
        </p>
      </div>
    </div>
  )
}

function SemesterJourneyCard({ registered }: { registered: number[] }) {
  const months = buildSemesterJourney(registered)

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
      <h3
        className="font-bold text-base mb-4"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
      >
        Semester Journey
      </h3>

      {months.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Your journey starts here — join a club or attend an event to see it here.
        </p>
      ) : (
        <div className="space-y-6">
          {months.map((month) => (
            <div key={month.key}>
              <p
                className="font-bold text-sm mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
              >
                {month.label}
              </p>
              <div className="relative pl-6">
                <div
                  className="absolute left-[7px] top-2 bottom-2 w-px"
                  style={{ background: "var(--border)" }}
                />
                <div className="space-y-3">
                  {month.entries.map((entry) => (
                    <div key={entry.id} className="relative flex items-start gap-3">
                      <span
                        className="absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          background: "var(--yu-gold-pale)",
                          color: "var(--yu-gold)",
                          border: "1px solid var(--yu-gold)",
                        }}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <p className="text-sm text-[var(--text-secondary)] leading-snug">
                        {entry.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ minHeight: 200, background: "var(--yu-navy)" }}
      >
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&auto=format"
          alt="YU Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 p-8 flex items-end h-full min-h-[200px]">
          <div>
            <p className="text-[var(--yu-gold)] text-xs font-semibold mono mb-1">
              Campus Highlights
            </p>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              No upcoming featured events
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Check the Events Hub for new campus activities.
            </p>
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
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{ minHeight: 220, background: "var(--yu-navy)" }}
    >
      <img
        src={ev.image}
        alt={ev.title}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="relative z-10 p-8 flex items-end min-h-[220px]">
        <div>
          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {ev.title}
          </h2>
          {isHappening ? (
            <p className="text-[var(--yu-gold)] text-xs font-semibold mono mb-2">
              Happening Now
            </p>
          ) : (
            <div className="mb-2">
              <p className="text-[var(--yu-gold)] text-xs font-semibold mono mb-2">
                Starts in
              </p>
              <div className="flex gap-5">
                {countdown!.map((unit) => (
                  <div key={unit.label} className="min-w-[3rem]">
                    <p
                      className="text-2xl font-bold text-white leading-none"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {unit.value}
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: "rgba(201,168,76,0.75)" }}>
                      {unit.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-white/60 text-sm mt-1">
            {ev.date} · {ev.location} · {ev.capacity.toLocaleString()} capacity
          </p>
        </div>
      </div>
    </div>
  )
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className="text-2xl transition-transform hover:scale-110"
          style={{ color: s <= value ? "var(--yu-gold)" : "var(--border)" }}
        >
          ★
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
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill="var(--yu-navy)"
            />
          ) : null
        )
      )}
    </svg>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: Record<Role, { icon: string; label: string; view: View }[]> = {
  student: [
    { icon: "⊞", label: "Home Feed", view: "feed" },
    { icon: "◈", label: "Events Hub", view: "events" },
    { icon: "▣", label: "My QR Pass", view: "qr-pass" },
    { icon: "◎", label: "My Clubs", view: "clubs" },
    { icon: "⬡", label: "Rewards", view: "rewards" },
    { icon: "◉", label: "Notifications", view: "notifications" },
  ],
  president: [
    { icon: "⊞", label: "Command Center", view: "command" },
    { icon: "✦", label: "Create Event", view: "create-event" },
    { icon: "◈", label: "QR Scanner", view: "scanner" },
    { icon: "◎", label: "Members", view: "members" },
    { icon: "◉", label: "Notifications", view: "notifications" },
  ],
  advisor: [
    { icon: "◈", label: "Approvals", view: "approvals" },
    { icon: "⊞", label: "Analytics", view: "analytics" },
    { icon: "◉", label: "Notifications", view: "notifications" },
  ],
  committee: [
    { icon: "◈", label: "Master Calendar", view: "calendar" },
    { icon: "★", label: "Event Evaluation", view: "evaluation" },
    { icon: "◎", label: "Certifications", view: "certifications" },
    { icon: "⊞", label: "Analytics", view: "analytics" },
    { icon: "◉", label: "Notifications", view: "notifications" },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  president: "Club President",
  advisor: "Club Advisor",
  committee: "Student Affairs",
}

const ROLE_COLORS: Record<Role, string> = {
  student: "#3B7DD8",
  president: "#7C3AED",
  advisor: "#1AA06D",
  committee: "#C9A84C",
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
  const roleColor = ROLE_COLORS[role]

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        background: "var(--yu-navy-dark)",
        width: 240,
        minWidth: 240,
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base shrink-0"
            style={{ background: "var(--yu-gold)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            YU
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Al Yamamah
            </p>
            <p className="text-[var(--yu-gold)] text-xs font-medium mono">Student Hub</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 mb-6">
        <div
          className="rounded-xl px-3 py-2 flex items-center gap-2.5"
          style={{ background: `${roleColor}22` }}
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: roleColor }} />
          <span className="text-xs font-semibold" style={{ color: roleColor }}>
            {ROLE_LABELS[role]}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((item) => {
          const active = currentView === item.view
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: active ? `${roleColor}28` : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.52)",
              }}
            >
              <span className="text-base w-5 text-center" style={{ color: active ? roleColor : undefined }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3">
          <Avatar name={userName} size={34} bg="var(--yu-gold)" />
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{userName}</p>
            <p className="text-white/40 text-xs mono truncate">YU · {new Date().getFullYear()}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-white/30 hover:text-white/70 text-lg transition-all"
            title="Sign out"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Login / Role selector ────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [step, setStep] = useState<"login" | "onboarding">("login")

  const roles: { value: Role; label: string; icon: string; desc: string }[] = [
    { value: "student", label: "Student", icon: "👩‍🎓", desc: "Access events, clubs & your campus life" },
    { value: "president", label: "Club President", icon: "👑", desc: "Manage your club, events & members" },
    { value: "advisor", label: "Club Advisor", icon: "🛡️", desc: "Oversee clubs and approve proposals" },
    { value: "committee", label: "Student Affairs", icon: "🏛️", desc: "University-wide oversight & analytics" },
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
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--yu-navy-dark)" }}>
        <div className="w-full max-w-md mx-auto px-6">
          <div
            className="rounded-3xl p-8"
            style={{ background: "var(--yu-navy)" }}
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">{roles.find((r) => r.value === role)?.icon}</div>
              <h2 className="text-2xl font-bold text-white">
                Welcome, {ROLE_LABELS[role]}
              </h2>
              <p className="text-white/50 text-sm mt-1">Here's what you can do</p>
            </div>
            <div className="space-y-4 mb-8">
              {onboardingText[role].map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "var(--yu-gold)", color: "var(--yu-navy-dark)" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onLogin(role)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: "var(--yu-gold)", color: "var(--yu-navy-dark)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Enter Your Hub →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--yu-navy-dark)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ background: "var(--yu-navy)" }}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg"
              style={{ background: "var(--yu-gold)" }}
            >
              YU
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Al Yamamah University
              </p>
              <p className="text-[var(--yu-gold)] text-sm mono">Student Hub</p>
            </div>
          </div>
          <h1
            className="text-4xl font-extrabold text-white leading-snug mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Your Campus,
            <br />
            <span style={{ color: "var(--yu-gold)" }}>Connected.</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            One platform for events, clubs, attendance, and your entire campus life journey at YU.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: "◈", label: "1,400+ Events hosted this year" },
            { icon: "◎", label: "42 Active student clubs" },
            { icon: "⬡", label: "Vision 2030 aligned programs" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-white/60 text-sm">
              <span style={{ color: "var(--yu-gold)" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Sign In
          </h2>
          <p className="text-white/40 text-sm mb-8">Use your YU university credentials</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-white/60 text-xs font-medium mono block mb-1.5">
                UNIVERSITY EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s2022XXXXX@yu.edu.sa"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                }}
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium mono block mb-1.5">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                }}
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium mono block mb-1.5">
                ROLE
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className="flex flex-col items-start px-3 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: role === r.value ? `${ROLE_COLORS[r.value]}22` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${role === r.value ? ROLE_COLORS[r.value] : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <span className="text-lg mb-1">{r.icon}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: role === r.value ? ROLE_COLORS[r.value] : "rgba(255,255,255,0.6)" }}
                    >
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("onboarding")}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 mb-4"
            style={{ background: "var(--yu-gold)", color: "var(--yu-navy-dark)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Continue
          </button>
          <p className="text-center text-white/30 text-xs">
            Authorized users only · Al Yamamah University
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Student views ─────────────────────────────────────────────────────────────
function StudentFeed({ registered }: { registered: number[] }) {
  const todaySchedule = EVENTS
    .filter((ev) => registered.includes(ev.id) && ev.date === TODAY_LABEL)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

  const recommended = getRecommendedEvents(registered, 3)
  const upcoming = EVENTS.filter(
    (ev) => ev.date !== TODAY_LABEL && !registered.includes(ev.id) && !recommended.some((r) => r.id === ev.id)
  ).slice(0, 2)

  return (
    <div className="space-y-6">
      <FeaturedHeroBanner />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Events Attended" value={12} sub="This semester" icon="◈" accent="#3B7DD8" />
        <StatCard label="Club Memberships" value={3} sub="Active" icon="◎" accent="#7C3AED" />
        <StatCard label="YU Points" value="1,840" sub="Rank #47" icon="⬡" accent="var(--yu-gold)" />
        <StatCard label="Certificates" value={5} sub="Earned" icon="★" accent="#1AA06D" />
      </div>

      {/* Today's Schedule + Announcements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <div className="flex items-baseline justify-between mb-4 gap-3">
            <h3
              className="font-bold text-base"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
            >
              Today's Schedule
            </h3>
            <span className="text-xs font-semibold mono" style={{ color: "var(--text-muted)" }}>
              {TODAY_LABEL}
            </span>
          </div>
          {todaySchedule.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              No events scheduled for today — check the Events Hub to find something happening this week.
            </p>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((ev) => (
                <div
                  key={ev.id}
                  className="flex gap-3 items-start p-3 rounded-xl"
                  style={{ background: "var(--surface)" }}
                >
                  <span
                    className="text-xs font-bold mono shrink-0 pt-0.5 w-[4.5rem]"
                    style={{ color: "var(--yu-navy)" }}
                  >
                    {ev.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--yu-navy)" }}>
                      {ev.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{ev.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <h3
            className="font-bold text-base mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
          >
            Announcements
          </h3>
          <div className="space-y-3">
            {[
              { from: "Student Affairs", text: "Registration for Fall 2026 clubs opens August 1st.", time: "2h ago", urgent: true },
              { from: "Google Dev Club", text: "New workshop slots available for the AI Summit — check Events Hub.", time: "5h ago", urgent: false },
              { from: "Sports Federation", text: "Tryouts for the basketball team are next Monday at 4PM.", time: "1d ago", urgent: false },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: "var(--surface)" }}>
                {a.urgent && (
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ background: "var(--danger)" }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold" style={{ color: "var(--yu-navy)" }}>
                    {a.from}
                  </span>{" "}
                  <span className="text-sm text-[var(--text-secondary)]">{a.text}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)] mono shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div>
        <h3
          className="font-bold text-base mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Recommended for You
        </h3>
        {recommended.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              You're all caught up — check the Events Hub when new campus events are posted.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recommended.map((ev) => (
              <EventPreviewCard key={ev.id} event={ev} reason={ev.reason} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming events preview */}
      {upcoming.length > 0 && (
      <div>
        <h3
          className="font-bold text-base mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Upcoming Events
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.map((ev) => (
            <EventPreviewCard key={ev.id} event={ev} />
          ))}
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
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Events Discovery Hub
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Find and register for campus events — your QR pass is generated automatically.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: filter === cat ? "var(--yu-navy)" : "white",
              color: filter === cat ? "white" : "var(--text-secondary)",
              border: `1px solid ${filter === cat ? "var(--yu-navy)" : "var(--border)"}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-4">
        {filtered.map((ev) => {
          const isReg = registered.includes(ev.id)
          return (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col md:flex-row"
            >
              <div className="relative w-full md:w-48 h-40 md:h-auto bg-gray-100 shrink-0">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p
                        className="font-bold text-base"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
                      >
                        {ev.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{ev.club}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      <Badge label={ev.category} color={ev.color} />
                      <Badge label={ev.vision2030} color="#1AA06D" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)] mb-3">
                    <span>📅 {ev.date}</span>
                    <span>⏰ {ev.time}</span>
                    <span>📍 {ev.location}</span>
                  </div>
                  <ProgressBar value={ev.registered} max={ev.capacity} color={ev.color} />
                  <p className="text-xs text-[var(--text-muted)] mt-1 mono">
                    {ev.registered} / {ev.capacity} spots filled
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setRegistered((prev) => isReg ? prev.filter((id) => id !== ev.id) : [...prev, ev.id])}
                    className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{
                      background: isReg ? "var(--surface)" : "var(--yu-navy)",
                      color: isReg ? "var(--text-secondary)" : "white",
                      border: `1px solid ${isReg ? "var(--border)" : "var(--yu-navy)"}`,
                    }}
                  >
                    {isReg ? "✓ Registered" : "Register / RSVP"}
                  </button>
                </div>
              </div>
            </div>
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
      <div>
        <h2
          className="text-xl font-bold text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          My QR Pass
        </h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mt-1">
          Show this at event check-in for instant attendance tracking
        </p>
      </div>

      {/* Pass card */}
      <div
        className="w-full rounded-3xl overflow-hidden"
        style={{ background: "var(--yu-navy)", boxShadow: "0 24px 64px rgba(15,28,61,0.32)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[var(--yu-gold)] text-xs font-bold mono">AL YAMAMAH UNIVERSITY</p>
            <p className="text-white text-sm font-semibold mt-0.5">Digital Student Pass</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm"
            style={{ background: "var(--yu-gold)", color: "var(--yu-navy-dark)" }}
          >
            YU
          </div>
        </div>

        {/* QR code */}
        <div className="mx-6 mb-4 rounded-2xl p-6 flex flex-col items-center qr-bg" style={{ background: "white" }}>
          <div
            className="transition-all duration-1000"
            style={{ opacity: animating ? 0.85 : 1, transform: animating ? "scale(0.97)" : "scale(1)" }}
          >
            <QRCode size={160} />
          </div>
          <p className="mono text-xs mt-3" style={{ color: "var(--yu-navy)" }}>
            S202210045-YU-2026
          </p>
        </div>

        {/* Student info */}
        <div className="px-6 pb-6 space-y-3">
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-white/40 mono">STUDENT</p>
              <p className="text-white font-semibold mt-0.5">Sarah Al-Mutairi</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 mono">ID NUMBER</p>
              <p className="text-white font-semibold mt-0.5 mono">202210045</p>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-white/40 mono">PROGRAM</p>
              <p className="text-white font-semibold mt-0.5">{STUDENT_MAJOR}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 mono">VALID UNTIL</p>
              <p className="text-[var(--yu-gold)] font-semibold mt-0.5 mono">May 2027</p>
            </div>
          </div>

          {/* Registered events */}
          <div
            className="rounded-xl p-3 mt-2"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <p className="text-white/40 text-xs mono mb-2">REGISTERED EVENTS</p>
            <div className="space-y-1.5">
              {EVENTS.slice(0, 3).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <p className="text-white/80 text-xs truncate flex-1 mr-2">{ev.title}</p>
                  <span className="text-[var(--yu-gold)] text-xs mono shrink-0">{ev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        QR code refreshes every 30 seconds for security. Attendance certificates are issued automatically after scanning.
      </p>
    </div>
  )
}

function MyClubs() {
  const [joined, setJoined] = useState([1, 2, 5])

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          My Clubs
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage your memberships and stay up to date with club activity.
        </p>
      </div>

      <div className="space-y-3">
        {CLUBS.map((club) => {
          const isJoined = joined.includes(club.id)
          const catColors: Record<string, string> = {
            Tech: "#3B7DD8", Academic: "#7C3AED", Cultural: "#C9A84C", Sports: "#D94040",
          }
          const color = catColors[club.category] || "#3B7DD8"
          return (
            <div
              key={club.id}
              className="bg-white rounded-2xl border border-[var(--border)] p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: color }}
              >
                {club.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-sm"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
                >
                  {club.name}
                </p>
                <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
                  <span>{club.members} members</span>
                  <span>·</span>
                  <span>{club.meetings}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge label={club.category} color={color} />
                <button
                  onClick={() =>
                    setJoined((prev) =>
                      isJoined ? prev.filter((id) => id !== club.id) : [...prev, club.id]
                    )
                  }
                  className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: isJoined ? "var(--surface)" : "var(--yu-navy)",
                    color: isJoined ? "var(--text-secondary)" : "white",
                    border: `1px solid ${isJoined ? "var(--border)" : "var(--yu-navy)"}`,
                  }}
                >
                  {isJoined ? "Joined ✓" : "Join"}
                </button>
              </div>
            </div>
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
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          YU Rewards & XP
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Earn points and unlock campus perks.</p>
      </div>

      {/* XP card */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center"
        style={{ background: "var(--yu-navy)" }}
      >
        <div className="text-center">
          <p className="text-[var(--yu-gold)] text-xs font-bold mono mb-1">YOUR YU POINTS</p>
          <p
            className="text-5xl font-extrabold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            1,840
          </p>
          <p className="text-white/40 text-sm mt-1">Campus Rank #47</p>
        </div>
        <div className="flex-1 w-full">
          <p className="text-white/60 text-xs mb-2">Next reward at 2,000 pts</p>
          <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="h-full rounded-full" style={{ width: "92%", background: "var(--yu-gold)" }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Events", pts: "+50 pts" },
              { label: "Clubs", pts: "+100 pts" },
              { label: "Volunteering", pts: "+200 pts" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.07)" }}>
                <p className="text-[var(--yu-gold)] text-xs font-bold mono">{item.pts}</p>
                <p className="text-white/60 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3
          className="font-bold text-base mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Your Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className="bg-white rounded-2xl border border-[var(--border)] p-4 text-center transition-all hover:-translate-y-0.5"
              style={{ opacity: badge.earned ? 1 : 0.45 }}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p
                className="font-bold text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
              >
                {badge.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{badge.desc}</p>
              {badge.earned && (
                <span
                  className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--yu-gold-pale)", color: "var(--yu-gold)" }}
                >
                  Earned
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Perks */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <h3
          className="font-bold text-base mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Redeem Points
        </h3>
        <div className="space-y-3">
          {[
            { perk: "Cafeteria 15% Discount", cost: "500 pts", available: true },
            { perk: "Priority Course Registration", cost: "1,200 pts", available: true },
            { perk: "YU Branded Hoodie", cost: "2,500 pts", available: false },
            { perk: "Parking Priority Pass (1 month)", cost: "800 pts", available: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--surface)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--yu-navy)" }}>{item.perk}</p>
                <p className="text-xs mono" style={{ color: "var(--yu-gold)" }}>{item.cost}</p>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: item.available ? "var(--yu-navy)" : "var(--border)",
                  color: item.available ? "white" : "var(--text-muted)",
                  cursor: item.available ? "pointer" : "not-allowed",
                }}
                disabled={!item.available}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── President views ──────────────────────────────────────────────────────────
function CommandCenter() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Club Command Center
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Google Developer Student Club · Spring 2026</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Members" value={142} sub="+12 this month" icon="◎" accent="#7C3AED" />
        <StatCard label="Pending Requests" value={6} sub="Awaiting approval" icon="◈" accent="var(--warning)" />
        <StatCard label="Events This Sem." value={8} sub="3 upcoming" icon="✦" accent="#3B7DD8" />
        <StatCard label="Avg. Attendance" value="78%" sub="Up from 65%" icon="⬡" accent="#1AA06D" />
      </div>

      {/* Join requests */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-bold text-base"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
          >
            Pending Join Requests
          </h3>
          <Badge label="6 pending" color="var(--warning)" />
        </div>
        <div className="space-y-3">
          {[
            { name: "Mohammed Al-Rashid", major: "Computer Science", year: "2nd year", id: "202310089" },
            { name: "Hessa Al-Qahtani", major: "Information Systems", year: "3rd year", id: "202210201" },
            { name: "Yousuf Al-Anzi", major: "Cybersecurity", year: "1st year", id: "202410015" },
          ].map((req, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: "var(--surface)" }}>
              <Avatar name={req.name} size={36} bg="var(--yu-navy-mid)" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--yu-navy)" }}>{req.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{req.major} · {req.year} · <span className="mono">{req.id}</span></p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "#1AA06D" }}
                >
                  Approve
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                  style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement chart — simple visual */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <h3
          className="font-bold text-base mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Monthly Attendance
        </h3>
        <div className="flex items-end gap-3 h-32">
          {[
            { month: "Feb", val: 55 }, { month: "Mar", val: 72 }, { month: "Apr", val: 68 },
            { month: "May", val: 85 }, { month: "Jun", val: 79 }, { month: "Jul", val: 91 },
          ].map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold mono" style={{ color: "var(--yu-navy)" }}>{d.val}%</p>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{ height: `${(d.val / 100) * 96}px`, background: "var(--yu-navy)" }}
              />
              <p className="text-xs text-[var(--text-muted)] mono">{d.month}</p>
            </div>
          ))}
        </div>
      </div>
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Event Submitted!
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          Your event has been sent to your club advisor for approval.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-white"
          style={{ background: "var(--yu-navy)" }}
        >
          Create Another
        </button>
      </div>
    )
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs font-semibold mono block mb-1.5" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all"
        style={{ borderColor: "var(--border)", background: "white", color: "var(--text-primary)" }}
      />
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Create New Event
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Fill in the details and submit for advisor approval.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-4">
        {field("EVENT NAME", "name", "text", "e.g. AI Workshop Series")}
        <div>
          <label className="text-xs font-semibold mono block mb-1.5" style={{ color: "var(--text-secondary)" }}>
            DESCRIPTION
          </label>
          <textarea
            rows={3}
            placeholder="Describe the event, its goals, and expected outcomes..."
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none"
            style={{ borderColor: "var(--border)", background: "white", color: "var(--text-primary)" }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field("DATE", "date", "date")}
          {field("TIME", "time", "time")}
        </div>
        {field("LOCATION", "location", "text", "e.g. Tuwaiq Auditorium")}
        {field("CAPACITY", "capacity", "number", "e.g. 150")}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold mono block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              CATEGORY
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ borderColor: "var(--border)", background: "white", color: "var(--text-primary)" }}
            >
              {["Tech", "Academic", "Cultural", "Sports"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mono block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              VISION 2030 TAG
            </label>
            <select
              value={form.vision2030}
              onChange={(e) => setForm((f) => ({ ...f, vision2030: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{ borderColor: "var(--border)", background: "white", color: "var(--text-primary)" }}
            >
              {["Innovation", "Sustainability", "Community Development"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div
          className="rounded-xl p-4 border-2 border-dashed text-center cursor-pointer hover:opacity-70 transition-all"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-2xl mb-1">🖼</p>
          <p className="text-sm text-[var(--text-muted)]">Upload event poster (JPG, PNG)</p>
        </div>
      </div>

      <button
        onClick={() => setSubmitted(true)}
        className="px-8 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
        style={{ background: "var(--yu-navy)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Submit for Approval →
      </button>
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
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Live QR Check-In Scanner
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Scan member QR passes for instant attendance logging.</p>
      </div>

      {/* Scanner UI */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col items-center"
        style={{ background: "var(--yu-navy-dark)" }}
      >
        <div className="relative w-full" style={{ height: 260 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-48 h-48 rounded-2xl border-2 relative"
              style={{ borderColor: scanning ? "var(--yu-gold)" : "rgba(255,255,255,0.3)" }}
            >
              {/* Corner accents */}
              {[
                "top-0 left-0 border-t-2 border-l-2",
                "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "bottom-0 right-0 border-b-2 border-r-2",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 ${cls}`}
                  style={{ borderColor: "var(--yu-gold)" }}
                />
              ))}
              {scanning && (
                <div
                  className="absolute left-0 right-0 h-0.5"
                  style={{
                    background: "var(--yu-gold)",
                    top: "50%",
                    animation: "none",
                    boxShadow: "0 0 12px var(--yu-gold)",
                  }}
                />
              )}
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/30 text-xs text-center">Point camera at<br/>student QR Pass</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-white/40 text-xs mono">
              {scanning ? "SCANNING..." : "READY TO SCAN"}
            </p>
          </div>
        </div>

        <button
          onClick={simulateScan}
          disabled={scanning}
          className="mx-6 mb-6 w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{
            background: scanning ? "rgba(255,255,255,0.12)" : "var(--yu-gold)",
            color: scanning ? "rgba(255,255,255,0.4)" : "var(--yu-navy-dark)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {scanning ? "Scanning..." : "Simulate Scan"}
        </button>
      </div>

      {/* Log */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-bold text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
          >
            Attendance Log
          </h3>
          <Badge label={`${scanned.length} checked in`} color="#1AA06D" />
        </div>
        {scanned.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">No scans yet</p>
        ) : (
          <div className="space-y-2">
            {scanned.map((id) => {
              const member = MEMBERS.find((m) => m.id_num === id)
              return (
                <div key={id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "#1AA06D11" }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#1AA06D" }} />
                  <p className="text-sm font-semibold flex-1" style={{ color: "var(--yu-navy)" }}>
                    {member?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs mono text-[var(--text-muted)]">{id}</p>
                  <span className="text-xs text-[#1AA06D]">✓</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function MembersView() {
  const [members, setMembers] = useState(MEMBERS)

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Member Management
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">142 total members · Google Developer Student Club</p>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                {["Member", "ID", "Attendance", "Joined", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr
                  key={m.id}
                  className="border-b transition-all hover:bg-[var(--surface)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size={32} />
                      <span className="font-semibold" style={{ color: "var(--yu-navy)" }}>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 mono text-xs text-[var(--text-muted)]">{m.id_num}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={m.attendance} max={10} color="var(--yu-navy)" />
                      <span className="text-xs mono text-[var(--text-muted)] shrink-0">{m.attendance}/10</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[var(--text-muted)]">{m.joined}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      label={m.status}
                      color={m.status === "active" ? "#1AA06D" : m.status === "pending" ? "var(--warning)" : "var(--text-muted)"}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {m.status === "pending" && (
                        <button
                          className="text-xs font-bold text-[#1AA06D] hover:underline"
                          onClick={() =>
                            setMembers((prev) => prev.map((mem) => mem.id === m.id ? { ...mem, status: "active" } : mem))
                          }
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="text-xs font-bold text-[var(--danger)] hover:underline"
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
      </div>
    </div>
  )
}

// ─── Advisor views ────────────────────────────────────────────────────────────
function ApprovalsView() {
  const [approvals, setApprovals] = useState(PENDING_APPROVALS)
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [modal, setModal] = useState<number | null>(null)

  const approve = (id: number) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)))
    setModal(null)
  }

  const requestChanges = (id: number) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: "changes-requested" } : a)))
    setModal(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Oversight & Approvals
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Review club event and budget proposals.</p>
      </div>

      <div className="space-y-4">
        {approvals.map((a) => {
          const statusColors: Record<string, string> = {
            pending: "var(--warning)",
            approved: "#1AA06D",
            "changes-requested": "var(--danger)",
          }
          return (
            <div key={a.id} className="bg-white rounded-2xl border border-[var(--border)] p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p
                    className="font-bold text-base"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
                  >
                    {a.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {a.club} · Submitted by {a.submittedBy} · {a.date}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <Badge label={a.type} color="#3B7DD8" />
                  <Badge label={a.vision2030} color="#1AA06D" />
                  <Badge label={a.status} color={statusColors[a.status]} />
                </div>
              </div>

              {a.status === "pending" && (
                <>
                  <div className="mb-3">
                    <textarea
                      rows={2}
                      placeholder="Add feedback notes (optional)..."
                      value={feedback[a.id] || ""}
                      onChange={(e) => setFeedback((f) => ({ ...f, [a.id]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none"
                      style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(a.id)}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ background: "#1AA06D" }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => requestChanges(a.id)}
                      className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                      style={{ background: "var(--surface)", color: "var(--danger)", border: "1px solid var(--danger)" }}
                    >
                      Request Changes
                    </button>
                  </div>
                </>
              )}

              {a.status !== "pending" && (
                <p
                  className="text-sm font-semibold"
                  style={{ color: statusColors[a.status] }}
                >
                  {a.status === "approved" ? "✓ Approved" : "⚠ Changes Requested"}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdvisorAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Club Performance Analytics
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Spring 2026 semester overview for supervised clubs.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Supervised Clubs" value={3} icon="◎" accent="#7C3AED" />
        <StatCard label="Events Approved" value={14} sub="This semester" icon="✓" accent="#1AA06D" />
        <StatCard label="Students Reached" value="2,140" icon="◈" accent="#3B7DD8" />
      </div>

      {CLUBS.slice(0, 3).map((club) => {
        const engagement = [78, 91, 65][club.id - 1] ?? 70
        return (
          <div key={club.id} className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-center justify-between mb-3">
              <p
                className="font-bold text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
              >
                {club.name}
              </p>
              <span
                className="text-lg font-extrabold mono"
                style={{ color: engagement > 80 ? "#1AA06D" : "var(--warning)" }}
              >
                {engagement}%
              </span>
            </div>
            <ProgressBar value={engagement} max={100} color={engagement > 80 ? "#1AA06D" : "var(--warning)"} />
            <div className="flex gap-6 mt-3 text-xs text-[var(--text-muted)]">
              <span>{club.members} members</span>
              <span>4 events this semester</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Committee views ──────────────────────────────────────────────────────────
function MasterCalendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const eventDays: Record<number, string> = {
    10: "#C9A84C", 15: "#7C3AED", 20: "#D94040", 28: "#3B7DD8", 3: "#1AA06D",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Master Event Calendar
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          University-wide event overview — prevents scheduling conflicts.
        </p>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3
            className="font-bold text-base"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
          >
            August 2026
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--surface)" }}>
              ‹
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--surface)" }}>
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-xs font-bold mono py-1" style={{ color: "var(--text-muted)" }}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Offset for Aug 1 being Saturday (index 6) */}
          {Array(6).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((day) => {
            const hasEvent = eventDays[day]
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all hover:opacity-80 relative"
                style={{
                  background: hasEvent ? `${hasEvent}18` : "transparent",
                  color: hasEvent ? hasEvent : "var(--text-primary)",
                  fontWeight: hasEvent ? 700 : 400,
                }}
              >
                {day}
                {hasEvent && (
                  <div
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ background: hasEvent }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* All events list */}
      <div className="space-y-3">
        <h3
          className="font-bold text-base"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          All Scheduled Events
        </h3>
        {EVENTS.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: ev.color }}
            >
              {ev.date.split(" ")[1].replace(",", "")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--yu-navy)" }}>{ev.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{ev.club} · {ev.location}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge label={ev.category} color={ev.color} />
              <Badge label={ev.vision2030} color="#1AA06D" />
            </div>
          </div>
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
      prev.map((e) =>
        e.id === eventId
          ? { ...e, scores: { ...tempScores } as typeof e.scores, evaluated: true }
          : e
      )
    )
    setActiveEvent(null)
    setTempScores({})
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Event Evaluation & Scoring
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Review and score completed events using the YU rubric.</p>
      </div>

      <div className="space-y-4">
        {events.map((ev) => {
          const isActive = activeEvent === ev.id
          const attendPct = Math.round((ev.attendance / ev.capacity) * 100)

          return (
            <div key={ev.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p
                      className="font-bold text-base"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
                    >
                      {ev.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{ev.club} · {ev.date}</p>
                  </div>
                  <Badge
                    label={ev.evaluated ? "Evaluated" : "Pending Review"}
                    color={ev.evaluated ? "#1AA06D" : "var(--warning)"}
                  />
                </div>

                <div className="flex gap-6 text-sm mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mono">ATTENDANCE</p>
                    <p className="font-bold" style={{ color: "var(--yu-navy)" }}>
                      {ev.attendance} / {ev.capacity}
                      <span className="text-xs ml-1 font-normal" style={{ color: attendPct > 85 ? "#1AA06D" : "var(--text-muted)" }}>
                        ({attendPct}%)
                      </span>
                    </p>
                  </div>
                </div>

                {ev.evaluated && !isActive && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {Object.entries(ev.scores).map(([key, val]) => (
                      <div key={key} className="text-center p-2 rounded-xl" style={{ background: "var(--surface)" }}>
                        <p className="text-xs text-[var(--text-muted)] mono capitalize">{key}</p>
                        <p className="font-bold text-lg" style={{ color: "var(--yu-gold)" }}>{val}/5</p>
                      </div>
                    ))}
                  </div>
                )}

                {!ev.evaluated && !isActive && (
                  <button
                    onClick={() => {
                      setActiveEvent(ev.id)
                      setTempScores({ organization: 0, turnout: 0, impact: 0, creativity: 0 })
                    }}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "var(--yu-navy)" }}
                  >
                    Start Evaluation
                  </button>
                )}
              </div>

              {/* Scoring panel */}
              {isActive && (
                <div className="border-t p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <p
                    className="font-bold text-sm mb-4"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
                  >
                    Scoring Rubric
                  </p>
                  <div className="space-y-4">
                    {[
                      { key: "organization", label: "Organization & Logistics" },
                      { key: "turnout", label: "Attendance Turnout" },
                      { key: "impact", label: "Impact on Student Life (Vision 2030)" },
                      { key: "creativity", label: "Creativity & Innovation" },
                    ].map((criterion) => (
                      <div key={criterion.key} className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>
                          {criterion.label}
                        </p>
                        <StarRating
                          value={tempScores[criterion.key] ?? 0}
                          onChange={(v) => setTempScores((s) => ({ ...s, [criterion.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={() => submitEval(ev.id)}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background: "var(--yu-navy)" }}
                    >
                      Submit Evaluation
                    </button>
                    <button
                      onClick={() => setActiveEvent(null)}
                      className="px-5 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Official Certification Generator
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Issue recognition certificates to clubs for high-scoring events.
        </p>
      </div>

      {eligibleEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-[var(--text-muted)] text-sm">
            No evaluated events yet. Complete evaluations to unlock certifications.
          </p>
        </div>
      ) : (
        eligibleEvents.map((ev) => {
          const avg = Object.values(ev.scores).reduce((s, v) => s + v, 0) / 4
          const isIssued = issued.includes(ev.id)

          return (
            <div key={ev.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "var(--yu-gold-pale)", color: "var(--yu-gold)" }}
                >
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-sm"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
                  >
                    {ev.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{ev.club}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-sm" style={{ color: s <= avg ? "var(--yu-gold)" : "var(--border)" }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs mono text-[var(--text-muted)]">{avg.toFixed(1)} avg</span>
                  </div>
                </div>
                <button
                  onClick={() => setIssued((prev) => (isIssued ? prev : [...prev, ev.id]))}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 shrink-0"
                  style={{
                    background: isIssued ? "#1AA06D18" : "var(--yu-gold)",
                    color: isIssued ? "#1AA06D" : "var(--yu-navy-dark)",
                    border: isIssued ? "1px solid #1AA06D40" : "none",
                  }}
                >
                  {isIssued ? "✓ Certificate Issued" : "Issue Certificate"}
                </button>
              </div>

              {isIssued && (
                <div
                  className="mx-5 mb-5 rounded-2xl p-6 text-center"
                  style={{ background: "var(--yu-navy)", border: "2px solid var(--yu-gold)" }}
                >
                  <p className="text-[var(--yu-gold)] text-xs font-bold mono mb-1">CERTIFICATE OF EXCELLENCE</p>
                  <p
                    className="text-white text-lg font-bold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Al Yamamah University
                  </p>
                  <p className="text-white/60 text-xs mt-1 mb-3">
                    This certifies that
                  </p>
                  <p
                    className="text-[var(--yu-gold)] text-xl font-extrabold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {ev.club}
                  </p>
                  <p className="text-white/60 text-xs mt-1 mb-1">
                    has successfully organized
                  </p>
                  <p className="text-white font-semibold text-sm">{ev.title}</p>
                  <p className="text-white/40 text-xs mt-3 mono">Issued by Student Affairs Committee · {new Date().toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

function CommitteeAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          University-Wide Analytics
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Student engagement and club activity across YU, Spring 2026.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={42} sub="This semester" icon="◈" accent="#3B7DD8" />
        <StatCard label="Student Engagement" value="73%" sub="+8% vs last sem." icon="⬡" accent="var(--yu-gold)" />
        <StatCard label="Active Clubs" value={18} sub="Out of 22 registered" icon="◎" accent="#7C3AED" />
        <StatCard label="Attendance Rate" value="81%" sub="Avg. per event" icon="★" accent="#1AA06D" />
      </div>

      {/* Vision 2030 breakdown */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <h3
          className="font-bold text-sm mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Vision 2030 Event Alignment
        </h3>
        <div className="space-y-4">
          {[
            { pillar: "Innovation", count: 18, pct: 43, color: "#3B7DD8" },
            { pillar: "Community Development", count: 14, pct: 33, color: "#7C3AED" },
            { pillar: "Sustainability", count: 10, pct: 24, color: "#1AA06D" },
          ].map((item) => (
            <div key={item.pillar}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold" style={{ color: "var(--yu-navy)" }}>{item.pillar}</span>
                <span className="mono text-xs text-[var(--text-muted)]">{item.count} events · {item.pct}%</span>
              </div>
              <ProgressBar value={item.pct} max={100} color={item.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Club leaderboard */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <h3
          className="font-bold text-sm mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Club Engagement Leaderboard
        </h3>
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
                style={{
                  background: club.rank <= 3 ? "var(--yu-gold-pale)" : "var(--surface)",
                  color: club.rank <= 3 ? "var(--yu-gold)" : "var(--text-muted)",
                }}
              >
                {club.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--yu-navy)" }}>
                  {club.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{club.members} members</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${club.score}%`, background: club.rank === 1 ? "var(--yu-gold)" : "var(--yu-navy)" }}
                  />
                </div>
                <span className="mono text-xs font-bold" style={{ color: "var(--yu-navy)" }}>{club.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Notifications (shared) ───────────────────────────────────────────────────
function NotificationsView({ role }: { role: Role }) {
  const notifsByRole: Record<Role, { icon: string; title: string; body: string; time: string; urgent: boolean }[]> = {
    student: [
      { icon: "◈", title: "Event Reminder", body: "Google Developer Summit starts in 2 days. You're registered!", time: "Just now", urgent: true },
      { icon: "⬡", title: "YU Points Earned", body: "You earned 50 points for attending the Debate Workshop.", time: "3h ago", urgent: false },
      { icon: "◎", title: "Club Update", body: "GDSC: New meeting scheduled for Monday 4PM at Lab B1.", time: "1d ago", urgent: false },
    ],
    president: [
      { icon: "✓", title: "Event Approved", body: "Your AI Workshop event was approved by Dr. Al-Harbi.", time: "1h ago", urgent: true },
      { icon: "◎", title: "New Join Request", body: "3 new members requested to join your club.", time: "4h ago", urgent: false },
      { icon: "◈", title: "Attendance Milestone", body: "Your club hit 90% attendance this week!", time: "2d ago", urgent: false },
    ],
    advisor: [
      { icon: "◈", title: "New Proposal", body: "GDSC submitted a new event for your review.", time: "30m ago", urgent: true },
      { icon: "★", title: "Budget Request", body: "Environmental Society submitted a SAR 2,400 budget request.", time: "2h ago", urgent: true },
      { icon: "✓", title: "Report Ready", body: "Semester engagement report for your clubs is ready.", time: "1d ago", urgent: false },
    ],
    committee: [
      { icon: "◈", title: "Scheduling Conflict", body: "Two events are overlapping on Aug 15 — review calendar.", time: "1h ago", urgent: true },
      { icon: "★", title: "Evaluation Due", body: "3 events from July are pending your score.", time: "3h ago", urgent: true },
      { icon: "◎", title: "Certification Issued", body: "Certificate issued to Environmental Society.", time: "2d ago", urgent: false },
    ],
  }

  const notifs = notifsByRole[role]

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
        >
          Notifications
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {notifs.filter((n) => n.urgent).length} urgent · {notifs.length} total
        </p>
      </div>

      <div className="space-y-3">
        {notifs.map((n, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border p-5 flex gap-4 items-start"
            style={{ borderColor: n.urgent ? "var(--yu-gold)" : "var(--border)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{
                background: n.urgent ? "var(--yu-gold-pale)" : "var(--surface)",
                color: n.urgent ? "var(--yu-gold)" : "var(--text-muted)",
              }}
            >
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm" style={{ color: "var(--yu-navy)" }}>{n.title}</p>
                <span className="text-xs mono text-[var(--text-muted)] shrink-0">{n.time}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{n.body}</p>
            </div>
          </div>
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
      <Sidebar
        role={role}
        currentView={view}
        onNavigate={(v) => setView(v)}
        onLogout={handleLogout}
        userName={USER_NAMES[role]}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 px-8 py-4 border-b flex items-center justify-between"
          style={{ background: "rgba(244,246,251,0.92)", borderColor: "var(--border)", backdropFilter: "blur(8px)" }}
        >
          <div>
            <p className="text-xs font-semibold mono" style={{ color: "var(--text-muted)" }}>
              {ROLE_LABELS[role].toUpperCase()}
            </p>
            <h1
              className="font-bold text-lg leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--yu-navy)" }}
            >
              {VIEW_TITLES[view] ?? view}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("notifications")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all hover:opacity-70 relative"
              style={{ background: "white", border: "1px solid var(--border)" }}
            >
              ◉
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                style={{ background: "var(--danger)", borderColor: "white" }}
              />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "white", border: "1px solid var(--border)" }}>
              <Avatar name={USER_NAMES[role]} size={24} bg={ROLE_COLORS[role]} />
              <span className="text-xs font-semibold" style={{ color: "var(--yu-navy)" }}>{USER_NAMES[role].split(" ")[0]}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  )
}
