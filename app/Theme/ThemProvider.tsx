import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { useColorScheme } from 'nativewind';

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
    const { setColorScheme } = useColorScheme();
    const systemTheme = Appearance.getColorScheme();
    const [theme, setTheme] = useState(systemTheme || 'light');

    function toggleTheme() {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setColorScheme(newTheme);
    }

    useEffect(() => {
        setColorScheme(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
        </ThemeContext.Provider>
    );
}
