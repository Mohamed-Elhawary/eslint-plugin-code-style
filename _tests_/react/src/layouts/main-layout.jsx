/*
 *Test Rules:
 *- code-style/folder-component-suffix (components in layouts/ must end with "Layout")
 */

export const MainLayout = ({ children }) => (
    <div className="layout">
        <header>{children}</header>
        <main>{children}</main>
    </div>
);
