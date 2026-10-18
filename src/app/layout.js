import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

export const metadata = {
  title: "TaskFlow | Project & Task Management",
  description: "Plan • Collaborate • Achieve - Responsive project & task management system for small software teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="h-full bg-[#FBFAFC]">
      <body className="min-h-full font-sans text-[#0F172A] antialiased bg-[#FBFAFC]">
        <LanguageProvider>
          <AuthProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
