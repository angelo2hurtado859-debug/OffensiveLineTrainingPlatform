import { useState } from 'react'

type Screen = 'home' | 'playbook' | 'field' | 'quiz' | 'progress' | 'dashboard' | 'answer-key'

interface OPlayer {
  id: string
  label: string
  x: number
  y: number
}

interface DPlayer {
  id: string
  label: string
  x: number
  y: number
}

interface Assignment {
  linemanId: string
  defenderId: string
  technique: string
  correct?: boolean
}

const TECHNIQUES = [
  'Drive Block',
  'Reach Block',
  'Down Block',
  'Double Team',
  'Pull – Kick Out',
  'Pull – Wrap',
  'Pass Set',
  'Combo Block',
]

type FormationKey = '4-3 Over' | '3-4 Under' | 'Eagle' | '4-3 Under' | 'Bear'

interface AnswerKey {
  formation: FormationKey
  assignments: Assignment[]
}

const FORMATIONS: Record<FormationKey, DPlayer[]> = {
  '4-3 Over': [
    { id: 'd1', label: 'DE',  x: 120, y: 110 },
    { id: 'd2', label: 'DT',  x: 225, y: 120 },
    { id: 'd3', label: 'NT',  x: 300, y: 115 },
    { id: 'd4', label: 'DT',  x: 375, y: 120 },
    { id: 'd5', label: 'DE',  x: 480, y: 110 },
    { id: 'd6', label: 'OLB', x:  78, y:  68 },
    { id: 'd7', label: 'MLB', x: 255, y:  62 },
    { id: 'd8', label: 'MLB', x: 345, y:  62 },
    { id: 'd9', label: 'OLB', x: 522, y:  68 },
  ],
  '3-4 Under': [
    { id: 'd1', label: 'DE',  x: 175, y: 115 },
    { id: 'd2', label: 'NT',  x: 300, y: 108 },
    { id: 'd3', label: 'DE',  x: 425, y: 115 },
    { id: 'd4', label: 'OLB', x:  95, y:  70 },
    { id: 'd5', label: 'ILB', x: 235, y:  65 },
    { id: 'd6', label: 'ILB', x: 365, y:  65 },
    { id: 'd7', label: 'OLB', x: 505, y:  70 },
  ],
  'Eagle': [
    { id: 'd1', label: 'DE',  x: 155, y: 118 },
    { id: 'd2', label: 'NG',  x: 262, y: 125 },
    { id: 'd3', label: 'DT',  x: 338, y: 125 },
    { id: 'd4', label: 'DE',  x: 445, y: 118 },
    { id: 'd5', label: 'SLB', x:  88, y:  72 },
    { id: 'd6', label: 'MLB', x: 300, y:  65 },
    { id: 'd7', label: 'WLB', x: 512, y:  72 },
  ],
  '4-3 Under': [
    { id: 'd1', label: 'DE',  x: 145, y: 112 },
    { id: 'd2', label: 'DT',  x: 240, y: 122 },
    { id: 'd3', label: 'NT',  x: 328, y: 118 },
    { id: 'd4', label: 'DE',  x: 455, y: 112 },
    { id: 'd5', label: 'WLB', x:  90, y:  68 },
    { id: 'd6', label: 'MLB', x: 270, y:  62 },
    { id: 'd7', label: 'SLB', x: 370, y:  62 },
    { id: 'd8', label: 'WLB', x: 510, y:  68 },
  ],
  'Bear': [
    { id: 'd1', label: 'DE',  x: 140, y: 118 },
    { id: 'd2', label: 'DT',  x: 215, y: 122 },
    { id: 'd3', label: 'NG',  x: 300, y: 112 },
    { id: 'd4', label: 'DT',  x: 385, y: 122 },
    { id: 'd5', label: 'DE',  x: 460, y: 118 },
    { id: 'd6', label: 'OLB', x:  82, y:  70 },
    { id: 'd7', label: 'MLB', x: 300, y:  62 },
    { id: 'd8', label: 'OLB', x: 518, y:  70 },
  ],
}

const OL: OPlayer[] = [
  { id: 'lt', label: 'LT', x: 183, y: 270 },
  { id: 'lg', label: 'LG', x: 242, y: 270 },
  { id: 'c',  label: 'C',  x: 300, y: 270 },
  { id: 'rg', label: 'RG', x: 358, y: 270 },
  { id: 'rt', label: 'RT', x: 417, y: 270 },
]

const PLAYS = [
  { id: 'p1', name: 'Power Right',   formation: 'I-Form',   scheme: 'Gap',      date: 'Sep 3',  compl: 4, total: 5 },
  { id: 'p2', name: 'Inside Zone',   formation: 'Shotgun',  scheme: 'Zone',     date: 'Sep 5',  compl: 3, total: 5 },
  { id: 'p3', name: 'Counter Trey',  formation: 'I-Form',   scheme: 'Gap',      date: 'Sep 8',  compl: 5, total: 5 },
  { id: 'p4', name: '3-Step Slide',  formation: 'Shotgun',  scheme: 'Pass Pro', date: 'Sep 10', compl: 2, total: 5 },
  { id: 'p5', name: 'QB Draw',       formation: 'Shotgun',  scheme: 'Zone',     date: 'Sep 12', compl: 4, total: 5 },
  { id: 'p6', name: 'Trap',          formation: 'I-Form',   scheme: 'Gap',      date: 'Sep 15', compl: 1, total: 5 },
]

