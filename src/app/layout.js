import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export const metadata = {
  title: "UrTask | Project & Task Management",
  description: "Modern, responsive project & task management system with dark/light mode and multi-language support.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased bg-slate-50 dark:bg-[#0C0C0E] text-slate-900 dark:text-white transition-colors">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppLayoutWrapper>{children}</AppLayoutWrapper>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
