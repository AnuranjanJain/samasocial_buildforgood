import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronRight,
  CircleGauge,
  FileBadge2,
  HeartHandshake,
  Home,
  IndianRupee,
  Languages,
  Leaf,
  MapPin,
  Menu,
  Moon,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  Sun,
  Send,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  Wheat,
  X,
} from 'lucide-react'
import { LogoMark, Wordmark } from './brand'
import {
  employers,
  farmOpportunities,
  impactMetrics,
  jobs,
  serviceRequests,
  workers,
} from './data'
import { copy, getLocale, languageOptions, type CopyKey, type LanguageCode } from './i18n'
import type { Employer, Job, MatchResult, Worker } from './types'
import './App.css'

type View = 'dashboard' | 'cockpit' | 'matches' | 'passport' | 'enterprise' | 'farm' | 'impact' | 'guide'
type ThemeMode = 'light' | 'dark'
type ChatMessage = {
  id: number
  role: 'bot' | 'user'
  text: string
}

const themeStorageKey = 'rozgaar-saathi-theme'
const languageStorageKey = 'rozgaar-saathi-language'

const viewItems: Array<{
  id: View
  labelKey: CopyKey
  icon: typeof WalletCards
}> = [
  { id: 'dashboard', labelKey: 'dashboard', icon: Home },
  { id: 'cockpit', labelKey: 'cockpit', icon: WalletCards },
  { id: 'matches', labelKey: 'jobMatching', icon: BriefcaseBusiness },
  { id: 'passport', labelKey: 'skillPassport', icon: FileBadge2 },
  { id: 'enterprise', labelKey: 'enterpriseKit', icon: Store },
  { id: 'farm', labelKey: 'farmStability', icon: Wheat },
  { id: 'impact', labelKey: 'impact', icon: HeartHandshake },
  { id: 'guide', labelKey: 'guideFaq', icon: BookOpenCheck },
]

function getInitialTheme(): ThemeMode {
  const saved = window.localStorage.getItem(themeStorageKey)
  return saved === 'dark' ? 'dark' : 'light'
}

function getInitialLanguage(): LanguageCode {
  const saved = window.localStorage.getItem(languageStorageKey)
  return languageOptions.some((option) => option.code === saved) ? (saved as LanguageCode) : 'en'
}

function getEmployer(job: Job): Employer {
  return employers.find((employer) => employer.id === job.employerId) ?? employers[0]
}

function getMatch(worker: Worker, job: Job): MatchResult {
  const matchedSkills = job.requiredSkills.filter((skill) => worker.skills.includes(skill))
  const missingSkills = job.requiredSkills.filter((skill) => !worker.skills.includes(skill))
  const segmentFit = job.goodFor.includes(worker.segment) ? 18 : 0
  const skillScore = Math.round((matchedSkills.length / job.requiredSkills.length) * 48)
  const distanceScore = job.distanceKm <= worker.distancePreferenceKm ? 14 : 7
  const employer = getEmployer(job)
  const employerScore = Math.round((employer.reliabilityScore + employer.paymentClarity) / 20)
  const womenFit =
    worker.womenWorkMode?.enabled && employer.womenFriendly && job.distanceKm <= worker.distancePreferenceKm
      ? 10
      : 0
  const score = Math.min(99, skillScore + segmentFit + distanceScore + employerScore + womenFit + 8)

  return {
    score,
    matchedSkills,
    missingSkills,
    reasons: [
      `${matchedSkills.length}/${job.requiredSkills.length} required skills already match`,
      `${job.distanceKm} km from preferred work area`,
      `${employer.reliabilityScore}% employer reliability with clear payment terms`,
    ],
  }
}