const BADGES = [
  { id: 'b1', name: 'Front Recognition', icon: '🔍', earned: true,  desc: 'Correctly ID\'d 10 defensive fronts' },
  { id: 'b2', name: 'Combo Blocks',      icon: '🤝', earned: true,  desc: 'Executed 20 combo block assignments' },
  { id: 'b3', name: 'Pulling Mastery',   icon: '⚡', earned: false, desc: 'Complete 15 pulling assignments' },
  { id: 'b4', name: 'Blitz Pickup',      icon: '🛡️', earned: false, desc: 'Correctly ID 10 blitz packages' },
  { id: 'b5', name: 'Pass Protection',   icon: '🏆', earned: true,  desc: 'Perfect score on pass pro quiz' },
  { id: 'b6', name: 'Zone Master',       icon: '🗺️', earned: false, desc: 'Complete all zone blocking drills' },
]

const ROSTER = [
  { name: 'Marcus Johnson',  pos: 'LT', num: 72, install: 87, quiz: 91, weak: 'Blitz ID'     },
  { name: 'DeShawn Williams',pos: 'LG', num: 64, install: 76, quiz: 82, weak: 'Combo Blocks' },
  { name: 'Tyler Brooks',    pos: 'C',  num: 55, install: 94, quiz: 96, weak: '—'            },
  { name: 'Antoine Davis',   pos: 'RG', num: 67, install: 65, quiz: 71, weak: 'Pulling'      },
  { name: 'Kendrick Moore',  pos: 'RT', num: 77, install: 58, quiz: 63, weak: 'Pass Pro'     },
]


function scoreColor(n: number) {
  if (n >= 80) return '#C8A84B'
  if (n >= 65) return '#f59e0b'
  return '#ef4444'
}

function getPath(fx: number, fy: number, tx: number, ty: number) {
  const mx = (fx + tx) / 2
  const my = (fy + ty) / 2 - 28
  return `M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}`
}

// ── Field SVG ──────────────────────────────────────────────────────────────

interface FieldProps {
  defenders: DPlayer[]
  selectedLineman: string | null
  setSelectedLineman: (id: string | null) => void
  assignments: Assignment[]
  techPicker: { defenderId: string; px: number; py: number } | null
  setTechPicker: (v: { defenderId: string; px: number; py: number } | null) => void
  onTechSelect: (tech: string) => void
  submitted?: boolean
}

