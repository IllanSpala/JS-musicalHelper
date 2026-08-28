import { useState } from 'react';

/* ─── Tool definitions ─── */
const TOOLS = [
  {
    id: 'poly-metro',
    label: 'Metrônomo Polirrítmico',
    shortLabel: 'Metrônomo Polirrítmico',
    desc: 'Subdivida o tempo com precisão cirúrgica. Sincronize seu timing.',
    icon: '⟁',
    href: './ferramentas/PolyMetro.html',
    tag: 'SYS.01',
    color: '#00C9A7',
  },
  {
    id: 'scale-machine',
    label: 'Praticador de Escalas',
    shortLabel: 'Escalas',
    desc: 'Visualize padrões, posições e shapes CAGED em tempo real no braço.',
    icon: '♯',
    href: './ferramentas/ScaleMachine.html',
    tag: 'SYS.02',
    color: '#E63B2E',
  },
  {
    id: 'tab-player',
    label: 'Leitor de Tablaturas',
    shortLabel: 'Tablaturas',
    desc: 'Carregue, visualize e pratique tablaturas em um ambiente fluido e imersivo.',
    icon: '≡',
    href: './ferramentas/TabPlayer.html',
    tag: 'SYS.03',
    color: '#F59E0B',
  },
  {
    id: 'harmonic-map',
    label: 'Mapa Harmônico',
    shortLabel: 'Mapa Harmônico',
    desc: 'Teia harmônica dos acordes. Construa progressões e descubra os graus tonais.',
    icon: '◎',
    href: './ferramentas/HarmonicMap.html',
    tag: 'SYS.04',
    color: '#7B61FF',
  },
  {
    id: 'composition-engine',
    label: 'Motor de Composição',
    shortLabel: 'Composição',
    desc: 'Construa progressões harmoniosas e procedurais em uma teia interativa.',
    icon: '✦',
    href: './ferramentas/CompositionEngine.html',
    tag: 'SYS.05',
    color: '#A78BFA',
  },
];

/* ─── Individual Card ─── */
function ToolCard({ tool }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={tool.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`
          : `rgba(255,255,255,0.035)`,
        border: hovered
          ? `1px solid rgba(255,255,255,0.18)`
          : `1px solid rgba(255,255,255,0.07)`,
        borderRadius: '20px',
        padding: 'clamp(24px, 3vw, 40px)',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${tool.color}22, inset 0 1px 0 rgba(255,255,255,0.1)`
          : '0 4px 20px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow behind icon on hover */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: tool.color,
        opacity: hovered ? 0.06 : 0,
        filter: 'blur(40px)',
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      {/* Tag */}
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 'clamp(0.6rem, 0.9vw, 0.72rem)',
        color: tool.color,
        opacity: 0.85,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: 'clamp(14px, 2vw, 22px)',
        display: 'block',
      }}>
        {tool.tag}
      </span>

      {/* Icon */}
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
        color: hovered ? tool.color : 'rgba(255,255,255,0.6)',
        marginBottom: 'clamp(12px, 2vw, 20px)',
        transition: 'color 0.3s ease',
        lineHeight: 1,
        fontWeight: 300,
      }}>
        {tool.icon}
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(1rem, 1.6vw, 1.35rem)',
        color: '#F5F3EE',
        margin: '0 0 clamp(10px, 1.2vw, 14px) 0',
        lineHeight: 1.2,
        letterSpacing: '-0.3px',
      }}>
        {tool.label}
      </h2>

      {/* Description */}
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 'clamp(0.72rem, 1vw, 0.82rem)',
        color: 'rgba(255,255,255,0.45)',
        margin: '0 0 auto 0',
        lineHeight: 1.65,
        flexGrow: 1,
      }}>
        {tool.desc}
      </p>

      {/* CTA Arrow */}
      <div style={{
        marginTop: 'clamp(20px, 2.5vw, 30px)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: hovered ? tool.color : 'rgba(255,255,255,0.3)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(0.72rem, 0.9vw, 0.8rem)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        transition: 'color 0.3s ease',
      }}>
        Abrir Ferramenta
        <svg
          style={{
            transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.3s ease',
          }}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </a>
  );
}

/* ─── Main Hub ─── */
export default function ToolsHub() {
  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(48px, 7vw, 96px) clamp(20px, 5vw, 60px) clamp(40px, 5vw, 72px)',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Header block */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        marginBottom: 'clamp(40px, 6vw, 72px)',
      }}>
        {/* Overline */}
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.65rem, 0.9vw, 0.75rem)',
          color: '#E63B2E',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 'clamp(12px, 1.5vw, 18px)',
        }}>
          Ecossistema de Ferramentas — v2.0
        </span>

        {/* Main heading */}
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(2.2rem, 5.5vw, 5rem)',
          color: '#F5F3EE',
          margin: 0,
          lineHeight: 1.0,
          letterSpacing: '-2px',
          textTransform: 'uppercase',
        }}>
          JoJo<span style={{ color: '#E63B2E' }}>Tools</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.75rem, 1.1vw, 0.9rem)',
          color: 'rgba(255,255,255,0.4)',
          margin: 'clamp(12px, 1.5vw, 18px) 0 0 0',
          letterSpacing: '0.5px',
          maxWidth: '520px',
          lineHeight: 1.6,
        }}>
          Precisão teórica. Prática imersiva. Escolha sua ferramenta abaixo.
        </p>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(240px, 22vw, 320px), 1fr))',
        gap: 'clamp(16px, 2vw, 28px)',
        width: '100%',
        maxWidth: '1200px',
      }}>
        {TOOLS.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Bottom system status tag */}
      <div style={{
        marginTop: 'clamp(40px, 5vw, 64px)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 18px',
        borderRadius: '9999px',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#22c55e',
          display: 'inline-block',
          boxShadow: '0 0 8px #22c55e',
          animation: 'pulse-green 2s infinite',
        }} />
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.6rem, 0.8vw, 0.7rem)',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          SYSTEM OPERATIONAL — 5 MODULES ONLINE
        </span>

        <style>{`
          @keyframes pulse-green {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </main>
  );
}
