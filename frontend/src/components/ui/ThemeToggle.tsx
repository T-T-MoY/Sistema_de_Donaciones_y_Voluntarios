import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
    /**
     * 'default' → superficies claras/neutras de la app.
     * 'dark'    → superficies nocturnas fijas (navbar y hero de la landing),
     *             donde los tokens claros quedarían fuera de lugar.
     */
    variant?: 'default' | 'dark';
}

const ThemeToggle = ({ variant = 'default' }: ThemeToggleProps) => {
    const { theme, toggleTheme } = useTheme();

    const estilos = variant === 'dark'
        ? 'border-white/15 bg-white/[0.06] text-cream/80 hover:border-gold/60 hover:bg-white/[0.12] hover:text-cream'
        : 'border-border bg-surface-elevated text-text-muted shadow-soft hover:border-accent/60 hover:bg-accent-soft hover:text-text';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`press group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${estilos}`}
            aria-label={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
            title={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
        >
            {theme === 'light' ? (
                // Luna
                <svg
                    className="h-[18px] w-[18px] transition-transform duration-300 ease-out-soft motion-safe:group-hover:-rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                // Sol
                <svg
                    className="h-[18px] w-[18px] transition-transform duration-300 ease-out-soft motion-safe:group-hover:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;
