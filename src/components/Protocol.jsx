import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';



gsap.registerPlugin(ScrollTrigger);

export default function Protocol() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');
      
      cards.forEach((card, i) => {
        if(i < cards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: cards[i + 1],
            end: 'top top',
            pin: true,
            pinSpacing: false,
          });

          gsap.to(card, {
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top bottom',
              end: 'top top',
              scrub: true,
            },
            scale: 0.9,
            opacity: 0.5,
            filter: 'blur(20px)',
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const protocols = [
    {
      step: '01',
      title: 'Treinar com Metrônomo',
      desc: 'Sincronização de batidas precisas. Uma interface para segurar seu "time", dominar subdivisões sem perder o foco na música.',
      href: "./ferramentas/PolyMetro.html",
      bgUrl: "./metronome_piano.png"
    },
    {
      step: '02',
      title: 'Praticador de Escalas',
      desc: 'Sistema visual completo de grade teórica para decorar padrões nas cordas. Compreenda mapeamentos, transições e escalas como um profissional.',
      href: "./ferramentas/ScaleMachine.html",
      bgUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop"
    },
    {
      step: '03',
      title: 'Upar Tablaturas',
      desc: 'Um leitor avançado integrado em tempo real para visualizar suas sessões imediatamente. Carregue, pratique e evolua a leitura da pauta num ambiente fluido.',
      href: "./ferramentas/TabPlayer.html",
      bgUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=2070&auto=format&fit=crop"
    },
    {
      step: '04',
      title: 'Gravidade Harmônica',
      desc: 'Explore a teia emocional dos acordes em tempo real. Construa progressões arrastando shapes CAGED, ouça arpejos e descubra a lógica por trás de cada grau tonal.',
      href: "./ferramentas/HarmonicMap.html",
      bgUrl: "./circle_of_fifths.svg"
    }
  ];


  return (
    <section ref={containerRef} id="protocol" className="relative w-full bg-background z-20">
      {protocols.map((proto, idx) => (
        <div key={idx} className="protocol-card min-h-screen w-full flex flex-col md:flex-row items-center justify-center p-8 bg-background border-b border-textDark/10">
          
          <div className="w-full md:w-1/2 p-8 md:p-20 relative z-10 flex flex-col justify-center items-start">
            <span className="font-data text-accent text-sm mb-4 block opacity-80">SYS.STEP_{proto.step}</span>
            <h2 className="font-heading font-black text-5xl md:text-7xl text-textDark uppercase mb-8">
              {proto.title}
            </h2>
            <p className="font-data text-textDark font-medium max-w-md leading-relaxed text-lg mb-10">
              {proto.desc}
            </p>
            <a href={proto.href} className="premium-btn border border-textDark bg-primary hover:bg-textDark hover:text-white text-textDark px-8 py-4 font-heading font-black tracking-widest text-sm uppercase">
              Abrir Ferramenta
            </a>
          </div>

          <div className="w-full md:w-1/2 h-[50vh] md:h-screen p-4 md:p-10 flex items-center justify-center relative overflow-hidden group">
            <a href={proto.href} className="relative w-full aspect-square md:aspect-auto md:w-[80%] md:h-[70%] bg-primary rounded-[3rem] overflow-hidden drop-shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.02]">
               <div 
                 className="absolute inset-0 bg-cover bg-center opacity-80 grayscale mix-blend-multiply transition-all duration-700"
                 style={{ backgroundImage: `url(${proto.bgUrl})` }}
               ></div>
               <div className="absolute inset-0 border border-textDark/10 rounded-[3rem]"></div>
            </a>
          </div>
          
        </div>
      ))}
    </section>
  );
}
