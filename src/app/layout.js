import { Inter } from "next/font/google";
import "./globals.css";
import Titlebar from "@/components/Titlebar";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JustNotes",
  description: "A premium notes app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased h-screen overflow-hidden`}>
        <ThemeProvider>
          <Titlebar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
