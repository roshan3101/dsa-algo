"use client"

import { createContext, useState, useEffect } from "react";


type Theme = "light" | "dark";

type ThemeContextValue = {
    theme : Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({children}: {children: React.ReactNode}) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const stored = window.localStorage.getItem("dsa-theme") as Theme | null;
        if(stored == "light" || stored == "dark") {
            setTheme(stored);
            applyTheme(stored);
        }
        else{
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const initial = prefersDark ? "dark" : "light";
            setTheme(initial);
            applyTheme(initial);
        }

    }, []);

    const applyTheme = (t: Theme) => {
        const root = document.documentElement;
        if(t == "dark"){
            root.classList.add("dark");
        }else{
            root.classList.remove("dark");
        }
    };

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev == "dark" ? "light" : "dark";
            window.localStorage.setItem("dsa-theme", next);
            applyTheme(next);
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}