function getTopMatches(worker: Worker) {
  return jobs
    .map((job) => ({ job, employer: getEmployer(job), match: getMatch(worker, job) }))
    .sort((a, b) => b.match.score - a.match.score)
}

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers[0].id)
  const [selectedJobId, setSelectedJobId] = useState(jobs[0].id)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage)

  const t = (key: CopyKey) => copy[language][key] ?? copy.en[key]
  const locale = getLocale(language)
  const formatRupees = (value: number) =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'INR',
    }).format(value)

  const worker = workers.find((item) => item.id === selectedWorkerId) ?? workers[0]
  const matches = useMemo(() => getTopMatches(worker), [worker])
  const selectedMatch = matches.find((match) => match.job.id === selectedJobId) ?? matches[0]
  const securedIncome = worker.earnedThisWeek + worker.pendingPayments
  const incomeGap = Math.max(worker.weeklyIncomeTarget - securedIncome, 0)
  const incomeProgress = Math.min(100, Math.round((securedIncome / worker.weeklyIncomeTarget) * 100))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem(languageStorageKey, language)
  }, [language])

  const handleWorkerChange = (workerId: string) => {
    const nextWorker = workers.find((item) => item.id === workerId) ?? workers[0]
    setSelectedWorkerId(nextWorker.id)
    setSelectedJobId(getTopMatches(nextWorker)[0].job.id)
    setActiveView('cockpit')
    setMobileNavOpen(false)
  }

  const handleViewChange = (view: View) => {
    setActiveView(view)
    setMobileNavOpen(false)
  }

  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Rozgaar Saathi">
        <Wordmark />
        <div className="topbar-title">
          <span>{t('theme')}</span>
          <strong>{t('topbarTitle')}</strong>
        </div>
        <div className="topbar-controls">
          <div className="segmented-control" aria-label="Theme">
            <button
              type="button"
              className={theme === 'light' ? 'is-active' : ''}
              onClick={() => setTheme('light')}
              aria-label={t('themeLight')}
            >
              <Sun size={17} />
            </button>
            <button
              type="button"
              className={theme === 'dark' ? 'is-active' : ''}
              onClick={() => setTheme('dark')}
              aria-label={t('themeDark')}
            >
              <Moon size={17} />
            </button>
          </div>
          <label className="language-select">
            <Languages size={17} />
            <span>{t('language')}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.nativeName}
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button mobile-menu"
            type="button"
            aria-label={mobileNavOpen ? t('closeNavigation') : t('openNavigation')}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="layout-grid">
        <aside className={`side-panel ${mobileNavOpen ? 'is-open' : ''}`}>
          <section className="panel-section">
            <p className="section-kicker">{t('personas')}</p>
            <div className="persona-list">
              {workers.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`persona-button ${item.id === worker.id ? 'is-active' : ''}`}
                  onClick={() => handleWorkerChange(item.id)}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          </section>

          <nav className="workflow-nav" aria-label="Rozgaar workflows">
            <p className="section-kicker">{t('workflows')}</p>
            {viewItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`workflow-button ${activeView === item.id ? 'is-active' : ''}`}
                  onClick={() => handleViewChange(item.id)}
                >
                  <Icon size={19} />
                  <span>
                    <strong>{t(item.labelKey)}</strong>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="workspace">
          <div className="view-stage" key={`${activeView}-${worker.id}-${language}`}>
            {activeView === 'dashboard' && (
              <OperationsDashboard
                t={t}
                formatRupees={formatRupees}
                onOpenView={handleViewChange}
                activeWorker={worker}
                matches={matches}
              />
            )}
            {activeView === 'cockpit' && (
              <WorkerCockpit
                t={t}
                worker={worker}
                incomeGap={incomeGap}
                incomeProgress={incomeProgress}
                topMatch={matches[0]}
                formatRupees={formatRupees}
              />
            )}
            {activeView === 'matches' && (
              <JobMatching
                t={t}
                matches={matches}
                selectedJobId={selectedMatch.job.id}
                onSelectJob={setSelectedJobId}
                worker={worker}
                formatRupees={formatRupees}
              />
            )}
            {activeView === 'passport' && (
              <SkillPassport
                t={t}
                worker={worker}
                topMatch={matches[0]}
                formatRupees={formatRupees}
              />
            )}
            {activeView === 'enterprise' && (
              <EnterpriseKit t={t} worker={worker} formatRupees={formatRupees} />
            )}
            {activeView === 'farm' && <FarmStability t={t} worker={worker} formatRupees={formatRupees} />}
            {activeView === 'impact' && <ImpactDashboard t={t} />}
            {activeView === 'guide' && <GuideFaq t={t} />}
          </div>
        </section>
      </div>
    </main>
  )
}

