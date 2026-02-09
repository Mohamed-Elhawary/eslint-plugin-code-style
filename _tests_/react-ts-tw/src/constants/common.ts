/*
 *Test Rules:
 *- code-style/folder-based-naming-convention (camelCase with suffix for constants folder)
 *  File: common.ts → expected name: commonConstants (suffix auto-fixed)
 *- code-style/no-hardcoded-strings (constants should be in constants folder)
 */

export const commonConstants = {
    appName: "MyApp",
    version: "1.0.0",
};
