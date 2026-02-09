/*
 *Test Rules:
 *- code-style/folder-component-suffix (components in layouts/ must end with "Layout")
 */

import { type ReactNode } from "react";

import { appStrings } from "@/strings";

export const MainLayout = ({ children }: { children: ReactNode }) => (
    <div className="flex min-h-screen flex-col">
        <header className="bg-gray-800 p-4 text-white">{appStrings.layout.header}</header>
        <main className="flex-1 p-6">{children}</main>
        <footer className="bg-gray-800 p-4 text-white">{appStrings.layout.footer}</footer>
    </div>
);
