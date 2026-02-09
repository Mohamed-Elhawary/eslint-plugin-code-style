/*
 *Test Rules:
 *- code-style/folder-component-suffix (components in layouts/ must end with "Layout")
 *- tailwindcss/classnames-order
 */

import { appStrings } from "@/strings";

export const MainLayout = ({ children }) => (
    <div className="flex min-h-screen flex-col">
        <header className="bg-gray-800 p-4 text-white">{appStrings.header}</header>
        <main className="flex-1 p-6">{children}</main>
        <footer className="bg-gray-800 p-4 text-white">{appStrings.footer}</footer>
    </div>
);
