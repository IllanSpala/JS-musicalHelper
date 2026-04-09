import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Philosophy from './components/Philosophy';
import Protocol from './components/Protocol';
import Footer from './components/Footer';

function App() {
  return (
    <>
      {/* Global Noise Overlay Required by the System */}
      <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
      
      <main className="w-full min-h-screen relative overflow-x-hidden">
        <Navbar />
        <Hero />
        <Features />
        <Philosophy />
        <Protocol />
        <Footer />
      </main>
    </>
  );
}

export default App;
