import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export const metadata = {
  title: "TaskFlow | Project & Task Management",
  description: "Modern, responsive project & task management system with dark/light mode and multi-language support.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className="min-h-full font-['Tajawal',sans-serif] antialiased bg-[#FAF9F6] dark:bg-[#0E1512] text-[#26332B] dark:text-[#FAF9F6] transition-colors">
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
