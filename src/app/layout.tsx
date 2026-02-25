import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Rialo Alpha | Semi-Agentic Commerce",
    description: "Advanced AI-driven commerce and trading automation framework.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen">
                    <main className="relative z-10">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
