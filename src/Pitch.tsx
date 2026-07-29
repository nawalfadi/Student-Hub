import { useState, useEffect, type ReactNode, type CSSProperties } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import yuLogoWhite from "./assets/yu-logo-white.png"
import { LangToggle, useLang } from "./i18n"
import {
  Eye,
  FileText,
  Scale,
  GraduationCap,
  Crown,
  ShieldCheck,
  Landmark,
  QrCode,
  ClipboardCheck,
  Bell,
  Trophy,
  BarChart3,
  SquarePen,
  ScanLine,
  Award,
  Gauge,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Sun,
  Moon,
  History,
  PenLine,
  Gavel,
} from "lucide-react"

type Theme = "light" | "dark"
const THEME_KEY = "yu-theme"

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light"
    }
    return "dark"
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return {
    theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  }
}

function tint(color: string, pct = 14, base = "var(--card)") {
  return `color-mix(in srgb, ${color} ${pct}%, ${base})`
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function EyebrowLabel({ children }: { children: ReactNode }) {
  const { isAr } = useLang()
  return (
    <p
      className={`text-[10.5px] font-bold uppercase ${isAr ? "tracking-[0.08em]" : "mono tracking-[0.2em]"}`}
      style={{ color: "var(--brand)" }}
    >
      {children}
    </p>
  )
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const { t } = useLang()
  const isDark = theme === "dark"
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? t("theme.light") : t("theme.dark")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-px bg-[var(--card)] border"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-md)", color: "var(--text-secondary)" }}
    >
      {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
    </button>
  )
}

function PrimaryButton({
  children,
  onClick,
  icon: Icon,
}: {
  children: ReactNode
  onClick: () => void
  icon?: LucideIcon
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] text-white hover:brightness-[1.05] hover:-translate-y-px px-7 py-3.5 text-[15px] gap-2.5"
      style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" }}
    >
      {children}
      {Icon && <Icon size={17} strokeWidth={2.25} />}
    </button>
  )
}

function ProblemCard({
  icon: Icon,
  label,
  body,
  delay,
}: {
  icon: LucideIcon
  label: string
  body: string
  delay: number
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className="h-full rounded-[var(--r-lg)] border p-5 text-start"
        style={{ borderColor: "var(--border)", background: "var(--card)", boxShadow: "var(--shadow-xs)" }}
      >
        <Icon size={18} strokeWidth={2} style={{ color: "var(--brand)" }} />
        <p className="font-display font-bold text-sm mt-3" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {body}
        </p>
      </div>
    </Reveal>
  )
}

function RoleCard({
  identity,
  summary,
  detail,
  color,
  icon: Icon,
  delay,
}: {
  identity: string
  summary: string
  detail: string
  color: string
  icon: LucideIcon
  delay: number
}) {
  const { isAr } = useLang()
  return (
    <Reveal delay={delay}>
      <div
        className="lift-hover rounded-[var(--r-xl)] p-7 h-full border relative overflow-hidden group text-start"
        style={{ borderColor: "var(--border)", background: "var(--card)", boxShadow: "var(--shadow-xs)" }}
      >
        <div
          className="absolute -top-10 w-32 h-32 rounded-full transition-transform duration-500 group-hover:scale-125 -end-10"
          style={{ background: tint(color, 14), filter: "blur(4px)" }}
        />
        <div className="relative z-10">
          <div
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center mb-5"
            style={{ background: tint(color, 13), color }}
          >
            <Icon size={23} strokeWidth={2} />
          </div>
          <p className="font-display font-extrabold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>
            {identity}
          </p>
          <p
            className={`text-[11px] font-bold uppercase mt-1.5 ${isAr ? "tracking-wide" : "mono tracking-widest"}`}
            style={{ color }}
          >
            {summary}
          </p>
          <p className="text-sm mt-3.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {detail}
          </p>
        </div>
      </div>
    </Reveal>
  )
}

function FeatureCard({
  name,
  blurb,
  color,
  icon: Icon,
  delay,
}: {
  name: string
  blurb: string
  color: string
  icon: LucideIcon
  delay: number
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className="h-full rounded-[var(--r-lg)] border p-5 flex flex-col gap-3.5 text-start"
        style={{ borderColor: "var(--border)", background: "var(--card)", boxShadow: "var(--shadow-xs)" }}
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: tint(color, 12), color }}
        >
          <Icon size={19} strokeWidth={2} />
        </div>
        <div>
          <p className="font-display font-bold text-[13.5px] leading-snug" style={{ color: "var(--text-primary)" }}>
            {name}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {blurb}
          </p>
        </div>
      </div>
    </Reveal>
  )
}

