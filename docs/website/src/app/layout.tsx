import "./globals.css"; // eslint-disable-line code-style/absolute-imports-only -- Next.js app directory CSS

import type { Metadata } from "next";
import type React from "react";

import { Navbar } from "@/components";
import { ThemeProvider } from "@/components";
import { layoutStringsData, metadataStringsData } from "@/data";

export const metadata: Metadata = {
    description: metadataStringsData.defaultDescription,
    metadataBase: new URL("https://eslint-plugin-code-style.vercel.app"),
    openGraph: {
        description: metadataStringsData.ogDescription,
        siteName: metadataStringsData.ogSiteName,
        title: metadataStringsData.ogTitle,
        type: "website",
        url: "https://eslint-plugin-code-style.vercel.app",
    },
    title: {
        default: metadataStringsData.defaultTitle,
        template: metadataStringsData.titleTemplate,
    },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
    <html
        lang="en"
        suppressHydrationWarning
    >
        <head>
            <script dangerouslySetInnerHTML={{ __html: layoutStringsData.themeInitScript }} />
        </head>
        <body
            className="min-h-screen font-sans antialiased"
            suppressHydrationWarning
        >
            <ThemeProvider>
                <Navbar />
                <main className="pt-16">{children}</main>
            </ThemeProvider>
        </body>
    </html>
);

// eslint-disable-next-line import-x/no-default-export
export default RootLayout;
