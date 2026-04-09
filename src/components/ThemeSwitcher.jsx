import { useTheme } from './ThemeContext';
import { Palette } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className={`premium-btn flex items-center space-x-2 px-4 py-2 text-sm rounded-full border transition-all duration-300
        ${theme === 'vapor' 
          ? 'border-accent text-accent bg-primary/20 hover:bg-accent hover:text-white' 
          : 'border-textDark text-textDark bg-background/50 hover:bg-textDark hover:text-background'}`}
    >
      <Palette size={16} />
      <span className="font-data uppercase tracking-widest text-[10px]">
        {theme === 'vapor' ? 'Vapor Clinic' : 'Brutalist Signal'}
      </span>
    </button>
  );
}
