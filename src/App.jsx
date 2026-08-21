import HomeNavbar from './components/HomeNavbar';
import ToolsHub from './components/ToolsHub';
import HomeFooter from './components/HomeFooter';

function App() {
  return (
    <>
      {/* Subtle noise texture overlay */}
      <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      <div className="min-h-screen w-full flex flex-col" style={{ background: '#111111' }}>
        <HomeNavbar />
        <ToolsHub />
        <HomeFooter />
      </div>
    </>
  );
}

export default App;