function getFaqAnswer(question: string, t: (key: CopyKey) => string) {
  const normalized = question.toLowerCase()

  if (normalized.includes('dashboard') || normalized.includes('start') || normalized.includes('begin')) {
    return t('guideStepDashboard')
  }

  if (normalized.includes('worker') || normalized.includes('persona') || normalized.includes('profile')) {
    return t('guideStepPersona')
  }

  if (normalized.includes('match') || normalized.includes('job') || normalized.includes('work')) {
    return t('guideStepMatch')
  }

  if (normalized.includes('passport') || normalized.includes('skill') || normalized.includes('proof')) {
    return t('guideStepPassport')
  }

  if (
    normalized.includes('enterprise') ||
    normalized.includes('business') ||
    normalized.includes('farmer') ||
    normalized.includes('farm')
  ) {
    return t('guideStepEnterpriseFarm')
  }

  if (normalized.includes('language') || normalized.includes('hindi') || normalized.includes('tamil')) {
    return `${t('language')}: use the topbar selector to switch between English, Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, and Malayalam.`
  }

  if (normalized.includes('dark') || normalized.includes('light') || normalized.includes('theme')) {
    return `${t('themeLight')} / ${t('themeDark')}: use the sun and moon buttons in the topbar. Your preference is saved on this device.`
  }

  return t('botUnknown')
}

