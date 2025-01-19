import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from 'next-themes';
import { fonts } from '@/lib/fonts'; // 불러온 fonts 사용

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
        <body className={`${fonts.poorStory}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
