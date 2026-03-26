export type ResolvedThemeType = "dark" | "light";

export type ThemeSnapshotType = {
    resolved: ResolvedThemeType,
    theme: ThemeType,
};

export type ThemeType = "dark" | "light" | "system";
