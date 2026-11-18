import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// =====================================================
// TIPOS
// =====================================================
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

interface ThemeProviderProps {
    children: ReactNode;
}

// =====================================================
// CONTEXTO
// =====================================================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // La barra de estado del móvil sigue el tema de la app
        // (no el del sistema), así que la actualizamos aquí.
        const themeColor = window.document.querySelector('meta[name="theme-color"]');
        themeColor?.setAttribute('content', theme === 'dark' ? '#263556' : '#e3f0f7');

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = (): void => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// =====================================================
// HOOK
// =====================================================
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de ThemeProvider');
    }
    return context;
};