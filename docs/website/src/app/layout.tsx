import "./globals.css"; // eslint-disable-line code-style/absolute-imports-only -- Next.js app directory CSS

import type { Metadata } from "next";
import type React from "react";

import { Navbar } from "@/components";
import { ThemeProvider } from "@/components";
import { layoutStringsData, metadataStringsData } from "@/data";

export const metadata: Metadata = {
    authors: [
        {
            name: metadataStringsData.authorName,
            url: metadataStringsData.authorUrl,
        },
    ],
    creator: metadataStringsData.authorName,
    description: metadataStringsData.defaultDescription,
    keywords: metadataStringsData.keywords.split(","),
    metadataBase: new URL("https://www.eslint-plugin-code-style.org"),
    openGraph: {
        description: metadataStringsData.ogDescription,
        locale: "en_US",
        siteName: metadataStringsData.ogSiteName,
        title: metadataStringsData.ogTitle,
        type: "website",
        url: "https://www.eslint-plugin-code-style.org",
    },
    publisher: metadataStringsData.authorName,
    robots: {
        follow: true,
        index: true,
    },
    title: {
        default: metadataStringsData.defaultTitle,
        template: metadataStringsData.titleTemplate,
    },
    twitter: {
        card: "summary_large_image",
        description: metadataStringsData.twitterDescription,
        title: metadataStringsData.twitterTitle,
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
