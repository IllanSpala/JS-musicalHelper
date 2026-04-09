import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export default function Features() {
  return (
    <section id="features" className="relative w-full min-h-screen py-32 px-6 md:px-16 bg-background z-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading font-black text-3xl md:text-5xl uppercase mb-16 text-textDark border-b border-textDark/20 pb-4">
          Núcleo <span className="font-drama italic text-accent lowercase">Operacional</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <DiagnosticShuffler />
          <TelemetryTypewriter />
          <CursorProtocolScheduler />
        </div>
      </div>
    </section>
  );
}

function DiagnosticShuffler() {
  const [cards, setCards] = useState([
    { id: 1, text: "ESTUDE" },
    { id: 2, text: "PRATIQUE" },
    { id: 3, text: "EVOLUA" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const last = newCards.pop();
        newCards.unshift(last);
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-80 bg-background border border-textDark/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-textDark/10">
        <h3 className="font-heading font-bold text-lg text-textDark uppercase">Rápido</h3>
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
      </div>
      <p className="font-data text-sm font-semibold text-textDark mb-6 h-12">
        Interfaces projetadas para treino direto. Sem distrações.
      </p>
      
      <div className="relative h-32 w-full flex flex-col items-center justify-center">
        {cards.map((card, index) => (
          <div 
            key={card.id}
            className="absolute p-4 w-full text-center bg-primary border text-textDark border-textDark/10 rounded-2xl shadow-md font-heading font-black text-sm tracking-widest uppercase transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              transform: `translateY(${index * 15}px) scale(${1 - index * 0.05})`,
              zIndex: 3 - index,
              opacity: 1 - index * 0.3
            }}
          >
            {card.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function TelemetryTypewriter() {
  const [text, setText] = useState('');
  const fullText = "> O acesso total a escalas, tablaturas e metrônomos consolida a evolução de qualquer músico.";
  
  useEffect(() => {
    let i = 0;
    let isWaiting = false;

    const interval = setInterval(() => {
      if (isWaiting) return;

      setText(fullText.substring(0, i));
      i++;

      if (i > fullText.length) {
        isWaiting = true; 
        setTimeout(() => {
          i = 0;
          isWaiting = false;
        }, 4000); // Pausa de 4 segundos após completar o texto
      }
    }, 80);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-80 bg-background border border-textDark/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-textDark/10">
        <h3 className="font-heading font-bold text-lg text-textDark uppercase">Democrático</h3>
        <span className="font-data text-xs text-accent px-2 py-1 bg-accent/10 rounded">Live Feed</span>
      </div>
      
      <div className="p-4 bg-primary/50 rounded-2xl h-40 font-data text-sm text-textDark leading-relaxed border border-textDark/5">
        <span className="opacity-50">sys.log.append:</span><br/>
        <span className="text-accent">{text}</span>
        <span className="w-2 h-4 inline-block bg-accent animate-pulse ml-1 align-middle"></span>
      </div>
    </div>
  );
}

function CursorProtocolScheduler() {
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });
      
      tl.to(cursorRef.current, { x: 14, y: 34, duration: 1 }) // Coordenada ajustada para o "D"
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 })
        .to('.grid-cell-0', { backgroundColor: 'var(--color-accent)', color: '#fff', duration: 0.1 })
        .to(cursorRef.current, { scale: 1, duration: 0.1 })
        .to(cursorRef.current, { x: 160, y: 80, duration: 1, delay: 0.5 })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 })
        .to('.grid-save', { backgroundColor: 'var(--color-accent)', color: '#fff', duration: 0.1 })
        .to(cursorRef.current, { scale: 1, duration: 0.1 })
        .to(cursorRef.current, { opacity: 0, duration: 0.5 })
        .to('.grid-cell-0, .grid-save', { backgroundColor: 'transparent', color: 'inherit', duration: 0.1 }) 
        .to(cursorRef.current, { x: 0, y: 0, opacity: 1, duration: 0.1 }); 
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="h-80 bg-background border border-textDark/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-textDark/10">
        <h3 className="font-heading font-bold text-lg text-textDark uppercase">Gratuito</h3>
        <span className="text-xs font-data opacity-50 px-2 py-1 rounded border border-textDark/20">Open_Source</span>
      </div>
      
      <p className="font-data text-xs font-semibold mb-4 h-8 text-textDark">Estude de domingo a domingo. 100% livre e disponível.</p>

      <div className="relative border border-textDark/10 p-2 rounded-xl bg-primary/20">
        <div className="grid grid-cols-7 gap-1 mb-2 font-data text-[10px] text-center text-textDark">
          <span className="grid-cell-0 transition-colors rounded">D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => (
             <div key={i} className="h-6 rounded bg-textDark/5"></div>
          ))}
        </div>
        <div className="mt-2 text-right">
          <span className="grid-save inline-block px-3 py-1 border border-textDark/10 rounded text-[10px] font-heading font-bold transition-colors">TOCAR</span>
        </div>
        
        <div ref={cursorRef} className="absolute top-0 left-0 text-accent filter drop-shadow-md z-10 w-4 h-4 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 2L11.4 22L14.7 14.7L22 11.4L4 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}