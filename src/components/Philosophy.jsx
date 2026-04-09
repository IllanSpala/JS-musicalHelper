import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Line by line reveal
      gsap.from('.ph-line', {
        scrollTrigger: {
          trigger: container.current,
          start: 'top 60%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, container);
    return () => ctx.revert();
  }, []);

  // Wooden guitar / piano / vintage audio texture
  const bg = "url('https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070&auto=format&fit=crop')";

  return (
    <section ref={container} id="philosophy" className="relative w-full py-40 bg-dark overflow-hidden z-20">
      <div 
        className="absolute inset-0 opacity-15 bg-fixed grayscale mix-blend-screen"
        style={{
          backgroundImage: bg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-16 flex flex-col justify-center min-h-[40vh]">
        <div className="mb-16 ph-line font-bold text-background font-heading text-lg max-w-xl left-border pl-6 border-l-2 border-background/20">
          A maioria da indústria foca em: <br/> "Interfaces complexas, dispersas e catracas de pagamento."
        </div>
        
        <div className="ph-line text-4xl md:text-6xl text-background font-heading font-black leading-tight">
          Nós focamos em:
          <br/>
          <span className="font-drama italic text-accent text-6xl md:text-8xl mt-4 block">
            Didática Pura.
          </span>
        </div>
      </div>
    </section>
  );
}