function FieldSVG({
  defenders,
  selectedLineman,
  setSelectedLineman,
  assignments,
  techPicker,
  setTechPicker,
  onTechSelect,
  submitted,
}: FieldProps) {

  function handleDefClick(d: DPlayer) {
    if (!selectedLineman) return
    const bx = Math.min(d.x + 22, 450)
    const by = Math.min(d.y - 5, 290)
    setTechPicker({ defenderId: d.id, px: bx, py: by })
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <svg
        viewBox="0 0 600 360"
        style={{ width: '100%', borderRadius: 16, display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#133a1d" />
            <stop offset="100%" stopColor="#0c2414" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Field */}
        <rect width="600" height="360" fill="url(#fg)" rx="16" />

        {/* Yard lines */}
        {[1, 2, 3, 4, 5].map(i => (
          <line key={i} x1="0" y1={i * 55} x2="600" y2={i * 55} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}

        {/* Hash marks */}
        {[200, 400].map(hx =>
          [1, 2, 3, 4, 5].map(i => (
            <line key={`h${hx}${i}`} x1={hx} y1={i * 55 - 9} x2={hx} y2={i * 55 + 9}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          ))
        )}

        {/* LOS */}
        <line x1="0" y1="228" x2="600" y2="228" stroke="rgba(200,168,75,0.45)" strokeWidth="1.5" strokeDasharray="10 5" />
        <text x="12" y="224" fill="rgba(200,168,75,0.55)" fontSize="9.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">LOS</text>

        {/* Scrimmage zone shade */}
        <rect x="0" y="228" width="600" height="60" fill="rgba(200,168,75,0.025)" />

        {/* Assignment paths */}
        {assignments.map(a => {
          const lm = OL.find(o => o.id === a.linemanId)
          const df = defenders.find(d => d.id === a.defenderId)
          if (!lm || !df) return null
          const color = submitted
            ? a.correct === false ? '#ef4444' : '#22c55e'
            : '#C8A84B'
          return (
            <g key={a.linemanId}>
              <path
                d={getPath(lm.x, lm.y - 22, df.x, df.y + 22)}
                stroke={color}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.85"
                filter="url(#glow)"
              />
              <circle cx={df.x} cy={df.y + 22} r="3.5" fill={color} opacity="0.9" />
            </g>
          )
        })}

        {/* Defenders */}
        {defenders.map(d => {
          const assigned = assignments.some(a => a.defenderId === d.id)
          const active = !!selectedLineman
          return (
            <g
              key={d.id}
              style={{ cursor: active ? 'pointer' : 'default' }}
              onClick={() => handleDefClick(d)}
            >
              {assigned && (
                <circle cx={d.x} cy={d.y} r="27" fill="none" stroke="#C8A84B" strokeWidth="1" opacity="0.35" />
              )}
              <circle
                cx={d.x} cy={d.y} r="21"
                fill="#1a3a6b"
                stroke={assigned ? '#C8A84B' : active ? 'rgba(200,168,75,0.55)' : 'rgba(200,168,75,0.25)'}
                strokeWidth={assigned ? '2' : '1.5'}
              />
              <text x={d.x} y={d.y + 5} textAnchor="middle"
                fill="white" fontSize="11" fontWeight="700"
                fontFamily="Barlow Condensed, sans-serif"
                style={{ userSelect: 'none' }}>
                {d.label}
              </text>
            </g>
          )
        })}

        {/* Offensive linemen */}
        {OL.map(p => {
          const sel = selectedLineman === p.id
          const done = assignments.some(a => a.linemanId === p.id)
          return (
            <g
              key={p.id}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedLineman(sel ? null : p.id)}
            >
              {sel && (
                <>
                  <circle cx={p.x} cy={p.y} r="30" fill="none" stroke="#E8C94A" strokeWidth="1.5" opacity="0.4">
                    <animate attributeName="r" values="28;33;28" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.15;0.5" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              <circle
                cx={p.x} cy={p.y} r="21"
                fill={sel ? '#C8A84B' : done ? '#14306e' : '#0e2055'}
                stroke={sel ? '#E8C94A' : done ? '#C8A84B' : 'rgba(200,168,75,0.55)'}
                strokeWidth={sel ? '2.5' : '2'}
                filter={sel ? 'url(#softglow)' : undefined}
              />
              <text x={p.x} y={p.y + 5} textAnchor="middle"
                fill={sel ? '#0D1B3E' : 'white'}
                fontSize="11" fontWeight="800"
                fontFamily="Barlow Condensed, sans-serif"
                style={{ userSelect: 'none' }}>
                {p.label}
              </text>
            </g>
          )
        })}

        {/* Technique picker dropdown */}
        {techPicker && (
          <foreignObject
            x={Math.min(techPicker.px, 600 - 148)}
            y={Math.min(techPicker.py, 360 - 220)}
            width="146"
            height="218"
          >
            <div style={{
              background: '#0a1628',
              border: '1px solid #C8A84B',
              borderRadius: 10,
              padding: '6px 0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.85), 0 0 20px rgba(200,168,75,0.15)',
            }}>
              <p style={{ color: '#C8A84B', fontSize: 9, fontWeight: 700, padding: '2px 10px 6px', letterSpacing: '0.12em', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase' }}>
                Technique
              </p>
              {TECHNIQUES.map(t => (
                <div
                  key={t}
                  onClick={() => onTechSelect(t)}
                  style={{ padding: '5px 10px', color: '#e2e8f0', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.1s' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.background = 'rgba(200,168,75,0.18)')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.background = 'transparent')}
                >
                  {t}
                </div>
              ))}
            </div>
          </foreignObject>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10, opacity: 0.5 }}>
        <span style={{ color: 'white', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          1 · Select lineman &nbsp; 2 · Click defender &nbsp; 3 · Pick technique
        </span>
      </div>
    </div>
  )
}

// ── Nav Header ─────────────────────────────────────────────────────────────

function NavHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 24px',
      borderBottom: '1px solid rgba(200,168,75,0.18)',
      background: 'rgba(8,15,34,0.6)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <button
        onClick={onBack}
        style={{ color: '#C8A84B', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← HOME
      </button>
      <div style={{ width: 1, height: 18, background: 'rgba(200,168,75,0.2)' }} />
      <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white', margin: 0 }}>
        {title}
      </h2>
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  // Answer keys: playId -> { formation, assignments }
  const [answerKeys, setAnswerKeys] = useState<Record<string, AnswerKey>>({})

  // Answer key editor state
  const [akPlayId, setAkPlayId] = useState<string | null>(null)
  const [akFormation, setAkFormation] = useState<FormationKey>('4-3 Over')
  const [akSelected, setAkSelected] = useState<string | null>(null)
  const [akAssignments, setAkAssignments] = useState<Assignment[]>([])
  const [akPicker, setAkPicker] = useState<{ defenderId: string; px: number; py: number } | null>(null)
  const [akSaved, setAkSaved] = useState(false)

  // Install field state
  const [fieldFormation, setFieldFormation] = useState<FormationKey>('4-3 Over')
  const [fieldSelected, setFieldSelected] = useState<string | null>(null)
  const [fieldAssignments, setFieldAssignments] = useState<Assignment[]>([])
  const [fieldPicker, setFieldPicker] = useState<{ defenderId: string; px: number; py: number } | null>(null)

  // Quiz state
  const [quizPlayId, setQuizPlayId] = useState<string | null>(null)
  const [quizFormation, setQuizFormation] = useState<FormationKey>('4-3 Over')
  const [quizSelected, setQuizSelected] = useState<string | null>(null)
  const [quizAssignments, setQuizAssignments] = useState<Assignment[]>([])
  const [quizPicker, setQuizPicker] = useState<{ defenderId: string; px: number; py: number } | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const navBack = () => setScreen('home')

  function openAnswerKeyEditor(playId: string) {
    const existing = answerKeys[playId]
    setAkPlayId(playId)
    setAkFormation(existing?.formation ?? '4-3 Over')
    setAkAssignments(existing?.assignments ?? [])
    setAkSelected(null)
    setAkPicker(null)
    setAkSaved(false)
    setScreen('answer-key')
  }

  function handleAkTech(tech: string) {
    if (!akPicker || !akSelected) return
    setAkAssignments(prev => [
      ...prev.filter(a => a.linemanId !== akSelected),
      { linemanId: akSelected, defenderId: akPicker.defenderId, technique: tech },
    ])
    setAkPicker(null)
    setAkSelected(null)
  }

  function saveAnswerKey() {
    if (!akPlayId) return
    setAnswerKeys(prev => ({
      ...prev,
      [akPlayId]: { formation: akFormation, assignments: akAssignments },
    }))
    setAkSaved(true)
  }

  function handleFieldTech(tech: string) {
    if (!fieldPicker || !fieldSelected) return
    setFieldAssignments(prev => [
      ...prev.filter(a => a.linemanId !== fieldSelected),
      { linemanId: fieldSelected, defenderId: fieldPicker.defenderId, technique: tech },
    ])
    setFieldPicker(null)
    setFieldSelected(null)
  }

  function handleQuizTech(tech: string) {
    if (!quizPicker || !quizSelected) return
    setQuizAssignments(prev => [
      ...prev.filter(a => a.linemanId !== quizSelected),
      { linemanId: quizSelected, defenderId: quizPicker.defenderId, technique: tech },
    ])
    setQuizPicker(null)
    setQuizSelected(null)
  }

  function submitQuiz() {
    const key = quizPlayId ? answerKeys[quizPlayId] : null
    setQuizAssignments(prev =>
      prev.map(a => {
        if (!key) return { ...a, correct: false }
        const correctAnswer = key.assignments.find(ka => ka.linemanId === a.linemanId)
        return { ...a, correct: correctAnswer?.defenderId === a.defenderId }
      })
    )
    setQuizSubmitted(true)
  }

  function resetQuiz() {
    setQuizAssignments([])
    setQuizSelected(null)
    setQuizPicker(null)
    setQuizSubmitted(false)
  }

  const goldBtn: React.CSSProperties = {
    background: 'linear-gradient(135deg, #C8A84B, #E8C94A)',
    color: '#0D1B3E',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(200,168,75,0.35)',
  }

  const ghostBtn: React.CSSProperties = {
    background: 'transparent',
    color: '#C8A84B',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    border: '1px solid rgba(200,168,75,0.4)',
    borderRadius: 10,
    padding: '10px 20px',
    cursor: 'pointer',
  }

  const card: React.CSSProperties = {
    background: '#111e42',
    border: '1px solid rgba(200,168,75,0.2)',
    borderRadius: 14,
    padding: '20px',
  }

  const label: React.CSSProperties = {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  }

  const selectStyle: React.CSSProperties = {
    background: '#111e42',
    border: '1px solid rgba(200,168,75,0.35)',
    color: 'white',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: 14,
    letterSpacing: '0.05em',
    borderRadius: 8,
    padding: '8px 12px',
    outline: 'none',
    cursor: 'pointer',
  }

  // ── Home ──────────────────────────────────────────────────────────────

  if (screen === 'home') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '32px 24px' }}>
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.028) 60px),repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.028) 60px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Gold radial glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(200,168,75,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Emblem */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div style={{
            width: 128, height: 128, borderRadius: '50%',
            border: '3px solid #C8A84B',
            background: 'radial-gradient(circle at 40% 35%, #1e3366, #0a1628)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(200,168,75,0.3), inset 0 0 30px rgba(200,168,75,0.05)',
          }}>
            <span style={{ fontSize: 52 }}>🏈</span>
          </div>
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(200,168,75,0.2)' }} />
          <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: '1px solid rgba(200,168,75,0.09)' }} />
        </div>

        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px, 10vw, 68px)', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white', margin: '0 0 4px', textAlign: 'center' }}>
          MEHS OL
        </h1>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#C8A84B', fontSize: 14, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 44 }}>
          Offensive Line Training
        </p>

        {/* Nav tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, width: '100%', maxWidth: 540 }}>
          {([
            { label: 'Playbook',        icon: '📋', s: 'playbook'  },
            { label: 'Install Training',icon: '🎯', s: 'field'     },
            { label: 'Quiz Mode',       icon: '⚡', s: 'quiz'      },
            { label: 'Progress',        icon: '📈', s: 'progress'  },
            { label: 'Team Rankings',   icon: '🏆', s: 'dashboard' },
          ] as { label: string; icon: string; s: Screen }[]).map(item => (
            <button
              key={item.s}
              onClick={() => setScreen(item.s)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                padding: '20px 12px',
                background: '#111e42',
                border: '1px solid rgba(200,168,75,0.28)',
                borderRadius: 14,
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#C8A84B';
                (e.currentTarget as HTMLElement).style.background = 'rgba(200,168,75,0.1)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.28)';
                (e.currentTarget as HTMLElement).style.background = '#111e42'
              }}
            >
              <span style={{ fontSize: 26 }}>{item.icon}</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <p style={{ marginTop: 52, color: 'rgba(255,255,255,0.15)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
          SEASON 2024 · CHAMPIONSHIP PROGRAM
        </p>
      </div>
    )
  }

  // ── Playbook ──────────────────────────────────────────────────────────

  if (screen === 'playbook') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3E' }}>
        <NavHeader title="Playbook" onBack={navBack} />
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {PLAYS.map(play => {
            const pct = (play.compl / play.total) * 100
            const hasKey = !!answerKeys[play.id]
            const keyData = answerKeys[play.id]
            return (
              <div
                key={play.id}
                style={{ ...card, transition: 'border-color 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.55)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.2)')}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                      {play.name}
                    </h3>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#C8A84B', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>
                      {play.formation} · {play.scheme}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.28)', fontSize: 10 }}>
                      {play.date}
                    </span>
                    {/* Answer key status pill */}
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em',
                      padding: '2px 7px', borderRadius: 20,
                      background: hasKey ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                      color: hasKey ? '#22c55e' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${hasKey ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                      {hasKey ? '✓ KEY SET' : 'NO KEY'}
                    </span>
                  </div>
                </div>

                {/* Answer key preview */}
                {hasKey && keyData && (
                  <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10 }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 6 }}>
                      ANSWER KEY · {keyData.formation}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {OL.map(ol => {
                        const a = keyData.assignments.find(a => a.linemanId === ol.id)
                        const df = a ? FORMATIONS[keyData.formation].find(d => d.id === a.defenderId) : null
                        return (
                          <div key={ol.id} style={{ textAlign: 'center', minWidth: 44 }}>
                            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, color: '#C8A84B', fontSize: 13, margin: 0 }}>{ol.label}</p>
                            <p style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.5)', fontSize: 9, margin: '2px 0 0' }}>
                              {df ? df.label : '—'}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Completion bar */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                      TEAM COMPLETION
                    </span>
                    <span style={{ color: '#C8A84B', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                      {play.compl}/{play.total}
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${pct}%`,
                      background: pct === 100 ? 'linear-gradient(90deg,#C8A84B,#E8C94A)' : '#C8A84B',
                      boxShadow: '0 0 10px rgba(200,168,75,0.5)',
                    }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => setScreen('field')}
                    style={{ ...ghostBtn, flex: 1, fontSize: 11 }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(200,168,75,0.12)';
                      (e.currentTarget as HTMLElement).style.borderColor = '#C8A84B'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.4)'
                    }}
                  >
                    View Install
                  </button>
                  <button
                    onClick={() => openAnswerKeyEditor(play.id)}
                    style={{
                      ...goldBtn, flex: 1, fontSize: 11,
                      background: hasKey
                        ? 'linear-gradient(135deg, #1a4a2e, #0f3020)'
                        : 'linear-gradient(135deg, #C8A84B, #E8C94A)',
                      color: hasKey ? '#22c55e' : '#0D1B3E',
                      boxShadow: hasKey ? '0 4px 16px rgba(34,197,94,0.2)' : '0 4px 20px rgba(200,168,75,0.35)',
                      border: hasKey ? '1px solid rgba(34,197,94,0.3)' : 'none',
                    }}
                  >
                    {hasKey ? '✎ Edit Key' : '+ Set Key'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Answer Key Editor ────────────────────────────────────────────────────

  if (screen === 'answer-key') {
    const play = PLAYS.find(p => p.id === akPlayId)
    const akDefs = FORMATIONS[akFormation]
    const allSet = akAssignments.length === 5

    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3E' }}>
        <NavHeader title={`Answer Key · ${play?.name ?? ''}`} onBack={() => setScreen('playbook')} />
        <div style={{ padding: '20px 24px' }}>

          {/* Instruction banner */}
          <div style={{
            background: 'rgba(200,168,75,0.07)',
            border: '1px solid rgba(200,168,75,0.25)',
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>🔑</span>
            <div>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, color: '#C8A84B', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                Setting Correct Answers
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '3px 0 0', lineHeight: 1.4 }}>
                Assign every lineman to their correct defender and technique. This becomes the grading key for Quiz Mode.
              </p>
            </div>
          </div>

          {/* Formation selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <span style={label}>Defensive Formation</span>
              <select
                value={akFormation}
                onChange={e => {
                  setAkFormation(e.target.value as FormationKey)
                  setAkAssignments([])
                  setAkSelected(null)
                  setAkPicker(null)
                  setAkSaved(false)
                }}
                style={selectStyle}
              >
                {Object.keys(FORMATIONS).map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <button
                onClick={() => { setAkAssignments([]); setAkSelected(null); setAkPicker(null); setAkSaved(false) }}
                style={ghostBtn}
              >
                Clear
              </button>
              <button
                onClick={saveAnswerKey}
                disabled={!allSet}
                style={{
                  ...goldBtn,
                  opacity: allSet ? 1 : 0.4,
                  cursor: allSet ? 'pointer' : 'not-allowed',
                  background: akSaved
                    ? 'linear-gradient(135deg,#16a34a,#22c55e)'
                    : 'linear-gradient(135deg,#C8A84B,#E8C94A)',
                }}
              >
                {akSaved ? '✓ Saved!' : `Save Key (${akAssignments.length}/5)`}
              </button>
            </div>
          </div>

          <FieldSVG
            defenders={akDefs}
            selectedLineman={akSelected}
            setSelectedLineman={setAkSelected}
            assignments={akAssignments}
            techPicker={akPicker}
            setTechPicker={setAkPicker}
            onTechSelect={handleAkTech}
          />

          {/* Assignment summary */}
          <div style={{ ...card, marginTop: 20 }}>
            <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, color: '#C8A84B', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>
              Correct Assignments
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {OL.map(p => {
                const a = akAssignments.find(a => a.linemanId === p.id)
                const df = a ? akDefs.find(d => d.id === a.defenderId) : null
                return (
                  <div key={p.id} style={{ textAlign: 'center', padding: '10px 4px', background: a ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.04)', borderRadius: 10, border: `1px solid ${a ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, color: '#C8A84B', fontSize: 15, margin: 0 }}>{p.label}</p>
                    {a ? (
                      <>
                        <p style={{ color: 'white', fontSize: 12, marginTop: 3 }}>{df?.label}</p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                          {a.technique.split(' ')[0]}
                        </p>
                      </>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, marginTop: 3 }}>—</p>
                    )}
                  </div>
                )
              })}
            </div>
            {allSet && !akSaved && (
              <p style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(200,168,75,0.6)', fontSize: 10, textAlign: 'center', marginTop: 14, letterSpacing: '0.1em' }}>
                All 5 linemen assigned — hit Save Key to lock it in.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Install Field ─────────────────────────────────────────────────────

  if (screen === 'field') {
    const defs = FORMATIONS[fieldFormation]
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3E' }}>
        <NavHeader title="Install Training" onBack={navBack} />
        <div style={{ padding: '20px 24px' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <span style={label}>Formation</span>
              <select
                value={fieldFormation}
                onChange={e => {
                  setFieldFormation(e.target.value as FormationKey)
                  setFieldAssignments([])
                  setFieldSelected(null)
                  setFieldPicker(null)
                }}
                style={selectStyle}
              >
                {Object.keys(FORMATIONS).map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setFieldAssignments([]); setFieldSelected(null); setFieldPicker(null) }}
                style={ghostBtn}
              >
                Reset
              </button>
              <button
                onClick={() => setScreen('quiz')}
                style={goldBtn}
              >
                Take Quiz ⚡
              </button>
            </div>
          </div>

          <FieldSVG
            defenders={defs}
            selectedLineman={fieldSelected}
            setSelectedLineman={setFieldSelected}
            assignments={fieldAssignments}
            techPicker={fieldPicker}
            setTechPicker={setFieldPicker}
            onTechSelect={handleFieldTech}
          />

          {/* Assignment summary */}
          {fieldAssignments.length > 0 && (
            <div style={{ ...card, marginTop: 20 }}>
              <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, color: '#C8A84B', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>
                Current Assignments
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {OL.map(p => {
                  const a = fieldAssignments.find(a => a.linemanId === p.id)
                  const df = a ? defs.find(d => d.id === a.defenderId) : null
                  return (
                    <div key={p.id} style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                      <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, color: '#C8A84B', fontSize: 15 }}>{p.label}</p>
                      {a ? (
                        <>
                          <p style={{ color: 'white', fontSize: 11, marginTop: 2 }}>{df?.label}</p>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                            {a.technique.split(' ')[0]}
                          </p>
                        </>
                      ) : (
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 2 }}>—</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Quiz ──────────────────────────────────────────────────────────────

  if (screen === 'quiz') {
    const playsWithKeys = PLAYS.filter(p => answerKeys[p.id])
    const activeKey = quizPlayId ? answerKeys[quizPlayId] : null
    const activeQuizFormation = activeKey?.formation ?? quizFormation
    const quizDefs = FORMATIONS[activeQuizFormation]
    const correctCount = quizAssignments.filter(a => a.correct).length
    const activePlay = PLAYS.find(p => p.id === quizPlayId)

    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3E' }}>
        <NavHeader title="Quiz Mode" onBack={navBack} />
        <div style={{ padding: '20px 24px' }}>
          {!quizSubmitted ? (
            <>
              {/* Play selector */}
              <div style={{ marginBottom: 16 }}>
                <span style={label}>Select Play to Quiz On</span>
                {playsWithKeys.length === 0 ? (
                  <div style={{
                    padding: '14px 18px',
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 12,
                  }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#ef4444', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 4px' }}>
                      No answer keys set yet
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>
                      Go to <button onClick={() => setScreen('playbook')} style={{ background: 'none', border: 'none', color: '#C8A84B', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 11, padding: 0, textDecoration: 'underline' }}>Playbook</button> and tap "Set Key" on a play first.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {playsWithKeys.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setQuizPlayId(p.id)
                          setQuizFormation(answerKeys[p.id].formation)
                          resetQuiz()
                        }}
                        style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '8px 16px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: quizPlayId === p.id ? '2px solid #C8A84B' : '1px solid rgba(200,168,75,0.3)',
                          background: quizPlayId === p.id ? 'rgba(200,168,75,0.15)' : 'transparent',
                          color: quizPlayId === p.id ? '#C8A84B' : 'rgba(255,255,255,0.55)',
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {quizPlayId && activeKey && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                        FORMATION
                      </span>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, color: '#C8A84B', fontSize: 13, letterSpacing: '0.08em' }}>
                        {activeQuizFormation}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}>ASSIGNED</span>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 24, color: '#C8A84B' }}>
                        {quizAssignments.length}<span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>/5</span>
                      </span>
                    </div>
                  </div>

                  {/* Quiz mode banner */}
                  <div style={{
                    background: 'rgba(200,168,75,0.07)',
                    border: '1px solid rgba(200,168,75,0.2)',
                    borderRadius: 10,
                    padding: '10px 16px',
                    marginBottom: 16,
                    textAlign: 'center',
                  }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(200,168,75,0.7)', fontSize: 10, letterSpacing: '0.14em' }}>
                      ⚡ QUIZ MODE — No hints. Assign every lineman's blocking responsibility.
                    </span>
                  </div>

                  <FieldSVG
                    defenders={quizDefs}
                    selectedLineman={quizSelected}
                    setSelectedLineman={setQuizSelected}
                    assignments={quizAssignments}
                    techPicker={quizPicker}
                    setTechPicker={setQuizPicker}
                    onTechSelect={handleQuizTech}
                  />

                  {quizAssignments.length === 5 && (
                    <button
                      onClick={submitQuiz}
                      style={{ ...goldBtn, width: '100%', marginTop: 20, padding: '14px', fontSize: 14 }}
                    >
                      Submit Answers
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            /* Results */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
              <div style={{
                width: 136, height: 136, borderRadius: '50%',
                border: `4px solid ${correctCount >= 4 ? '#C8A84B' : correctCount >= 3 ? '#f59e0b' : '#ef4444'}`,
                background: 'radial-gradient(circle at 40% 38%, #1e3366, #080f22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                marginBottom: 24,
                boxShadow: correctCount >= 4 ? '0 0 50px rgba(200,168,75,0.4)' : '0 0 40px rgba(239,68,68,0.2)',
              }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                  {correctCount}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                  / 5
                </span>
              </div>

              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 36, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
                {correctCount === 5 ? 'Perfect Read!' : correctCount >= 3 ? 'Good Work' : 'Keep Studying'}
              </h3>
              <p style={{ color: '#C8A84B', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>
                {correctCount >= 4 ? 'Championship-level recognition' : 'Review assignments and try again'}
              </p>
              {activePlay && (
                <p style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.12em', marginBottom: 28 }}>
                  {activePlay.name} · {activeQuizFormation}
                </p>
              )}

              <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {quizAssignments.map(a => {
                  const lm = OL.find(o => o.id === a.linemanId)
                  const df = quizDefs.find(d => d.id === a.defenderId)
                  const ok = a.correct !== false
                  return (
                    <div key={a.linemanId} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1px solid ${ok ? 'rgba(200,168,75,0.35)' : 'rgba(239,68,68,0.35)'}`,
                      background: ok ? 'rgba(200,168,75,0.05)' : 'rgba(239,68,68,0.05)',
                    }}>
                      <span style={{ fontSize: 16 }}>{ok ? '✓' : '✗'}</span>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, color: '#C8A84B', fontSize: 16, width: 32 }}>
                        {lm?.label}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, flex: 1, fontFamily: 'Inter, sans-serif' }}>
                        → {df?.label} · {a.technique}
                      </span>
                      {!ok && activeKey && (() => {
                        const correctA = activeKey.assignments.find(ka => ka.linemanId === a.linemanId)
                        const correctDf = correctA ? quizDefs.find(d => d.id === correctA.defenderId) : null
                        return (
                          <span style={{ color: '#ef4444', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>
                            should be {correctDf?.label ?? '?'}
                          </span>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={resetQuiz} style={ghostBtn}>Retry</button>
                <button onClick={() => setScreen('progress')} style={goldBtn}>View Progress</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Progress ──────────────────────────────────────────────────────────

  if (screen === 'progress') {
    const cats = [
      { cat: 'Front Recognition', pct: 91 },
      { cat: 'Zone Blocking',     pct: 78 },
      { cat: 'Combo Blocks',      pct: 85 },
      { cat: 'Pass Protection',   pct: 72 },
      { cat: 'Pulling Plays',     pct: 61 },
      { cat: 'Blitz Pickup',      pct: 55 },
    ]

    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3E' }}>
        <NavHeader title="Progress" onBack={navBack} />
        <div style={{ padding: '24px' }}>
          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {([
              { icon: '📋', value: '14', sub: 'of 18 installs',     lbl: 'Completed'     },
              { icon: '⚡', value: '84%', sub: '+6% this week',      lbl: 'Quiz Accuracy' },
              { icon: '🔍', value: '2.3s', sub: 'front ID speed',    lbl: 'Recognition'   },
              { icon: '🏆', value: '#2', sub: 'on the roster',       lbl: 'Position Rank' },
            ]).map(s => (
              <div key={s.lbl} style={card}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 36, fontWeight: 900, color: 'white', margin: '6px 0 2px' }}>{s.value}</p>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#C8A84B', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.lbl}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 3 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Accuracy bars */}
          <div style={{ ...card, marginBottom: 24 }}>
            <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, color: 'white', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 18px' }}>
              Assignment Accuracy by Category
            </h4>
            {cats.map(item => (
              <div key={item.cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>
                    {item.cat}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: scoreColor(item.pct) }}>
                    {item.pct}%
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${item.pct}%`,
                    background: scoreColor(item.pct),
                    boxShadow: item.pct >= 80 ? `0 0 10px ${scoreColor(item.pct)}80` : 'none',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, color: 'white', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
            Achievement Badges
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {BADGES.map(b => (
              <div key={b.id} style={{
                ...card,
                opacity: b.earned ? 1 : 0.45,
                borderColor: b.earned ? 'rgba(200,168,75,0.4)' : 'rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{b.icon}</span>
                  {b.earned && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#C8A84B', letterSpacing: '0.1em' }}>
                      EARNED
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, color: 'white', fontSize: 15, letterSpacing: '0.06em', margin: '0 0 4px' }}>
                  {b.name}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter, sans-serif', margin: 0, lineHeight: 1.4 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────

  if (screen === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B3E' }}>
        <NavHeader title="Coach Dashboard" onBack={navBack} />
        <div style={{ padding: '24px' }}>
          {/* Team readiness */}
          <div style={{
            ...card,
            background: 'linear-gradient(135deg, #162a5c 0%, #0e1e3f 100%)',
            borderColor: 'rgba(200,168,75,0.35)',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, color: 'white', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                  Team Readiness
                </h4>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: 0 }}>
                  14 of 18 installs complete · Week 4 of fall camp
                </p>
              </div>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 42, color: '#C8A84B', lineHeight: 1 }}>
                76%
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, width: '76%', background: 'linear-gradient(90deg, #C8A84B, #E8C94A)', boxShadow: '0 0 14px rgba(200,168,75,0.6)' }} />
            </div>
          </div>

          {/* Player table */}
          <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(200,168,75,0.1)' }}>
              <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, color: 'white', letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
                Player Completion
              </h4>
            </div>
            {ROSTER.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px',
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid rgba(200,168,75,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, color: '#C8A84B', fontSize: 12 }}>
                    {p.num}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, color: 'white', fontSize: 15, letterSpacing: '0.05em', margin: 0 }}>
                    {p.name}
                  </p>
                  <p style={{ color: '#C8A84B', fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', margin: '1px 0 0', letterSpacing: '0.1em' }}>
                    {p.pos}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', margin: '0 0 2px', letterSpacing: '0.1em' }}>INSTALL</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 16, color: scoreColor(p.install), margin: 0 }}>{p.install}%</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', margin: '0 0 2px', letterSpacing: '0.1em' }}>QUIZ</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 16, color: scoreColor(p.quiz), margin: 0 }}>{p.quiz}%</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', margin: '0 0 2px', letterSpacing: '0.1em' }}>FOCUS</p>
                  <p style={{ color: p.weak === '—' ? 'rgba(255,255,255,0.2)' : '#ef4444', fontSize: 11, fontFamily: 'Inter, sans-serif', margin: 0 }}>{p.weak}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent installs */}
          <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, color: 'white', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
            Recent Installs
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PLAYS.slice(0, 4).map(play => {
              const pct = (play.compl / play.total) * 100
              return (
                <div key={play.id} style={{
                  ...card,
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 18px',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, color: 'white', fontSize: 15, letterSpacing: '0.05em', margin: 0 }}>
                      {play.name}
                    </p>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', fontSize: 10, margin: '2px 0 0' }}>
                      {play.date}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 88, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: '#C8A84B', boxShadow: '0 0 6px rgba(200,168,75,0.5)' }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#C8A84B', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}
