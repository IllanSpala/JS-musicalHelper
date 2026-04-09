import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Hero() {
  const container = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-animate', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2
      });
    }, container);
    return () => ctx.revert();
  }, []); 

  // Music studio context (Raw/Acoustic Brutalism)
  const bg = "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop&sat=-100')";

  return (
    <section 
      ref={container}
      className="relative w-full h-[100dvh] flex items-end justify-start pb-20 md:pb-32 px-6 md:px-16"
      style={{
        backgroundImage: bg,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-primary/10"></div>
      
      <div className="relative z-10 max-w-4xl text-textDark">
        <h1 className="flex flex-col mb-6">
          <span className="hero-animate font-heading font-black text-4xl md:text-6xl tracking-tight uppercase">
            Eleve sua
          </span>
          <span className="hero-animate font-drama italic text-7xl md:text-[8rem] leading-[0.8] text-accent">
            Musicalidade.
          </span>
        </h1>
        
        <p className="hero-animate font-data text-lg md:text-xl max-w-xl mb-10 text-white/90 leading-relaxed uppercase tracking-wide">
          Um ecossistema de ferramentas essenciais de precisão: afine seu estudo, leia tablaturas e visualize escalas em um só lugar.
        </p>

        <div className="hero-animate flex flex-col md:flex-row gap-4">
          <a href="#protocol" className="premium-btn-accent shadow-xl shadow-accent/20">
            Começar Agora
          </a>
        </div>
      </div>
    </section>
  );
}
