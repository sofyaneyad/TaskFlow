import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export const metadata = {
  title: "TaskFlow | Project & Task Management",
  description: "Modern, responsive project & task management system with dark/light mode and multi-language support.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className="min-h-full font-['Tajawal',sans-serif] antialiased bg-[#F8F9FA] dark:bg-[#09090B] text-[#09090B] dark:text-[#F4F4F5] transition-colors">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <AppLayoutWrapper>{children}</AppLayoutWrapper>
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
