import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import {
    MD3LightTheme,
    MD3DarkTheme,
    adaptNavigationTheme,
    MD3Theme
} from "react-native-paper";
import {
    DefaultTheme as NavigationDefaultTheme,
    DarkTheme as NavigationDarkTheme,
    Theme as NavigationTheme
} from "@react-navigation/native";
import merge from "deepmerge";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
    theme: MD3Theme & NavigationTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    const theme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useAppTheme must be used within a ThemeProvider");
    }
    return context;
}
