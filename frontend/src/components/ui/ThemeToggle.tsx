import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
    /**
     * 'default' → usa los tokens claro/oscuro de la app.
     * 'dark'    → para superficies oscuras fijas (navbar de la landing),
     *             donde los tokens claros quedarían fuera de lugar.
     */
    variant?: 'default' | 'dark';
}

const ThemeToggle = ({ variant = 'default' }: ThemeToggleProps) => {
    const { theme, toggleTheme } = useTheme();

    const estilos = variant === 'dark'
        ? 'border border-white/20 bg-white/[0.07] text-arena-ivory/85 hover:border-white/30 hover:bg-white/[0.12] hover:text-arena-ivory'
        : 'border border-claro-borde bg-claro-tinte text-claro-primario hover:bg-claro-tinte/70 dark:border-oscuro-borde dark:bg-oscuro-tinte dark:text-oscuro-primario dark:hover:bg-oscuro-tinte/70 shadow-soft';

    return (
        <button
            onClick={toggleTheme}
            className={`press rounded-xl p-2.5 ${estilos}`}
            aria-label={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
            title={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
        >
            {theme === 'light' ? (
                // Icono de Luna
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                // Icono de Sol
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;