function FlowJourney({
  steps,
  note1,
  note2,
}: {
  steps: { icon: LucideIcon; label: string; desc: string; color: string }[]
  note1: string
  note2: string
}) {
  return (
    <div>
      <div className="relative">
        <div
          className="absolute top-[26px] left-[6%] right-[6%] h-px hidden lg:block"
          style={{ background: "var(--border)" }}
        />
        <motion.div
          className="absolute top-[26px] left-[6%] h-px hidden lg:block origin-left"
          style={{ background: "var(--gradient-brand)", right: "6%" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 shrink-0"
                style={{ background: s.color, boxShadow: `0 0 0 6px var(--surface), var(--shadow-md)` }}
              >
                <s.icon size={20} strokeWidth={2} color="white" />
              </div>
              <div>
                <p className="font-display font-bold text-[12.5px]" style={{ color: "var(--text-primary)" }}>
                  {s.label}
                </p>
                <p className="text-[11px] mt-1 leading-snug max-w-[8.5rem]" style={{ color: "var(--text-secondary)" }}>
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Reveal delay={0.45} className="mt-10">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs"
            style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}
          >
            <PenLine size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
            {note1}
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs"
            style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}
          >
            <Gavel size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
            {note2}
          </div>
        </div>
      </Reveal>
    </div>
  )
}

function GuardrailCard({
  icon: Icon,
  title,
  body,
  delay,
}: {
  icon: LucideIcon
  title: string
  body: string
  delay: number
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className="h-full rounded-[var(--r-lg)] border p-6 text-start"
        style={{ borderColor: "var(--border)", background: "var(--card)", boxShadow: "var(--shadow-xs)" }}
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--surface-sunken)", color: "var(--text-primary)" }}
        >
          <Icon size={19} strokeWidth={2} />
        </div>
        <p className="font-display font-bold text-[14.5px] mb-2" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {body}
        </p>
      </div>
    </Reveal>
  )
}

