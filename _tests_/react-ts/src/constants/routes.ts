/*
 *Test Rules:
 *- code-style/folder-based-naming-convention (camelCase with suffix for constants folder)
 *  File: routes.ts → expected name: routesConstants (not routeConstants)
 *- code-style/no-hardcoded-strings (constants should be in constants folder)
 */

export const routesConstants = {
    dashboard: "/dashboard",
    home: "/",
    login: "/login",
    profile: "/profile",
};
