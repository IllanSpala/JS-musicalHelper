export default function Footer() {
  return (
    <footer className="relative w-full bg-dark text-background rounded-t-[4rem] px-8 pt-20 pb-10 z-30 -mt-10 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-b border-background/10 pb-12 mb-8">
        
        <div className="mb-10 md:mb-0">
          <span className="font-heading font-black text-4xl tracking-tighter block mb-2">jojoTools</span>
          <span className="font-drama italic text-accent text-2xl block">Educação Musical de Precisão</span>
        </div>

        <div className="flex flex-col items-start md:items-end space-y-4">
          <div className="flex items-center space-x-3 px-4 py-2 border border-background/10 rounded-full font-data text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="opacity-70">SYSTEM OPERATIONAL</span>
          </div>
          <span className="font-data text-xs opacity-50 uppercase tracking-widest">
            Protocol: Brutalist Signal
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between text-xs font-data opacity-50">
        <p>&copy; {new Date().getFullYear()} jojoTools. All systems nominal.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-accent transition-colors">Termos</a>
          <a href="#" className="hover:text-accent transition-colors">Privacidade</a>
        </div>
      </div>
    </footer>
  );
}
