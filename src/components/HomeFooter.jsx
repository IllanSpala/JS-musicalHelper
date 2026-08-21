export default function HomeFooter() {
  return (
    <footer style={{
      width: '100%',
      padding: '16px 0 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.15)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        maxWidth: '1200px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.6rem, 0.8vw, 0.7rem)',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}>
          © {new Date().getFullYear()} JoJoTools — All systems nominal.
        </span>

        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.6rem, 0.8vw, 0.7rem)',
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}>
          Protocol: Brutalist Signal — Open Source
        </span>
      </div>
    </footer>
  );
}
