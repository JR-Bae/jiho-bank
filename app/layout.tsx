import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from 'next-themes';
import { gaegu } from '@/lib/fonts';

export const metadata: Metadata = {
    title: "지호의 저금통",
    description: "우리 아이의 첫 저금통",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
        <body className={gaegu.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            suppressHydrationWarning
        >
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}