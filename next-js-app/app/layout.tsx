import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/context/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSA Algorithms Visualizer",
  description: "Interactive DSA algorithms powered by C++ and WebAssembly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
        <SidebarProvider>
          <div className="min-h-screen flex">
            <AppSidebar />
            <SidebarTrigger />
            <main className="flex-1 flex flex-col items-center justify-center p-8">
              {children}
            </main>
          </div>
        </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