export default function Pitch() {
  const { theme, toggleTheme } = useTheme()
  const { t, isAr } = useLang()

  const openLiveDemo = () => {
    window.location.assign("/app")
  }

  const problems = [
    { icon: Eye, label: t("pitch.problem.1.label"), body: t("pitch.problem.1.body") },
    { icon: FileText, label: t("pitch.problem.2.label"), body: t("pitch.problem.2.body") },
    { icon: Scale, label: t("pitch.problem.3.label"), body: t("pitch.problem.3.body") },
  ]

  const roles = [
    {
      identity: t("pitch.role.student.identity"),
      summary: t("pitch.role.student.summary"),
      detail: t("pitch.role.student.detail"),
      color: "var(--brand)",
      icon: GraduationCap,
    },
    {
      identity: t("pitch.role.president.identity"),
      summary: t("pitch.role.president.summary"),
      detail: t("pitch.role.president.detail"),
      color: "#8A63D6",
      icon: Crown,
    },
    {
      identity: t("pitch.role.advisor.identity"),
      summary: t("pitch.role.advisor.summary"),
      detail: t("pitch.role.advisor.detail"),
      color: "var(--success)",
      icon: ShieldCheck,
    },
    {
      identity: t("pitch.role.committee.identity"),
      summary: t("pitch.role.committee.summary"),
      detail: t("pitch.role.committee.detail"),
      color: "var(--info)",
      icon: Landmark,
    },
  ]

  const features = [
    { icon: QrCode, name: t("pitch.feature.1.name"), blurb: t("pitch.feature.1.blurb"), color: "var(--brand)" },
    {
      icon: ClipboardCheck,
      name: t("pitch.feature.2.name"),
      blurb: t("pitch.feature.2.blurb"),
      color: "var(--success)",
    },
    { icon: Bell, name: t("pitch.feature.3.name"), blurb: t("pitch.feature.3.blurb"), color: "var(--info)" },
    { icon: Trophy, name: t("pitch.feature.4.name"), blurb: t("pitch.feature.4.blurb"), color: "#8A63D6" },
    {
      icon: BarChart3,
      name: t("pitch.feature.5.name"),
      blurb: t("pitch.feature.5.blurb"),
      color: "var(--warning)",
    },
  ]

  const flowSteps = [
    { icon: SquarePen, label: t("pitch.flow.1.label"), desc: t("pitch.flow.1.desc"), color: "#8A63D6" },
    { icon: ShieldCheck, label: t("pitch.flow.2.label"), desc: t("pitch.flow.2.desc"), color: "var(--success)" },
    { icon: Scale, label: t("pitch.flow.3.label"), desc: t("pitch.flow.3.desc"), color: "var(--info)" },
    { icon: Bell, label: t("pitch.flow.4.label"), desc: t("pitch.flow.4.desc"), color: "var(--brand)" },
    { icon: ScanLine, label: t("pitch.flow.5.label"), desc: t("pitch.flow.5.desc"), color: "var(--warning)" },
    { icon: Award, label: t("pitch.flow.6.label"), desc: t("pitch.flow.6.desc"), color: "var(--success)" },
  ]

  const guardrails = [
    { icon: FileText, title: t("pitch.trust.1.title"), body: t("pitch.trust.1.body") },
    { icon: Gauge, title: t("pitch.trust.2.title"), body: t("pitch.trust.2.body") },
    { icon: Scale, title: t("pitch.trust.3.title"), body: t("pitch.trust.3.body") },
  ]

  const auditFeed = [
    {
      actor: "Ahmed Al-Zahrani",
      role: t("pitch.audit.1.role"),
      action: t("pitch.audit.1.action"),
      time: t("pitch.audit.1.time"),
    },
    {
      actor: "Dr. Khalid Al-Harbi",
      role: t("pitch.audit.2.role"),
      action: t("pitch.audit.2.action"),
      time: t("pitch.audit.2.time"),
    },
    {
      actor: "Eng. Noura Al-Dosari",
      role: t("pitch.audit.3.role"),
      action: t("pitch.audit.3.action"),
      time: t("pitch.audit.3.time"),
    },
    {
      actor: "System",
      role: t("pitch.audit.4.role"),
      action: t("pitch.audit.4.action"),
      time: t("pitch.audit.4.time"),
    },
  ]

  const CtaArrow = isAr ? ArrowLeft : ArrowRight

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <div
        className="fixed top-5 z-[60] flex items-center gap-2"
        style={{ insetInlineEnd: "1.25rem" }}
      >
        <LangToggle />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-10 md:py-14 space-y-28 pb-20">
        {/* 1. Hero */}
        <section
          className="noise rounded-[var(--r-2xl)] overflow-hidden relative"
          style={{
            minHeight: "min(92vh, 720px)",
            background:
              "radial-gradient(120% 140% at 12% 0%, rgba(246,137,55,0.30) 0%, rgba(246,137,55,0) 55%), linear-gradient(165deg, #18181B 0%, #050507 100%)",
          }}
        >
          <div
            className="animate-float absolute w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: "#F68937", opacity: 0.16, filter: "blur(120px)", top: "-10%", left: "-6%", zIndex: 0 }}
          />
          <div
            className="absolute w-[320px] h-[320px] rounded-full pointer-events-none"
            style={{ background: "#8A63D6", opacity: 0.1, filter: "blur(120px)", bottom: "-8%", right: "4%", zIndex: 0 }}
          />
          <div className="relative z-10 min-h-[inherit] flex flex-col items-center justify-center text-center px-8 py-20">
            <Reveal>
              <img
                src={yuLogoWhite}
                alt="Al Yamamah University"
                className="h-9 md:h-10 w-auto mx-auto mb-7 opacity-90"
              />
            </Reveal>
            <Reveal delay={0.06}>
              <p
                className={`font-display text-[22px] md:text-[28px] font-extrabold uppercase mb-5 ${
                  isAr ? "tracking-[0.12em]" : "tracking-[0.18em]"
                }`}
                style={
                  {
                    background: "linear-gradient(135deg, #F68937 0%, #FFB35F 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  } as CSSProperties
                }
              >
                {t("pitch.wordmark")}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <h1 className="font-display text-[44px] md:text-[56px] font-extrabold text-white leading-[1.05] max-w-3xl">
                {t("pitch.heroLine1")}
                <br />
                <span
                  style={
                    {
                      background: "var(--gradient-brand)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    } as CSSProperties
                  }
                >
                  {t("pitch.heroLine2")}
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-[16px] mt-6 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {t("pitch.heroSub")}
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-12 flex flex-col items-center gap-5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold uppercase ${isAr ? "tracking-[0.1em]" : "tracking-widest"}`}
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {t("pitch.scroll")}
                </span>
                <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                  <ChevronDown size={15} strokeWidth={2.5} color="var(--brand)" />
                </motion.span>
              </div>
              <p
                className={`text-[11px] uppercase max-w-2xl leading-relaxed ${
                  isAr ? "tracking-[0.06em]" : "mono tracking-[0.12em]"
                }`}
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {t("pitch.credits")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* 2. The Problem */}
        <section className="text-center max-w-2xl mx-auto">
          <Reveal>
            <EyebrowLabel>{t("pitch.problem.eyebrow")}</EyebrowLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <p
              className="font-display text-[26px] md:text-[30px] font-bold mt-3 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("pitch.problem.title1")}
              <br />
              {t("pitch.problem.title2")}
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-[15px] mt-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {t("pitch.problem.sub")}
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {problems.map((p, i) => (
              <ProblemCard key={p.label} {...p} delay={0.1 * i} />
            ))}
          </div>
        </section>

        {/* 3. The Solution — roles */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-10">
            <Reveal>
              <EyebrowLabel>{t("pitch.solution.eyebrow")}</EyebrowLabel>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="font-display text-[26px] md:text-[30px] font-bold mt-3" style={{ color: "var(--text-primary)" }}>
                {t("pitch.solution.title")}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-[15px] mt-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {t("pitch.solution.sub")}
              </p>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roles.map((s, i) => (
              <RoleCard key={s.summary} {...s} delay={i * 0.1} />
            ))}
          </div>
        </section>

        {/* 4. Features */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-10">
            <Reveal>
              <EyebrowLabel>{t("pitch.features.eyebrow")}</EyebrowLabel>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="font-display text-[26px] md:text-[30px] font-bold mt-3" style={{ color: "var(--text-primary)" }}>
                {t("pitch.features.title")}
              </p>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {features.map((c, i) => (
              <FeatureCard key={c.name} {...c} delay={i * 0.08} />
            ))}
          </div>
        </section>

        {/* 5. How it works */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-14">
            <Reveal>
              <EyebrowLabel>{t("pitch.flow.eyebrow")}</EyebrowLabel>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="font-display text-[26px] md:text-[30px] font-bold mt-3" style={{ color: "var(--text-primary)" }}>
                {t("pitch.flow.title")}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-[15px] mt-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {t("pitch.flow.sub")}
              </p>
            </Reveal>
          </div>
          <FlowJourney steps={flowSteps} note1={t("pitch.flow.note1")} note2={t("pitch.flow.note2")} />
        </section>

        {/* 6. Trust */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-10">
            <Reveal>
              <EyebrowLabel>{t("pitch.trust.eyebrow")}</EyebrowLabel>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="font-display text-[26px] md:text-[30px] font-bold mt-3" style={{ color: "var(--text-primary)" }}>
                {t("pitch.trust.title")}
              </p>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {guardrails.map((g, i) => (
              <GuardrailCard key={g.title} {...g} delay={i * 0.1} />
            ))}
          </div>
        </section>

        {/* 7. Live audit trail */}
        <section>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-start">
              <Reveal>
                <EyebrowLabel>{t("pitch.audit.eyebrow")}</EyebrowLabel>
              </Reveal>
              <Reveal delay={0.08}>
                <p
                  className="font-display text-[26px] md:text-[30px] font-bold mt-3 leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("pitch.audit.title")}
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="text-[15px] mt-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {t("pitch.audit.sub")}
                </p>
              </Reveal>
              <Reveal delay={0.24} className="flex gap-3 mt-6">
                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                  <History size={14} strokeWidth={2} style={{ color: "var(--brand)" }} /> {t("pitch.audit.badge")}
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <div
                className="rounded-[var(--r-xl)] border p-2"
                style={{ borderColor: "var(--border)", background: "var(--card)", boxShadow: "var(--shadow-md)" }}
              >
                <div className="space-y-1.5 p-3">
                  {auditFeed.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl text-start"
                      style={{ background: "var(--surface-sunken)" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 animate-pulse-dot"
                        style={{ background: "var(--brand)" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                          <span className="font-bold">{e.actor}</span>{" "}
                          <span style={{ color: "var(--text-muted)" }}>({e.role})</span>{" "}
                          <span style={{ color: "var(--text-secondary)" }}>{e.action}</span>
                        </p>
                      </div>
                      <span className="text-[10.5px] mono shrink-0" style={{ color: "var(--text-muted)" }}>
                        {e.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 8. Closing CTA */}
        <section
          className="noise rounded-[var(--r-2xl)] overflow-hidden relative text-center"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div
            className="animate-float absolute w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{ background: "var(--brand)", opacity: 0.14, filter: "blur(120px)", top: "-20%", left: "-8%" }}
          />
          <div className="relative z-10 px-8 py-20 flex flex-col items-center">
            <Reveal>
              <Trophy size={30} strokeWidth={2} color="var(--brand)" />
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-display text-[28px] md:text-[36px] font-bold text-white mt-5 max-w-lg leading-tight">
                {t("pitch.cta.title")}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-sm mt-4 max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
                {t("pitch.cta.sub")}
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-8">
              <PrimaryButton icon={CtaArrow} onClick={openLiveDemo}>
                {t("pitch.cta.button")}
              </PrimaryButton>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  )
}
