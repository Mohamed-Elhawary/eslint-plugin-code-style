"use client";

import type React from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    componentStringsData,
    eventNameValuesEnumsData,
    localStorageKeyValuesEnumsData,
    methodNameValuesEnumsData,
    themeValuesEnumsData,
} from "@/data";
import type { ThemeContextValueInterface } from "@/interfaces";
import type { ResolvedThemeType, ThemeSnapshotType, ThemeType } from "@/types";

const ThemeContext = createContext<ThemeContextValueInterface | undefined>(undefined);

const getStoredThemeHandler = (): ThemeType => {
    const stored = localStorage.getItem(localStorageKeyValuesEnumsData.theme);

    return stored === themeValuesEnumsData.light || stored === themeValuesEnumsData.dark || stored === themeValuesEnumsData.system ? stored : themeValuesEnumsData.system;
};

const getSystemDarkHandler = (): boolean => window.matchMedia(componentStringsData.prefersColorSchemeDark).matches;

const resolveThemeHandler = (theme: ThemeType): ResolvedThemeType => {
    if (theme === themeValuesEnumsData.system) return getSystemDarkHandler() ? themeValuesEnumsData.dark : themeValuesEnumsData.light;

    return theme;
};

let themeStore: ThemeSnapshotType = {
    resolved: themeValuesEnumsData.light,
    theme: themeValuesEnumsData.system,
};

const themeListeners = new Set<() => void>();

const notifyListenersHandler = () => themeListeners.forEach((listener) => listener());

const subscribeToThemeHandler = (callback: () => void) => {
    themeListeners.add(callback);

    return () => themeListeners[methodNameValuesEnumsData.deleteMethod](callback);
};

const getThemeSnapshotHandler = () => themeStore;

const getThemeServerSnapshotHandler = (): ThemeSnapshotType => ({
    resolved: themeValuesEnumsData.light,
    theme: themeValuesEnumsData.system,
});

const updateThemeStoreHandler = (newTheme: ThemeType) => {
    const resolved = resolveThemeHandler(newTheme);

    themeStore = {
        resolved,
        theme: newTheme,
    };

    localStorage.setItem(
        localStorageKeyValuesEnumsData.theme,
        newTheme,
    );

    document.documentElement.classList.toggle(
        themeValuesEnumsData.dark,
        resolved === themeValuesEnumsData.dark,
    );

    notifyListenersHandler();
};

const initializeThemeStoreHandler = () => {
    const theme = getStoredThemeHandler();

    const resolved = resolveThemeHandler(theme);

    themeStore = {
        resolved,
        theme,
    };

    document.documentElement.classList.toggle(
        themeValuesEnumsData.dark,
        resolved === themeValuesEnumsData.dark,
    );

    notifyListenersHandler();
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        resolved: resolvedTheme,
        theme,
    } = useSyncExternalStore(
        subscribeToThemeHandler,
        getThemeSnapshotHandler,
        getThemeServerSnapshotHandler,
    );

    const setThemeHandler = useCallback(
        (newTheme: ThemeType) => updateThemeStoreHandler(newTheme),
        [],
    );

    const value = useMemo(
        () => ({
            onSetTheme: setThemeHandler,
            resolvedTheme,
            theme,
        }),
        [
            theme,
            setThemeHandler,
            resolvedTheme,
        ],
    );

    useEffect(
        () => {
            initializeThemeStoreHandler();

            const mediaQuery = window.matchMedia(componentStringsData.prefersColorSchemeDark);

            const changeHandler = () => {
                if (themeStore.theme === themeValuesEnumsData.system) {
                    const resolved = getSystemDarkHandler() ? themeValuesEnumsData.dark : themeValuesEnumsData.light;

                    themeStore = {
                        ...themeStore,
                        resolved,
                    };

                    document.documentElement.classList.toggle(
                        themeValuesEnumsData.dark,
                        resolved === themeValuesEnumsData.dark,
                    );

                    notifyListenersHandler();
                }
            };

            mediaQuery.addEventListener(
                eventNameValuesEnumsData.change,
                changeHandler,
            );

            return () => mediaQuery.removeEventListener(
                eventNameValuesEnumsData.change,
                changeHandler,
            );
        },
        [],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

// eslint-disable-next-line code-style/folder-based-naming-convention -- React hook naming convention
export const useTheme = (): ThemeContextValueInterface => {
    const context = useContext(ThemeContext);

    if (!context) throw new Error(componentStringsData.useThemeError);

    return context;
};
