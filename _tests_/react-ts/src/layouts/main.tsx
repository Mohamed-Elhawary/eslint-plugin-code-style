/*
 *Test Rules:
 *- code-style/folder-component-suffix (components in layouts/ must end with "Layout")
 */

import { type ReactNode } from "react";

import { appStrings } from "@/strings";

export const MainLayout = ({ children }: { children: ReactNode }) => (
    <div className="layout-container">
        <header className="layout-header">{appStrings.layout.header}</header>
        <main className="layout-main">{children}</main>
        <footer className="layout-footer">{appStrings.layout.footer}</footer>
    </div>
);