function GuideFaq({ t }: { t: (key: CopyKey) => string }) {
  const suggestedQuestions = [
    'How do I start the demo?',
    'How does job matching work?',
    'What is the Skill Passport?',
    'How do I support farmers?',
  ]
  const guideSteps = [
    t('guideStepDashboard'),
    t('guideStepPersona'),
    t('guideStepMatch'),
    t('guideStepPassport'),
    t('guideStepEnterpriseFarm'),
  ]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'bot', text: t('faqGreeting') },
  ])

  useEffect(() => {
    setMessages([{ id: 1, role: 'bot', text: t('faqGreeting') }])
  }, [t])

  const sendQuestion = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text: trimmed },
      { id: Date.now() + 1, role: 'bot', text: getFaqAnswer(trimmed, t) },
    ])
    setInput('')
  }

  return (
    <div className="support-layout">
      <section className="card guide-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('howToUse')}</p>
            <h3>{t('guideFaq')}</h3>
          </div>
          <BookOpenCheck className="header-icon" size={24} />
        </div>
        <div className="guide-steps">
          {guideSteps.map((step, index) => (
            <div className="guide-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card faq-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('faqAssistant')}</p>
            <h3>{t('faqAssistant')}</h3>
          </div>
          <Bot className="header-icon" size={24} />
        </div>
        <p className="faq-subtitle">{t('faqSubtitle')}</p>

        <div className="suggested-list">
          <span>{t('suggestedQuestions')}</span>
          <div>
            {suggestedQuestions.map((question) => (
              <button type="button" key={question} onClick={() => sendQuestion(question)}>
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-window" aria-live="polite">
          {messages.map((message) => (
            <div className={`chat-bubble ${message.role}`} key={message.id}>
              {message.text}
            </div>
          ))}
        </div>

        <form
          className="chat-form"
          onSubmit={(event) => {
            event.preventDefault()
            sendQuestion(input)
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('faqPlaceholder')}
            aria-label={t('faqPlaceholder')}
          />
          <button type="submit" aria-label={t('send')}>
            <Send size={18} />
          </button>
        </form>
      </section>
    </div>
  )
}

function OperationsDashboard({
  t,
  formatRupees,
  onOpenView,
  activeWorker,
  matches,
}: {
  t: (key: CopyKey) => string
  formatRupees: (value: number) => string
  onOpenView: (view: View) => void
  activeWorker: Worker
  matches: ReturnType<typeof getTopMatches>
}) {
  const totalIncome = workers.reduce((sum, worker) => sum + worker.earnedThisWeek + worker.pendingPayments, 0)
  const readyWorkers = workers.filter((worker) => worker.verifiedSkills.length >= 2).length
  const reliableEmployers = employers.filter((employer) => employer.reliabilityScore >= 88).length
  const urgentMatches = jobs.filter((job) => job.openings >= 6).length

  return (
    <div className="dashboard-grid">
      <section className="command-card">
        <div className="dashboard-heading">
          <div>
            <p className="section-kicker">{t('pilotReady')}</p>
            <h1>{t('topbarTitle')}</h1>
            <p>{t('dashboardSubtitle')}</p>
          </div>
          <LogoMark className="hero-logo" />
        </div>
        <div className="metric-strip">
          <DashboardMetric icon={IndianRupee} label={t('incomeUnlocked')} value={formatRupees(totalIncome)} />
          <DashboardMetric icon={UsersRound} label={t('workersSupported')} value={workers.length.toString()} />
          <DashboardMetric icon={BriefcaseBusiness} label={t('urgentMatches')} value={urgentMatches.toString()} />
          <DashboardMetric icon={ShieldCheck} label={t('reliableEmployers')} value={reliableEmployers.toString()} />
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('workerPipeline')}</p>
            <h3>{readyWorkers}/{workers.length} {t('readyNow')}</h3>
          </div>
          <UserRoundCheck className="header-icon" size={24} />
        </div>
        <div className="pipeline-list">
          {workers.map((worker) => {
            const progress = Math.min(100, Math.round(((worker.earnedThisWeek + worker.pendingPayments) / worker.weeklyIncomeTarget) * 100))
            return (
              <div className="pipeline-row" key={worker.id}>
                <div>
                  <strong>{worker.name}</strong>
                  <span>{worker.role}</span>
                </div>
                <div className="mini-progress" aria-label={`${progress}%`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card demand-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('employerDemand')}</p>
            <h3>{jobs.length} {t('rankedOpportunities')}</h3>
          </div>
          <CircleGauge className="header-icon" size={24} />
        </div>
        <div className="demand-list">
          {matches.slice(0, 3).map(({ job, employer, match }) => (
            <button className="demand-row" type="button" key={job.id} onClick={() => onOpenView('matches')}>
              <span>{match.score}%</span>
              <div>
                <strong>{job.title}</strong>
                <small>{employer.name}</small>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="card coverage-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('regionalCoverage')}</p>
            <h3>8 {t('languages')}</h3>
          </div>
          <Languages className="header-icon" size={24} />
        </div>
        <div className="language-grid">
          {languageOptions.map((language) => (
            <span key={language.code}>{language.nativeName}</span>
          ))}
        </div>
      </section>

      <section className="card quick-actions">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('quickActions')}</p>
            <h3>{activeWorker.name}</h3>
          </div>
          <Sparkles className="header-icon" size={24} />
        </div>
        <div className="action-grid">
          {viewItems.filter((item) => item.id !== 'dashboard').map((item) => {
            const Icon = item.icon
            return (
              <button type="button" key={item.id} onClick={() => onOpenView(item.id)}>
                <Icon size={19} />
                <span>{t(item.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function WorkerCockpit({
  t,
  worker,
  incomeGap,
  incomeProgress,
  topMatch,
  formatRupees,
}: {
  t: (key: CopyKey) => string
  worker: Worker
  incomeGap: number
  incomeProgress: number
  topMatch: ReturnType<typeof getTopMatches>[number]
  formatRupees: (value: number) => string
}) {
  const projectedIncome = worker.earnedThisWeek + worker.pendingPayments + topMatch.job.pay

  return (
    <div className="content-grid">
      <section className="card large-card">
        <div className="worker-summary">
          <div>
            <p className="section-kicker">{t('activeWorker')}</p>
            <h2>{worker.name}</h2>
            <p>{worker.role}</p>
          </div>
          <div className="worker-badge">
            <MapPin size={17} />
            {worker.location}
          </div>
        </div>

        <div className="income-meter">
          <div className="meter-copy">
            <span>{t('weeklyTarget')}</span>
            <strong>{formatRupees(worker.weeklyIncomeTarget)}</strong>
            <small>
              {formatRupees(worker.earnedThisWeek + worker.pendingPayments)} {t('secured')}
            </small>
          </div>
          <div className="meter-track" aria-hidden="true">
            <span style={{ width: `${incomeProgress}%` }} />
          </div>
        </div>

        <div className="metric-row">
          <MetricCard icon={CalendarCheck} label={t('completedShifts')} value={worker.completedShifts.toString()} />
          <MetricCard icon={Banknote} label={t('pendingPayment')} value={formatRupees(worker.pendingPayments)} />
          <MetricCard icon={TrendingUp} label={t('gapLeft')} value={formatRupees(incomeGap)} />
        </div>

        <div className="next-action">
          <Sparkles size={21} />
          <div>
            <strong>{t('recommendedNextAction')}</strong>
            <p>
              {topMatch.job.title}. {t('acceptWorkToReach')}{' '}
              <b>{formatRupees(projectedIncome)}</b>.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('readiness')}</p>
            <h3>{t('workProfile')}</h3>
          </div>
          <UserRoundCheck className="header-icon" size={24} />
        </div>
        <div className="readiness-list">
          <ReadinessItem label={t('verifiedSkills')} value={`${worker.verifiedSkills.length}/${worker.skills.length}`} />
          <ReadinessItem label={t('documents')} value={worker.documents.join(', ')} />
          <ReadinessItem label={t('languages')} value={worker.languages.join(', ')} />
          <ReadinessItem label={t('availability')} value={worker.availability.join(', ')} />
        </div>
      </section>

      {worker.womenWorkMode?.enabled && (
        <section className="card accent-card">
          <div className="card-header">
            <div>
              <p className="section-kicker">{t('womensWorkMode')}</p>
              <h3>{t('participationPreferences')}</h3>
            </div>
            <ShieldCheck className="header-icon" size={24} />
          </div>
          <div className="preference-grid">
            <span>{t('preferredHours')}</span>
            <strong>{worker.womenWorkMode.preferredHours}</strong>
            <span>{t('nearbyWork')}</span>
            <strong>{worker.womenWorkMode.nearbyOnly ? worker.workPreference : 'Flexible'}</strong>
            <span>{t('careNote')}</span>
            <strong>{worker.womenWorkMode.childcareNote}</strong>
          </div>
        </section>
      )}
    </div>
  )
}

function JobMatching({
  t,
  matches,
  selectedJobId,
  onSelectJob,
  worker,
  formatRupees,
}: {
  t: (key: CopyKey) => string
  matches: ReturnType<typeof getTopMatches>
  selectedJobId: string
  onSelectJob: (jobId: string) => void
  worker: Worker
  formatRupees: (value: number) => string
}) {
  const selected = matches.find((item) => item.job.id === selectedJobId) ?? matches[0]

  return (
    <div className="match-layout">
      <section className="card match-list-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('jobMatching')}</p>
            <h3>{t('rankedOpportunities')}</h3>
          </div>
          <CircleGauge className="header-icon" size={24} />
        </div>
        <div className="match-list">
          {matches.map(({ job, employer, match }) => (
            <button
              key={job.id}
              type="button"
              className={`match-card ${selectedJobId === job.id ? 'is-active' : ''}`}
              onClick={() => onSelectJob(job.id)}
            >
              <div className="score-ring" style={{ '--score': match.score } as CSSProperties}>
                <span>{match.score}</span>
              </div>
              <div>
                <strong>{job.title}</strong>
                <small>
                  {employer.name} / {formatRupees(job.pay)} per {job.payUnit}
                </small>
                <div className="mini-tags">
                  {match.matchedSkills.slice(0, 3).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="card detail-card">
        <div className="job-detail-top">
          <div>
            <p className="section-kicker">{t('selectedMatch')}</p>
            <h3>{selected.job.title}</h3>
            <p>{selected.employer.name}</p>
          </div>
          <div className="trust-badge">
            <BadgeCheck size={18} />
            {selected.employer.reliabilityScore}% {t('reliable')}
          </div>
        </div>

        <div className="job-facts">
          <MetricCard icon={IndianRupee} label={t('pay')} value={`${formatRupees(selected.job.pay)} / ${selected.job.payUnit}`} />
          <MetricCard icon={MapPin} label={t('distance')} value={`${selected.job.distanceKm} km`} />
          <MetricCard icon={UsersRound} label={t('openings')} value={selected.job.openings.toString()} />
        </div>

        <div className="reason-box">
          <strong>{t('whyFits')} {worker.name}</strong>
          <ul>
            {selected.match.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="skills-split">
          <div>
            <span>{t('matchedSkills')}</span>
            {selected.match.matchedSkills.map((skill) => (
              <b key={skill}>{skill}</b>
            ))}
          </div>
          <div>
            <span>{t('skillGaps')}</span>
            {selected.match.missingSkills.length ? (
              selected.match.missingSkills.map((skill) => <b key={skill}>{skill}</b>)
            ) : (
              <b>{t('readyNow')}</b>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function SkillPassport({
  t,
  worker,
  topMatch,
  formatRupees,
}: {
  t: (key: CopyKey) => string
  worker: Worker
  topMatch: ReturnType<typeof getTopMatches>[number]
  formatRupees: (value: number) => string
}) {
  return (
    <div className="passport-layout">
      <section className="passport-card">
        <div className="passport-stamp">{t('passportTitle')}</div>
        <div className="passport-head">
          <LogoMark className="passport-avatar-logo" />
          <div>
            <p>{worker.role}</p>
            <h3>{worker.name}</h3>
            <span>{worker.location}</span>
          </div>
        </div>
        <div className="passport-grid">
          <PassportField label="Location" value={worker.location} />
          <PassportField label="Experience" value={worker.experience} />
          <PassportField label={t('availability')} value={worker.availability.join(', ')} />
          <PassportField label={t('weeklyTarget')} value={formatRupees(worker.weeklyIncomeTarget)} />
        </div>
        <div className="passport-section">
          <span>{t('verifiedSkills')}</span>
          <div className="skill-cloud">
            {worker.verifiedSkills.map((skill) => (
              <b key={skill}>{skill}</b>
            ))}
          </div>
        </div>
        <div className="passport-footer">
          <span>
            <ShieldCheck size={17} /> {t('portableProof')}
          </span>
          <span>
            <BriefcaseBusiness size={17} /> {t('selectedMatch')}: {topMatch.match.score}%
          </span>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('portableProof')}</p>
            <h3>{t('whyItMatters')}</h3>
          </div>
          <FileBadge2 className="header-icon" size={24} />
        </div>
        <div className="timeline">
          <TimelineItem title="Skills become visible" text="Everyday work is translated into a profile employers can understand." />
          <TimelineItem title="Trust improves" text="Workers can show verified skills, past work, and payment-ready documents." />
          <TimelineItem title="Income search gets faster" text="The passport connects directly to the next best work opportunity." />
        </div>
      </section>
    </div>
  )
}

function EnterpriseKit({
  t,
  worker,
  formatRupees,
}: {
  t: (key: CopyKey) => string
  worker: Worker
  formatRupees: (value: number) => string
}) {
  const profile =
    worker.enterpriseProfile ??
    workers.find((item) => item.enterpriseProfile)?.enterpriseProfile ??
    workers[0].enterpriseProfile

  return (
    <div className="content-grid">
      <section className="card large-card service-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('enterpriseKit')}</p>
            <h3>{t('serviceCard')}</h3>
          </div>
          <Store className="header-icon" size={24} />
        </div>
        <div className="service-preview">
          <span>Rozgaar Saathi</span>
          <h3>{profile?.serviceName ?? 'Verified local service'}</h3>
          <p>{worker.name} / {worker.location}</p>
          <div>
            <b>{profile?.priceRange ?? 'Custom pricing'}</b>
            <small>{profile?.repeatCustomers ?? 0} repeat customers</small>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('quickActions')}</p>
            <h3>{t('nearbyLeads')}</h3>
          </div>
          <PackageCheck className="header-icon" size={24} />
        </div>
        <div className="request-list">
          {serviceRequests.map((request) => (
            <div className="request-row" key={request.id}>
              <span>{request.status}</span>
              <strong>{request.title}</strong>
              <small>{request.customer}</small>
              <b>{formatRupees(request.budget)}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function FarmStability({
  t,
  worker,
  formatRupees,
}: {
  t: (key: CopyKey) => string
  worker: Worker
  formatRupees: (value: number) => string
}) {
  const farmWorker = worker.farmProfile ? worker : workers.find((item) => item.farmProfile) ?? worker

  return (
    <div className="content-grid">
      <section className="card large-card farm-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('farmStability')}</p>
            <h3>{t('seasonalIncome')}</h3>
          </div>
          <Sprout className="header-icon" size={24} />
        </div>
        <div className="farm-summary">
          <div>
            <span>{t('crop')}</span>
            <strong>{farmWorker.farmProfile?.crop ?? 'Seasonal produce'}</strong>
          </div>
          <div>
            <span>{t('season')}</span>
            <strong>{farmWorker.farmProfile?.season ?? 'Local harvest window'}</strong>
          </div>
          <div>
            <span>{t('expectedHarvest')}</span>
            <strong>{farmWorker.farmProfile?.expectedHarvestKg ?? 0} kg</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('stabilityOptions')}</p>
            <h3>{t('nextBestWork')}</h3>
          </div>
          <Leaf className="header-icon" size={24} />
        </div>
        <div className="farm-list">
          {farmOpportunities.map((opportunity) => (
            <div className="farm-row" key={opportunity.id}>
              <div>
                <strong>{opportunity.title}</strong>
                <small>{opportunity.buyer} / {opportunity.window}</small>
                <p>{opportunity.stabilityReason}</p>
              </div>
              <b>{formatRupees(opportunity.price)} / {opportunity.unit}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ImpactDashboard({ t }: { t: (key: CopyKey) => string }) {
  return (
    <div className="content-grid">
      <section className="card large-card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('impact')}</p>
            <h3>{t('whatUnlocks')}</h3>
          </div>
          <HeartHandshake className="header-icon" size={24} />
        </div>
        <div className="impact-grid">
          {impactMetrics.map((metric) => (
            <div className="impact-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-kicker">{t('theme')}</p>
            <h3>{t('builtForRozgaar')}</h3>
          </div>
          <Home className="header-icon" size={24} />
        </div>
        <div className="theme-list">
          {[
            'Daily wage worker income tools',
            'Micro-entrepreneur support',
            'Women’s economic participation',
            'Farmer income stability',
            'Skill-job matching for first-time workers',
          ].map((item) => (
            <div key={item}>
              <BadgeCheck size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function DashboardMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards
  label: string
  value: string
}) {
  return (
    <div className="dashboard-metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards
  label: string
  value: string
}) {
  return (
    <div className="metric-card">
      <Icon size={19} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ReadinessItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="readiness-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PassportField({ label, value }: { label: string; value: string }) {
  return (
    <div className="passport-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function TimelineItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="timeline-item">
      <span />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default App
